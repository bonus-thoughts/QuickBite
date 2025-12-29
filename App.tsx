import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from './components/LeafletMap';
import Sidebar from './components/Sidebar';
import HUD from './components/HUD';
import StreetViewModal from './components/StreetViewModal';
import { DataPoint, Cluster, DayFilter, AOI } from './types';
import { FULL_RAW_DATA, ZONE_COLORS } from './constants';

const App: React.FC = () => {
    const [dayFilter, setDayFilter] = useState<DayFilter>('ALL');
    const [activeClusterId, setActiveClusterId] = useState<number | null>(null);
    const [activeAOIId, setActiveAOIId] = useState<string | null>(null);
    const [lockedRoutes, setLockedRoutes] = useState<Set<string>>(new Set());
    const [showHistory, setShowHistory] = useState(false);
    const [streetViewLocation, setStreetViewLocation] = useState<{lat: number, lng: number} | null>(null);

    // --- Data Processing Logic ---

    // 1. Generate Clusters Dynamically based on filter
    const clusters = useMemo(() => {
        const points = dayFilter === 'ALL' 
            ? FULL_RAW_DATA 
            : FULL_RAW_DATA.filter(d => d.day === dayFilter);
        
        if (points.length === 0) return [];

        const tempClusters: any[] = [];
        const threshold = 0.002;

        points.forEach(p => {
            let added = false;
            for (let c of tempClusters) {
                const dLat = Math.abs(c.lat - p.lat);
                const dLng = Math.abs(c.lng - p.lng);
                if (dLat < threshold && dLng < threshold) {
                    c.points.push(p);
                    c.lat = (c.lat * c.count + p.lat) / (c.count + 1); 
                    c.lng = (c.lng * c.count + p.lng) / (c.count + 1);
                    c.count++;
                    added = true;
                    break;
                }
            }
            if (!added) {
                tempClusters.push({ lat: p.lat, lng: p.lng, count: 1, points: [p] });
            }
        });

        // Scoring
        tempClusters.forEach(c => {
            const uniqueDates = new Set(c.points.map((p: any) => p.date)).size;
            c.uniqueDatesCount = uniqueDates;
            c.score = (uniqueDates * 25) + (c.count * 5);
        });

        tempClusters.sort((a, b) => b.score - a.score);

        return tempClusters.slice(0, 6).map((c, index) => {
            const color = ZONE_COLORS[index % ZONE_COLORS.length];
            // Name logic simplified
            let name = `Node ${String.fromCharCode(65+index)}`;
            if (c.points.some((p: any) => p.description?.includes("Walmart"))) name = "Walmart Sector";
            else if (c.points.some((p: any) => p.description?.includes("Jacksboro"))) name = "Jacksboro Corridor";

            return {
                id: index + 100,
                name,
                code: c.score > 50 ? `HOTSPOT-${index+1}` : `NODE-${index+1}`,
                coords: [c.lat, c.lng] as [number, number],
                type: c.score > 50 ? "High Activity" : "Transient",
                probability: Math.min(99, c.score),
                window: `${c.points[0].time} - ${c.points[c.points.length-1].time}`,
                description: `Detected on ${c.uniqueDatesCount} unique dates with ${c.count} total signals.`,
                assessment: "Pending AI Analysis...",
                risk: c.score > 60 ? "High" : "Low",
                routine: [],
                color,
                rawPoints: c.points,
                uniqueDatesCount: c.uniqueDatesCount,
                score: c.score
            } as Cluster;
        });

    }, [dayFilter]);

    // 2. Generate AOIs (Gaps and Dwells)
    const aois = useMemo(() => {
        if (dayFilter === 'ALL') return []; // AOIs are best viewed per day to see the timeline
        
        const dayPoints = FULL_RAW_DATA.filter(d => d.day === dayFilter)
                                       .sort((a,b) => a.time.localeCompare(b.time));

        if (dayPoints.length < 2) return [];

        const computedAOIs: AOI[] = [];

        // GAP Logic: If delta > 45 mins between points
        for (let i = 0; i < dayPoints.length - 1; i++) {
            const p1 = dayPoints[i];
            const p2 = dayPoints[i+1];
            
            // Simple Parse assuming same day (filtered)
            const [h1, m1] = p1.time.split(':').map(Number);
            const [h2, m2] = p2.time.split(':').map(Number);
            const minutes1 = h1 * 60 + m1;
            const minutes2 = h2 * 60 + m2;
            const diff = minutes2 - minutes1;

            if (diff > 45) {
                computedAOIs.push({
                    id: `gap-${i}`,
                    center: [p1.lat, p1.lng],
                    radius: 300,
                    label: `Last seen: ${p1.time}`,
                    type: 'GAP',
                    duration: `${Math.floor(diff/60)}h ${diff%60}m`,
                    points: [p1],
                    riskLevel: 'MEDIUM'
                });
            }
        }

        return computedAOIs;
    }, [dayFilter]);


    // 3. Handle Filter Changes
    useEffect(() => {
        // Reset state on filter change
        setActiveClusterId(null);
        setActiveAOIId(null);
        
        // Auto-lock routes logic
        if (dayFilter !== 'ALL') {
            const dayDates = new Set(FULL_RAW_DATA.filter(d => d.day === dayFilter).map(d => d.date));
            setLockedRoutes(dayDates);
            setShowHistory(false); // Hide history dots to focus on the route
        } else {
            // LOCK ALL ROUTES FOR 'ALL' FILTER
            const allDates = new Set(FULL_RAW_DATA.map(d => d.date));
            setLockedRoutes(allDates);
            setShowHistory(true);
        }
    }, [dayFilter]);

    // 3. Handlers
    const handleClusterClick = (cluster: Cluster) => {
        setActiveClusterId(cluster.id);
        setActiveAOIId(null);
    };

    const handleAOIClick = (aoi: AOI) => {
        setActiveAOIId(aoi.id);
        setActiveClusterId(null);
    };

    const toggleRoute = (date: string) => {
        const next = new Set(lockedRoutes);
        if (next.has(date)) next.delete(date);
        else next.add(date);
        setLockedRoutes(next);
    };

    const activeCluster = clusters.find(c => c.id === activeClusterId) || null;

    return (
        <div className="flex w-full h-full relative">
            <Sidebar 
                currentDay={dayFilter}
                setDayFilter={setDayFilter}
                clusters={clusters}
                aois={aois}
                activeClusterId={activeClusterId}
                setActiveClusterId={setActiveClusterId}
                activeAOIId={activeAOIId}
                setActiveAOIId={setActiveAOIId}
                toggleHistory={() => setShowHistory(!showHistory)}
                showHistory={showHistory}
                onOpenStreetView={(lat, lng) => setStreetViewLocation({lat, lng})}
            />
            
            <div className="flex-1 relative">
                <LeafletMap 
                    data={FULL_RAW_DATA}
                    clusters={clusters}
                    aois={aois}
                    lockedRoutes={lockedRoutes}
                    activeClusterId={activeClusterId}
                    activeAOIId={activeAOIId}
                    onClusterClick={handleClusterClick}
                    onAOIClick={handleAOIClick}
                    onRouteToggle={toggleRoute}
                    showHistory={showHistory}
                />
                <HUD activeCluster={activeCluster} />
            </div>

            {streetViewLocation && (
                <StreetViewModal 
                    lat={streetViewLocation.lat} 
                    lng={streetViewLocation.lng} 
                    onClose={() => setStreetViewLocation(null)} 
                />
            )}
        </div>
    );
};

export default App;