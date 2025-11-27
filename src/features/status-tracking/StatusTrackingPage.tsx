'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBoard } from './components/StatusBoard';
import { ConfigPanel } from './components/ConfigPanel';
import {
    NoConfigState,
    NoDataState,
    NoStatusColumnState,
    LoadingState,
    ErrorState,
} from './components/EmptyStates';
import { useStatusConfig } from './hooks/useStatusConfig';
import { useStatusBoard } from './hooks/useStatusBoard';
import { getTableMetadata, autoDetectCardFields } from './services/status-tracking.service';
import type { TableData } from '@/core/models/table';
import type { StatusBoardConfig } from './types';

/**
 * Main Status Tracking page component
 * Manages state for configuration and board data
 */
export default function StatusTrackingPage() {
    const { currentOrganization } = useAuth();
    const [currentTable, setCurrentTable] = useState<TableData | null>(null);
    const [loadingTable, setLoadingTable] = useState(false);

    const orgId = currentOrganization?.id || '';

    // Use custom hooks for config and board management
    const {
        config,
        setConfig,
        isConfigured,
    } = useStatusConfig({ orgId });

    const {
        boardData,
        loading: boardLoading,
        error: boardError,
        refreshBoard,
        handleDragEnd,
    } = useStatusBoard({ config });

    // Load table metadata when tableId changes
    useEffect(() => {
        async function loadTable() {
            if (!config?.tableId) {
                setCurrentTable(null);
                return;
            }

            setLoadingTable(true);
            const { table, error } = await getTableMetadata(config.tableId);

            if (error) {
                console.error('Failed to load table:', error);
                setCurrentTable(null);
            } else if (table) {
                setCurrentTable(table);

                // Auto-detect card fields if not configured
                if (!config.cardConfig.nameFieldId) {
                    const detectedConfig = autoDetectCardFields(table.columns);
                    setConfig({
                        ...config,
                        cardConfig: detectedConfig,
                    });
                }
            }

            setLoadingTable(false);
        }

        loadTable();
    }, [config?.tableId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ESC - could be used to clear selection or close modals in future
            if (e.key === 'Escape') {
                // For now, just log
                console.log('ESC pressed');
            }

            // Arrow keys - could be used for navigation in future
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // Future: Navigate between columns
                console.log('Arrow key pressed:', e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleConfigChange = (newConfig: StatusBoardConfig) => {
        setConfig(newConfig);
    };

    // Determine what to render
    const renderContent = () => {
        // Loading table metadata
        if (loadingTable) {
            return <LoadingState />;
        }

        // No table selected yet
        if (!config?.tableId) {
            return <NoConfigState />;
        }

        // Loading board data
        if (boardLoading) {
            return <LoadingState />;
        }

        // Error loading board
        if (boardError) {
            return <ErrorState error={boardError.message} onRetry={refreshBoard} />;
        }

        // No status column selected
        if (!config.statusColumnId) {
            return <NoStatusColumnState />;
        }

        // Board has data
        if (boardData) {
            // Table exists but has no rows
            if (boardData.totalCards === 0) {
                return <NoDataState tableName={boardData.tableMetadata.name} />;
            }

            // No columns (status values)
            if (boardData.columns.length === 0) {
                return <NoStatusColumnState />;
            }

            // Render the board
            return <StatusBoard boardData={boardData} onDragEnd={handleDragEnd} />;
        }

        // Default fallback
        return <NoConfigState />;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header with Config Panel on the right */}
            <div className="border-b border-[#DEE1E7] bg-white px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0A0B0D]">
                        ステータストラッキング
                    </h1>
                    <p className="text-sm text-[#5B616E] mt-1">
                        案件の進捗状況をカンバンボードで管理
                    </p>
                </div>

                {/* Config Panel - on the right */}
                {orgId && (
                    <ConfigPanel
                        orgId={orgId}
                        config={config}
                        onConfigChange={handleConfigChange}
                        currentTable={currentTable}
                    />
                )}
            </div>

            {/* Main Content - scrollable area */}
            <div className="flex-1 overflow-auto bg-[#FAFAFA]">
                {renderContent()}
            </div>
        </div>
    );
}
