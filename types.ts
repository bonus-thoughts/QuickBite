export interface DataPoint {
    lat: number;
    lng: number;
    date: string;
    time: string;
    day: string;
    description?: string; // Original CSV description
    source?: string; // Capture Network/Camera
}

export interface Cluster {
    id: number;
    name: string;
    code: string;
    coords: [number, number];
    type: string;
    probability: number;
    window: string;
    description: string;
    assessment: string;
    risk: string;
    routine: { date: string; time: string; note: string; lat: number; lng: number }[];
    color: string;
    rawPoints: DataPoint[];
    uniqueDatesCount: number;
    score: number;
}

export interface AOI {
    id: string;
    center: [number, number];
    radius: number;
    label: string;
    type: 'DWELL' | 'GAP';
    duration: string; 
    points?: DataPoint[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Corridor {
    id: number;
    name: string;
    desc: string;
    points: [number, number][];
}

export type DayFilter = 'ALL' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface AnalysisResult {
    summary: string;
    attentionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    keyInsights: string[];
}
