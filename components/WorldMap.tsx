import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { GeoJsonCollection, GeoJsonFeature, ViewState, Activity } from '../types';
import { Loader } from './Loader';

interface WorldMapProps {
  data: GeoJsonCollection | null;
  activities: Activity[];
  onCountryClick: (feature: GeoJsonFeature) => void;
  onActivityClick: (activity: Activity) => void;
  selectedId: string | null; // Can be country name or activity ID
}

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 md:w-16 md:h-16 text-brandWhite/30 group-hover:text-brandRed transition-colors drop-shadow-lg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 md:w-16 md:h-16 text-brandWhite/30 group-hover:text-brandRed transition-colors drop-shadow-lg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

export const WorldMap: React.FC<WorldMapProps> = ({ data, activities, onCountryClick, onActivityClick, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });

  // View State Management
  const [viewState, setViewState] = useState<ViewState>(ViewState.GLOBE);

  // Transform state for Flat Map Zoom/Pan
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  // Mutable state for D3 integration
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const isDraggingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Tick state to force re-renders for animation
  const [, setTick] = useState(0);

  const [hoveredFeature, setHoveredFeature] = useState<GeoJsonFeature | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const [manualRotateDir, setManualRotateDir] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Filter State
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions(prev => (prev.width === width && prev.height === height) ? prev : { width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear location message after delay
  useEffect(() => {
    if (locationMsg) {
      const timer = setTimeout(() => setLocationMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationMsg]);

  // ------------------------------------------------------------------
  // 1. Data Prep & Filtering
  // ------------------------------------------------------------------
  const countryCentroids = useMemo(() => {
    if (!data) return new Map();
    const centroids = new Map<string, [number, number]>();
    data.features.forEach(feature => {
      // Calculate centroid once
      centroids.set(feature.properties.name, d3.geoCentroid(feature));
    });
    return centroids;
  }, [data]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.type))).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedTypes.size === 0) return activities;
    return activities.filter(a => selectedTypes.has(a.type));
  }, [activities, selectedTypes]);

  const toggleType = (type: string) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setSelectedTypes(next);
  };

  // ------------------------------------------------------------------
  // 2. Projection & Path Setup
  // ------------------------------------------------------------------
  const projection = useMemo(() => {
    const { width, height } = dimensions;

    let proj: d3.GeoProjection;

    if (viewState === ViewState.GLOBE) {
      proj = d3.geoOrthographic()
        .translate([width / 2, height / 2])
        .scale(Math.min(width, height) / 2.5)
        .clipAngle(90); // IMPORTANT: Hides back of globe

      // Apply current rotation
      proj.rotate(rotationRef.current);
    } else {
      proj = d3.geoEquirectangular()
        .translate([width / 2, height / 2])
        // Adjust scale to fit the width comfortably
        .scale(width / 6.28)
        .clipAngle(null); // No clipping for flat map

      // For flat map, we strictly enforce 0 pitch/roll
      const [lon] = rotationRef.current;
      proj.rotate([lon, 0, 0]);
    }
    return proj;
  }, [dimensions, viewState]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // ------------------------------------------------------------------
  // 3. View Switch Cleanup
  // ------------------------------------------------------------------
  useLayoutEffect(() => {
    // When view changes, sanitize refs and state immediately

    // Stop any ongoing transitions
    if (svgRef.current) {
      d3.select(svgRef.current).interrupt();
    }
    isTransitioningRef.current = false;
    isDraggingRef.current = false;

    // Calculate default transform based on ViewState
    let nextTransform = d3.zoomIdentity;
    if (viewState === ViewState.FLAT) {
      const k = 1.7;
      // Center the map at the new scale
      const x = (dimensions.width / 2) * (1 - k);
      const y = (dimensions.height / 2) * (1 - k);
      nextTransform = d3.zoomIdentity.translate(x, y).scale(k);
    }

    // Reset/Set Zoom Transform
    setTransform(nextTransform);
    transformRef.current = nextTransform;

    if (zoomBehaviorRef.current && svgRef.current) {
      d3.select(svgRef.current).call(zoomBehaviorRef.current.transform, nextTransform);
    }

    // Sanitize Rotation if going to FLAT
    if (viewState === ViewState.FLAT) {
      const currentLon = rotationRef.current[0];
      rotationRef.current = [currentLon, 0, 0];
      projection.rotate([currentLon, 0, 0]);
      // Force a tick to align render
      setTick(t => t + 1);
    }
  }, [viewState, projection, dimensions]);


  // ------------------------------------------------------------------
  // 4. Interaction Logic (Zoom / Drag)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Define Zoom Behavior for Flat Map
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', (event) => {
        setTransform(event.transform);
        transformRef.current = event.transform;
      });

    // Apply behaviors based on view
    if (viewState === ViewState.GLOBE) {
      // Clear any previous handlers
      svg.on(".zoom", null);
      svg.on(".drag", null);

      // For Globe: Support both drag (rotation) and pinch-zoom
      // Simplified approach: let zoom handle all touch events, check count inside handler

      const globeZoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 12])
        .filter((event) => {
          // Allow all touch events and block mouse wheel
          if (event.type === 'wheel') return false;
          return true;
        })
        .on('start', (event) => {
          // Track if this is a multi-touch gesture
          if (event.sourceEvent && event.sourceEvent.type.includes('touch')) {
            const touches = (event.sourceEvent as TouchEvent).touches;
            if (touches && touches.length >= 2) {
              // Multi-touch zoom starting
              isDraggingRef.current = false;
            }
          }
        })
        .on('zoom', (event) => {
          // Only handle zoom for multi-touch gestures
          if (event.sourceEvent && event.sourceEvent.type.includes('touch')) {
            const touches = (event.sourceEvent as TouchEvent).touches;
            if (touches && touches.length >= 2) {
              // Multi-touch: update projection scale
              const baseScale = Math.min(dimensions.width, dimensions.height) / 2.5;
              const newScale = baseScale * event.transform.k;
              projection.scale(newScale);
              setTick(t => t + 1);
            }
          }
        });

      // Store globe zoom behavior in ref for button controls
      zoomBehaviorRef.current = globeZoom;

      // Globe Manual Drag (Rotation) - only for single touch/mouse
      const drag = d3.drag<SVGSVGElement, unknown>()
        .filter((event) => {
          // Only allow single touch or mouse
          if (event.type.includes('touch')) {
            const touches = (event as TouchEvent).touches;
            return touches && touches.length === 1;
          }
          return true; // Allow mouse
        })
        .on('start', () => {
          isDraggingRef.current = true;
          svg.interrupt();
          isTransitioningRef.current = false;
        })
        .on('drag', (event) => {
          const rotate = projection.rotate();
          const k = 75 / projection.scale();
          const nextRotate: [number, number, number] = [
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k,
            rotate[2]
          ];
          projection.rotate(nextRotate);
          rotationRef.current = nextRotate;
          setTick(t => t + 1);
        })
        .on('end', () => {
          isDraggingRef.current = false;
        });

      // Apply both behaviors
      svg.call(globeZoom);
      svg.call(globeZoom.transform, d3.zoomIdentity);
      svg.call(drag);
    } else {
      // Flat Map: Full zoom/pan support with pinch/spread
      svg.on(".drag", null);
      svg.on(".zoom", null);

      // Store flat map zoom behavior in ref
      zoomBehaviorRef.current = zoom;

      // Ensure zoom behavior supports all touch gestures
      svg.call(zoom);

      // Ensure initial transform is set
      svg.call(zoom.transform, transformRef.current);
    }
  }, [viewState, dimensions]);


  // ------------------------------------------------------------------
  // 5. Focus / Transition Logic
  // ------------------------------------------------------------------
  const animateToLocation = (coords: [number, number], scale?: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.interrupt();
    isTransitioningRef.current = true;

    const [lon, lat] = coords;

    if (viewState === ViewState.FLAT) {
      if (!zoomBehaviorRef.current) return;

      const p = projection([lon, lat]);
      if (!p) {
        isTransitioningRef.current = false;
        return;
      }

      const effectiveWidth = dimensions.width;
      const effectiveHeight = dimensions.height;
      const nextScale = scale || transformRef.current.k;

      const targetTransform = d3.zoomIdentity
        .translate(effectiveWidth / 2, effectiveHeight / 2)
        .scale(nextScale)
        .translate(-p[0], -p[1]);

      svg.transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .call(zoomBehaviorRef.current.transform, targetTransform)
        .on("end", () => {
          isTransitioningRef.current = false;
        });

    } else {
      // Globe
      const targetRotation: [number, number, number] = [-lon, -lat, 0];
      const startRotation = projection.rotate();
      const interpolate = d3.interpolate(startRotation, targetRotation);

      svg.transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .tween("rotate", () => {
          return (t) => {
            const r = interpolate(t);
            projection.rotate(r);
            rotationRef.current = r as [number, number, number];
            setTick(prev => prev + 1);
          };
        })
        .on("end", () => {
          isTransitioningRef.current = false;
        });
    }
  };

  const focusOnFeature = (feature: GeoJsonFeature) => {
    if (!data) return;

    if (viewState === ViewState.FLAT) {
      // Zoom to bounds in Flat view
      if (!zoomBehaviorRef.current || !svgRef.current) return;

      const bounds = pathGenerator.bounds(feature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      if (dx === 0 || dy === 0) return;

      const effectiveWidth = dimensions.width;
      const effectiveHeight = dimensions.height;
      const scale = Math.max(1, Math.min(12, 0.9 / Math.max(dx / effectiveWidth, dy / effectiveHeight)));

      const svg = d3.select(svgRef.current);
      svg.interrupt();
      isTransitioningRef.current = true;

      const targetTransform = d3.zoomIdentity
        .translate(effectiveWidth / 2, effectiveHeight / 2)
        .scale(scale)
        .translate(-x, -y);

      svg.transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .call(zoomBehaviorRef.current.transform, targetTransform)
        .on("end", () => {
          isTransitioningRef.current = false;
        });

    } else {
      // Globe - Rotate to Centroid
      let centroid = countryCentroids.get(feature.properties.name);
      if (!centroid) centroid = d3.geoCentroid(feature);
      if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

      animateToLocation(centroid);
    }
  };

  const focusOnActivity = (activity: Activity) => {
    animateToLocation(activity.coordinates);
  };

  // Watch for external selection
  useEffect(() => {
    if (selectedId && data) {
      // Check if it's a country
      const feature = data.features.find(f => f.properties.name === selectedId);
      if (feature) {
        setTimeout(() => focusOnFeature(feature), 10);
      } else {
        // Check if it's an activity
        const activity = activities.find(a => a.id === selectedId);
        if (activity) {
          setTimeout(() => focusOnActivity(activity), 10);
        }
      }
    }
  }, [selectedId, data, activities, viewState]);


  // ------------------------------------------------------------------
  // 6. Animation Loop (Auto-Rotation)
  // ------------------------------------------------------------------
  useEffect(() => {
    const timer = d3.timer((elapsed) => {
      // Pause if transitioning or user is interacting
      if (isTransitioningRef.current) return;

      const isManual = manualRotateDir !== 0;
      if (!isManual && (isDraggingRef.current || selectedId || hoveredFeature || hoveredActivity)) return;

      const rotate = projection.rotate();
      const currentK = transformRef.current.k;

      // Slower rotation when zoomed in (Flat view)
      const zoomFactor = viewState === ViewState.FLAT ? Math.max(0.1, (9 - currentK) / 8) : 1;
      const baseSpeed = isManual ? 2.5 : 0.05;
      const speed = baseSpeed * zoomFactor;
      const direction = isManual ? manualRotateDir : 1;

      const nextYaw = rotate[0] + (speed * direction);

      if (viewState === ViewState.FLAT) {
        projection.rotate([nextYaw, 0, 0]);
      } else {
        projection.rotate([nextYaw, rotate[1], rotate[2]]);
      }

      rotationRef.current = projection.rotate();
      setTick(t => t + 1);
    });

    return () => timer.stop();
  }, [viewState, projection, selectedId, hoveredFeature, hoveredActivity, manualRotateDir]);


  // ------------------------------------------------------------------
  // 7. Handlers & Locating
  // ------------------------------------------------------------------
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (viewState === ViewState.GLOBE) {
      // For Globe view, adjust projection scale directly
      const currentScale = projection.scale();
      const newScale = currentScale * 1.4;
      const baseScale = Math.min(dimensions.width, dimensions.height) / 2.5;
      const maxScale = baseScale * 12; // Match flat map max zoom (12x)

      if (newScale <= maxScale) {
        projection.scale(newScale);
        setTick(t => t + 1); // Force re-render
      }
    } else {
      // For Flat view, use zoom behavior
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.scaleBy, 1.4);
      }
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (viewState === ViewState.GLOBE) {
      // For Globe view, adjust projection scale directly
      const currentScale = projection.scale();
      const newScale = currentScale / 1.4;
      const minScale = Math.min(dimensions.width, dimensions.height) / 2.5; // Default scale

      if (newScale >= minScale) {
        projection.scale(newScale);
        setTick(t => t + 1); // Force re-render
      }
    } else {
      // For Flat view, use zoom behavior
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(zoomBehaviorRef.current.scaleBy, 1 / 1.4);
      }
    }
  };

  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data || isLocating) return;

    setLocationMsg(null);
    setIsLocating(true);

    if (!("geolocation" in navigator)) {
      setLocationMsg({ type: 'error', text: "Geolocation is not supported" });
      setIsLocating(false);
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const userPoint: [number, number] = [longitude, latitude];

      // Find if user is in a supported country
      const foundFeature = data.features.find(f => d3.geoContains(f, userPoint));

      if (foundFeature) {
        onCountryClick(foundFeature);
        setLocationMsg({ type: 'success', text: `Located in ${foundFeature.properties.name}` });
      } else {
        // Fallback: Just move camera to location
        animateToLocation(userPoint, viewState === ViewState.FLAT ? 4 : undefined);
        setLocationMsg({ type: 'success', text: "Moved to your location" });
      }
      setIsLocating(false);
    };

    const error = (err: any) => {
      // Use 'any' type to safely handle non-standard error objects that might be passed
      console.error("Geolocation error:", err.code, err.message);

      let msg = "Could not access location";

      // Safety check for code property
      const code = err.code !== undefined ? err.code : 0;

      switch (code) {
        case 1: // PERMISSION_DENIED
          msg = "Location permission denied";
          break;
        case 2: // POSITION_UNAVAILABLE
          msg = "Location unavailable";
          break;
        case 3: // TIMEOUT
          msg = "Location request timed out";
          break;
        default:
          msg = err.message ? String(err.message) : "Unknown location error";
      }

      setLocationMsg({ type: 'error', text: msg });
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(
      success,
      error,
      {
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: false
      }
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Directly manipulate DOM for performance to avoid re-rendering entire map on mouse move
    if (tooltipRef.current) {
      const offsetX = 20;
      const offsetY = 20;

      // Ensure tooltip stays within viewport bounds
      let x = e.clientX + offsetX;
      let y = e.clientY + offsetY;

      const tooltipWidth = 260; // Max width approximate
      const tooltipHeight = 150; // Max height approximate

      if (x + tooltipWidth > window.innerWidth) {
        x = e.clientX - tooltipWidth - 10;
      }

      if (y + tooltipHeight > window.innerHeight) {
        y = e.clientY - tooltipHeight - 10;
      }

      tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  const getRegionStyle = (feature: GeoJsonFeature) => {
    // Determine color based on longitude/latitude to approximate continents
    const centroid = countryCentroids.get(feature.properties.name);
    if (!centroid) return 'fill-brandGrey/30';
    const [lon, lat] = centroid;

    // Americas (approx Lon < -30) -> Blue (Remapped to Salmon/Red in new palette)
    if (lon < -30) return 'fill-brandBlue/20';

    // Europe & Africa (approx Lon -30 to 60)
    if (lon >= -30 && lon < 60) {
      // Europe (Lat > 30) -> Purple (Remapped to Maroon)
      if (lat > 25) return 'fill-brandPurple/20';
      // Africa (Lat <= 30) -> Gold (Remapped to Light Pink)
      return 'fill-brandGold/20';
    }

    // Asia (Lon >= 60) -> Green (Remapped to Pale Pink)
    // Differentiate Oceania (Lat < 10, Lon > 90) -> LightRed
    if (lat < 10 && lon > 90) return 'fill-brandLightRed/20'; // Oceania

    return 'fill-brandGreen/20'; // Asia
  };

  const helperText = viewState === ViewState.GLOBE
    ? "Click & Drag to Rotate"
    : "Scroll to Zoom • Drag to Pan";

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brandBlack transition-colors duration-300">
        <div className="scale-150 mb-4">
          <Loader />
        </div>
        <p className="text-brandRed font-heading text-lg tracking-widest uppercase animate-pulse">Loading map data...</p>
      </div>
    );
  }

  // Calculate transform string for SVG Group
  const groupTransform = `translate(${transform.x},${transform.y}) scale(${transform.k})`;

  // Calculate zoom-independent scaling factors
  // In Globe view, k is always 1 (handled by projection scale).
  // In Flat view, k increases with zoom. We divide dimensions by k to keep visual size constant.
  const scaleFactor = transform.k || 1;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-brandBlack transition-colors duration-300 overflow-hidden group/container flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
    >

      {/* View Switcher */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex p-1 bg-brandWhite/10 backdrop-blur-xl rounded-full border border-brandWhite/20 shadow-2xl">
        <button
          onClick={() => setViewState(ViewState.GLOBE)}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${viewState === ViewState.GLOBE ? 'bg-brandRed text-brandBlack shadow-md' : 'text-brandCream/70 hover:text-brandWhite'}`}
        >
          Globe
        </button>
        <button
          onClick={() => setViewState(ViewState.FLAT)}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${viewState === ViewState.FLAT ? 'bg-brandRed text-brandBlack shadow-md' : 'text-brandCream/70 hover:text-brandWhite'}`}
        >
          Map
        </button>
      </div>

      {/* Activity Filter (Top Left, below Search) - Moved down to avoid overlap with new search position on mobile */}
      <div className="absolute top-36 md:top-20 left-4 z-20 font-sans">
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-2xl border backdrop-blur-xl transition-all active:scale-95 ${isFilterOpen || selectedTypes.size > 0
              ? 'bg-brandRed text-brandBlack border-brandRed'
              : 'bg-brandWhite/10 text-brandCream border-brandWhite/20 hover:bg-brandWhite/20 hover:border-brandWhite/40 hover:text-brandWhite'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-bold">Filter</span>
            {selectedTypes.size > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-brandBlack text-brandRed rounded-full text-[10px] font-bold">
                {selectedTypes.size}
              </span>
            )}
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-brandDeep/90 border border-brandWhite/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => setSelectedTypes(new Set())}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${selectedTypes.size === 0
                    ? 'bg-brandRed/20 text-brandRed'
                    : 'text-brandGrey hover:bg-brandRed/10 hover:text-brandCream'
                    }`}
                >
                  Show All
                </button>
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg hover:bg-white/5 group transition-colors"
                  >
                    <span className={selectedTypes.has(type) ? 'text-brandCream font-bold' : 'text-brandGrey group-hover:text-brandCream'}>
                      {type}
                    </span>
                    {selectedTypes.has(type) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-brandRed" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Rotate Controls */}
      <div
        className="absolute top-0 bottom-0 left-0 w-24 z-10 flex flex-col items-center justify-center cursor-pointer group hover:bg-gradient-to-r hover:from-brandDeep/60 hover:to-transparent transition-all"
        onMouseDown={() => setManualRotateDir(1)}
        onMouseUp={() => setManualRotateDir(0)}
        onMouseLeave={() => setManualRotateDir(0)}
        onTouchStart={() => setManualRotateDir(1)}
        onTouchEnd={() => setManualRotateDir(0)}
      >
        <div className="transform transition-transform group-hover:-translate-x-1 opacity-50 group-hover:opacity-100">
          <ChevronLeft />
        </div>
        <span className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[9px] font-bold uppercase tracking-widest text-brandCream/80 text-center pointer-events-none">
          Hold to<br />Rotate
        </span>
      </div>

      <div
        className="absolute top-0 bottom-0 right-0 w-24 z-10 flex flex-col items-center justify-center cursor-pointer group hover:bg-gradient-to-l hover:from-brandDeep/60 hover:to-transparent transition-all"
        onMouseDown={() => setManualRotateDir(-1)}
        onMouseUp={() => setManualRotateDir(0)}
        onMouseLeave={() => setManualRotateDir(0)}
        onTouchStart={() => setManualRotateDir(-1)}
        onTouchEnd={() => setManualRotateDir(0)}
      >
        <div className="transform transition-transform group-hover:translate-x-1 opacity-50 group-hover:opacity-100">
          <ChevronRight />
        </div>
        <span className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[9px] font-bold uppercase tracking-widest text-brandCream/80 text-center pointer-events-none">
          Hold to<br />Rotate
        </span>
      </div>

      {/* Bottom Right Controls (Zoom + Location) */}
      <div className="absolute bottom-8 right-6 z-10 flex flex-col space-y-3 items-center">

        {/* Zoom Controls */}
        <div className="flex flex-col space-y-2 items-center mb-1">
          <div className="mb-1 px-2 py-0.5 bg-brandWhite/10 backdrop-blur-xl text-[10px] font-mono text-brandLightRed border border-brandWhite/20 rounded shadow-2xl">
            {viewState === ViewState.GLOBE
              ? `${(projection.scale() / (Math.min(dimensions.width, dimensions.height) / 2.5)).toFixed(1)}x`
              : `${transform.k.toFixed(1)}x`
            }
          </div>
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-brandWhite/10 hover:bg-brandRed text-brandCream hover:text-brandBlack rounded-full shadow-2xl flex items-center justify-center transition-all border border-brandWhite/20 hover:border-transparent active:scale-95 backdrop-blur-xl"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-brandWhite/10 hover:bg-brandRed text-brandCream hover:text-brandBlack rounded-full shadow-2xl flex items-center justify-center transition-all border border-brandWhite/20 hover:border-transparent active:scale-95 backdrop-blur-xl"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>

        {/* Location Button */}
        <div className="relative">
          {locationMsg && (
            <div className={`absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-medium shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-right-2 z-50 ${locationMsg.type === 'error'
              ? 'bg-red-900/90 text-red-100 border-red-700/50'
              : 'bg-brandDeep/90 text-brandCream border-brandWhite/20'
              }`}>
              {locationMsg.text}
            </div>
          )}

          <button
            onClick={handleLocateMe}
            className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all border active:scale-95 relative z-10 backdrop-blur-xl
                      ${isLocating
                ? 'bg-brandRed text-brandBlack border-transparent animate-pulse'
                : 'bg-brandWhite/10 hover:bg-brandRed text-brandCream hover:text-brandBlack border-brandWhite/20 hover:border-transparent'
              }`}
            title="Find My Location"
          >
            <LocationIcon />
          </button>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-move block"
        style={{ touchAction: 'none' }}
      >
        {/* ... Defs ... */}
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="80%" stopColor="var(--color-brand-deep)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-brand-red)" stopOpacity="0.4" />
          </radialGradient>

          {/* Kept for activities or other uses */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={groupTransform}>

          {/* Globe Sphere (Background) */}
          {viewState === ViewState.GLOBE && (
            <circle
              cx={dimensions.width / 2}
              cy={dimensions.height / 2}
              r={projection.scale()}
              className="fill-brandBlack stroke-brandGrey/20"
              strokeWidth={1}
            />
          )}

          {/* Countries */}
          {data.features.map((feature) => {
            const d = pathGenerator(feature);
            // If clipped or invalid, d is null
            if (!d) return null;

            const isSelected = selectedId === feature.properties.name;
            // Note: We do NOT highlight 'hoveredFeature' here anymore to avoid z-fighting with the overlay
            const regionStyle = getRegionStyle(feature);

            return (
              <path
                key={feature.id || feature.properties.name}
                d={d}
                className={`
                    transition-colors duration-200
                    ${isSelected
                    ? 'fill-brandRed stroke-brandCream opacity-100'
                    : `${regionStyle} stroke-brandGrey/20`
                  }
                    ${!isSelected ? 'hover:opacity-100' : ''}
                 `}
                // Scale Stroke Width inversely with zoom level
                strokeWidth={(isSelected ? 1.5 : 0.5) / scaleFactor}
                onMouseEnter={() => setHoveredFeature(feature)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountryClick(feature);
                }}
              />
            );
          })}

          {/* Labels */}
          {data.features.map((feature) => {
            const area = pathGenerator.area(feature);
            if (area < 80) return null;
            const geoCentroid = countryCentroids.get(feature.properties.name);
            if (!geoCentroid) return null;
            const projected = projection(geoCentroid);
            if (!projected) return null;
            const [x, y] = projected;
            const baseFontSize = Math.min(14, Math.max(8, Math.sqrt(area) / 3));

            return (
              <text
                key={`${feature.id || feature.properties.name}-label`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none fill-[#fdf3f3] font-heading select-none font-normal tracking-wide opacity-80"
                stroke="#420d10"
                strokeWidth={2 / scaleFactor}
                style={{
                  // Scale Font Size inversely with zoom level
                  fontSize: `${baseFontSize / scaleFactor}px`,
                  paintOrder: 'stroke',
                  strokeLinejoin: 'round'
                }}
              >
                {feature.properties.name}
              </text>
            );
          })}

          {/* Hover Highlight Overlay - "Raises Up" */}
          {hoveredFeature && (() => {
            const d = pathGenerator(hoveredFeature);
            if (!d) return null;

            // Get base style but make it more opaque/vibrant for the lifted state
            const regionClass = getRegionStyle(hoveredFeature);
            // Increase opacity for the lifted state (replacing /20 with /60)
            const liftClass = regionClass.replace('/20', '/60');

            return (
              <path
                d={d}
                className={`pointer-events-none stroke-brandRed ${liftClass} transition-all duration-300 ease-out`}
                strokeWidth={1.5 / scaleFactor}
                style={{
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))', // Strong shadow to simulate height
                  transform: 'scale(1.05)',
                  transformBox: 'fill-box', // Crucial: Scales from center of the shape
                  transformOrigin: 'center',
                }}
              />
            );
          })()}

          {/* Activities Hotspots (Filtered) - Moved AFTER labels to ensure they are on top */}
          {filteredActivities.map((activity) => {
            // Use pathGenerator for visibility check on Globe
            const pointGeo = { type: 'Point', coordinates: activity.coordinates } as any;
            const d = pathGenerator(pointGeo);

            // If clipped by globe, d is null (or empty)
            if (!d) return null;

            const [x, y] = projection(activity.coordinates) || [0, 0];
            const isHovered = hoveredActivity?.id === activity.id;
            const isSelected = selectedId === activity.id;

            return (
              <g
                key={activity.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer group/activity"
                onMouseEnter={() => setHoveredActivity(activity)}
                onMouseLeave={() => setHoveredActivity(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onActivityClick(activity);
                }}
              >
                {/* Invisible Hit Area for easier clicking - Scaled */}
                <circle r={24 / scaleFactor} className="fill-transparent" />

                {/* Ripple Effect (only if not selected to avoid visual clutter) - Scaled */}
                {!isSelected && (
                  <circle r={8 / scaleFactor} className="fill-brandRed opacity-40 animate-ripple pointer-events-none" />
                )}

                {/* Main Dot - Scaled */}
                <circle
                  r={(isSelected || isHovered ? 8 : 5) / scaleFactor}
                  strokeWidth={(isSelected ? 2 : 1) / scaleFactor}
                  className={`transition-all duration-300 ${isSelected ? 'fill-brandCream stroke-brandRed' : 'fill-brandRed stroke-brandDeep'}`}
                />
              </g>
            );
          })}

          {/* Globe Atmosphere (Foreground) */}
          {viewState === ViewState.GLOBE && (
            <circle
              cx={dimensions.width / 2}
              cy={dimensions.height / 2}
              r={projection.scale()}
              fill="url(#globeGlow)"
              className="pointer-events-none"
            />
          )}
        </g>
      </svg>

      {/* Helper Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brandCream/80 text-[10px] md:text-xs font-medium pointer-events-none select-none bg-brandWhite/10 backdrop-blur-xl px-4 py-2 rounded-full border border-brandWhite/20 shadow-2xl">
        {helperText}
      </div>

      {/* Improved Tooltip (HTML Overlay) */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 pointer-events-none bg-brandDeep/95 backdrop-blur-md border border-brandRed/30 rounded-lg shadow-2xl p-4 max-w-xs transition-opacity duration-200 ${hoveredActivity ? 'opacity-100' : 'opacity-0'}`}
        style={{ top: 0, left: 0 }} // Managed via transform
      >
        {hoveredActivity && (
          <>
            <h4 className="font-heading text-sm text-brandRed mb-1 uppercase tracking-wide leading-tight">
              {hoveredActivity.title}
            </h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-brandWhite/80 uppercase tracking-wider">
                {hoveredActivity.type}
              </span>
            </div>
            <p className="text-xs font-sans text-brandCream/80 leading-snug">
              {hoveredActivity.description.length > 80
                ? hoveredActivity.description.substring(0, 80) + '...'
                : hoveredActivity.description}
            </p>
          </>
        )}
      </div>

    </div>
  );
};