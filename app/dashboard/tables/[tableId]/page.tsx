'use client';

import TablePage from '@/components-pages/TablePage';
import { useParams } from 'next/navigation';

export default function Table() {
    const params = useParams();
    const tableId = params?.tableId as string;

    return <TablePage tableId={tableId} />;
}

