import React from 'react';
import { Cluster } from '../types';

interface HUDProps {
    activeCluster: Cluster | null;
}

const HUD: React.FC<HUDProps> = ({ activeCluster }) => {
    if (!activeCluster) return null;

    let confidenceLabel = "LOW";
    if (activeCluster.probability > 80) confidenceLabel = "HIGH";
    else if (activeCluster.probability > 50) confidenceLabel = "MEDIUM";

    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded shadow-xl min-w-[200px] pointer-events-auto animate-in slide-in-from-right-5">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Activity Summary</div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">Focus Area</span>
                    <span className="text-xs font-mono font-bold" style={{ color: activeCluster.color }}>
                        {activeCluster.code}
                    </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">Window</span>
                    <span className="text-xs font-mono text-slate-100">{activeCluster.window}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${activeCluster.probability}%`, backgroundColor: activeCluster.color }}
                    />
                </div>
                <div className="text-[9px] text-right mt-1 font-bold" style={{ color: activeCluster.color }}>
                    {confidenceLabel} FREQUENCY
                </div>
            </div>
        </div>
    );
};

export default HUD;
