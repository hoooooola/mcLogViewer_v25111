import { LogData, FlightInfo, DataPoint, FlightPathPoint } from '../types';
import { HEADER_MAPPINGS, ALL_DATA_KEYS, DATA_KEY_METADATA } from '../constants';

const getLogValue = (row: any, canonicalKey: string): number | null => {
    const possibleKeys = HEADER_MAPPINGS[canonicalKey] || [canonicalKey];
    for (const key of possibleKeys) {
        const value = row[key];
        if (value !== undefined && value !== null) {
            const numValue = parseFloat(value);
            // Return the value if it's a valid number
            if (!isNaN(numValue)) {
                return numValue;
            }
        }
    }
    return null;
};

// New helper function to find a numeric value from a list of possible keys.
// This makes GPS data extraction more robust against different CSV header names.
const findValueFromKeys = (row: any, keys: string[]): number | null => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
            const value = parseFloat(row[key]);
            if (!isNaN(value)) {
                return value;
            }
        }
    }
    return null;
};

export function processMetadata(data: any[]): FlightInfo {
    // 1. Always calculate duration from the 'time' column, as it's the source for the chart's X-axis.
    // This ensures the displayed duration is always in sync with the charts.
    let minTime = Infinity, maxTime = -Infinity;
    data.forEach(row => {
        if (row && typeof row.time === 'number' && isFinite(row.time)) {
            minTime = Math.min(minTime, row.time);
            maxTime = Math.max(maxTime, row.time);
        }
    });

    let totalDuration = 'N/A';
    if (isFinite(minTime)) {
        const timeScale = minTime > 1e6 ? 0.001 : 1; // Handle microseconds
        const durationMs = (maxTime - minTime) * timeScale;
        if (durationMs > 0) {
            const totalSeconds = Math.floor(durationMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            totalDuration = `${minutes} min ${seconds} sec`;
        }
    }

    // 2. Check for an absolute takeoff time from multiple possible headers.
    const unixTimeKeys = ['unix_time', 'blackbox.sensor_values.gps_data.unix_time'];
    let takeoffTimestamp: number | null = null;
    
    for (const row of data) {
        if (row) {
            const ts = findValueFromKeys(row, unixTimeKeys);
            if (ts !== null && isFinite(ts) && ts > 0) {
                takeoffTimestamp = ts;
                break; // Found the first valid timestamp
            }
        }
    }
    
    if (takeoffTimestamp !== null) {
        const takeoffTimestampMs = takeoffTimestamp < 1e12 ? takeoffTimestamp * 1000 : takeoffTimestamp; // handle seconds vs milliseconds
        const flightDate = new Date(takeoffTimestampMs);
        const taipeiTime = new Intl.DateTimeFormat('zh-TW', {
            dateStyle: 'long', timeStyle: 'medium', timeZone: 'Asia/Taipei', hourCycle: 'h23'
        }).format(flightDate);
        
        return { 
            takeoffTime: taipeiTime, 
            totalDuration,
            takeoffTimestampMs, 
            isRelativeTime: false 
        };
    }
    
    // 3. If no absolute timestamp is found, it's a relative timeline.
    if (!isFinite(minTime)) { // No time data at all
        return { takeoffTime: 'N/A', totalDuration: 'N/A', takeoffTimestampMs: 0, isRelativeTime: true };
    }

    return {
        takeoffTime: 'N/A (無絕對時間戳)',
        totalDuration, // Use duration calculated from 'time' column
        takeoffTimestampMs: 0,
        isRelativeTime: true
    };
}


export function processRawData(data: any[]): { chartData: LogData, flightPath: FlightPathPoint[] } {
    const MAX_POINTS = 3000;
    const step = data.length > MAX_POINTS ? Math.floor(data.length / MAX_POINTS) : 1;
    
    let minTime = Infinity;
    for (const row of data) {
        if (row && typeof row.time === 'number' && isFinite(row.time)) {
            minTime = Math.min(minTime, row.time);
        }
    }

    const startTime = isFinite(minTime) ? minTime : 0;
    const timeScale = startTime > 1e6 ? 0.001 : 1; // Likely microseconds

    let initialAltitude: number | null = null;
    // Pre-scan to find the first valid altitude to use as a baseline for relative altitude calculations
    for (const row of data) {
        if (row) {
            const alt = getLogValue(row, 'altitude');
            if (alt !== null) {
                initialAltitude = alt;
                break;
            }
        }
    }

    const relevantKeys = ALL_DATA_KEYS.filter(k => !['time', 'unix_time', 'longitude', 'latitude'].includes(k));
    const chartData: Record<string, DataPoint[]> = {};
    relevantKeys.forEach(key => chartData[key] = []);
    const flightPath: FlightPathPoint[] = [];

    for (let i = 0; i < data.length; i += step) {
        const row = data[i];
        if (!row || typeof row.time !== 'number') continue;

        const t = ((row.time - startTime) * timeScale) / 1000; // time in seconds, starting from 0
        
        for (const key of relevantKeys) {
            let value = getLogValue(row, key);
            if (value !== null) {
                // Apply transformations using the metadata dictionary
                const metadata = DATA_KEY_METADATA[key];
                if (metadata) {
                    if (metadata.isStateful && metadata.statefulTransform) {
                         // Only apply stateful transform if the required state (initialAltitude) is available
                        if (key === 'altitude' && initialAltitude !== null) {
                            value = metadata.statefulTransform(value, { initialAltitude });
                        }
                    } else if (metadata.transform) {
                        value = metadata.transform(value);
                    }
                }
                chartData[key].push({ x: t, y: value });
            }
        }

        // Flight path data uses absolute altitude for correct 2D/3D map representation
        let lat = findValueFromKeys(row, ['latitude', 'lat', 'Latitude']);
        let lng = findValueFromKeys(row, ['longitude', 'lon', 'lng', 'Longitude']);
        const alt = findValueFromKeys(row, ['altitude', 'alt', 'Altitude']);

        if (lat !== null && lng !== null && alt !== null && lat !== 0 && lng !== 0) {
            // Check if latitude/longitude values are likely scaled by a large factor (e.g., from some flight controllers)
            // Valid latitude is between -90 and 90. Valid longitude is between -180 and 180.
            if (Math.abs(lat) > 90) {
                lat /= 10000000;
            }
            if (Math.abs(lng) > 180) {
                lng /= 10000000;
            }
            flightPath.push({ lat, lng, alt, time: t });
        }
    }
    
    return { chartData, flightPath };
}