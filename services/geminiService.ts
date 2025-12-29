import { GoogleGenAI } from "@google/genai";
import { DataPoint, Cluster, AnalysisResult, AOI } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the "Pattern Analyst" persona
const SYSTEM_INSTRUCTION = `
You are an expert Pattern of Life (PoL) Analyst. 
Your task is to analyze movement data to identify routines, common routes, and deviations.
Your output should be objective, analytical, and professional. 
Focus on:
1. Routine establishment (Regular commutes, repeated stops, established corridors).
2. Anomaly detection (Unexpected stops, deviations from the norm).
3. Efficiency and logic of the route.

Do not use military or tactical terminology.
`;

export const analyzeDailyPattern = async (day: string, points: DataPoint[]): Promise<AnalysisResult> => {
    // 1. Prepare data summary
    const summaryData = points.map(p => `- ${p.time}: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)} (${p.description || 'Unknown'})`).join('\n');

    const prompt = `
    Analyze the following movement data for ${day}. 
    
    Data:
    ${summaryData}

    Provide a JSON response with:
    - summary: A brief narrative of the day's activity, focusing on the flow of movement.
    - attentionLevel: LOW (Routine), MEDIUM (Minor Deviation), or HIGH (Major Deviation).
    - keyInsights: An array of 2-3 specific observations (e.g., "Commute time matches historical average", "Unusual stop at Location X").
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "{}";
        return JSON.parse(text) as AnalysisResult;

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return {
            summary: "Analysis unavailable due to connection error.",
            attentionLevel: "LOW",
            keyInsights: ["Data unavailable"]
        };
    }
};

export const getIntelForCluster = async (cluster: Cluster): Promise<string> => {
    // 1. Try with Google Maps Grounding
    try {
        const prompt = `
        Search for places and businesses at these coordinates: ${cluster.coords[0]}, ${cluster.coords[1]}.
        What is the primary function of this area (Residential, Commercial, Industrial)?
        Does it match the description "${cluster.description}"?
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                toolConfig: {
                    // @ts-ignore
                    retrievalConfig: {
                        latLng: {
                            latitude: cluster.coords[0],
                            longitude: cluster.coords[1]
                        }
                    }
                }
            }
        });

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let groundingText = "";
        if (grounding) {
            const sources = grounding.map(c => c.web?.title || c.web?.uri).filter(Boolean).join(", ");
            if (sources) groundingText = `\n(Source: ${sources})`;
        }

        return (response.text || "No intelligence available.") + groundingText;

    } catch (error) {
        console.warn("Maps Grounding failed, falling back to Search:", error);
        // Fallback: Pure Google Search with coordinates
        return await fallbackSearch(cluster.coords[0], cluster.coords[1], cluster.description);
    }
};

export const analyzeAOI = async (aoi: AOI): Promise<string> => {
    const typeContext = aoi.type === 'GAP'
        ? `Signal lost for ${aoi.duration}.`
        : `Dwell time of ${aoi.duration}.`;

    try {
        const prompt = `
        Identify the nearest buildings or landmarks to coordinates: ${aoi.center[0]}, ${aoi.center[1]}.
        Context: ${typeContext}
        Hypothesize the reason for the stop.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                toolConfig: {
                    // @ts-ignore
                    retrievalConfig: {
                        latLng: {
                            latitude: aoi.center[0],
                            longitude: aoi.center[1]
                        }
                    }
                }
            }
        });

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let groundingText = "";
        if (grounding) {
            const sources = grounding.map(c => c.web?.title || c.web?.uri).filter(Boolean).join(", ");
            if (sources) groundingText = `\n(Source: ${sources})`;
        }
        return (response.text || "Analysis unavailable.") + groundingText;

    } catch (error) {
        console.warn("AOI Analysis failed, falling back:", error);
        return await fallbackSearch(aoi.center[0], aoi.center[1], typeContext);
    }
};

import * as MGRS from 'mgrs';

// ... (existing imports)

export const analyzeLocation = async (lat: number, lng: number): Promise<string> => {
    try {
        // Convert to MGRS
        let mgrsString = "Unknown";
        try {
            // mgrs library expects [lon, lat] for forward conversion
            mgrsString = MGRS.forward([lng, lat]);
        } catch (e) {
            console.warn("MGRS Conversion error:", e);
        }

        // Determine Hemispheres for extra clarity
        const latDir = lat >= 0 ? "North" : "South";
        const lngDir = lng >= 0 ? "East" : "West";

        // Attempt 1: Maps Grounding with explicit coordinates in prompt
        const prompt = `
        Perform a comprehensive site survey for the location.
        
        Location Data:
        - Decimal: ${lat} (${latDir}), ${lng} (${lngDir})
        - MGRS Grid: ${mgrsString}
        
        Using Google Maps or Search:
        1. Identify the nearest street address and major intersection.
        2. **CRITICAL**: Search for all businesses, restaurants, retail stores, and landmarks within a **400m radius** of these coordinates. 
           - List these businesses.
           - Mention if there are any popular chains (e.g., Panda Express, Starbucks).
        3. Describe the environment (e.g., "Dense Commercial", "Rural Residential", "University Campus").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                toolConfig: {
                    // @ts-ignore
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let groundingText = "";
        if (grounding) {
            const sources = grounding.map(c => c.web?.title || c.web?.uri).filter(Boolean).join(", ");
            if (sources) groundingText = `\n(Sources: ${sources})`;
        }
        return (response.text || "Site analysis unavailable.") + groundingText;

    } catch (error) {
        // Attempt 2: Fallback to Google Search if Maps Tool rejects the query (e.g. 400 INVALID_ARGUMENT)
        console.warn("Maps Grounding rejected query, falling back to Search:", error);
        return await fallbackSearch(lat, lng, "Site Survey");
    }
};

// Fallback function using Google Search with coordinate strings
async function fallbackSearch(lat: number, lng: number, context: string): Promise<string> {
    const prompt = `
    I have coordinates: ${lat}, ${lng}.
    Context: ${context}
    
    Using Google Search:
    1. Find what is at or near these coordinates.
    2. Describe the location type (Commercial, Residential, etc).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let groundingText = "";
        if (grounding) {
            const sources = grounding.map(c => c.web?.title || c.web?.uri).filter(Boolean).join(", ");
            if (sources) groundingText = `\n(Sources: ${sources})`;
        }
        return (response.text || "Fallback analysis unavailable.") + groundingText;
    } catch (e) {
        console.error("Fallback failed:", e);
        return "Analysis failed completely.";
    }
}