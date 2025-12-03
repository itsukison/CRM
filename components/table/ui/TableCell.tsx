import React from 'react';
import { Row, Column, definitionToColumn, TagOption } from '@/types';
import { EnrichmentProgress } from '@/services/enrichmentService';
import { IconSearch, IconFileText, IconDatabase, IconAlertTriangle, IconCheck, IconPlus } from '@/components/Icons';
import { evaluateFormula, getDefaultTagColor } from '../utils';

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
    const [showTagDropdown, setShowTagDropdown] = React.useState(false);
    const cellRef = React.useRef<HTMLTableCellElement>(null);

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

    const handleTagCellClick = (e: React.MouseEvent) => {
        if (column.type === 'tag' && !isEditing) {
            e.stopPropagation();
            setShowTagDropdown(true);
        } else {
            handleCellClick(e, row.id, column.id);
        }
    };

    const handleTagCellDoubleClick = () => {
        if (column.type !== 'tag') {
            handleCellDoubleClick(row.id, column.id);
        }
        // Tag columns don't use double-click anymore
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
            ref={cellRef}
            className={`border-b border-r border-[#E6E8EB] relative h-8 p-0 box-border overflow-hidden select-none
                ${isSelected && !isEditing ? 'bg-[#0052FF]/5' : ''}
            `}
            onClick={handleTagCellClick}
            onDoubleClick={handleTagCellDoubleClick}
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
                        // Save the value first using functional update to ensure latest state
                        handleCellUpdate(row.id, column.id, value);
                        // Use requestAnimationFrame to ensure the state update is processed
                        // before unmounting the editor. This prevents the value from being lost
                        // when clicking another cell, as it ensures React has processed the update.
                        requestAnimationFrame(() => {
                            setEditingCell(null);
                        });
                    }}
                    onCancel={() => setEditingCell(null)}
                />
            ) : (
                <>
                    <div className={`px-2 py-1.5 w-full h-full text-[#0A0B0D] text-xs overflow-hidden font-mono flex items-center
                        ${column.textOverflow === 'wrap' ? 'whitespace-normal break-words leading-snug' :
                            column.textOverflow === 'visible' ? 'whitespace-nowrap' :
                                'whitespace-nowrap'
                        }
                    `}
                        style={{
                            textOverflow: column.textOverflow === 'clip' ? 'clip' : column.textOverflow === 'visible' ? 'visible' : 'ellipsis'
                        }}>
                        {renderCellValue(displayValue, column.type, column)}
                    </div>
                    {column.type === 'tag' && showTagDropdown && (
                        <TagCellDropdown
                            cellRef={cellRef}
                            initialValue={rawValue}
                            column={column}
                            onSave={(value) => {
                                handleCellUpdate(row.id, column.id, value);
                                setShowTagDropdown(false);
                            }}
                            onClose={() => setShowTagDropdown(false)}
                        />
                    )}
                </>
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

    // Use a ref to track the initial value to prevent reset on re-render
    const initialValueRef = React.useRef(initialValue);
    const [value, setValue] = React.useState(() => {
        // Normalize initial value: treat undefined/null as empty string
        const normalized = initialValue === undefined || initialValue === null ? '' : String(initialValue);
        return normalized;
    });
    const [isComposing, setIsComposing] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const isSavingRef = React.useRef(false);

    // Update initialValueRef when initialValue changes (but don't reset state)
    React.useEffect(() => {
        if (initialValue !== initialValueRef.current) {
            initialValueRef.current = initialValue;
        }
    }, [initialValue]);

    // Focus on mount
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // Set cursor to end
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, []);

    const handleSave = React.useCallback((val: string) => {
        // Prevent multiple saves
        if (isSavingRef.current) return;
        isSavingRef.current = true;
        
        // Normalize empty values to empty string for consistency
        const normalizedValue = val === undefined || val === null ? '' : val;
        onSave(normalizedValue);
        
        // Reset saving flag after a short delay
        setTimeout(() => {
            isSavingRef.current = false;
        }, 100);
    }, [onSave]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation(); // Prevent global keys from triggering

        if (e.key === 'Enter' && !e.shiftKey) {
            if (isComposing) return;
            e.preventDefault();
            handleSave(value);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        // Use the current value from the textarea to ensure we capture the latest input
        const currentValue = e.target.value;
        handleSave(currentValue);
    }, [handleSave]);

    return (
        <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full px-2 py-1.5 text-xs bg-white outline-none font-mono text-[#0A0B0D] resize-none shadow-xl border-2 border-[#0052FF] z-50"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
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


const renderCellValue = (value: any, type: string, column?: Column) => {
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

            // Get tag colors from column options or default colors
            const getTagColors = (tagLabel: string): { bg: string; text: string; border: string } => {
                if (column?.options) {
                    const tagOption = column.options.find(opt => opt.label === tagLabel);
                    if (tagOption?.color) {
                        // Parse color string (format: "bg-blue-50 text-blue-600 border-blue-200")
                        const colorParts = tagOption.color.split(' ');
                        const bg = colorParts.find(p => p.startsWith('bg-')) || 'bg-[#F5F5F7]';
                        const text = colorParts.find(p => p.startsWith('text-')) || 'text-[#0A0B0D]';
                        const border = colorParts.find(p => p.startsWith('border-')) || 'border-[#E6E8EB]';
                        return { bg, text, border };
                    }
                }
                
                // Check for default colors for common tags
                const defaultColor = getDefaultTagColor(tagLabel);
                if (defaultColor) {
                    const colorParts = defaultColor.split(' ');
                    const bg = colorParts.find(p => p.startsWith('bg-')) || 'bg-[#F5F5F7]';
                    const text = colorParts.find(p => p.startsWith('text-')) || 'text-[#0A0B0D]';
                    const border = colorParts.find(p => p.startsWith('border-')) || 'border-[#E6E8EB]';
                    return { bg, text, border };
                }
                
                // Fallback to default
                return { bg: 'bg-[#F5F5F7]', text: 'text-[#0A0B0D]', border: 'border-[#E6E8EB]' };
            };

            return (
                <div className="flex gap-1 overflow-hidden whitespace-nowrap">
                    {tags.map((tag, idx) => {
                        const colors = getTagColors(tag);
                        return (
                            <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.border} border uppercase tracking-wider font-mono whitespace-nowrap flex-shrink-0`}>
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

interface TagCellDropdownProps {
    cellRef: React.RefObject<HTMLTableCellElement>;
    initialValue: any;
    column: Column;
    onSave: (value: any) => void;
    onClose: () => void;
}

const TagCellDropdown: React.FC<TagCellDropdownProps> = ({
    cellRef,
    initialValue,
    column,
    onSave,
    onClose
}) => {
    const [inputValue, setInputValue] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>(
        typeof initialValue === 'string' ? initialValue.split(',').map(t => t.trim()).filter(Boolean) :
            Array.isArray(initialValue) ? initialValue : []
    );
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

    // Close on Escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

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
            onClose();
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            setSelectedTags(prev => prev.slice(0, -1));
        }
    };

    // Filter options based on input
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(opt.label)
    );

    // Get position for dropdown
    const getDropdownPosition = () => {
        if (!cellRef.current) return { top: 0, left: 0 };
        const rect = cellRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 4,
            left: rect.left
        };
    };

    const position = getDropdownPosition();

    const getTagColors = (tagLabel: string): { bg: string; text: string; border: string } => {
        const tagOption = options.find(opt => opt.label === tagLabel);
        if (tagOption?.color) {
            const colorParts = tagOption.color.split(' ');
            const bg = colorParts.find(p => p.startsWith('bg-')) || 'bg-[#F5F5F7]';
            const text = colorParts.find(p => p.startsWith('text-')) || 'text-[#0A0B0D]';
            const border = colorParts.find(p => p.startsWith('border-')) || 'border-[#E6E8EB]';
            return { bg, text, border };
        }
        
        // Check for default colors for common tags
        const defaultColor = getDefaultTagColor(tagLabel);
        if (defaultColor) {
            const colorParts = defaultColor.split(' ');
            const bg = colorParts.find(p => p.startsWith('bg-')) || 'bg-[#F5F5F7]';
            const text = colorParts.find(p => p.startsWith('text-')) || 'text-[#0A0B0D]';
            const border = colorParts.find(p => p.startsWith('border-')) || 'border-[#E6E8EB]';
            return { bg, text, border };
        }
        
        return { bg: 'bg-[#F5F5F7]', text: 'text-[#0A0B0D]', border: 'border-[#E6E8EB]' };
    };

    return (
        <div
            ref={containerRef}
            className="fixed bg-white shadow-xl border border-[#E6E8EB] rounded-md z-[100] flex flex-col min-w-[200px] max-w-[300px]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-2 flex flex-wrap gap-1 border-b border-[#E6E8EB] min-h-[32px] max-h-[100px] overflow-y-auto">
                {selectedTags.map((tag, idx) => {
                    const colors = getTagColors(tag);
                    return (
                        <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${colors.bg} ${colors.text} ${colors.border} border`}>
                            {tag}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                                className="ml-1 hover:text-red-500"
                            >
                                ×
                            </button>
                        </span>
                    );
                })}
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[60px] text-xs outline-none bg-transparent"
                    placeholder={selectedTags.length === 0 ? "Select or create..." : ""}
                />
            </div>
            {(filteredOptions.length > 0 || inputValue) && (
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {inputValue && !options.some(o => o.label === inputValue) && !selectedTags.includes(inputValue) && (
                        <div
                            className="px-2 py-1.5 text-xs hover:bg-[#F5F5F7] cursor-pointer rounded text-blue-600 flex items-center gap-2"
                            onClick={() => {
                                toggleTag(inputValue);
                                setInputValue('');
                            }}
                        >
                            <IconPlus className="w-3 h-3" />
                            Create "{inputValue}"
                        </div>
                    )}
                    {filteredOptions.map(opt => {
                        const isSelected = selectedTags.includes(opt.label);
                        const colors = getTagColors(opt.label);
                        return (
                            <div
                                key={opt.id}
                                className="px-2 py-1.5 text-xs hover:bg-[#F5F5F7] cursor-pointer rounded text-[#0A0B0D] flex items-center gap-2"
                                onClick={() => {
                                    toggleTag(opt.label);
                                    setInputValue('');
                                }}
                            >
                                {isSelected && <IconCheck className="w-3 h-3 text-[#0052FF]" />}
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${colors.bg} ${colors.text} ${colors.border} border`}>
                                    {opt.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
