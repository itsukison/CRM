import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { COLORS } from '../constants';
import { IconDatabase, IconPlus, IconSettings, IconChevronRight, IconTrash } from './Icons';
import { deleteTable } from '../services/tableService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from 'sonner';

interface SidebarProps {
    tables: { id: string, name: string }[];
    currentTableId: string;
    onSelectTable: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tables, currentTableId, onSelectTable }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Determine active view from current location
    const isLanding = pathname === '/';
    const isDashboard = pathname === '/dashboard';
    const isCreateTable = pathname === '/dashboard/create';
    const isTableView = pathname?.startsWith('/dashboard/tables/');

    const handleDeleteTable = async () => {
        if (!tableToDelete) return;

        const { error } = await deleteTable(tableToDelete);
        if (error) {
            console.error('Failed to delete table:', error);
            toast.error('テーブルの削除に失敗しました');
        } else {
            toast.success('テーブルを削除しました');
            // Refresh the page or update state (parent should handle this, but for now force refresh or redirect)
            if (currentTableId === tableToDelete) {
                router.push('/dashboard');
            } else {
                window.location.reload(); // Simple reload to refresh list for now
            }
        }
        setTableToDelete(null);
    };

    return (
        <>
            <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen border-r border-gray-200 flex flex-col bg-white z-10 relative transition-all duration-300`}>
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-20 text-gray-400 hover:text-blue-600"
                >
                    <IconChevronRight className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                </button>

                {/* Logo Area */}
                <div className={`p-6 cursor-pointer group ${isCollapsed ? 'flex justify-center px-2' : ''}`} onClick={() => router.push('/')}>
                    <div className="w-6 h-6 transition-transform group-hover:scale-95 shrink-0" style={{ backgroundColor: COLORS.BLUE }}></div>
                    {!isCollapsed && <h1 className="ml-3 text-lg font-bold tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap overflow-hidden">Flowly</h1>}
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-3 space-y-1">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className={`w-full text-left px-3 py-2 rounded-sm text-sm font-medium transition-colors flex items-center ${isDashboard && !isTableView && !isCreateTable ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'} ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                        title="ダッシュボード"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        {!isCollapsed && <span>ダッシュボード</span>}
                    </button>

                    {!isCollapsed && (
                        <div className="pt-6 pb-2 px-3 text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                            データベース
                        </div>
                    )}
                    {isCollapsed && <div className="h-6"></div>}

                    {tables.map(table => (
                        <div key={table.id} className="group/item relative flex items-center px-3 py-2 rounded-sm text-sm font-medium transition-colors "
                            style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
                        >
                            <button
                                onClick={() => {
                                    onSelectTable(table.id);
                                    router.push(`/dashboard/tables/${table.id}`);
                                }}
                                className={`w-full text-left ${isCollapsed ? 'flex justify-center' : 'flex items-center'} ${currentTableId === table.id && isTableView ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                title={table.name}
                            >
                                <div className={`flex items-center ${isCollapsed ? '' : 'gap-2'} overflow-hidden`}>
                                    <IconDatabase className={`w-4 h-4 shrink-0 ${currentTableId === table.id && isTableView ? 'text-blue-500' : 'text-gray-400'}`} />
                                    {!isCollapsed && <span className="truncate">{table.name}</span>}
                                </div>
                                {!isCollapsed && currentTableId === table.id && isTableView && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></div>}
                            </button>
                            {/* Delete button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTableToDelete(table.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="削除"
                            >
                                <IconTrash className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => router.push('/dashboard/create')}
                        className={`w-full text-left px-3 py-2 mt-2 rounded-sm text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 border border-dashed border-gray-200 hover:border-blue-200 flex items-center transition-all ${isCollapsed ? 'justify-center' : 'gap-2'}`}
                        title="新規作成"
                    >
                        <IconPlus className="w-3.5 h-3.5 shrink-0" />
                        {!isCollapsed && <span>新規作成</span>}
                    </button>
                </nav>

                {/* Bottom Section */}
                <div className={`p-4 border-t border-gray-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-gray-500">システム稼働中</span>
                        </div>
                    )}
                    <button className={`py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-sm text-xs font-semibold text-gray-700 transition-colors flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 w-full justify-center'}`}>
                        <IconSettings className="w-3.5 h-3.5" /> {!isCollapsed && "設定"}
                    </button>
                </div>
            </div>

            <AlertDialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
                <AlertDialogContent className="fixed inset-0 flex items-center justify-center">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">テーブルの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            本当にこのテーブルを削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300">キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTable} className="bg-red-600 hover:bg-red-700">
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
