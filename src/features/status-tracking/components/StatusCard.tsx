import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StatusCard as StatusCardType } from '../types';

interface StatusCardProps {
    card: StatusCardType;
    onClick?: (card: StatusCardType) => void;
}

/**
 * Individual draggable card component
 * Displays record information in a compact, scannable format
 */
export const StatusCard = React.memo<StatusCardProps>(({ card, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleClick = () => {
        if (onClick) {
            onClick(card);
        }
    };

    const formatNumber = (num?: number): string => {
        if (num === undefined || num === null) return '';
        if (num >= 1000000) {
            return `¥${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `¥${(num / 1000).toFixed(1)}K`;
        }
        return `¥${num.toLocaleString()}`;
    };

    const formatTimestamp = (timestamp?: string): string => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return '今日';
            if (diffDays === 1) return '昨日';
            if (diffDays < 7) return `${diffDays}日前`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
            return `${Math.floor(diffDays / 365)}年前`;
        } catch {
            return '';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                borderRadius: '2px',
                padding: '12px',
                marginBottom: '8px',
            }}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className="bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-move group"
        >
            {/* Card Name/Title */}
            {card.nameValue && (
                <div className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {card.nameValue}
                </div>
            )}

            {/* Assigned Person */}
            {card.assignedValue && (
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {String(card.assignedValue).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                        {card.assignedValue}
                    </span>
                </div>
            )}

            {/* Value and Timestamp Row */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-500 mt-3 pt-2 border-t border-gray-100">
                {card.numericValue !== undefined && (
                    <span className="font-bold text-gray-700">
                        {formatNumber(card.numericValue)}
                    </span>
                )}
                {card.updatedAt && (
                    <span className="text-gray-400">
                        {formatTimestamp(card.updatedAt)}
                    </span>
                )}
            </div>
        </div>
    );
});

StatusCard.displayName = 'StatusCard';

