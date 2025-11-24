import { useState } from 'react';
import { TableData } from '@/types';

interface UseTableSelectionProps {
    table: TableData;
    selectedRowIds: Set<string>;
    onSelectRowIds: (ids: Set<string>) => void;
    selectedCellIds: Set<string>;
    onSelectCellIds: (ids: Set<string>) => void;
    editingCell: { rowId: string; colId: string } | null;
    setEditingCell: (cell: { rowId: string; colId: string } | null) => void;
}

export const useTableSelection = ({
    table,
    selectedRowIds,
    onSelectRowIds,
    selectedCellIds,
    onSelectCellIds,
    editingCell,
    setEditingCell
}: UseTableSelectionProps) => {
    const [anchorCell, setAnchorCell] = useState<{ rowId: string; colId: string } | null>(null);

    const toggleRowSelection = (id: string) => {
        const newSet = new Set(selectedRowIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        onSelectRowIds(newSet);
    };

    const toggleAllRows = () => {
        if (selectedRowIds.size === table.rows.length) {
            onSelectRowIds(new Set());
        } else {
            onSelectRowIds(new Set(table.rows.map(r => r.id)));
        }
    };

    const handleCellClick = (e: React.MouseEvent, rowId: string, colId: string) => {
        // Don't select if clicking inside editor
        if (editingCell) return;

        // Prevent browser text selection on shift+click
        if (e.shiftKey) {
            e.preventDefault();
        }

        if (e.shiftKey && anchorCell) {
            // Range Selection
            const startRowIdx = table.rows.findIndex(r => r.id === anchorCell.rowId);
            const endRowIdx = table.rows.findIndex(r => r.id === rowId);
            const startColIdx = table.columns.findIndex(c => c.id === anchorCell.colId);
            const endColIdx = table.columns.findIndex(c => c.id === colId);

            if (startRowIdx === -1 || endRowIdx === -1 || startColIdx === -1 || endColIdx === -1) return;

            const minRow = Math.min(startRowIdx, endRowIdx);
            const maxRow = Math.max(startRowIdx, endRowIdx);
            const minCol = Math.min(startColIdx, endColIdx);
            const maxCol = Math.max(startColIdx, endColIdx);

            const newSet = new Set<string>();
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    newSet.add(`${table.rows[r].id}:${table.columns[c].id}`);
                }
            }
            onSelectCellIds(newSet);
        } else {
            // Single Selection
            const newSet = new Set<string>();
            newSet.add(`${rowId}:${colId}`);
            onSelectCellIds(newSet);
            setAnchorCell({ rowId, colId });
        }
    };

    const handleCellDoubleClick = (rowId: string, colId: string) => {
        setEditingCell({ rowId, colId });
        // Also ensure it is selected
        const newSet = new Set<string>();
        newSet.add(`${rowId}:${colId}`);
        onSelectCellIds(newSet);
        setAnchorCell({ rowId, colId });
    };

    return {
        toggleRowSelection,
        toggleAllRows,
        handleCellClick,
        handleCellDoubleClick,
        anchorCell
    };
};
