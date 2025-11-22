'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TableData } from '../types';
import { IconDatabase } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { getTables } from '../services/tableService';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { deleteTable } from '../services/tableService';
import { toast } from 'sonner';
import { IconDots, IconTrash } from '../components/Icons';

const DashboardPage: React.FC = () => {
    const router = useRouter();
    const { currentOrganization, loading: authLoading } = useAuth();
    const [tables, setTables] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tableToDelete, setTableToDelete] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTables() {
            if (!currentOrganization) {
                setTables([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { tables, error } = await getTables(currentOrganization.id);
                if (error) throw error;
                setTables(tables);
            } catch (err) {
                console.error('Error fetching tables:', err);
                setError('テーブルの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            fetchTables();
        }
    }, [currentOrganization, authLoading]);

    const handleTableClick = (tableId: string) => {
        router.push(`/dashboard/tables/${tableId}`);
    };

    const handleCreateClick = () => {
        router.push('/dashboard/create');
    };

    const handleDeleteTable = async () => {
        if (!tableToDelete) return;

        const { error } = await deleteTable(tableToDelete);
        if (error) {
            console.error('Failed to delete table:', error);
            toast.error('テーブルの削除に失敗しました');
        } else {
            toast.success('テーブルを削除しました');
            setTables(prev => prev.filter(t => t.id !== tableToDelete));
        }
        setTableToDelete(null);
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="p-12 animate-in fade-in duration-500 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-[#323232]">ダッシュボード</h1>
                {currentOrganization && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        {currentOrganization.name}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all group">
                    <h3 className="text-gray-500 text-xs font-bold font-mono uppercase tracking-wider mb-2 group-hover:text-blue-600">データベース数</h3>
                    <p className="text-4xl font-bold tracking-tighter text-[#323232]">{tables.length}</p>
                </div>
                <div className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all group">
                    <h3 className="text-gray-500 text-xs font-bold font-mono uppercase tracking-wider mb-2 group-hover:text-blue-600">総レコード数</h3>
                    <p className="text-4xl font-bold tracking-tighter text-[#323232]">
                        {tables.reduce((acc, t) => acc + (t.rows?.length || 0), 0)}
                    </p>
                </div>
                <div className="p-6 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all group">
                    <h3 className="text-gray-500 text-xs font-bold font-mono uppercase tracking-wider mb-2 group-hover:text-green-600">システムステータス</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xl font-bold text-[#323232]">稼働中</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-6 tracking-tight text-[#323232] border-b border-gray-100 pb-2">データベース一覧</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => (
                    <div
                        key={table.id}
                        onClick={() => handleTableClick(table.id)}
                        className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IconDatabase className="w-12 h-12 text-blue-600" />
                        </div>

                        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-100 outline-none transition-colors">
                                    <IconDots className="w-4 h-4 text-gray-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setTableToDelete(table.id)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    >
                                        <IconTrash className="w-4 h-4 mr-2" />
                                        削除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="mb-4 pr-8">
                            <h3 className="text-lg font-bold text-[#323232] group-hover:text-blue-600 transition-colors mb-1">{table.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10">{table.description || "No description provided."}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mt-4 pt-4 border-t border-gray-50">
                            <span>{table.rows?.length || 0} ROWS</span>
                            <span>{table.columns.length} COLS</span>
                        </div>
                    </div>
                ))}
                <div
                    onClick={handleCreateClick}
                    className="bg-[#f2f2f2] p-6 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 h-48"
                >
                    <span className="text-3xl mb-2">+</span>
                    <span className="text-sm font-bold uppercase tracking-wider">新規作成</span>
                </div>
            </div>

            <AlertDialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>テーブルの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            本当にこのテーブルを削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTable} className="bg-red-600 hover:bg-red-700">
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DashboardPage;
