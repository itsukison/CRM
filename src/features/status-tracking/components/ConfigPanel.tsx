import React, { useEffect, useState, useRef } from 'react';
import { CustomSelect } from '@/ui/primitives/custom-select';
import { Checkbox } from '@/src/ui/primitives/checkbox';
import { IconSettings, IconChevronRight } from '@/components/Icons';
import type { TableOption, ColumnOption, StatusBoardConfig, CardConfig } from '../types';
import { getTableOptions, getStatusColumnOptions, autoDetectCardFields } from '../services/status-tracking.service';
import type { TableData } from '@/core/models/table';

interface ConfigPanelProps {
    orgId: string;
    config: StatusBoardConfig | null;
    onConfigChange: (config: StatusBoardConfig) => void;
    currentTable: TableData | null;
}

/**
 * Compact configuration panel for the header row
 */
export function ConfigPanel({ orgId, config, onConfigChange, currentTable }: ConfigPanelProps) {
    const [tableOptions, setTableOptions] = useState<TableOption[]>([]);
    const [columnOptions, setColumnOptions] = useState<ColumnOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDisplayMenu, setShowDisplayMenu] = useState(false);
    const displayMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (displayMenuRef.current && !displayMenuRef.current.contains(event.target as Node)) {
                setShowDisplayMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load table options on mount
    useEffect(() => {
        async function loadTables() {
            setLoading(true);
            const tables = await getTableOptions(orgId);
            setTableOptions(tables);
            setLoading(false);
        }
        if (orgId) {
            loadTables();
        }
    }, [orgId]);

    // Update column options when table changes
    useEffect(() => {
        if (currentTable) {
            const columns = getStatusColumnOptions(currentTable);
            setColumnOptions(columns);

            // If no status column is selected yet, or the selected one doesn't exist, auto-select first
            if (!config?.statusColumnId || !columns.find(c => c.id === config.statusColumnId)) {
                if (columns.length > 0 && config) {
                    handleStatusColumnChange(columns[0].id);
                }
            }
        } else {
            setColumnOptions([]);
        }
    }, [currentTable]);

    const handleTableChange = (tableId: string) => {
        const selectedTable = tableOptions.find(t => t.id === tableId);
        if (!selectedTable) return;

        const newConfig: StatusBoardConfig = {
            tableId,
            statusColumnId: '',
            cardConfig: {
                showName: true,
                showAssigned: true,
                showValue: true,
                showTimestamp: true,
            },
        };

        onConfigChange(newConfig);
    };

    const handleStatusColumnChange = (columnId: string) => {
        if (!config) return;

        const newConfig: StatusBoardConfig = {
            ...config,
            statusColumnId: columnId,
        };

        onConfigChange(newConfig);
    };

    const handleCardFieldToggle = (field: keyof CardConfig) => {
        if (!config) return;

        const newConfig: StatusBoardConfig = {
            ...config,
            cardConfig: {
                ...config.cardConfig,
                [field]: !config.cardConfig[field],
            },
        };

        onConfigChange(newConfig);
    };

    // Count active display fields
    const activeFieldCount = config ? [
        config.cardConfig.showName,
        config.cardConfig.showAssigned,
        config.cardConfig.showValue,
        config.cardConfig.showTimestamp,
    ].filter(Boolean).length : 0;

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 font-mono">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Table Selector */}
            <div className="flex items-center gap-1.5">
                <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                    データ:
                </label>
                <div style={{ width: '140px' }}>
                    <CustomSelect
                        value={config?.tableId || ''}
                        onChange={handleTableChange}
                        options={tableOptions.map(t => ({
                            value: t.id,
                            label: t.name,
                        }))}
                    />
                </div>
            </div>

            {/* Status Column Selector */}
            {config?.tableId && columnOptions.length > 0 && (
                <div className="flex items-center gap-1.5">
                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                        列:
                    </label>
                    <div style={{ width: '120px' }}>
                        <CustomSelect
                            value={config?.statusColumnId || ''}
                            onChange={handleStatusColumnChange}
                            options={columnOptions.map(c => ({
                                value: c.id,
                                label: c.name,
                            }))}
                        />
                    </div>
                </div>
            )}

            {/* Display Options Dropdown */}
            {config?.statusColumnId && (
                <div className="relative" ref={displayMenuRef}>
                    <button
                        onClick={() => setShowDisplayMenu(!showDisplayMenu)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                            ${showDisplayMenu ? 'bg-[#EEF0F3] border-[#B1B7C3] text-[#0A0B0D]' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}
                        `}
                    >
                        <IconSettings className="w-3.5 h-3.5" />
                        表示
                        {activeFieldCount > 0 && (
                            <span className="bg-[#0A0B0D] text-white text-[10px] px-1.5 min-w-[16px] h-4 flex items-center justify-center font-mono">
                                {activeFieldCount}
                            </span>
                        )}
                    </button>

                    {showDisplayMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#0A0B0D] shadow-lg p-3 z-50">
                            <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-3 font-mono">
                                表示項目
                            </h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 p-1.5 hover:bg-[#EEF0F3] cursor-pointer">
                                    <Checkbox
                                        checked={config.cardConfig.showName}
                                        onCheckedChange={() => handleCardFieldToggle('showName')}
                                        className="border-gray-400 data-[state=checked]:bg-[#0A0B0D] data-[state=checked]:border-[#0A0B0D]"
                                    />
                                    <span className="text-xs text-[#0A0B0D]">名前</span>
                                </label>

                                <label className="flex items-center gap-2 p-1.5 hover:bg-[#EEF0F3] cursor-pointer">
                                    <Checkbox
                                        checked={config.cardConfig.showAssigned}
                                        onCheckedChange={() => handleCardFieldToggle('showAssigned')}
                                        className="border-gray-400 data-[state=checked]:bg-[#0A0B0D] data-[state=checked]:border-[#0A0B0D]"
                                    />
                                    <span className="text-xs text-[#0A0B0D]">担当者</span>
                                </label>

                                <label className="flex items-center gap-2 p-1.5 hover:bg-[#EEF0F3] cursor-pointer">
                                    <Checkbox
                                        checked={config.cardConfig.showValue}
                                        onCheckedChange={() => handleCardFieldToggle('showValue')}
                                        className="border-gray-400 data-[state=checked]:bg-[#0A0B0D] data-[state=checked]:border-[#0A0B0D]"
                                    />
                                    <span className="text-xs text-[#0A0B0D]">金額</span>
                                </label>

                                <label className="flex items-center gap-2 p-1.5 hover:bg-[#EEF0F3] cursor-pointer">
                                    <Checkbox
                                        checked={config.cardConfig.showTimestamp}
                                        onCheckedChange={() => handleCardFieldToggle('showTimestamp')}
                                        className="border-gray-400 data-[state=checked]:bg-[#0A0B0D] data-[state=checked]:border-[#0A0B0D]"
                                    />
                                    <span className="text-xs text-[#0A0B0D]">更新日</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
