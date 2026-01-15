import { useEffect } from 'react';
import * as d3 from 'd3';
import { ViewState } from '../types';

interface UseMapInteractionProps {
    svgRef: React.RefObject<SVGSVGElement>;
    viewState: ViewState;
    dimensions: { width: number; height: number };
    projection: d3.GeoProjection;
    isDraggingRef: React.MutableRefObject<boolean>;
    transformRef: React.MutableRefObject<d3.ZoomTransform>;
    rotationRef: React.MutableRefObject<[number, number, number]>;
    zoomBehaviorRef: React.MutableRefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>;
    globeLastTransformRef: React.MutableRefObject<d3.ZoomTransform>;
    setTransform: React.Dispatch<React.SetStateAction<d3.ZoomTransform>>;
    setTick: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Hook to handle zoom/pan interactions for both Globe and Flat map views.
 * Extracted from WorldMap.tsx section 4.
 */
export function useMapInteraction({
    svgRef,
    viewState,
    dimensions,
    projection,
    isDraggingRef,
    transformRef,
    rotationRef,
    zoomBehaviorRef,
    globeLastTransformRef,
    setTransform,
    setTick,
}: UseMapInteractionProps) {
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // Clear any existing handlers to prevent duplicates/ghosts
        svg.on(".zoom", null);
        svg.on(".drag", null);

        if (viewState === ViewState.GLOBE) {
            // --- GLOBE INTERACTION ---
            const globeZoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 12])
                .filter((event) => {
                    // Prevent mouse wheel zooming (use controls instead)
                    if (event.type === 'wheel') return false;
                    return true;
                })
                .on('start', (event) => {
                    isDraggingRef.current = true;
                    globeLastTransformRef.current = event.transform;
                })
                .on('zoom', (event) => {
                    const t = event.transform;
                    const lastT = globeLastTransformRef.current;

                    // Determine interaction type
                    let isPinch = false;
                    if (event.sourceEvent?.type?.includes('touch')) {
                        if (event.sourceEvent.touches?.length >= 2) {
                            isPinch = true;
                        }
                    }

                    // Handle Scale (Pinch Only)
                    if (t.k !== lastT.k) {
                        const kRatio = t.k / lastT.k;
                        const newScale = projection.scale() * kRatio;
                        const baseScale = Math.min(dimensions.width, dimensions.height) / 2.5;
                        const minScale = baseScale;
                        const maxScale = baseScale * 12;

                        if (newScale >= minScale && newScale <= maxScale) {
                            projection.scale(newScale);
                        } else if (newScale < minScale) {
                            projection.scale(minScale);
                        } else if (newScale > maxScale) {
                            projection.scale(maxScale);
                        }
                    }

                    // Handle Rotation (Drag)
                    if (!isPinch) {
                        const sensitivity = 75 / projection.scale();
                        const dx = t.x - lastT.x;
                        const dy = t.y - lastT.y;

                        if (dx !== 0 || dy !== 0) {
                            const rotate = projection.rotate();
                            const nextRotate: [number, number, number] = [
                                rotate[0] + dx * sensitivity,
                                rotate[1] - dy * sensitivity,
                                rotate[2]
                            ];
                            projection.rotate(nextRotate);
                            rotationRef.current = nextRotate;
                        }
                    }

                    globeLastTransformRef.current = t;
                    setTick(c => c + 1);
                })
                .on('end', () => {
                    isDraggingRef.current = false;
                });

            zoomBehaviorRef.current = globeZoom;
            svg.call(globeZoom);
            svg.call(globeZoom.transform, d3.zoomIdentity);

        } else {
            // --- FLAT MAP INTERACTION ---
            const flatZoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 12])
                .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
                .on('zoom', (event) => {
                    setTransform(event.transform);
                    transformRef.current = event.transform;
                });

            zoomBehaviorRef.current = flatZoom;
            svg.call(flatZoom);

            if (transformRef.current) {
                svg.call(flatZoom.transform, transformRef.current);
            }
        }

        // Cleanup
        return () => {
            if (svgRef.current) {
                const s = d3.select(svgRef.current);
                s.on(".zoom", null);
                s.on(".drag", null);
            }
        };
    }, [viewState, dimensions]);
}
