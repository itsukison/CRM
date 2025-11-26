import { useState, useRef, useCallback } from 'react';
import { TableData, Column, columnToDefinition } from '@/types';

interface UseTableColumnsProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
    setConfirmDialog: (dialog: { isOpen: boolean; title: string; description: string; onConfirm: () => void }) => void;
}

export const useTableColumns = ({ table, onUpdateTable, setConfirmDialog }: UseTableColumnsProps) => {
    const [editingCol, setEditingCol] = useState<Column | null>(null);
    const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizingRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

    const handleAddColumn = () => {
        handleAddColumnAt(table.columns.length);
    };

    const handleAddColumnAt = (index: number) => {
        const newColId = `col_${Date.now()}`;
        const newCol: Column = {
            id: newColId,
            title: `新規カラム`,
            type: 'text',
            description: '',
            textOverflow: 'clip'
        };
        onUpdateTable(prev => {
            // Insert new column definition at the specified index
            const newColDef = columnToDefinition(newCol, index);
            const newColumns = [...prev.columns];
            newColumns.splice(index, 0, newColDef);

            // Re-index orders
            const reorderedColumns = newColumns.map((c, i) => ({ ...c, order: i }));

            return {
                ...prev,
                columns: reorderedColumns,
            };
        });
        setEditingCol(newCol);
        setActiveColMenu(newColId);
    };

    const handleUpdateColumn = (updatedCol: Column) => {
        onUpdateTable(prev => ({
            ...prev,
            columns: prev.columns.map(c => {
                if (c.id === updatedCol.id) {
                    return columnToDefinition(updatedCol, c.order);
                }
                return c;
            })
        }));
        setEditingCol(updatedCol);
        setActiveColMenu(null);
    };

    const handleDeleteColumn = (colId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'カラムの削除',
            description: 'このカラムを削除しますか？データは失われます。',
            onConfirm: () => {
                onUpdateTable(prev => ({
                    ...prev,
                    columns: prev.columns.filter(c => c.id !== colId),
                    rows: prev.rows.map(r => {
                        const newRow = { ...r };
                        delete newRow[colId];
                        return newRow;
                    })
                }));
                setActiveColMenu(null);
            }
        });
    };

    const handleColResizeMove = useCallback((e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { colId, startX, startWidth } = resizingRef.current;
        const diff = e.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Min width 50
        setColumnWidths(prev => ({ ...prev, [colId]: newWidth }));
    }, []);

    const handleColResizeEnd = useCallback(() => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleColResizeMove);
        document.removeEventListener('mouseup', handleColResizeEnd);
        document.body.style.cursor = '';
    }, [handleColResizeMove]);

    const handleColResizeStart = (e: React.MouseEvent, colId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const startWidth = columnWidths[colId] || 200;
        resizingRef.current = { colId, startX: e.pageX, startWidth };
        document.addEventListener('mousemove', handleColResizeMove);
        document.addEventListener('mouseup', handleColResizeEnd);
        document.body.style.cursor = 'col-resize';
    };

    return {
        editingCol,
        setEditingCol,
        activeColMenu,
        setActiveColMenu,
        handleAddColumn,
        handleAddColumnAt,
        handleUpdateColumn,
        handleDeleteColumn,
        columnWidths,
        setColumnWidths,
        handleColResizeStart
    };
};
