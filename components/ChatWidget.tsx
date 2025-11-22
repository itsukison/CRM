
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TableData, Filter, SortState } from '../types';
import { analyzeChatIntent } from '../services/geminiService';
import { IconMessageCircle, IconX, IconChevronRight, IconSparkles } from './Icons';

interface ChatWidgetProps {
    table: TableData;
    onApplyFilter: (filter: Filter | null) => void;
    onApplySort: (sort: SortState | null) => void;
    onUpdateTable: (table: TableData) => void;
    selectedRowIds: Set<string>;
    selectedCellIds: Set<string>;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    table, 
    onApplyFilter, 
    onApplySort, 
    onUpdateTable,
    selectedRowIds,
    selectedCellIds
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', role: 'ai', content: 'こんにちは。私はデータベースアシスタントです。' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [mode, setMode] = useState<'chat' | 'agent'>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsThinking(true);

        try {
            const selectionContext = {
                selectedRowIds: Array.from(selectedRowIds) as string[],
                selectedCellIds: Array.from(selectedCellIds) as string[]
            };

            const result = await analyzeChatIntent(userMsg.content, table, selectionContext, mode);
            
            let aiResponseText = result.reply || "処理しました。";

            if (result.intent === 'FILTER' && result.filterParams) {
                onApplyFilter(result.filterParams);
                aiResponseText += ` フィルタ適用中: ${result.filterParams.columnId} ${result.filterParams.operator === 'contains' ? 'を含む' : result.filterParams.operator === 'greater' ? 'より大きい' : 'と等しい'} ${result.filterParams.value}`;
            } else if (result.intent === 'SORT' && result.sortParams) {
                onApplySort(result.sortParams);
                aiResponseText += ` ${result.sortParams.columnId} で並び替えました。`;
            } else if (result.intent === 'EDIT') {
                 if (mode === 'chat') {
                     aiResponseText += " データの編集はAGENTモードに切り替えてから行ってください。";
                 } else {
                     aiResponseText += " (編集機能は現在UI経由でのみサポートされています。ツールバーを使用してください)";
                 }
            } else {
                if (userMsg.content.toLowerCase().includes("クリア") || userMsg.content.toLowerCase().includes("リセット")) {
                    onApplyFilter(null);
                    onApplySort(null);
                    aiResponseText = "フィルタとソートをクリアしました。";
                }
            }

            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponseText };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "エラーが発生しました。" }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleClear = () => {
        setMessages([{ id: 'welcome', role: 'ai', content: 'こんにちは。私はデータベースアシスタントです。' }]);
        onApplyFilter(null);
        onApplySort(null);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-0 w-[400px] h-[480px] bg-white border border-gray-200 shadow-2xl rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="p-3 bg-[#f2f2f2] border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">AI Chat</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={handleClear}
                                className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors uppercase tracking-wider"
                            >
                                Clear
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black p-1 hover:bg-gray-200 rounded"><IconX className="w-4 h-4"/></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'user' ? (
                                    <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-[#f2f2f2] text-[#323232] text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className="w-full text-[#323232] text-sm leading-relaxed pr-4 flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            <IconSparkles className={`w-4 h-4 ${mode === 'agent' ? 'text-blue-500' : 'text-gray-400'}`}/>
                                        </div>
                                        <div>
                                            {msg.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isThinking && (
                             <div className="w-full flex gap-3 pr-4">
                                <div className="shrink-0 mt-0.5">
                                    <IconSparkles className="w-4 h-4 text-gray-400"/>
                                </div>
                                <div className="text-sm text-gray-400 animate-pulse mt-0.5">
                                    考え中...
                                </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer: Mode Toggle & Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2 mb-2 pl-1">
                            <div className="flex bg-gray-100 rounded p-0.5">
                                <button 
                                    onClick={() => setMode('chat')}
                                    className={`px-3 py-0.5 text-[10px] font-bold rounded uppercase transition-all ${mode === 'chat' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Chat
                                </button>
                                <button 
                                    onClick={() => setMode('agent')}
                                    className={`px-3 py-0.5 text-[10px] font-bold rounded uppercase transition-all ${mode === 'agent' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Agent
                                </button>
                            </div>
                            {selectedRowIds.size > 0 && (
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {selectedRowIds.size}行選択中
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={mode === 'agent' ? "AIに操作を依頼..." : "データについて質問..."}
                                className="w-full pr-8 pl-3 py-2.5 bg-[#f2f2f2] border border-transparent focus:bg-white focus:border-blue-500 rounded-md outline-none text-sm transition-all placeholder-gray-400 text-[#323232]"
                            />
                            <button 
                                onClick={handleSend}
                                className="absolute right-2 top-2 text-blue-600 hover:bg-blue-50 rounded p-0.5"
                            >
                                <IconChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button - Only shown when CLOSED */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 bg-[#323232] hover:bg-black text-white"
                >
                    <IconMessageCircle className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};
