import React from 'react';
import { Row, Column, definitionToColumn, TagOption } from '@/types';
import { EnrichmentProgress } from '@/services/enrichmentService';
import { IconSearch, IconFileText, IconDatabase, IconAlertTriangle } from '@/components/Icons';
import { evaluateFormula } from '../utils';

interface TableCellProps {
    row: Row;
    column: Column;
    allColumns: Column[];
    allRows: Row[]; // For aggregate formula functions
    isSelected: boolean;
    isEditing: boolean;
    isLoading: boolean;
    enrichmentProgress?: EnrichmentProgress;
    width: number;
    handleCellClick: (e: React.MouseEvent, rowId: string, colId: string) => void;
    handleCellDoubleClick: (rowId: string, colId: string) => void;
    handleCellUpdate: (rowId: string, colId: string, value: any) => void;
    setEditingCell: (cell: { rowId: string; colId: string } | null) => void;
    onContextMenu?: (e: React.MouseEvent, rowId: string, colId: string, value: any) => void;
    selectionBorders?: {
        top: boolean;
        bottom: boolean;
        left: boolean;
        right: boolean;
    };
}

export const TableCell: React.FC<TableCellProps> = ({
    row,
    column,
    allColumns,
    allRows,
    isSelected,
    isEditing,
    isLoading,
    enrichmentProgress,
    width,
    handleCellClick,
    handleCellDoubleClick,
    handleCellUpdate,
    setEditingCell,
    onContextMenu,
    selectionBorders
}) => {
    const rawValue = row[column.id];

    let displayValue = rawValue;
    if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
        displayValue = evaluateFormula(rawValue, row, allColumns, allRows);
    }

    // Determine phase display
    let phaseDisplay = null;
    if (enrichmentProgress && enrichmentProgress.phase !== 'complete') {
        const phaseLabels: Record<string, string> = {
            'discovery': 'Searching',
            'extraction': 'Extracting',
            'financial': 'Financials',
            'error': 'Error'
        };
        const phaseColors: Record<string, string> = {
            'discovery': 'text-[#0052FF]',
            'extraction': 'text-purple-600',
            'financial': 'text-[#4B7C0F]',
            'error': 'text-[#FC401F]'
        };

        phaseDisplay = (
            <div className="w-full h-full flex items-center px-3 gap-2">
                <span className={phaseColors[enrichmentProgress.phase]}>
                    {enrichmentProgress.phase === 'discovery' && <IconSearch className="w-3.5 h-3.5 animate-pulse" />}
                    {enrichmentProgress.phase === 'extraction' && <IconFileText className="w-3.5 h-3.5 animate-pulse" />}
                    {enrichmentProgress.phase === 'financial' && <IconDatabase className="w-3.5 h-3.5 animate-pulse" />}
                    {enrichmentProgress.phase === 'error' && <IconAlertTriangle className="w-3.5 h-3.5" />}
                </span>
                <span className={`text-xs font-mono ${phaseColors[enrichmentProgress.phase]}`}>
                    {phaseLabels[enrichmentProgress.phase]}
                </span>
            </div>
        );
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e, row.id, column.id, rawValue);
        }
    };

    const getSelectionStyles = () => {
        if (!isSelected || isEditing || !selectionBorders) return {};

        const shadows: string[] = [];
        const color = '#0052FF';

        if (selectionBorders.top) shadows.push(`inset 0 2px 0 0 ${color}`);
        if (selectionBorders.bottom) shadows.push(`inset 0 -2px 0 0 ${color}`);
        if (selectionBorders.left) shadows.push(`inset 2px 0 0 0 ${color}`);
        if (selectionBorders.right) shadows.push(`inset -2px 0 0 0 ${color}`);

        return {
            boxShadow: shadows.join(', '),
            zIndex: 50
        };
    };

    return (
        <td
            className={`border-b border-r border-[#E6E8EB] relative h-8 p-0 box-border overflow-hidden select-none
                ${isSelected && !isEditing ? 'bg-[#0052FF]/5' : ''}
            `}
            onClick={(e) => handleCellClick(e, row.id, column.id)}
            onDoubleClick={() => handleCellDoubleClick(row.id, column.id)}
            onContextMenu={handleContextMenu}
            style={{
                verticalAlign: 'top',
                height: '32px',
                width,
                minWidth: width,
                maxWidth: width,
                ...getSelectionStyles()
            }}
        >
            {phaseDisplay ? phaseDisplay : isLoading ? (
                <div className="w-full h-full flex items-center px-2">
                    <div className="h-2 w-2/3 bg-[#E6E8EB] rounded animate-pulse"></div>
                </div>
            ) : isEditing ? (
                <CellEditor
                    initialValue={rawValue}
                    column={column}
                    onSave={(value) => {
                        handleCellUpdate(row.id, column.id, value);
                        setEditingCell(null);
                    }}
                    onCancel={() => setEditingCell(null)}
                />
            ) : (
                <div className={`px-2 py-1.5 w-full h-full text-[#0A0B0D] text-xs overflow-hidden font-mono flex items-center
                    ${column.textOverflow === 'wrap' ? 'whitespace-normal break-words leading-snug' :
                        column.textOverflow === 'visible' ? 'whitespace-nowrap' :
                            'whitespace-nowrap'
                    }
                `}
                    style={{
                        textOverflow: column.textOverflow === 'clip' ? 'clip' : column.textOverflow === 'visible' ? 'visible' : 'ellipsis'
                    }}>
                    {renderCellValue(displayValue, column.type)}
                </div>
            )}
        </td>
    );
};

interface CellEditorProps {
    initialValue: any;
    column: Column;
    onSave: (value: any) => void;
    onCancel: () => void;
}

const CellEditor: React.FC<CellEditorProps> = ({ initialValue, column, onSave, onCancel }) => {
    if (column.type === 'tag') {
        return <TagEditor initialValue={initialValue} column={column} onSave={onSave} onCancel={onCancel} />;
    }

    const [value, setValue] = React.useState(initialValue || '');
    const [isComposing, setIsComposing] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Focus on mount
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // Set cursor to end
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation(); // Prevent global keys from triggering

        if (e.key === 'Enter' && !e.shiftKey) {
            if (isComposing) return;
            e.preventDefault();
            onSave(value);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full px-2 py-1.5 text-xs bg-white outline-none font-mono text-[#0A0B0D] resize-none shadow-xl border-2 border-[#0052FF] z-50"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onSave(value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
        />
    );
};

const TagEditor: React.FC<CellEditorProps> = ({ initialValue, column, onSave, onCancel }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>(
        typeof initialValue === 'string' ? initialValue.split(',').map(t => t.trim()).filter(Boolean) :
            Array.isArray(initialValue) ? initialValue : []
    );
    const [isOpen, setIsOpen] = React.useState(true);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const options = column.options || [];

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onSave(selectedTags.join(', '));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedTags, onSave]);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                if (!selectedTags.includes(inputValue.trim())) {
                    setSelectedTags(prev => [...prev, inputValue.trim()]);
                }
                setInputValue('');
            } else {
                onSave(selectedTags.join(', '));
            }
        } else if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            setSelectedTags(prev => prev.slice(0, -1));
        }
    };

    // Filter options based on input
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(opt.label)
    );

    return (
        <div ref={containerRef} className="absolute inset-0 min-w-[200px] bg-white shadow-xl border border-[#E6E8EB] rounded-md z-50 flex flex-col">
            <div className="p-2 flex flex-wrap gap-1 border-b border-[#E6E8EB] min-h-[32px]">
                {selectedTags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-[#F5F5F7] text-[#0A0B0D] border border-[#E6E8EB]">
                        {tag}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                            className="ml-1 hover:text-red-500"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[60px] text-xs outline-none bg-transparent"
                    placeholder={selectedTags.length === 0 ? "Select or create..." : ""}
                />
            </div>
            {isOpen && (filteredOptions.length > 0 || inputValue) && (
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {inputValue && !options.some(o => o.label === inputValue) && !selectedTags.includes(inputValue) && (
                        <div
                            className="px-2 py-1.5 text-xs hover:bg-[#F5F5F7] cursor-pointer rounded text-blue-600"
                            onClick={() => {
                                toggleTag(inputValue);
                                setInputValue('');
                            }}
                        >
                            Create "{inputValue}"
                        </div>
                    )}
                    {filteredOptions.map(opt => (
                        <div
                            key={opt.id}
                            className="px-2 py-1.5 text-xs hover:bg-[#F5F5F7] cursor-pointer rounded text-[#0A0B0D]"
                            onClick={() => {
                                toggleTag(opt.label);
                                setInputValue('');
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const renderCellValue = (value: any, type: string) => {
    if (value === undefined || value === null || value === '') return <span className="text-[#B1B7C3] text-[10px] italic select-none"></span>;

    switch (type) {
        case 'url':
            return (
                <a href={value} target="_blank" rel="noreferrer" className="text-[#0052FF] hover:underline block font-mono" onClick={(e) => e.stopPropagation()}>
                    {String(value).replace(/^https?:\/\//, '')}
                </a>
            );
        case 'tag':
            const tags = typeof value === 'string' ? value.split(',').map(t => t.trim()).filter(Boolean) : Array.isArray(value) ? value : [String(value)];

            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag, idx) => {
                        let bg = 'bg-[#F5F5F7]';
                        let text = 'text-[#0A0B0D]';
                        let border = 'border-[#E6E8EB]';

                        // Status Colors
                        if (tag === '未接触') { bg = 'bg-gray-100'; text = 'text-gray-600'; border = 'border-gray-200'; }
                        else if (tag === '調査中') { bg = 'bg-blue-50'; text = 'text-blue-600'; border = 'border-blue-200'; }
                        else if (tag === '連絡済み') { bg = 'bg-green-50'; text = 'text-green-600'; border = 'border-green-200'; }
                        else if (tag === '除外候補') { bg = 'bg-red-50'; text = 'text-red-600'; border = 'border-red-200'; }
                        else if (tag === 'High' || tag === '高') { bg = 'bg-green-50'; text = 'text-green-700'; border = 'border-green-200'; }
                        else if (tag === 'Medium' || tag === '中') { bg = 'bg-yellow-50'; text = 'text-yellow-700'; border = 'border-yellow-200'; }
                        else if (tag === 'Low' || tag === '低') { bg = 'bg-gray-50'; text = 'text-gray-500'; border = 'border-gray-200'; }

                        return (
                            <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${bg} ${text} ${border} border uppercase tracking-wider font-mono whitespace-nowrap`}>
                                {tag}
                            </span>
                        );
                    })}
                </div>
            );
        case 'number':
            return <span className="font-mono text-[#0A0B0D]">{value}</span>;
        case 'date':
            return <span className="font-mono text-[#5B616E]">{value}</span>;
        default:
            return <span>{String(value)}</span>;
    }
};
