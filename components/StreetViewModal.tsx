import React, { useEffect, useState, useRef } from 'react';
import { X, MapPin, ExternalLink, AlertTriangle, GripHorizontal } from 'lucide-react';

interface StreetViewModalProps {
    lat: number;
    lng: number;
    onClose: () => void;
}

const StreetViewModal: React.FC<StreetViewModalProps> = ({ lat, lng, onClose }) => {
    // Window State
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 300 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);

    // Get Google Maps API key from environment
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Embed URL
    const src = `https://www.google.com/maps/embed/v1/streetview?key=${mapsKey}&location=${lat},${lng}&heading=0&pitch=0&fov=90`;

    // External Link (Fallback)
    const externalLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragStartRef.current) return;

            e.preventDefault(); // Prevent text selection

            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;

            setPosition(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            dragStartRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragStartRef.current = null;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    return (
        // Container - Draggable Window
        <div
            className="fixed z-[2000] shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex flex-col animate-in fade-in zoom-in duration-200"
            style={{
                left: position.x,
                top: position.y,
                width: '800px',
                height: '600px',
            }}
        >

            {/* Header - Draggable Area */}
            <div
                className={`flex justify-between items-center p-3 border-b border-slate-800 bg-slate-950 select-none cursor-move ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <MapPin className="text-teal-400 w-5 h-5" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        Visual Reconnaissance <GripHorizontal className="w-4 h-4 text-slate-600" />
                    </h3>
                </div>
                <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                    <a
                        href={externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded transition-colors border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    >
                        <ExternalLink className="w-3 h-3" /> External
                    </a>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-1.5 rounded ml-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Street View Embed - Full Width */}
                <div className="flex-1 bg-black relative flex items-center justify-center group h-full">
                    {/* 
                        Overlay to capture mouse events during drag 
                        This prevents the iframe from swallowing the mouseup/mousemove events
                    */}
                    {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}

                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0, pointerEvents: isDragging ? 'none' : 'auto' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={src}
                        className="w-full h-full z-10"
                    ></iframe>

                    {/* Instructions Overlay if map fails */}
                    <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-50">
                        <div className="bg-slate-950/80 backdrop-blur px-2 py-1 rounded border border-slate-800 text-[9px] text-slate-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Check API Key if error.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreetViewModal;