import { useState, useEffect } from 'react';
import type { StatusBoardConfig, CardConfig } from '../types';
import {
    loadUserConfig,
    debouncedSaveUserConfig,
} from '../services/status-tracking.service';

interface UseStatusConfigProps {
    orgId: string;
}

interface UseStatusConfigReturn {
    config: StatusBoardConfig | null;
    setConfig: (config: StatusBoardConfig) => void;
    updateTableId: (tableId: string) => void;
    updateStatusColumnId: (columnId: string) => void;
    updateCardConfig: (cardConfig: Partial<CardConfig>) => void;
    isConfigured: boolean;
}

/**
 * Hook for managing status board configuration
 * Handles loading from and saving to localStorage
 */
export function useStatusConfig({ orgId }: UseStatusConfigProps): UseStatusConfigReturn {
    const [config, setConfigState] = useState<StatusBoardConfig | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load config from localStorage on mount
    useEffect(() => {
        if (!isInitialized && orgId) {
            const savedConfig = loadUserConfig(orgId);
            if (savedConfig) {
                setConfigState(savedConfig);
            }
            setIsInitialized(true);
        }
    }, [orgId, isInitialized]);

    // Save config to localStorage whenever it changes (debounced)
    useEffect(() => {
        if (isInitialized && config && orgId) {
            debouncedSaveUserConfig(orgId, config);
        }
    }, [config, orgId, isInitialized]);

    const setConfig = (newConfig: StatusBoardConfig) => {
        setConfigState(newConfig);
    };

    const updateTableId = (tableId: string) => {
        if (!config) return;
        setConfigState({
            ...config,
            tableId,
        });
    };

    const updateStatusColumnId = (columnId: string) => {
        if (!config) return;
        setConfigState({
            ...config,
            statusColumnId: columnId,
        });
    };

    const updateCardConfig = (cardConfig: Partial<CardConfig>) => {
        if (!config) return;
        setConfigState({
            ...config,
            cardConfig: {
                ...config.cardConfig,
                ...cardConfig,
            },
        });
    };

    const isConfigured = !!(config?.tableId && config?.statusColumnId);

    return {
        config,
        setConfig,
        updateTableId,
        updateStatusColumnId,
        updateCardConfig,
        isConfigured,
    };
}

