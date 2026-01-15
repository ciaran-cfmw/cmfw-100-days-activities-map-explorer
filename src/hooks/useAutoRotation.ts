import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ViewState } from '../types';

interface UseAutoRotationProps {
    projection: d3.GeoProjection;
    viewState: ViewState;
    selectedId: string | null;
    hoveredFeature: any;
    hoveredActivity: any;
    manualRotateDir: number;
    isDraggingRef: React.MutableRefObject<boolean>;
    isTransitioningRef: React.MutableRefObject<boolean>;
    transformRef: React.MutableRefObject<d3.ZoomTransform>;
    rotationRef: React.MutableRefObject<[number, number, number]>;
    setTick: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Hook to handle auto-rotation of the globe/map.
 * Extracted from WorldMap.tsx section 6.
 */
export function useAutoRotation({
    projection,
    viewState,
    selectedId,
    hoveredFeature,
    hoveredActivity,
    manualRotateDir,
    isDraggingRef,
    isTransitioningRef,
    transformRef,
    rotationRef,
    setTick,
}: UseAutoRotationProps) {
    useEffect(() => {
        const timer = d3.timer(() => {
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
}
