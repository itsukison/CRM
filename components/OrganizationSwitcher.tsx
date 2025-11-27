import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/primitives/select";

export const OrganizationSwitcher: React.FC = () => {
    const { organizations, currentOrganization, setCurrentOrganization } = useAuth();

    if (!currentOrganization || organizations.length === 0) {
        return null;
    }

    return (
        <Select
            value={currentOrganization.id}
            onValueChange={(value) => {
                const org = organizations.find((o) => o.id === value);
                if (org) setCurrentOrganization(org);
            }}
        >
            <SelectTrigger className="w-[200px] bg-white border border-[#E6E8EB] hover:bg-[#FAFAFA] transition-colors">
                <SelectValue placeholder="Select Organization">
                    <span className="font-semibold">{currentOrganization.name}</span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                        <div className="flex flex-col items-start">
                            <span className="font-semibold">{org.name}</span>
                            {org.description && (
                                <span className="text-xs text-[#5B616E]">{org.description}</span>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
