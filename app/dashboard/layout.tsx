'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { AsciiBackground } from '@/components/AsciiBackground';
import { getTables } from '@/services/tableService';
import { TableData } from '@/types';
import { TablesProvider } from '@/contexts/TablesContext';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, organizations, currentOrganization, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [tables, setTables] = useState<TableData[]>([]);
    const [currentTableId, setCurrentTableId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/signin');
            } else if (organizations.length === 0) {
                router.push('/org-setup');
            }
        }
    }, [user, organizations, authLoading, router]);

    // Load tables when organization changes
    useEffect(() => {
        async function loadTables() {
            if (!currentOrganization) {
                setTables([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { tables: dbTables, error } = await getTables(currentOrganization.id);
                if (error) throw error;
                setTables(dbTables);

                // Set initial current table if needed
                if (dbTables.length > 0 && !currentTableId) {
                    setCurrentTableId(dbTables[0].id);
                }
            } catch (err) {
                console.error('Error loading tables:', err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            loadTables();
        }
    }, [currentOrganization, authLoading]);

    // Update currentTableId based on pathname
    useEffect(() => {
        if (pathname?.startsWith('/dashboard/tables/')) {
            const tableId = pathname.split('/')[3];
            if (tableId) {
                setCurrentTableId(tableId);
            }
        }
    }, [pathname]);

    if (authLoading || loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#717886',
                background: '#FFFFFF',
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden text-[#323232] font-sans bg-white">
            <AsciiBackground />

            <Sidebar
                tables={tables}
                currentTableId={currentTableId}
                onSelectTable={(id) => {
                    setCurrentTableId(id);
                }}
            />

            <main className="flex-1 relative z-0 flex flex-col h-full overflow-hidden">
                {/* Top Bar with Org Switcher and User */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #DEE1E7',
                    background: '#FFFFFF',
                    zIndex: 10,
                }}>
                    <OrganizationSwitcher />
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#717886',
                        fontFamily: 'JetBrains Mono, monospace',
                    }}>
                        {user?.email}
                    </div>
                </div>

                <TablesProvider tables={tables}>
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </TablesProvider>
            </main>
            <Toaster />
        </div>
    );
}

