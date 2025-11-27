
import React, { useState, useRef, useEffect } from 'react';
import { AnalyzeChatResult, ChatMessage, TableData, Filter, SortState } from '@/types';
import { analyzeChatIntent } from '../services/geminiService';
import { IconMessageCircle, IconX, IconChevronRight, IconSparkles } from './Icons';
import { enrichRowsWithCompanyDetails, generateCompaniesAndEnrich } from './tableAiTools';

const ASK_MODE_REFUSAL =
    "I can help explain or look up that information, but modifications can only be requested in Agent Mode.";

// Reuse the same filter logic as TablePage (multi-filter AND)
const applyFiltersToRows = (rows: any[], filters: Filter[]): any[] => {
    if (!filters || filters.length === 0) return rows;
    return rows.filter(row =>
        filters.every(filter => {
            const val = row[filter.columnId];
            const strVal = String(val ?? '').toLowerCase();
            const filterVal = filter.value.toLowerCase();

            switch (filter.operator) {
                case 'contains': return strVal.includes(filterVal);
                case 'equals': return strVal === filterVal;
                case 'greater': {
                    const numValG = parseFloat(strVal);
                    const numFilterG = parseFloat(filterVal);
                    return !isNaN(numValG) && !isNaN(numFilterG) && numValG > numFilterG;
                }
                case 'less': {
                    const numValL = parseFloat(strVal);
                    const numFilterL = parseFloat(filterVal);
                    return !isNaN(numValL) && !isNaN(numFilterL) && numValL < numFilterL;
                }
                default:
                    return true;
            }
        })
    );
};

// Reuse the same multi-sort logic as TablePage
const applySortsToRows = (rows: any[], sorts: SortState[]): any[] => {
    if (!sorts || sorts.length === 0) return rows;
    const processed = [...rows];
    processed.sort((a, b) => {
        for (const sort of sorts) {
            const valA = a[sort.columnId];
            const valB = b[sort.columnId];

            if (valA === valB) continue;
            if (valA === undefined || valA === null || valA === '') return 1;
            if (valB === undefined || valB === null || valB === '') return -1;

            let comparison = 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else {
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                if (strA < strB) comparison = -1;
                if (strA > strB) comparison = 1;
            }

            return sort.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
    });
    return processed;
};

const calculateAggregate = (
    rows: any[],
    columnId: string,
    operation: 'max' | 'min' | 'mean'
): number | null => {
    const nums: number[] = [];
    for (const row of rows) {
        const v = row[columnId];
        if (v === undefined || v === null || v === '') continue;
        let num: number;
        if (typeof v === 'number') {
            num = v;
        } else {
            const parsed = parseFloat(String(v).replace(/,/g, ''));
            if (isNaN(parsed)) continue;
            num = parsed;
        }
        nums.push(num);
    }
    if (nums.length === 0) return null;
    if (operation === 'max') return Math.max(...nums);
    if (operation === 'min') return Math.min(...nums);
    const sum = nums.reduce((acc, v) => acc + v, 0);
    return sum / nums.length;
};

const getScopedRows = (
    allRows: any[],
    selectedRowIds: Set<string>,
    scope?: 'all' | 'selected'
): any[] => {
    if (scope === 'selected' && selectedRowIds.size > 0) {
        return allRows.filter(r => selectedRowIds.has(r.id));
    }
    return allRows;
};

const findCompanyNameColumnId = (table: TableData): string | null => {
    const cols = table.columns;
    const preferred =
        cols.find(c => c.id === 'company_name') ||
        cols.find(c => {
            const name = c.name.toLowerCase();
            return (
                name.includes('会社') ||
                name.includes('企業') ||
                name.includes('社名') ||
                name.includes('company') ||
                name.includes('name')
            );
        });
    return preferred ? preferred.id : null;
};

const findEmailColumnId = (table: TableData): string | null => {
    const cols = table.columns;
    const preferred =
        cols.find(c => (c as any).type === 'email') ||
        cols.find(c => {
            const name = c.name.toLowerCase();
            return name.includes('email') || name.includes('メール');
        });
    return preferred ? preferred.id : null;
};

const findCeoColumnId = (table: TableData): string | null => {
    const cols = table.columns;
    const preferred =
        cols.find(c => {
            const name = c.name.toLowerCase();
            return (
                name.includes('ceo') ||
                name.includes('代表取締役') ||
                name.includes('代表者') ||
                name.includes('代表')
            );
        }) || null;
    return preferred ? preferred.id : null;
};

const isAffirmative = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
        ['yes', 'y', 'ok', 'okay', 'sure', 'please', 'do it'].some(k => lower.includes(k)) ||
        ['はい', 'お願い', '実行', 'お願いします'].some(k => text.includes(k))
    );
};

const isNegative = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
        ['no', 'n', 'stop', 'cancel'].some(k => lower.includes(k)) ||
        ['いいえ', 'やめて', 'キャンセル'].some(k => text.includes(k))
    );
};

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
    const isComposingRef = useRef(false);
    const lastEnterTimeRef = useRef<number | null>(null);

    type PendingAgentActionTool = 'enrich' | 'generate_data';
    interface PendingAgentAction {
        tool: PendingAgentActionTool;
        summary: string;
        params: any;
    }

    const [pendingAgentAction, setPendingAgentAction] = useState<PendingAgentAction | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Pending destructive Agent action confirmation flow
        if (pendingAgentAction) {
            const text = trimmed;
            if (!isAffirmative(text) && !isNegative(text)) {
                const clarifyMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: 'この操作を実行してよいか「yes / no / はい / いいえ」で回答してください。'
                };
                setMessages(prev => [...prev, clarifyMsg]);
                return;
            }

            if (isNegative(text)) {
                setPendingAgentAction(null);
                const cancelledMsg: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    role: 'ai',
                    content: '操作をキャンセルしました。'
                };
                setMessages(prev => [...prev, cancelledMsg]);
                return;
            }

            // isAffirmative
            setIsThinking(true);
            try {
                if (pendingAgentAction.tool === 'enrich') {
                    const enriched = await enrichRowsWithCompanyDetails({
                        table,
                        targetColumnIds: pendingAgentAction.params.targetColumnIds,
                        scope: pendingAgentAction.params.scope ?? 'selected',
                        selectedRowIds,
                    });
                    onUpdateTable(enriched);
                } else if (pendingAgentAction.tool === 'generate_data') {
                    const generated = await generateCompaniesAndEnrich({
                        table,
                        count: pendingAgentAction.params.count,
                        targetColumnIds: pendingAgentAction.params.targetColumnIds,
                        prompt: pendingAgentAction.params.prompt,
                    });
                    onUpdateTable(generated);
                }

                const executedMsg: ChatMessage = {
                    id: (Date.now() + 3).toString(),
                    role: 'ai',
                    content: `Agentツールを実行しました: ${pendingAgentAction.summary}`
                };
                setMessages(prev => [...prev, executedMsg]);
            } catch (error) {
                console.error(error);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 4).toString(),
                    role: 'ai',
                    content: 'Agentツールの実行中にエラーが発生しました。'
                }]);
            } finally {
                setPendingAgentAction(null);
                setIsThinking(false);
            }
            return;
        }

        setIsThinking(true);

        try {
            const selectionContext = {
                selectedRowIds: Array.from(selectedRowIds) as string[],
                selectedCellIds: Array.from(selectedCellIds) as string[]
            };

            const result: AnalyzeChatResult = await analyzeChatIntent(userMsg.content, table, selectionContext, mode);
            let aiResponseText = mode === 'chat' ? '' : (result.reply || "処理しました。");

            if (mode === 'chat') {
                // --- Ask Mode: strictly read-only, never touch filters or data ---
                const lower = userMsg.content.toLowerCase();
                if (lower.includes('クリア') || lower.includes('リセット')) {
                    aiResponseText =
                        "フィルタや並び替えのクリアは操作にあたるため、Askモードからは実行しません。\n" +
                        ASK_MODE_REFUSAL;
                } else if (result.intent === 'EDIT' || result.tool === 'enrich' || result.tool === 'generate_data') {
                    // Any edit-like intent is refused in Ask mode
                    aiResponseText = `${result.reply ?? ''}\n\n${ASK_MODE_REFUSAL}`.trim();
                } else if (result.filterParams) {
                    const baseRows = getScopedRows(table.rows, selectedRowIds, result.filterParams.scope);
                    const filteredRows = applyFiltersToRows(baseRows, [result.filterParams]);
                    const maxRowsToShow = 5;
                    const companyColId = findCompanyNameColumnId(table);

                    const question = userMsg.content.toLowerCase();
                    let valueColId: string | null = null;
                    if (question.includes('ceo') || question.includes('代表')) {
                        valueColId = findCeoColumnId(table);
                    } else if (
                        question.includes('email') ||
                        question.includes('mail') ||
                        question.includes('メール')
                    ) {
                        valueColId = findEmailColumnId(table);
                    }

                    if (filteredRows.length === 0) {
                        aiResponseText = `${aiResponseText}\n\n該当する行は見つかりませんでした。`;
                    } else if (valueColId) {
                        const lines = filteredRows.slice(0, maxRowsToShow).map(row => {
                            const name = companyColId ? row[companyColId] ?? '(名称未設定)' : '';
                            const value = row[valueColId] ?? '(値が未設定です)';
                            return `- ${name}: ${value}`;
                        });
                        const more =
                            filteredRows.length > maxRowsToShow
                                ? `\n…ほか ${filteredRows.length - maxRowsToShow} 行`
                                : '';
                        aiResponseText = `${aiResponseText}\n\n条件に一致した値:\n${lines.join('\n')}${more}`;
                    } else {
                        const lines = filteredRows.slice(0, maxRowsToShow).map(row => {
                            const name = companyColId ? row[companyColId] ?? '(名称未設定)' : '';
                            return `- ${name || JSON.stringify(row)}`;
                        });
                        const more =
                            filteredRows.length > maxRowsToShow
                                ? `\n…ほか ${filteredRows.length - maxRowsToShow} 行`
                                : '';
                        aiResponseText = `${aiResponseText}\n\n条件に一致した行の一覧:\n${lines.join('\n')}${more}`;
                    }
                } else if (
                    (result.tool === 'calculate_max' ||
                        result.tool === 'calculate_min' ||
                        result.tool === 'calculate_mean') &&
                    result.aggregateParams
                ) {
                    const baseRows = getScopedRows(table.rows, selectedRowIds, result.aggregateParams.scope);
                    const value = calculateAggregate(
                        baseRows,
                        result.aggregateParams.columnId,
                        result.aggregateParams.operation
                    );
                    if (value === null) {
                        aiResponseText = `${aiResponseText}\n\n指定されたカラムから数値を取得できませんでした。`;
                    } else {
                        const label =
                            result.aggregateParams.operation === 'max'
                                ? '最大値'
                                : result.aggregateParams.operation === 'min'
                                    ? '最小値'
                                    : '平均値';
                        aiResponseText = `${aiResponseText}\n\n${label}: ${value}`;
                    }
                }
            } else {
                // --- Agent Mode: can apply tools that affect view/data ---
                const lower = userMsg.content.toLowerCase();

                if (result.tool === 'filter' && result.filterParams) {
                    onApplyFilter(result.filterParams);
                    aiResponseText += ` フィルタ適用: ${result.filterParams.columnId} ${result.filterParams.operator} ${result.filterParams.value}`;
                } else if (result.tool === 'sort' && result.sortParams) {
                    onApplySort(result.sortParams);
                    aiResponseText += ` 並び替え: ${result.sortParams.columnId} (${result.sortParams.direction})`;
                } else if (
                    (result.tool === 'calculate_max' ||
                        result.tool === 'calculate_min' ||
                        result.tool === 'calculate_mean') &&
                    result.aggregateParams
                ) {
                    const baseRows = getScopedRows(table.rows, selectedRowIds, result.aggregateParams.scope);
                    const value = calculateAggregate(
                        baseRows,
                        result.aggregateParams.columnId,
                        result.aggregateParams.operation
                    );
                    if (value === null) {
                        aiResponseText = `${aiResponseText}\n\n指定されたカラムから数値を取得できませんでした。`;
                    } else {
                        const label =
                            result.aggregateParams.operation === 'max'
                                ? '最大値'
                                : result.aggregateParams.operation === 'min'
                                    ? '最小値'
                                    : '平均値';
                        aiResponseText = `${aiResponseText}\n\n[${label}] ${value}`;
                    }
                } else if (result.tool === 'enrich' && result.enrichParams) {
                    const scopeLabel =
                        result.enrichParams.scope === 'all' || !result.enrichParams.scope
                            ? '全行'
                            : `選択された ${selectedRowIds.size} 行`;
                    const colCount = result.enrichParams.targetColumnIds.length;
                    const summary = `${scopeLabel} × ${colCount} カラムをエンリッチします`;
                    setPendingAgentAction({
                        tool: 'enrich',
                        summary,
                        params: result.enrichParams,
                    });
                    aiResponseText += `\n\nAgentツール候補: ${summary}\n実行してよい場合は「yes / はい」と回答してください。`;
                } else if (result.tool === 'generate_data' && result.generateParams) {
                    const count = result.generateParams.count;
                    const colCount = result.generateParams.targetColumnIds.length;
                    const summary = `${count} 件の企業データを生成し、${colCount} カラムをエンリッチします`;
                    setPendingAgentAction({
                        tool: 'generate_data',
                        summary,
                        params: result.generateParams,
                    });
                    aiResponseText += `\n\nAgentツール候補: ${summary}\n実行してよい場合は「yes / はい」と回答してください。`;
                } else if (result.intent === 'EDIT') {
                    aiResponseText +=
                        " (一部の編集操作は現在UI経由でのみサポートされています。必要に応じてツールバーを使用してください)";
                } else if (lower.includes('クリア') || lower.includes('リセット')) {
                    onApplyFilter(null);
                    onApplySort(null);
                    aiResponseText = "フィルタとソートをクリアしました。";
                }
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponseText
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'ai', content: 'エラーが発生しました。' }
            ]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleClear = () => {
        setMessages([{ id: 'welcome', role: 'ai', content: 'こんにちは。私はデータベースアシスタントです。' }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-0 w-[400px] h-[480px] bg-white border border-gray-200 shadow-2xl rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="p-3 bg-[#f2f2f2] border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 tracking-wider ml-2">Flowly AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClear}
                                className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors uppercase tracking-wider"
                            >
                                クリア
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black p-1 hover:bg-gray-200 rounded"><IconX className="w-4 h-4" /></button>
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
                                            <IconSparkles className={`w-4 h-4 ${mode === 'agent' ? 'text-blue-500' : 'text-gray-400'}`} />
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
                                    <IconSparkles className="w-4 h-4 text-gray-400" />
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
                                    Ask
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
                                onCompositionStart={() => {
                                    isComposingRef.current = true;
                                }}
                                onCompositionEnd={() => {
                                    isComposingRef.current = false;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key !== 'Enter') return;
                                    if (isComposingRef.current) return;
                                    e.preventDefault();
                                    handleSend();
                                }}
                                placeholder={mode === 'agent' ? "AIに操作を依頼..." : "データについて質問..."}
                                className="w-full pr-8 pl-3 py-2.5 bg-[#f2f2f2] border border-transparent focus:bg-white focus:border-blue-500 rounded-md outline-none text-sm transition-all placeholder-gray-400 text-[#323232]"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-2 text-blue-600 hover:bg-blue-50 rounded p-0.5"
                            >
                                <IconChevronRight className="w-4 h-4" />
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
