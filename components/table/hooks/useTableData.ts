import { TableData, Row } from '@/types';

interface UseTableDataProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
    selectedRowIds: Set<string>;
    onSelectRowIds: (ids: Set<string>) => void;
    selectedCellIds: Set<string>;
    onSelectCellIds: (ids: Set<string>) => void;
    setConfirmDialog: (dialog: { isOpen: boolean; title: string; description: string; onConfirm: () => void }) => void;
    setShowAddMenu: (show: boolean) => void;
}

export const useTableData = ({
    table,
    onUpdateTable,
    selectedRowIds,
    onSelectRowIds,
    selectedCellIds,
    onSelectCellIds,
    setConfirmDialog,
    setShowAddMenu
}: UseTableDataProps) => {

    const handleCellUpdate = (rowId: string, colId: string, value: any) => {
        const updatedRows = table.rows.map(r => {
            if (r.id === rowId) return { ...r, [colId]: value };
            return r;
        });
        onUpdateTable({ ...table, rows: updatedRows });
    };

    const handleAddEmptyRow = () => {
        const newRow: Row = { id: `row_${Date.now()}` };
        table.columns.forEach(c => newRow[c.id] = '');
        onUpdateTable({ ...table, rows: [...table.rows, newRow] });
        setShowAddMenu(false);
    };

    const handleUnifiedDelete = (targetRowId?: string) => {
        if (targetRowId) {
            setConfirmDialog({
                isOpen: true,
                title: '行の削除',
                description: 'この行を削除しますか？',
                onConfirm: () => {
                    onUpdateTable(prev => ({
                        ...prev,
                        rows: prev.rows.filter(r => r.id !== targetRowId)
                    }));
                    // If the deleted row was selected, remove it from selection
                    if (selectedRowIds.has(targetRowId)) {
                        const newSelected = new Set(selectedRowIds);
                        newSelected.delete(targetRowId);
                        onSelectRowIds(newSelected);
                    }
                }
            });
            return;
        }

        if (selectedRowIds.size > 0) {
            setConfirmDialog({
                isOpen: true,
                title: '行の削除',
                description: `選択された ${selectedRowIds.size} 件の行を削除しますか？`,
                onConfirm: () => {
                    onUpdateTable(prev => ({
                        ...prev,
                        rows: prev.rows.filter(r => !selectedRowIds.has(r.id))
                    }));
                    onSelectRowIds(new Set());
                    onSelectCellIds(new Set());
                }
            });
        } else if (selectedCellIds.size > 0) {
            onUpdateTable(prev => {
                const newRows = [...prev.rows];
                (Array.from(selectedCellIds) as string[]).forEach((cellId) => {
                    const [rId, cId] = cellId.split(':');
                    const rowIdx = newRows.findIndex(r => r.id === rId);
                    if (rowIdx !== -1) {
                        newRows[rowIdx] = { ...newRows[rowIdx], [cId]: '' };
                    }
                });
                return { ...prev, rows: newRows };
            });
        }
    };

    const handleAddRowAbove = (rowId: string) => {
        const newRow: Row = { id: `row_${Date.now()}` };
        table.columns.forEach(c => newRow[c.id] = '');

        const rowIndex = table.rows.findIndex(r => r.id === rowId);
        if (rowIndex !== -1) {
            const newRows = [...table.rows];
            newRows.splice(rowIndex, 0, newRow);
            onUpdateTable({ ...table, rows: newRows });
        }
    };

    const handleAddRowBelow = (rowId: string) => {
        const newRow: Row = { id: `row_${Date.now()}` };
        table.columns.forEach(c => newRow[c.id] = '');

        const rowIndex = table.rows.findIndex(r => r.id === rowId);
        if (rowIndex !== -1) {
            const newRows = [...table.rows];
            newRows.splice(rowIndex + 1, 0, newRow);
            onUpdateTable({ ...table, rows: newRows });
        }
    };

    return {
        handleCellUpdate,
        handleAddEmptyRow,
        handleUnifiedDelete,
        handleAddRowAbove,
        handleAddRowBelow
    };
};
