
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush } from 'recharts';
import { LogData, ChartGroup, ChartDefinition, FlightInfo, FlightPathPoint, DataPoint } from '../types';
import { CHART_DEFINITIONS, DATA_COLORS } from '../constants';
import { Card } from './Card';
import { CesiumViewer } from './CesiumViewer';
import { FlightPathMap } from './FlightPathMap';

interface RightPanelProps {
    logData: LogData | null;
    flightInfo: FlightInfo | null;
    flightPath: FlightPathPoint[] | null;
    activeChartGroups: ChartGroup[];
    isSmooth: boolean;
    onTimeSync: (time: number | null) => void;
    syncTime: number | null;
    isDarkMode: boolean;
}

const ChartPlaceholder: React.FC<{message?: string}> = ({ message }) => (
    <div className="col-span-1 flex items-center justify-center bg-content border border-border rounded-lg h-96">
        <p className="text-text-secondary text-center p-4">{message || '請上傳日誌檔案並從左側選擇一個檢查項目以顯示圖表。'}</p>
    </div>
);

const formatRelativeTime = (tickItem: number) => {
    // tickItem is in milliseconds
    const totalSeconds = Math.floor(tickItem / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const formatTaipeiTime = (tickItem: number) => {
    return new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).format(new Date(tickItem));
};

interface ChartProps {
    chartDef: ChartDefinition;
    data: any[];
    isSmooth: boolean;
    syncId: string;
    flightInfo: FlightInfo | null;
    timeRange: { start: number; end: number } | null;
}

const Chart: React.FC<ChartProps> = ({ chartDef, data, isSmooth, syncId, flightInfo, timeRange }) => {
    const { title, yLabel, yLabelRight, isStepped, datasets } = chartDef;

    const hasData = datasets.some(ds => data.some(p => p[ds.label] !== null && p[ds.label] !== undefined));

    if (!hasData) {
        return (
            <Card>
                <h3 className="text-md font-semibold text-center mb-2 text-text-primary">{title}</h3>
                <div className="flex items-center justify-center h-64 text-text-secondary">
                    日誌中不存在此數據欄位。
                </div>
            </Card>
        );
    }
    
    const tickFormatter = flightInfo?.isRelativeTime ? formatRelativeTime : formatTaipeiTime;
    const xLabel = flightInfo?.isRelativeTime ? '飛行時間 (mm:ss)' : '時間 (台北時間)';

    return (
        <Card>
            <h3 className="text-md font-semibold text-center mb-2 text-text-primary">{title}</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} syncId={syncId} syncMethod="value" margin={{ top: 5, right: 30, left: 20, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                            dataKey="x" 
                            type="number" 
                            domain={timeRange ? [timeRange.start, timeRange.end] : ['dataMin', 'dataMax']} 
                            tickFormatter={tickFormatter}
                            tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 12 }} 
                            label={{ value: xLabel, position: 'insideBottom', offset: 0, fill: 'hsl(var(--text-secondary))' }} 
                            allowDataOverflow={true}
                        />
                        <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 12 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--text-secondary))' }} />
                        {yLabelRight && (
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 12 }} label={{ value: yLabelRight, angle: 90, position: 'insideRight', fill: 'hsl(var(--text-secondary))' }} />
                        )}
                        <Tooltip
                          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--content))', border: '1px solid hsl(var(--border))' }}
                          labelStyle={{ color: 'hsl(var(--text-primary))' }}
                          formatter={(value: any) => typeof value === 'number' ? value.toFixed(3) : null}
                          labelFormatter={tickFormatter}
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        {datasets.map((ds, index) => (
                            <Line
                                key={ds.key}
                                yAxisId={ds.yAxisId || 'left'}
                                type={isStepped ? 'stepAfter' : (isSmooth ? 'monotone' : 'linear')}
                                dataKey={ds.label}
                                name={ds.label}
                                stroke={DATA_COLORS[index % DATA_COLORS.length]}
                                dot={false}
                                strokeWidth={2}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


export const RightPanel: React.FC<RightPanelProps> = ({ logData, flightInfo, flightPath, activeChartGroups, isSmooth, onTimeSync, syncTime, isDarkMode }) => {
    const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null);
    
    const chartsToShow = useMemo(() => {
        return activeChartGroups.flatMap(group => CHART_DEFINITIONS[group]);
    }, [activeChartGroups]);

    const syncId = 'sync-charts';
    const tickFormatter = flightInfo?.isRelativeTime ? formatRelativeTime : formatTaipeiTime;

    const handleBrushMouseMove = (e: any) => {
        if (e && e.isTooltipActive && e.activeLabel) {
            onTimeSync(e.activeLabel);
        }
    };
    const handleBrushMouseLeave = () => {
        onTimeSync(null);
    };

    const prepareChartData = useCallback((chartDef: ChartDefinition): any[] => {
        if (!logData || !flightInfo) return [];

        const { takeoffTimestampMs } = flightInfo;
        const allX = new Set<number>();
        chartDef.datasets.forEach(ds => {
            if(logData[ds.key]) {
                logData[ds.key].forEach(p => allX.add(p.x));
            }
        });
        
        if (allX.size === 0) return [];

        const sortedX = Array.from(allX).sort((a, b) => a - b);
        
        const dataMaps = chartDef.datasets.map(ds => ({
            label: ds.label,
            map: new Map(logData[ds.key] ? logData[ds.key].map(p => [p.x, p.y]) : [])
        }));
        
        const mergedData = sortedX.map(x => {
            const point: any = { x: takeoffTimestampMs + (x * 1000) };
            dataMaps.forEach(dm => {
                point[dm.label] = dm.map.get(x) ?? null;
            });
            return point;
        });

        return mergedData;
    }, [logData, flightInfo]);

    const brushData = useMemo(() => {
        if (!logData || !flightInfo) return [];
        const { takeoffTimestampMs } = flightInfo;

        const brushKey = logData['thr_value']?.length > 0 ? 'thr_value' : 'motor_1';
        const overviewData = logData[brushKey];

        if (!overviewData || overviewData.length === 0) {
            const firstAvailableKey = Object.keys(logData).find(key => logData[key]?.length > 0);
            if (firstAvailableKey) {
                return logData[firstAvailableKey].map(d => ({ x: takeoffTimestampMs + (d.x * 1000), y: null }));
            }
            return [];
        }
        return overviewData.map(d => ({ x: takeoffTimestampMs + (d.x * 1000), y: d.y }));
    }, [logData, flightInfo]);

    const handleBrushChange = (range: { startIndex?: number; endIndex?: number }) => {
        if (!brushData || brushData.length === 0) {
            setTimeRange(null);
            return;
        }

        if (range.startIndex !== undefined && range.endIndex !== undefined) {
            const isFullRange = range.startIndex === 0 && range.endIndex === brushData.length - 1;
            
            if (isFullRange) {
                setTimeRange(null);
            } else {
                const start = brushData[range.startIndex].x;
                const end = brushData[range.endIndex].x;
                setTimeRange({ start, end });
            }
        } else {
            setTimeRange(null);
        }
    };
    
    useEffect(() => {
        setTimeRange(null);
    }, [logData]);

    return (
        <div className="flex flex-col gap-6">
             <Card>
                <h2 className="text-lg font-semibold border-b border-border pb-2 mb-3 text-text-primary">Cesium 視窗</h2>
                <CesiumViewer flightPath={flightPath} />
            </Card>
             <Card>
                <h2 className="text-lg font-semibold border-b border-border pb-2 mb-3 text-text-primary">地圖顯示</h2>
                 { logData ? (
                     <FlightPathMap flightPath={flightPath} syncTime={syncTime} />
                ) : (
                    <div className="flex items-center justify-center h-64 text-text-secondary">
                        請先上傳日誌檔案以顯示飛行軌跡。
                    </div>
                )}
            </Card>
             <Card>
                <h2 className="text-lg font-semibold border-b border-border pb-2 text-text-primary">時間軸調整</h2>
                {logData && brushData.length > 0 ? (
                    <>
                        <div className="h-28 mt-4 -mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={brushData} 
                                    syncId={syncId} 
                                    syncMethod="value"
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                    onMouseMove={handleBrushMouseMove}
                                    onMouseLeave={handleBrushMouseLeave}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="x" type="number" tickFormatter={tickFormatter} tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 10 }} padding={{ left: 10, right: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={['dataMin', 'dataMax']} />
                                    <Tooltip content={() => null} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Line type="monotone" dataKey="y" name="油門/馬達" stroke={DATA_COLORS[0]} dot={false} strokeWidth={1.5} connectNulls={true} />
                                    <Brush 
                                        dataKey="x" 
                                        height={40} 
                                        stroke="hsl(var(--primary))" 
                                        fill="hsla(var(--bkg), 0.5)"
                                        travellerWidth={10}
                                        gap={5}
                                        tickFormatter={tickFormatter}
                                        onChange={handleBrushChange}
                                     />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-text-secondary mt-2 text-center">在此預覽圖上拖曳或縮放選取框，即可調整下方圖表的時間範圍。</p>
                    </>
                ) : (
                    <p className="text-sm text-text-secondary mt-2">在圖表上使用滑鼠滾輪或雙指縮放手勢進行縮放。點擊並拖動以平移時間軸。所有圖表皆已同步。</p>
                )}
            </Card>
            <div className="grid grid-cols-1 gap-6">
                {!logData ? (
                    <ChartPlaceholder />
                ) : chartsToShow.length > 0 ? (
                    chartsToShow.map(chartDef => (
                        <Chart 
                            key={chartDef.id}
                            chartDef={chartDef}
                            data={prepareChartData(chartDef)}
                            isSmooth={isSmooth}
                            syncId={syncId}
                            flightInfo={flightInfo}
                            timeRange={timeRange}
                        />
                    ))
                ) : (
                   <ChartPlaceholder message="請從左側選擇一個或多個檢查項目以顯示圖表。" />
                )}
            </div>
        </div>
    );
};