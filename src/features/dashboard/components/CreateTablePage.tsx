'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TableCreator } from '@/components/TableCreator';
import { TableData } from '@/types';
import { createTable } from '@/services/tableService';
import { createRow, rowToData } from '@/services/rowService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CreateTablePage() {
    const router = useRouter();
    const { currentOrganization } = useAuth();

    const handleTableCreated = async (tableData: TableData) => {
        if (!currentOrganization) {
            toast.error('組織が選択されていません');
            return;
        }

        try {
            // 1. Create the table definition
            const { table: newTable, error: tableError } = await createTable(
                currentOrganization.id,
                tableData.name,
                tableData.description,
                tableData.columns
            );

            if (tableError || !newTable) throw tableError;

            // 2. Insert initial rows (if any)
            if (tableData.rows.length > 0) {
                // Insert sequentially to ensure order or avoiding rate limits if many
                // For 5 rows, parallel is fine usually, but let's be safe
                await Promise.all(tableData.rows.map(row =>
                    createRow(newTable.id, rowToData(row))
                ));
            }

            router.push(`/dashboard/tables/${newTable.id}`);
            toast.success('テーブルを作成しました');
        } catch (error) {
            console.error('Failed to create table:', error);
            toast.error('テーブルの作成に失敗しました');
        }
    };

    return (
        <TableCreator
            isOpen={true}
            onTableCreated={handleTableCreated}
            onCancel={() => router.push('/dashboard')}
            orgId={currentOrganization?.id}
        />
    );
}
