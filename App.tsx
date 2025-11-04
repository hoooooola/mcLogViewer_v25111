
import React, { useState, useCallback, useMemo } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { LogData, FlightInfo, ChartGroup, ActionLog, FlightPathPoint } from './types';
import { processRawData, processMetadata } from './services/logProcessor';

export default function App() {
    const [logData, setLogData] = useState<LogData | null>(null);
    const [flightPath, setFlightPath] = useState<FlightPathPoint[] | null>(null);
    const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [activeChartGroups, setActiveChartGroups] = useState<ChartGroup[]>(['power']);
    const [isSmooth, setIsSmooth] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    const [actionLogs, setActionLogs] = useState<ActionLog[]>([{ time: new Date(), message: '頁面已載入。' }]);
    const [syncTime, setSyncTime] = useState<number | null>(null);
    
    const addActionLog = useCallback((message: string) => {
        setActionLogs(prev => [...prev, { time: new Date(), message }]);
    }, []);

    const handleFileParse = useCallback((file: File) => {
        setIsLoading(true);
        setError('');
        setLogData(null);
        setFlightPath(null);
        setFlightInfo(null);
        setFileName(file.name);
        setActiveChartGroups(['power']); // Reset to default on new file
        addActionLog(`正在解析檔案：${file.name}`);

        (window as any).Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                try {
                    addActionLog('解析完成，正在處理數據...');
                    const metadata = processMetadata(results.data);
                    const { chartData, flightPath } = processRawData(results.data);
                    setFlightInfo(metadata);
                    setLogData(chartData);
                    setFlightPath(flightPath);
                    // Set initial sync time to the start of the flight
                    setSyncTime(metadata.takeoffTimestampMs);
                    addActionLog('數據處理完成。');
                } catch (e: any) {
                    setError(`處理數據時發生錯誤：${e.message}`);
                    addActionLog(`處理數據時發生錯誤：${e.message}`);
                } finally {
                    setIsLoading(false);
                }
            },
            error: (err: any) => {
                setError(`CSV 解析錯誤：${err.message}`);
                addActionLog(`CSV 解析錯誤：${err.message}`);
                setIsLoading(false);
            }
        });
    }, [addActionLog]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const newIsDark = !prev;
            if (newIsDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            addActionLog(`已切換至${newIsDark ? '深色' : '淺色'}模式。`);
            return newIsDark;
        });
    }, [addActionLog]);
    
    const handleChartGroupToggle = useCallback((group: ChartGroup) => {
        setActiveChartGroups(prev => 
            prev.includes(group) 
                ? prev.filter(g => g !== group) 
                : [...prev, group]
        );
    }, []);

    const leftPanelProps = useMemo(() => ({
        onFileParse: handleFileParse,
        fileName,
        flightInfo,
        isLoading,
        error,
        activeChartGroups,
        onChartGroupToggle: handleChartGroupToggle,
        isSmooth,
        setIsSmooth,
        toggleTheme,
        actionLogs,
        addActionLog,
        hasLogData: !!logData,
    }), [handleFileParse, fileName, flightInfo, isLoading, error, activeChartGroups, handleChartGroupToggle, isSmooth, toggleTheme, actionLogs, addActionLog, logData]);

    return (
        <div className={`min-h-screen p-4 lg:p-6 transition-colors duration-300`}>
            <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-3 printable-area">
                    <LeftPanel {...leftPanelProps} />
                </div>
                <div className="lg:col-span-7">
                    <RightPanel 
                        logData={logData}
                        flightInfo={flightInfo}
                        flightPath={flightPath}
                        activeChartGroups={activeChartGroups} 
                        isSmooth={isSmooth}
                        onTimeSync={setSyncTime}
                        syncTime={syncTime}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </main>
            <footer>
                <p className="text-center text-text-secondary mt-8 text-sm">© 2025 CiRC Inc. · Flight Log Analyzer · created by Dr. erica</p>
            </footer>
        </div>
    );
}