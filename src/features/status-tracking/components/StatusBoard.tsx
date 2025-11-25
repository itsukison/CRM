import React from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { StatusColumn } from './StatusColumn';
import { StatusCard } from './StatusCard';
import type { StatusBoardData, StatusCard as StatusCardType } from '../types';

interface StatusBoardProps {
    boardData: StatusBoardData;
    onDragEnd: (event: DragEndEvent) => void;
    onCardClick?: (card: StatusCardType) => void;
}

/**
 * Main status board component with drag-and-drop functionality
 * Displays columns horizontally with cards that can be dragged between columns
 */
export function StatusBoard({ boardData, onDragEnd, onCardClick }: StatusBoardProps) {
    const [activeCard, setActiveCard] = React.useState<StatusCardType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const cardId = event.active.id as string;
        
        // Find the card being dragged
        for (const column of boardData.columns) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
                setActiveCard(card);
                break;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCard(null);
        onDragEnd(event);
    };

    const handleDragCancel = () => {
        setActiveCard(null);
    };

    if (!boardData || boardData.columns.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                    <div className="text-gray-400 text-sm font-mono mb-2">
                        データがありません
                    </div>
                    <div className="text-gray-400 text-xs">
                        選択したステータス列に値が存在しないか、レコードがありません
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {/* Scrollable container - allows both horizontal scroll for columns and vertical scroll for cards */}
            <div
                className="flex overflow-x-auto overflow-y-auto pb-6"
                style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '16px',
                    minHeight: '100%',
                    alignItems: 'flex-start',
                }}
            >
                {boardData.columns.map(column => (
                    <StatusColumn
                        key={column.id}
                        column={column}
                        onCardClick={onCardClick}
                    />
                ))}
            </div>

            {/* Drag overlay - shows the card being dragged */}
            <DragOverlay>
                {activeCard ? (
                    <div style={{ cursor: 'grabbing', opacity: 0.8 }}>
                        <StatusCard card={activeCard} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

