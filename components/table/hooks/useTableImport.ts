import { useState } from 'react';
import * as XLSX from 'xlsx';
import { TableData, Row, ColumnDefinition, ColumnType, definitionToColumn } from '@/types';
import Fuse from 'fuse.js';

interface UseTableImportProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
}

export interface ImportMapping {
    sourceHeader: string;
    action: 'existing' | 'new' | 'ignore';
    existingColumnId?: string;
    newColumnName?: string;
    newColumnType?: ColumnType;
}

export const useTableImport = ({ table, onUpdateTable }: UseTableImportProps) => {
    const [showImportModal, setShowImportModal] = useState(false);
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [importRows, setImportRows] = useState<any[][]>([]);
    const [importPreviewRows, setImportPreviewRows] = useState<any[][]>([]);
    const [importFileName, setImportFileName] = useState<string | null>(null);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Allow selecting the same file again
        e.target.value = '';

        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || (ext !== 'xlsx' && ext !== 'csv')) {
            alert('対応していないファイル形式です。xlsx または csv を選択してください。');
            return;
        }

        const MAX_SIZE_BYTES = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            alert('ファイルサイズが大きすぎます。5MB 以下のファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
            console.error('ファイル読み込みに失敗しました');
            alert('ファイルの読み込みに失敗しました。');
        };
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    alert('シートが見つかりませんでした。');
                    return;
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) {
                    alert('シートが無効です。');
                    return;
                }

                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                if (!sheetData || sheetData.length === 0) {
                    alert('データが見つかりませんでした。');
                    return;
                }

                const headerRow = sheetData[0] || [];
                const headers = headerRow.map((cell, idx) => {
                    const raw = cell == null ? '' : String(cell).trim();
                    return raw || `列${idx + 1}`;
                });

                const bodyRows = sheetData.slice(1).filter(row =>
                    row && row.some(cell => {
                        if (cell === null || cell === undefined) return false;
                        return String(cell).trim() !== '';
                    })
                );

                if (bodyRows.length === 0) {
                    alert('有効なデータ行が見つかりませんでした。');
                    return;
                }

                const MAX_ROWS = 500;
                const limitedRows = bodyRows.slice(0, MAX_ROWS);
                const preview = limitedRows.slice(0, 10);

                setImportHeaders(headers);
                setImportRows(limitedRows);
                setImportPreviewRows(preview);
                setImportFileName(file.name);
                setShowImportModal(true);
            } catch (err) {
                console.error('Excel/CSV の解析に失敗しました', err);
                alert('ファイルの解析に失敗しました。対応している形式か確認してください。');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleImportConfirm = (mappings: ImportMapping[]) => {
        if (importRows.length === 0) {
            alert('インポートするデータがありません。');
            return;
        }

        const hasAnyMapping = mappings.some(
            (m) => m.action === 'existing' || m.action === 'new'
        );
        if (!hasAnyMapping) {
            alert('少なくとも1つの列をマッピングしてください。');
            return;
        }

        const dataRows = importRows;

        onUpdateTable(prev => {
            if (!prev) return prev;

            const existingColumns = prev.columns;
            const updatedColumns: ColumnDefinition[] = [...existingColumns];
            const headerToTargetColId: Record<number, string> = {};
            const newColumns: ColumnDefinition[] = [];

            mappings.forEach((mapping, index) => {
                if (mapping.action === 'existing' && mapping.existingColumnId) {
                    const exists = existingColumns.some(c => c.id === mapping.existingColumnId);
                    if (exists) {
                        headerToTargetColId[index] = mapping.existingColumnId;
                    }
                    return;
                }

                if (mapping.action === 'new') {
                    const name = (mapping.newColumnName || mapping.sourceHeader || '').trim();
                    if (!name) return;
                    const type = mapping.newColumnType || 'text';
                    const newId = `import_col_${Date.now()}_${index}`;
                    const order = updatedColumns.length + newColumns.length;
                    const newColDef: ColumnDefinition = {
                        id: newId,
                        name,
                        type,
                        description: name,
                        required: false,
                        order,
                        textOverflow: 'clip'
                    };
                    newColumns.push(newColDef);
                    headerToTargetColId[index] = newId;
                    return;
                }
            });

            if (newColumns.length > 0) {
                updatedColumns.push(...newColumns);
            }

            if (Object.keys(headerToTargetColId).length === 0) {
                return prev;
            }

            const updatedRows: Row[] = [...prev.rows];

            const isRowEmptyForExistingColumns = (row: Row) => {
                return existingColumns.every(col => {
                    const val = row[col.id];
                    if (val === undefined || val === null) return true;
                    return String(val).trim() === '';
                });
            };

            const emptyRowIndices: number[] = [];
            updatedRows.forEach((row, idx) => {
                if (row.id.startsWith('empty_') && isRowEmptyForExistingColumns(row)) {
                    emptyRowIndices.push(idx);
                }
            });

            dataRows.forEach((dataRow, rowIndex) => {
                if (!dataRow || dataRow.length === 0) return;

                let targetRow: Row;
                let targetIndex: number;

                if (rowIndex < emptyRowIndices.length) {
                    targetIndex = emptyRowIndices[rowIndex];
                    targetRow = { ...updatedRows[targetIndex] };
                } else {
                    targetIndex = updatedRows.length;
                    targetRow = { id: `empty_import_${Date.now()}_${rowIndex}` };
                    updatedColumns.forEach(col => {
                        (targetRow as any)[col.id] = '';
                    });
                }

                Object.keys(headerToTargetColId).forEach((headerIndexStr) => {
                    const headerIndex = Number(headerIndexStr);
                    const targetColId = headerToTargetColId[headerIndex];
                    if (!targetColId) return;
                    const value = dataRow[headerIndex];
                    (targetRow as any)[targetColId] = value == null ? '' : value;
                });

                if (targetIndex < updatedRows.length) {
                    updatedRows[targetIndex] = targetRow;
                } else {
                    updatedRows.push(targetRow);
                }
            });

            return {
                ...prev,
                columns: updatedColumns,
                rows: updatedRows
            };
        });

        setShowImportModal(false);
        setImportHeaders([]);
        setImportRows([]);
        setImportPreviewRows([]);
        setImportFileName(null);
    };

    return {
        showImportModal,
        setShowImportModal,
        importHeaders,
        importRows,
        importPreviewRows,
        importFileName,
        handleFileSelected,
        handleImportConfirm
    };
};
