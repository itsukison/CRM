'use client';

import { use } from 'react';
import TablePage from '@/src/features/table/TablePage';

export default function Page({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = use(params);
    return <TablePage tableId={tableId} />;
}
