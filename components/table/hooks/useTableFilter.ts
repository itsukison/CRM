import { useState } from 'react';
import { Filter } from '@/types';

interface UseTableFilterProps {
    activeFilters: Filter[];
    onUpdateFilters: (filters: Filter[]) => void;
}

export const useTableFilter = ({ activeFilters, onUpdateFilters }: UseTableFilterProps) => {
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [newFilter, setNewFilter] = useState<Filter>({ columnId: '', operator: 'contains', value: '' });

    const addFilter = (filter: Filter) => {
        onUpdateFilters([...activeFilters, filter]);
    };

    const removeFilter = (index: number) => {
        onUpdateFilters(activeFilters.filter((_, i) => i !== index));
    };

    return {
        showFilterMenu,
        setShowFilterMenu,
        newFilter,
        setNewFilter,
        addFilter,
        removeFilter
    };
};
