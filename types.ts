
export interface DataPoint {
    x: number;
    y: number;
}

export type LogData = Record<string, DataPoint[]>;

export interface FlightInfo {
    takeoffTime: string;
    totalDuration: string;
    takeoffTimestampMs: number;
    isRelativeTime: boolean;
}

export interface FlightPathPoint {
    lng: number;
    lat: number;
    alt: number;
    time: number;
}

export type ChartGroup = 'power' | 'flight_control' | 'impact' | 'control_input';

export interface ActionLog {
    time: Date;
    message: string;
}

export interface ChartDefinition {
    id: string;
    title: string;
    yLabel: string;
    yLabelRight?: string;
    isStepped?: boolean;
    datasets: {
        key: string;
        label: string;
        yAxisId?: 'left' | 'right';
    }[];
}

export interface AttitudeData {
    roll: DataPoint[];
    pitch: DataPoint[];
    yaw: DataPoint[];
}