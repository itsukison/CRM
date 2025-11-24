import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select';

export interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}

/**
 * Reusable select component built on top of shadcn/ui Select
 * Used throughout table UI for dropdowns
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    className = ""
}) => {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`w-full h-9 bg-white ${className}`}>
                <SelectValue placeholder={options.find(o => o.value === value)?.label} />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
