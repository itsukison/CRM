import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { DragEndEvent as DndKitDragEndEvent } from '@dnd-kit/core';
import type {
    StatusBoardData,
    StatusBoardConfig,
    StatusColumn,
    StatusCard,
} from '../types';
import {
    getStatusBoardData,
    updateCardStatus,
} from '../services/status-tracking.service';

interface UseStatusBoardProps {
    config: StatusBoardConfig | null;
}

interface UseStatusBoardReturn {
    boardData: StatusBoardData | null;
    loading: boolean;
    error: Error | null;
    refreshBoard: () => Promise<void>;
    handleDragEnd: (event: DndKitDragEndEvent) => Promise<void>;
}

/**
 * Hook for managing status board state and drag-and-drop operations
 * Implements optimistic UI updates with rollback on error
 */
export function useStatusBoard({ config }: UseStatusBoardProps): UseStatusBoardReturn {
    const [boardData, setBoardData] = useState<StatusBoardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Fetch board data when config changes
    const fetchBoardData = useCallback(async () => {
        if (!config?.tableId || !config?.statusColumnId) {
            setBoardData(null);
            return;
        }

        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await getStatusBoardData(
            config.tableId,
            config.statusColumnId,
            config.cardConfig
        );

        if (fetchError) {
            setError(fetchError);
            toast.error('データの読み込みに失敗しました');
        } else {
            setBoardData(data);
        }

        setLoading(false);
    }, [config]);

    useEffect(() => {
        fetchBoardData();
    }, [fetchBoardData]);

    const refreshBoard = async () => {
        await fetchBoardData();
    };

    /**
     * Handle drag end event with optimistic UI update
     */
    const handleDragEnd = async (event: DndKitDragEndEvent) => {
        const { active, over } = event;

        if (!over || !boardData || !config) return;

        const cardId = active.id as string;
        
        // Determine the destination column ID
        // If dropped on a container (column), use over.id
        // If dropped on a card, use the containerId from data if available, or find the column of the target card
        let newStatusValue: string | undefined;

        // Check if dropped directly on a column container
        const isColumn = boardData.columns.some(col => col.id === over.id);
        
        if (isColumn) {
            newStatusValue = over.id as string;
        } else {
            // Dropped on a card, find which column that card belongs to
            const overCardId = over.id as string;
            const targetColumn = boardData.columns.find(col => 
                col.cards.some(c => c.id === overCardId)
            );
            
            if (targetColumn) {
                newStatusValue = targetColumn.id;
            } else {
                // Fallback: try to use containerId if dnd-kit provided it (often in data.current.sortable.containerId)
                const containerId = over.data?.current?.sortable?.containerId;
                if (containerId && boardData.columns.some(col => col.id === containerId)) {
                    newStatusValue = containerId;
                }
            }
        }

        // If we couldn't determine a valid destination column, abort
        if (!newStatusValue) {
            console.warn('Invalid drop target:', over);
            return;
        }

        // Find the card being dragged
        let draggedCard: StatusCard | undefined;
        let sourceColumnId: string | undefined;

        for (const column of boardData.columns) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
                draggedCard = card;
                sourceColumnId = column.id;
                break;
            }
        }

        if (!draggedCard || !sourceColumnId) return;

        // If dropped in the same column, do nothing (reordering is handled by SortableContext but we don't persist order yet)
        if (sourceColumnId === newStatusValue) return;

        // Store original state for rollback
        const originalBoardData = { ...boardData };

        // Optimistic update: Move card to new column
        const updatedColumns = boardData.columns.map(column => {
            if (column.id === sourceColumnId) {
                // Remove card from source column
                return {
                    ...column,
                    cards: column.cards.filter(c => c.id !== cardId),
                    count: column.count - 1,
                };
            } else if (column.id === newStatusValue) {
                // Add card to destination column
                const updatedCard = {
                    ...draggedCard!,
                    statusValue: newStatusValue!,
                };
                return {
                    ...column,
                    cards: [...column.cards, updatedCard],
                    count: column.count + 1,
                };
            }
            return column;
        });

        setBoardData({
            ...boardData,
            columns: updatedColumns,
        });

        // Persist to database
        const { error: updateError } = await updateCardStatus(
            cardId,
            config.statusColumnId,
            newStatusValue,
            draggedCard.data
        );

        if (updateError) {
            // Rollback on error
            setBoardData(originalBoardData);
            toast.error('ステータスの更新に失敗しました');
        } else {
            toast.success('ステータスを更新しました');
        }
    };

    return {
        boardData,
        loading,
        error,
        refreshBoard,
        handleDragEnd,
    };
}
