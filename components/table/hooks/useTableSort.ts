import { useState } from 'react';
import { SortState } from '@/types';

interface UseTableSortProps {
    activeSorts: SortState[];
    onUpdateSorts: (sorts: SortState[]) => void;
}

export const useTableSort = ({ activeSorts, onUpdateSorts }: UseTableSortProps) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [newSort, setNewSort] = useState<SortState>({ columnId: '', direction: 'asc' });

    // Helper to add a sort rule
    const addSort = (sort: SortState) => {
        // Remove existing sort for this column if any
        const existing = activeSorts.filter(s => s.columnId !== sort.columnId);
        onUpdateSorts([...existing, sort]);
    };

    return {
        showSortMenu,
        setShowSortMenu,
        newSort,
        setNewSort,
        addSort
    };
};
