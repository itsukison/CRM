import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/primitives/dialog";
import { TagOption } from '@/types';
import { IconPlus, IconTrash } from '@/components/Icons';

interface TagManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (options: TagOption[]) => void;
    initialOptions: TagOption[];
    columnTitle: string;
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialOptions,
    columnTitle
}) => {
    const [options, setOptions] = useState<TagOption[]>(initialOptions || []);
    const [newTagLabel, setNewTagLabel] = useState('');

    useEffect(() => {
        setOptions(initialOptions || []);
    }, [initialOptions, isOpen]);

    const handleAddTag = () => {
        if (!newTagLabel.trim()) return;
        const newTag: TagOption = {
            id: `tag_${Date.now()}`,
            label: newTagLabel.trim(),
            color: 'bg-gray-100 text-gray-800' // Default color
        };
        setOptions([...options, newTag]);
        setNewTagLabel('');
    };

    const handleDeleteTag = (id: string) => {
        setOptions(options.filter(o => o.id !== id));
    };

    const handleSave = () => {
        onSave(options);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-white p-0 gap-0 overflow-hidden rounded-xl border border-[#E6E8EB] shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b border-[#E6E8EB]">
                    <DialogTitle className="text-sm font-bold text-[#0A0B0D]">
                        タグ管理: {columnTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-3 py-2 text-sm border border-[#E6E8EB] rounded-lg outline-none focus:border-[#0052FF]"
                            placeholder="新しいタグを追加..."
                            value={newTagLabel}
                            onChange={(e) => setNewTagLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <button
                            onClick={handleAddTag}
                            className="px-3 py-2 bg-[#F5F5F7] hover:bg-[#E6E8EB] rounded-lg transition-colors"
                        >
                            <IconPlus className="w-4 h-4 text-[#0A0B0D]" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {options.length === 0 && (
                            <div className="text-center text-xs text-gray-400 py-4">
                                タグがありません
                            </div>
                        )}
                        {options.map((option) => (
                            <div key={option.id} className="flex items-center justify-between p-2 bg-[#F5F5F7] rounded-lg group">
                                <span className="text-sm font-medium text-[#0A0B0D]">{option.label}</span>
                                <button
                                    onClick={() => handleDeleteTag(option.id)}
                                    className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <IconTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-[#E6E8EB] bg-[#F5F5F7]/50">
                    <div className="flex justify-end gap-2 w-full">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-[#5B616E] hover:bg-[#E6E8EB] rounded-lg transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-xs font-bold text-white bg-[#0052FF] hover:bg-[#0040DD] rounded-lg shadow-sm transition-all"
                        >
                            保存
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
