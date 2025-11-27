import React from 'react';
import { Row, Column, definitionToColumn } from '@/types';
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
    onContextMenu
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

    return (
        <td
            className={`border-b border-r border-[#E6E8EB] relative h-10 p-0 box-border overflow-hidden select-none
                ${isSelected && !isEditing ? 'ring-2 ring-inset ring-[#0052FF] bg-[#F5F5F7]' : ''}
            `}
            onClick={(e) => handleCellClick(e, row.id, column.id)}
            onDoubleClick={() => handleCellDoubleClick(row.id, column.id)}
            onContextMenu={handleContextMenu}
            style={{ verticalAlign: 'top', height: '40px', width, minWidth: width, maxWidth: width }}
        >
            {phaseDisplay ? phaseDisplay : isLoading ? (
                <div className="w-full h-full flex items-center px-3">
                    <div className="h-2 w-2/3 bg-[#E6E8EB] rounded animate-pulse"></div>
                </div>
            ) : isEditing ? (
                <textarea
                    autoFocus
                    className="absolute inset-0 w-full h-full px-3 py-2.5 text-sm bg-white outline-none font-mono text-[#0A0B0D] resize-none shadow-xl border-2 border-[#0052FF] z-50"
                    value={rawValue || ''}
                    onChange={(e) => handleCellUpdate(row.id, column.id, e.target.value)}
                    onBlur={() => setEditingCell(null)}
                    onKeyDown={(e) => {
                        e.stopPropagation(); // Prevent global keys from triggering
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            setEditingCell(null);
                        }
                    }}
                />
            ) : (
                <div className={`px-3 py-2.5 w-full h-full text-[#0A0B0D] text-sm overflow-hidden font-mono
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
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#F5F5F7] text-[#0A0B0D] border border-[#E6E8EB] uppercase tracking-wider font-mono">{value}</span>;
        case 'number':
            return <span className="font-mono text-[#0A0B0D]">{value}</span>;
        case 'date':
            return <span className="font-mono text-[#5B616E]">{value}</span>;
        default:
            return <span>{String(value)}</span>;
    }
};
