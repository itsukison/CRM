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

    const handleUnifiedDelete = () => {
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

    return {
        handleCellUpdate,
        handleAddEmptyRow,
        handleUnifiedDelete
    };
};
