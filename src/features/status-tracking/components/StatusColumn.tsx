import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StatusCard } from './StatusCard';
import type { StatusColumn as StatusColumnType, StatusCard as StatusCardType } from '../types';

interface StatusColumnProps {
    column: StatusColumnType;
    onCardClick?: (card: StatusCardType) => void;
}

/**
 * Column component representing one status value
 * Contains vertically stacked draggable cards
 */
export const StatusColumn = React.memo<StatusColumnProps>(({ column, onCardClick }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const cardIds = column.cards.map(card => card.id);

    return (
        <div
            className="flex-shrink-0"
            style={{
                width: '320px',
                marginRight: '16px',
                padding: "16px",
                backgroundColor: isOver ? '#EEF0F3' : 'transparent',
                transition: 'background-color 0.15s',
            }}
        >
            {/* Column Header */}
            <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0A0B0D] uppercase tracking-wide font-mono">
                        {column.title}
                    </h3>
                    <span
                        className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#F5F5F7] text-[#5B616E] rounded-full"
                    >
                        {column.count}
                    </span>
                </div>
            </div>

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                style={{
                    minHeight: '200px',
                    // Removed fixed maxHeight to allow container to grow and page to scroll
                    overflowY: 'visible',
                    overflowX: 'hidden',
                }}
                className="flex-1 flex flex-col gap-2"
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {column.cards.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs font-mono">
                            カードがありません
                        </div>
                    ) : (
                        column.cards.map(card => (
                            <StatusCard key={card.id} card={card} onClick={onCardClick} />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
});

StatusColumn.displayName = 'StatusColumn';

