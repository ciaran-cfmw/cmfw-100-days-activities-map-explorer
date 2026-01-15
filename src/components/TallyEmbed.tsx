import React, { useEffect, useRef, useState } from 'react';

interface TallyEmbedProps {
    formId?: string;
    autoDetectLocation?: boolean;
    onClose?: () => void;
}

declare global {
    interface Window {
        Tally?: {
            loadEmbeds: () => void;
        };
    }
}

// Fuzz coordinates to ~1km accuracy for privacy
const fuzzCoord = (coord: number) => Math.round(coord * 100) / 100;

export const TallyEmbed: React.FC<TallyEmbedProps> = ({
    formId = '2EBRED',
    autoDetectLocation = true,
    onClose
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [geoStatus, setGeoStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable' | 'disabled'>(
        autoDetectLocation ? 'requesting' : 'disabled'
    );

    // Request geolocation on mount if enabled
    useEffect(() => {
        if (!autoDetectLocation) {
            setGeoStatus('disabled');
            return;
        }

        if (!navigator.geolocation) {
            setGeoStatus('unavailable');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: fuzzCoord(position.coords.latitude),
                    lng: fuzzCoord(position.coords.longitude),
                });
                setGeoStatus('granted');
            },
            () => {
                setGeoStatus('denied');
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    }, [autoDetectLocation]);

    // Build iframe URL with optional coordinates
    const buildIframeUrl = () => {
        const base = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
        if (coords) {
            return `${base}&lat=${coords.lat}&lng=${coords.lng}`;
        }
        return base;
    };

    useEffect(() => {
        // Load Tally embed script if not already loaded
        if (!document.querySelector('script[src*="tally.so"]')) {
            const script = document.createElement('script');
            script.src = 'https://tally.so/widgets/embed.js';
            script.async = true;
            script.onload = () => {
                window.Tally?.loadEmbeds();
            };
            document.body.appendChild(script);
        } else {
            window.Tally?.loadEmbeds();
        }
    }, [coords]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-brandDeep rounded-2xl border border-brandRed/20 dark:border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brandRed/20 dark:border-white/10 bg-brandDeep/90 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-heading text-brandCream">Register Your Event</h2>
                        {geoStatus === 'granted' && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <i className='bx bx-check-circle'></i> Location detected
                            </p>
                        )}
                        {geoStatus === 'denied' && (
                            <p className="text-xs text-brandGrey flex items-center gap-1">
                                <i className='bx bx-map-alt'></i> Location from address
                            </p>
                        )}
                        {geoStatus === 'disabled' && (
                            <p className="text-xs text-brandGrey flex items-center gap-1">
                                <i className='bx bx-edit-alt'></i> Manual entry mode
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-brandGrey hover:text-brandCream transition-all"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tally Iframe */}
                <div ref={containerRef} className="h-[70vh] overflow-auto bg-white">
                    {(geoStatus !== 'requesting') && (
                        <iframe
                            key={coords ? `${coords.lat}-${coords.lng}` : 'no-coords'}
                            src={buildIframeUrl()}
                            loading="lazy"
                            width="100%"
                            height="100%"
                            frameBorder={0}
                            title="CMFW Event Registration"
                            style={{ minHeight: '500px' }}
                        />
                    )}
                    {geoStatus === 'requesting' && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-brandGrey">Checking location permissions...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
