import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { DataPoint, Cluster, AOI } from '../types';
import { ROUTE_PALETTE } from '../constants';

interface LeafletMapProps {
    data: DataPoint[];
    clusters: Cluster[];
    aois: AOI[];
    lockedRoutes: Set<string>; // Set of dates
    activeClusterId: number | null;
    activeAOIId: string | null;
    onClusterClick: (cluster: Cluster) => void;
    onAOIClick: (aoi: AOI) => void;
    onRouteToggle: (date: string) => void;
    showHistory: boolean;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
    data, 
    clusters, 
    aois,
    lockedRoutes, 
    activeClusterId, 
    activeAOIId,
    onClusterClick,
    onAOIClick,
    onRouteToggle,
    showHistory
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [routeGeometries, setRouteGeometries] = useState<Record<string, [number, number][]>>({});
    
    // Layers
    const layersRef = useRef({
        clusters: L.layerGroup(),
        aois: L.layerGroup(),
        history: L.layerGroup(),
        routes: L.layerGroup(),
    });

    // Fetch Route Geometry from OSRM
    useEffect(() => {
        const fetchRoutes = async () => {
            const newGeometries: Record<string, [number, number][]> = {};
            const grouped = data.reduce((acc, curr) => {
                if (!acc[curr.date]) acc[curr.date] = [];
                acc[curr.date].push(curr);
                return acc;
            }, {} as Record<string, DataPoint[]>);

            const datesToFetch = Array.from(lockedRoutes) as string[];
            for (const date of datesToFetch) {
                if (routeGeometries[date]) {
                    newGeometries[date] = routeGeometries[date];
                    continue; // Skip if already fetched
                }

                const points = grouped[date]?.sort((a,b) => a.time.localeCompare(b.time));
                if (!points || points.length < 2) continue;

                // OSRM expects coordinates in lng,lat format joined by semicolons
                // Limit to 25 points to prevent URL length issues or simple rate limiting in demo
                const coordsString = points.slice(0, 25).map(p => `${p.lng},${p.lat}`).join(';');
                
                try {
                    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
                    const json = await response.json();
                    
                    if (json.routes && json.routes.length > 0) {
                        // OSRM returns [lng, lat], Leaflet needs [lat, lng]
                        const coordinates = json.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                        newGeometries[date] = coordinates;
                    } else {
                        // Fallback to straight lines if routing fails
                        newGeometries[date] = points.map(p => [p.lat, p.lng]);
                    }
                } catch (e) {
                    console.error("Routing failed", e);
                    newGeometries[date] = points.map(p => [p.lat, p.lng]);
                }
            }
            
            setRouteGeometries(prev => ({ ...prev, ...newGeometries }));
        };

        if (lockedRoutes.size > 0) {
            fetchRoutes();
        }
    }, [lockedRoutes, data]);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([32.784, -97.381], 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mapRef.current);

        const { clusters, aois, history, routes } = layersRef.current;
        clusters.addTo(mapRef.current);
        aois.addTo(mapRef.current);
        history.addTo(mapRef.current);
        routes.addTo(mapRef.current);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Render Clusters
    useEffect(() => {
        if (!mapRef.current) return;
        const layer = layersRef.current.clusters;
        layer.clearLayers();

        clusters.forEach(cluster => {
            const isSelected = activeClusterId === cluster.id;
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="target-icon-dashed" style="color: ${cluster.color}; opacity: ${isSelected ? 1 : 0.6}"></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });

            const marker = L.marker(cluster.coords, { icon });
            marker.on('click', () => onClusterClick(cluster));
            layer.addLayer(marker);
        });
    }, [clusters, activeClusterId, onClusterClick]);

    // Render AOIs
    useEffect(() => {
        if (!mapRef.current) return;
        const layer = layersRef.current.aois;
        layer.clearLayers();

        aois.forEach(aoi => {
            const isSelected = activeAOIId === aoi.id;
            const color = aoi.type === 'GAP' ? '#f59e0b' : '#ef4444'; 

            if (aoi.type === 'GAP') {
                const circle = L.circle(aoi.center, {
                    color: color,
                    weight: 2,
                    dashArray: '4, 4',
                    fillColor: color,
                    fillOpacity: isSelected ? 0.3 : 0.1,
                    radius: aoi.radius
                });
                
                const labelIcon = L.divIcon({
                    className: '',
                    html: `<div class="bg-slate-900 border border-amber-500 text-amber-500 text-[9px] px-1 rounded shadow-lg whitespace-nowrap -translate-x-1/2">GAP: ${aoi.duration}</div>`,
                    iconSize: [0, 0]
                });
                L.marker(aoi.center, { icon: labelIcon }).addTo(layer);

                circle.on('click', () => onAOIClick(aoi));
                layer.addLayer(circle);
            } else {
                const circle = L.circle(aoi.center, {
                    color: color,
                    weight: 0,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.4 : 0.2,
                    radius: aoi.radius
                });
                 const labelIcon = L.divIcon({
                    className: '',
                    html: `<div class="bg-slate-900 border border-red-500 text-red-500 text-[9px] px-1 rounded shadow-lg whitespace-nowrap -translate-x-1/2">DWELL</div>`,
                    iconSize: [0, 0]
                });
                L.marker(aoi.center, { icon: labelIcon }).addTo(layer);

                circle.on('click', () => onAOIClick(aoi));
                layer.addLayer(circle);
            }
        });

    }, [aois, activeAOIId, onAOIClick]);


    // Render Locked Routes (Using Fetched Geometry)
    useEffect(() => {
        if (!mapRef.current) return;
        const layer = layersRef.current.routes;
        layer.clearLayers();

        // Need original points for markers
        const grouped = data.reduce((acc, curr) => {
            if (!acc[curr.date]) acc[curr.date] = [];
            acc[curr.date].push(curr);
            return acc;
        }, {} as Record<string, DataPoint[]>);

        (Array.from(lockedRoutes) as string[]).forEach((date, i) => {
            const points = grouped[date]?.sort((a,b) => a.time.localeCompare(b.time));
            // Use fetched geometry if available, otherwise fallback to straight lines logic (handled in state init but good to have safety)
            const latlngs = routeGeometries[date] || (points ? points.map(p => [p.lat, p.lng] as [number, number]) : []);
            
            if (latlngs.length < 2) return;

            // Path Style
            L.polyline(latlngs, { color: '#0ea5e9', weight: 4, opacity: 0.5 }).addTo(layer);
            L.polyline(latlngs, { 
                color: '#bae6fd', 
                weight: 2, 
                opacity: 0.9,
                className: 'flow-anim',
                dashArray: '10, 20' 
            }).addTo(layer);

            // Camera Hits along the route (Markers)
            points?.forEach(p => {
                 const hitIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] cursor-pointer hover:bg-white transition-colors"></div>`,
                    iconSize: [8, 8],
                    iconAnchor: [4, 4]
                });
                L.marker([p.lat, p.lng], { icon: hitIcon })
                 .bindTooltip(`${p.time} | ${p.source}`, { 
                     direction: 'top', 
                     className: 'bg-slate-900/90 text-cyan-400 border border-cyan-500/50 text-[10px] px-2 py-1 rounded' 
                 })
                 .on('click', () => {
                     window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '_blank');
                 })
                 .addTo(layer);
            });
        });

    }, [lockedRoutes, routeGeometries, data]);

    // View Control Logic (FlyTo & FitBounds)
    useEffect(() => {
        if (!mapRef.current) return;
        
        // 1. Priority: specific AOI selected
        if (activeAOIId) {
            const aoi = aois.find(a => a.id === activeAOIId);
            if (aoi) mapRef.current.flyTo(aoi.center, 15, { duration: 1.5 });
            return;
        } 
        
        // 2. Priority: specific Cluster selected
        if (activeClusterId) {
            const cluster = clusters.find(c => c.id === activeClusterId);
            if (cluster) mapRef.current.flyTo(cluster.coords, 14, { duration: 1.5 });
            return;
        }

        // 3. Fallback: Fit bounds to all visible data (lockedRoutes)
        // Only run if there are locked routes (which implies filter is active or 'ALL')
        if (lockedRoutes.size > 0) {
             const visiblePoints = data.filter(p => lockedRoutes.has(p.date));
             if (visiblePoints.length > 0) {
                 const latLngs = visiblePoints.map(p => [p.lat, p.lng] as [number, number]);
                 const bounds = L.latLngBounds(latLngs);
                 mapRef.current.fitBounds(bounds, { 
                     padding: [80, 80], 
                     maxZoom: 14,
                     animate: true,
                     duration: 1.2
                 });
             }
        }
        
    }, [activeClusterId, activeAOIId, clusters, aois, lockedRoutes, data]);


    return <div ref={containerRef} className="w-full h-full z-0" />;
};

export default LeafletMap;