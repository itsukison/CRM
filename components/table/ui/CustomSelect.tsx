import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives/select";

export const CustomSelect = ({
    value,
    onChange,
    options,
    className = ""
}: {
    value: string,
    onChange: (val: string) => void,
    options: { value: string, label: string }[],
    className?: string
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
