"use client";

import React, { useState } from "react";
import { useEmailActivity } from "../hooks/useEmailActivity";
import type { EmailActivity, EmailStatus } from "../types";

interface ActivityTableProps {
  orgId: string;
}

const STATUS_STYLES: Record<
  EmailStatus,
  { bg: string; text: string; label: string }
> = {
  success: { bg: "bg-[#66C800]/10", text: "text-[#66C800]", label: "成功" },
  error: { bg: "bg-[#FC401F]/10", text: "text-[#FC401F]", label: "エラー" },
  pending: { bg: "bg-[#FFD12F]/10", text: "text-[#B8A581]", label: "送信中" },
};

type SortField = "sent_at" | "recipient_email" | "template_name" | "status";
type SortDirection = "asc" | "desc";

export const ActivityTable: React.FC<ActivityTableProps> = ({ orgId }) => {
  const { activities, loading, refresh } = useEmailActivity(orgId);
  const [sortField, setSortField] = useState<SortField>("sent_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<EmailStatus | "all">("all");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedActivities = [...activities]
    .filter((a) => filterStatus === "all" || a.status === filterStatus)
    .sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border border-[#DEE1E7] rounded-sm overflow-hidden">
          <div className="animate-pulse">
            <div className="h-10 bg-[#EEF0F3] border-b border-[#DEE1E7]" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 border-b border-[#EEF0F3] flex items-center px-4 gap-4"
              >
                <div className="h-3 bg-[#EEF0F3] rounded w-1/4" />
                <div className="h-3 bg-[#EEF0F3] rounded w-1/4" />
                <div className="h-3 bg-[#EEF0F3] rounded w-1/6" />
                <div className="h-3 bg-[#EEF0F3] rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#717886]">絞り込み:</span>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as EmailStatus | "all")
            }
            className="text-xs font-mono bg-white border border-[#DEE1E7] rounded-sm px-2 py-1 text-[#32353D] focus:outline-none focus:border-[#0000FF]"
          >
            <option value="all">すべて</option>
            <option value="success">成功</option>
            <option value="error">エラー</option>
            <option value="pending">送信中</option>
          </select>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1 text-xs font-mono text-[#717886] hover:text-[#0000FF] transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          更新
        </button>
      </div>

      {/* Table */}
      {sortedActivities.length === 0 ? (
        <div className="bg-white border border-[#DEE1E7] rounded-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#EEF0F3] rounded-sm flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#B1B7C3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-[#717886] font-mono text-sm">履歴がありません</p>
          <p className="text-[#B1B7C3] text-xs mt-1">
            メール送信履歴がここに表示されます
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#DEE1E7] rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#DEE1E7]">
                <th
                  className="px-4 py-3 text-left text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider cursor-pointer hover:text-[#0000FF]"
                  onClick={() => handleSort("recipient_email")}
                >
                  <div className="flex items-center gap-1">
                    宛先
                    {sortField === "recipient_email" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider cursor-pointer hover:text-[#0000FF]"
                  onClick={() => handleSort("template_name")}
                >
                  <div className="flex items-center gap-1">
                    テンプレート
                    {sortField === "template_name" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider cursor-pointer hover:text-[#0000FF]"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    ステータス
                    {sortField === "status" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider cursor-pointer hover:text-[#0000FF]"
                  onClick={() => handleSort("sent_at")}
                >
                  <div className="flex items-center gap-1">
                    送信日時
                    {sortField === "sent_at" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-[#EEF0F3] hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-[#32353D]">
                    {activity.recipient_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#5B616E]">
                    {activity.template_name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono ${
                        STATUS_STYLES[activity.status].bg
                      } ${STATUS_STYLES[activity.status].text}`}
                    >
                      {STATUS_STYLES[activity.status].label}
                    </span>
                    {activity.status === "error" && activity.error_message && (
                      <span
                        className="ml-2 text-[10px] text-[#FC401F] cursor-help"
                        title={activity.error_message}
                      >
                        ⓘ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-[#717886]">
                    {formatDate(activity.sent_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[#717886]">
        <span>合計: {sortedActivities.length}件</span>
        <span className="text-[#66C800]">
          ● 成功 {activities.filter((a) => a.status === "success").length}件
        </span>
        <span className="text-[#FC401F]">
          ● エラー {activities.filter((a) => a.status === "error").length}件
        </span>
      </div>
    </div>
  );
};
