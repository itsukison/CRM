import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/primitives/dialog";
import { TagOption } from '@/types';
import { IconPlus, IconTrash, IconEdit, IconCheck } from '@/components/Icons';

interface TagManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (options: TagOption[]) => void;
    initialOptions: TagOption[];
    columnTitle: string;
}

// Preset color palette
const PRESET_COLORS = [
    { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', label: 'Gray' },
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Blue' },
    { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'Green' },
    { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Yellow' },
    { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Red' },
    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', label: 'Purple' },
    { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', label: 'Pink' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', label: 'Indigo' },
    { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'Orange' },
    { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', label: 'Teal' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', label: 'Cyan' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Emerald' }
];

const getDefaultColor = () => `${PRESET_COLORS[0].bg} ${PRESET_COLORS[0].text} ${PRESET_COLORS[0].border}`;

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialOptions,
    columnTitle
}) => {
    const [options, setOptions] = useState<TagOption[]>(initialOptions || []);
    const [newTagLabel, setNewTagLabel] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState('');
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    useEffect(() => {
        setOptions(initialOptions || []);
        setEditingId(null);
        setShowColorPicker(null);
    }, [initialOptions, isOpen]);

    const handleAddTag = () => {
        if (!newTagLabel.trim()) return;
        // Check if tag already exists
        if (options.some(opt => opt.label.toLowerCase() === newTagLabel.trim().toLowerCase())) {
            setNewTagLabel('');
            return;
        }
        const newTag: TagOption = {
            id: `tag_${Date.now()}`,
            label: newTagLabel.trim(),
            color: getDefaultColor()
        };
        setOptions([...options, newTag]);
        setNewTagLabel('');
    };

    const handleDeleteTag = (id: string) => {
        setOptions(options.filter(o => o.id !== id));
        if (editingId === id) {
            setEditingId(null);
        }
        if (showColorPicker === id) {
            setShowColorPicker(null);
        }
    };

    const handleStartEdit = (option: TagOption) => {
        setEditingId(option.id);
        setEditingLabel(option.label);
        setShowColorPicker(null);
    };

    const handleSaveEdit = (id: string) => {
        if (!editingLabel.trim()) return;
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, label: editingLabel.trim() } : opt
        ));
        setEditingId(null);
        setEditingLabel('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingLabel('');
    };

    const handleColorSelect = (id: string, color: string) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, color } : opt
        ));
        setShowColorPicker(null);
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
                        {options.map((option) => {
                            const isEditing = editingId === option.id;
                            const showColorMenu = showColorPicker === option.id;
                            const colorParts = option.color?.split(' ') || [];
                            const bgColor = colorParts.find(p => p.startsWith('bg-')) || 'bg-gray-100';
                            const textColor = colorParts.find(p => p.startsWith('text-')) || 'text-gray-800';
                            const borderColor = colorParts.find(p => p.startsWith('border-')) || 'border-gray-200';

                            return (
                                <div key={option.id} className="flex items-center gap-2 p-2 bg-[#F5F5F7] rounded-lg group relative">
                                    {isEditing ? (
                                        <>
                                            <input
                                                className="flex-1 px-2 py-1 text-sm border border-[#E6E8EB] rounded outline-none focus:border-[#0052FF]"
                                                value={editingLabel}
                                                onChange={(e) => setEditingLabel(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEdit(option.id);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(option.id)}
                                                className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                                            >
                                                <IconCheck className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor} ${borderColor} border`}>
                                                {option.label}
                                            </span>
                                            <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setShowColorPicker(showColorMenu ? null : option.id)}
                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors relative"
                                                    title="色を変更"
                                                >
                                                    <div className={`w-4 h-4 rounded border ${bgColor} ${borderColor} border-2`}></div>
                                                </button>
                                                <button
                                                    onClick={() => handleStartEdit(option)}
                                                    className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                                    title="編集"
                                                >
                                                    <IconEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTag(option.id)}
                                                    className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                    title="削除"
                                                >
                                                    <IconTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {showColorMenu && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-[#E6E8EB] rounded-lg shadow-xl p-2 z-10 grid grid-cols-4 gap-1 min-w-[200px]">
                                                    {PRESET_COLORS.map((color, idx) => {
                                                        const colorString = `${color.bg} ${color.text} ${color.border}`;
                                                        const isSelected = option.color === colorString;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleColorSelect(option.id, colorString)}
                                                                className={`p-2 rounded border-2 transition-all hover:scale-110 ${
                                                                    isSelected ? 'border-[#0052FF] ring-2 ring-[#0052FF]/20' : 'border-transparent'
                                                                }`}
                                                                title={color.label}
                                                            >
                                                                <div className={`w-full h-6 rounded ${color.bg} ${color.border} border`}></div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
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
