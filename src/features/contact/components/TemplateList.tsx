"use client";

import React, { useState } from "react";
import { useTemplates } from "../hooks/useTemplates";
import { TemplateEditor } from "./TemplateEditor";
import type { EmailTemplate } from "../types";

interface TemplateListProps {
  orgId: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({ orgId }) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } =
    useTemplates(orgId);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    subject: string;
    body: string;
    variables: string[];
  }) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
    } else {
      await createTemplate(data);
    }
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("このテンプレートを削除しますか？")) {
      await deleteTemplate(id);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#DEE1E7] p-4 rounded-sm animate-pulse"
            >
              <div className="h-4 bg-[#EEF0F3] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#EEF0F3] rounded w-full mb-2" />
              <div className="h-3 bg-[#EEF0F3] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium hover:bg-[#3C8AFF] transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          新規テンプレート
        </button>
      </div>

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#EEF0F3] rounded-sm flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#B1B7C3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-[#717886] font-mono text-sm">テンプレートがありません</p>
          <p className="text-[#B1B7C3] text-xs mt-1">
            最初のテンプレートを作成してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-[#DEE1E7] p-4 rounded-sm hover:border-[#B1B7C3] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-[#0A0B0D] text-sm truncate flex-1">
                  {template.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1 text-[#717886] hover:text-[#0000FF]"
                    title="編集"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1 text-[#717886] hover:text-[#FC401F]"
                    title="削除"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-[#5B616E] mb-2 truncate">
                件名: {template.subject}
              </p>
              <p className="text-xs text-[#717886] line-clamp-2">
                {template.body.replace(/<[^>]*>/g, "").slice(0, 100)}...
              </p>
              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.variables.slice(0, 3).map((variable) => (
                    <span
                      key={variable}
                      className="px-1.5 py-0.5 bg-[#EEF0F3] text-[#5B616E] text-[10px] font-mono rounded-sm"
                    >
                      {`{${variable}}`}
                    </span>
                  ))}
                  {template.variables.length > 3 && (
                    <span className="text-[10px] text-[#B1B7C3]">
                      他{template.variables.length - 3}件
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditorOpen && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};
