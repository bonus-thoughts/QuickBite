import React from 'react';
import { Map as MapIcon, Activity, Clock, Database, Navigation, Eye } from 'lucide-react';
import { DayFilter, Cluster, AOI } from '../types';

interface SidebarProps {
    currentDay: DayFilter;
    setDayFilter: (day: DayFilter) => void;
    clusters: Cluster[];
    aois: AOI[];
    activeClusterId: number | null;
    setActiveClusterId: (id: number | null) => void;
    activeAOIId: string | null;
    setActiveAOIId: (id: string | null) => void;
    toggleHistory: () => void;
    showHistory: boolean;
    onOpenStreetView: (lat: number, lng: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    currentDay,
    setDayFilter,
    clusters,
    aois,
    activeClusterId,
    setActiveClusterId,
    activeAOIId,
    setActiveAOIId,
    toggleHistory,
    showHistory,
    onOpenStreetView
}) => {
    const handleClusterClick = (cluster: Cluster) => {
        if (activeClusterId === cluster.id) {
            setActiveClusterId(null);
        } else {
            setActiveClusterId(cluster.id);
            setActiveAOIId(null);
        }
    };

    const handleAOIClick = (aoi: AOI) => {
        if (activeAOIId === aoi.id) {
            setActiveAOIId(null);
        } else {
            setActiveAOIId(aoi.id);
            setActiveClusterId(null);
        }
    };

    const openGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const days: DayFilter[] = ['ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl h-screen">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className="text-blue-500 w-5 h-5" />
                    <h1 className="text-lg font-bold tracking-tight text-slate-100 uppercase">QuickBite Monitor</h1>
                </div>
                <p className="text-xs text-slate-400">Case ID: 1316 | Pattern Reconstruction</p>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Filter Timeline by Day</div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setDayFilter(day)}
                            className={`text-[10px] font-bold py-1 rounded border transition-colors
                                ${currentDay === day
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                {/* AOI Section */}
                {aois.length > 0 && (
                    <div>
                        <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Stops & Gaps
                        </div>
                        <div className="space-y-2">
                            {aois.map(aoi => (
                                <div
                                    key={aoi.id}
                                    onClick={() => handleAOIClick(aoi)}
                                    className={`p-3 rounded border cursor-pointer transition-all
                                        ${activeAOIId === aoi.id
                                            ? 'bg-slate-800 border-amber-500'
                                            : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${aoi.type === 'GAP' ? 'bg-amber-900/50 text-amber-500' : 'bg-red-900/50 text-red-500'}`}>
                                            {aoi.type === 'GAP' ? 'SIGNAL GAP' : 'DWELL'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {aoi.duration}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-300">{aoi.label}</div>

                                    {/* Data display for AOI */}
                                    {activeAOIId === aoi.id && aoi.points && (
                                        <div className="mt-3 pt-2 border-t border-slate-700/50 animate-in fade-in">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openGoogleMaps(aoi.center[0], aoi.center[1]);
                                                }}
                                                className="w-full mb-3 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-500 text-xs py-1.5 rounded border border-slate-700 transition-colors"
                                            >
                                                <Navigation className="w-3 h-3" /> Get Directions
                                            </button>

                                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                                <Database className="w-3 h-3" /> Source Data
                                            </div>
                                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                {aoi.points.map((point, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openGoogleMaps(point.lat, point.lng);
                                                        }}
                                                        className="flex justify-between items-start text-[9px] text-slate-400 bg-slate-950/30 p-1 rounded cursor-pointer hover:bg-slate-800 hover:text-slate-200 transition-colors"
                                                    >
                                                        <span>{point.time}</span>
                                                        <span className="truncate max-w-[120px]">{point.description || 'No Desc'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">Known Locations</div>

                {clusters.map(cluster => (
                    <div
                        key={cluster.id}
                        onClick={() => handleClusterClick(cluster)}
                        className={`p-4 rounded-lg border transition-all cursor-pointer group mb-2
                            ${activeClusterId === cluster.id
                                ? 'bg-slate-800 border-l-4'
                                : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                        style={{ borderLeftColor: activeClusterId === cluster.id ? cluster.color : undefined }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: cluster.color }}>
                                {cluster.code}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                                {cluster.uniqueDatesCount} DATES | {cluster.rawPoints.length} HITS
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-100 mb-1">{cluster.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{cluster.description}</p>

                        {activeClusterId === cluster.id && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2">

                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openGoogleMaps(cluster.coords[0], cluster.coords[1]);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs py-1.5 rounded border border-slate-700 transition-colors"
                                    >
                                        <Navigation className="w-3 h-3" /> Directions
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenStreetView(cluster.coords[0], cluster.coords[1]);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs py-1.5 rounded border border-slate-700 transition-colors"
                                    >
                                        <Eye className="w-3 h-3" /> Street View
                                    </button>
                                </div>

                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1">
                                    <Database className="w-3 h-3" /> Raw Signals
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    {cluster.rawPoints
                                        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
                                        .map((point, idx) => (
                                            <div
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openGoogleMaps(point.lat, point.lng);
                                                }}
                                                className="flex flex-col text-[10px] bg-slate-950/50 p-2 rounded border border-slate-800/50 hover:border-slate-700 cursor-pointer group/item hover:bg-slate-900"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-mono text-blue-400 font-bold group-hover/item:text-blue-300">{point.date}</span>
                                                    <span className="text-slate-500">{point.day}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-mono text-slate-300">{point.time}</span>
                                                    <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">{point.source || 'N/A'}</span>
                                                </div>
                                                <div className="text-slate-400 italic truncate" title={point.description}>
                                                    {point.description || 'No Description'}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900">
                <button
                    onClick={toggleHistory}
                    className={`w-full flex items-center justify-between p-3 rounded text-xs font-medium border transition-colors 
                    ${showHistory ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                    <span className="flex items-center gap-2">
                        <MapIcon className="w-4 h-4" /> Show Historical Data
                    </span>
                    <span className="text-[10px] uppercase">{showHistory ? 'ON' : 'OFF'}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;