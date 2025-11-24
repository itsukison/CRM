import { TableData, Row, ColumnDefinition } from '@/types';
import { identifyCompanies, scrapeCompanyDetails } from '../services/companyService';
import { definitionToColumn } from '@/types';

export interface EnrichToolOptions {
    table: TableData;
    targetColumnIds: string[];
    scope: 'selected' | 'all';
    selectedRowIds: Set<string>;
}

export interface GenerateToolOptions {
    table: TableData;
    count: number;
    targetColumnIds: string[];
    prompt?: string;
}

const findCompanyKeyColumn = (columns: ColumnDefinition[]) => {
    const allColumns = columns.map(definitionToColumn);
    const companyKeyColumn =
        allColumns.find(c => c.id === 'company_name') ||
        allColumns.find(c => {
            const title = c.title.toLowerCase();
            return (
                title.includes('会社') ||
                title.includes('企業') ||
                title.includes('社名') ||
                title.includes('company') ||
                title.includes('name') ||
                title.includes('domain') ||
                title.includes('ドメイン') ||
                title.includes('website') ||
                title.includes('サイト') ||
                title.includes('url')
            );
        }) ||
        null;
    return companyKeyColumn;
};

export const enrichRowsWithCompanyDetails = async (
    options: EnrichToolOptions
): Promise<TableData> => {
    const { table, targetColumnIds, scope, selectedRowIds } = options;

    const targetColDefs = table.columns.filter(c => targetColumnIds.includes(c.id));
    const targetCols = targetColDefs.map(definitionToColumn);

    if (targetCols.length === 0) {
        return table;
    }

    const companyKeyColumn = findCompanyKeyColumn(table.columns);
    if (!companyKeyColumn) {
        console.warn('No company key column found for enrichment.');
        return table;
    }

    const rowsToEnrich: Row[] =
        scope === 'selected' && selectedRowIds.size > 0
            ? table.rows.filter(r => selectedRowIds.has(r.id))
            : table.rows;

    const updatedRows: Row[] = [...table.rows];

    for (const row of rowsToEnrich) {
        const companyKey = row[companyKeyColumn.id] as string;
        if (!companyKey || typeof companyKey !== 'string' || companyKey.trim() === '') {
            continue;
        }

        try {
            const columnTitles = targetCols.map(col => col.title);
            const { data } = await scrapeCompanyDetails(companyKey, columnTitles);

            const existingIdx = updatedRows.findIndex(r => r.id === row.id);
            if (existingIdx === -1) continue;

            const updated: Row = { ...updatedRows[existingIdx] };
            targetCols.forEach(col => {
                const value = data[col.title];
                if (value !== undefined) {
                    (updated as any)[col.id] = value;
                }
            });
            updatedRows[existingIdx] = updated;
        } catch (e) {
            console.error(`Failed to enrich row ${row.id}`, e);
        }
    }

    return {
        ...table,
        rows: updatedRows,
    };
};

export const generateCompaniesAndEnrich = async (
    options: GenerateToolOptions
): Promise<TableData> => {
    const { table, count, targetColumnIds, prompt } = options;

    const targetColDefs = table.columns.filter(c => targetColumnIds.includes(c.id));
    const targetCols = targetColDefs.map(definitionToColumn);
    const companyKeyColumn = findCompanyKeyColumn(table.columns);

    if (!companyKeyColumn) {
        console.warn('No company key column found for generation.');
        return table;
    }

    const query = prompt || '日本の実在する企業';
    const companyNames = await identifyCompanies(query, count);

    if (!companyNames || companyNames.length === 0) {
        console.warn('No company names generated.');
        return table;
    }

    const rowsCopy: Row[] = [...table.rows];

    // Append new rows at the end
    const baseRows: Row[] = [];
    companyNames.slice(0, count).forEach((name, idx) => {
        const newRow: Row = { id: `gen_${Date.now()}_${idx}` };
        table.columns.forEach(col => {
            (newRow as any)[col.id] = '';
        });
        (newRow as any)[companyKeyColumn.id] = name;
        rowsCopy.push(newRow);
        baseRows.push(newRow);
    });

    // Enrich generated rows
    for (const row of baseRows) {
        const companyName = (row as any)[companyKeyColumn.id] as string;
        if (!companyName) continue;

        try {
            const targetColumnTitles = targetCols.map(c => c.title);
            const { data } = await scrapeCompanyDetails(companyName, targetColumnTitles);

            const existingIdx = rowsCopy.findIndex(r => r.id === row.id);
            if (existingIdx === -1) continue;

            const updatedRow: Row = { ...rowsCopy[existingIdx] };
            targetCols.forEach(col => {
                const value = data[col.title];
                if (value !== undefined) {
                    (updatedRow as any)[col.id] = value;
                }
            });

            rowsCopy[existingIdx] = updatedRow;
        } catch (e) {
            console.error(`Failed to enrich generated row for ${companyName}`, e);
        }
    }

    return {
        ...table,
        rows: rowsCopy,
    };
};


