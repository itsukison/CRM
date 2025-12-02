import React, { useState, useEffect } from 'react';
import { IconX, IconCheck } from '@/components/Icons';

interface DescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string) => void;
    initialDescription: string;
    columnTitle: string;
}

export const DescriptionModal: React.FC<DescriptionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialDescription,
    columnTitle
}) => {
    const [description, setDescription] = useState(initialDescription);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-[400px] border border-[#E6E8EB] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#5B616E] uppercase tracking-wider">説明</span>
                        <span className="text-sm font-bold text-[#0A0B0D]">{columnTitle}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-[#5B616E] hover:bg-[#E6E8EB] rounded-md transition-colors"
                    >
                        <IconX className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        className="w-full h-32 p-3 text-sm text-[#0A0B0D] bg-[#F5F5F7] border border-[#E6E8EB] rounded-xl outline-none focus:border-[#595959] focus:ring-1 focus:ring-[#595959] resize-none transition-all placeholder:text-[#B1B7C3]"
                        placeholder="このカラムの説明を入力してください..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="px-6 py-4 border-t border-[#E6E8EB] flex justify-end gap-2 bg-[#FAFAFA]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-[#5B616E] hover:bg-[#E6E8EB] rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => {
                            onSave(description);
                            onClose();
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#0A0B0D] hover:bg-[#0052FF] rounded-lg transition-colors flex items-center gap-2"
                    >
                        <IconCheck className="w-3.5 h-3.5" />
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};
