
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

// Make sure the 'marked' library is loaded in your index.html
declare const marked: any;

const PRESET_PROMPTS = [
    { 
        label: '總體飛行摘要', 
        value: '請根據這份 CSV 飛行日誌數據，提供一個總體飛行摘要。總結關鍵的飛行指標，例如飛行持續時間、最大高度、最大速度等。' 
    },
    { 
        label: '異常偵測', 
        value: '請分析這份 CSV 飛行日誌，找出任何可能的異常或潛在問題。請關注震動值 (vibr_x, vibr_y, vibr_z)、錯誤碼 (error)、馬達輸出 (motor_*) 和姿態角 (roll, pitch) 的劇烈變化。' 
    },
    { 
        label: '電源系統分析', 
        value: '請分析這份日誌中的電源系統表現。檢查電變電流 (esc*_current)、電壓 (esc*_voltage) 和溫度 (esc*_temperature) 數據，並指出任何不平衡或異常的讀數。' 
    },
    { 
        label: '尋找墜機點', 
        value: '這架無人機可能發生了撞擊。請分析日誌數據，特別是 is_armed 狀態、震動值 (vibr_*) 和陀螺儀數據 (gyro_*)，以識別最可能的撞擊時間點。' 
    },
];


export const GeminiAnalysisPanel: React.FC<{ rawData: any[] | null }> = ({ rawData }) => {
    const [customPrompt, setCustomPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    
    const handlePromptSelect = (prompt: string) => {
        setCustomPrompt(prompt);
    };

    const handleAnalysis = useCallback(async () => {
        if (!rawData || rawData.length === 0) {
            setError('沒有可供分析的日誌數據。');
            return;
        }
        if (!customPrompt.trim()) {
            setError('請輸入或選擇一個分析指令。');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            // Convert subset of CSV to string to keep payload reasonable
            const dataSubset = rawData.slice(0, 500); // Send first 500 rows
            const csvString = (window as any).Papa.unparse(dataSubset);
            
            const fullPrompt = `
                You are an expert drone flight log analyst. Based on the following CSV data, please answer the user's request.
                The data represents a flight log. Provide a concise, clear, and well-structured analysis in Markdown format.

                User Request: "${customPrompt}"

                CSV Data (first ${dataSubset.length} rows of ${rawData.length}):
                \`\`\`csv
                ${csvString}
                \`\`\`
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
            });
            
            const markdownText = response.text;
            setAnalysisResult(markdownText);

        } catch (e: any) {
            console.error(e);
            setError(`分析時發生錯誤: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [rawData, customPrompt]);


    return (
        <div className="mt-4 border-t border-border pt-4">
            {!rawData ? (
                 <div className="flex items-center justify-center h-24 bg-bkg rounded-md">
                    <p className="text-text-secondary">請先上傳日誌檔案以啟用 AI 分析功能。</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">選擇預設指令或自行輸入</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                             {PRESET_PROMPTS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => handlePromptSelect(p.value)}
                                    className="px-3 py-1 text-xs bg-secondary text-white rounded-full hover:bg-opacity-80 transition-colors"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <textarea
                            id="gemini-prompt-textarea"
                            name="gemini-prompt-textarea"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full h-24 p-2 bg-bkg border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition"
                            placeholder="例如：分析這趟飛行的震動數據，並指出異常高峰..."
                        />
                    </div>
                    <button
                        onClick={handleAnalysis}
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                    >
                         {isLoading ? '分析中...' : '執行 AI 分析'}
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {analysisResult && (
                         <div className="mt-4 p-4 bg-bkg rounded-md border border-border">
                            <h3 className="text-md font-semibold mb-2 text-text-primary">分析結果</h3>
                            <div 
                                className="prose prose-sm dark:prose-invert max-w-none text-text-primary"
                                dangerouslySetInnerHTML={{ __html: marked.parse(analysisResult) }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
