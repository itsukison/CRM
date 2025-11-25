import React from 'react';

/**
 * Empty state shown when no table is selected
 */
export function NoConfigState() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
                {/* ASCII Art - Kanban Board */}
                <pre className="text-gray-300 text-xs mb-6 font-mono leading-tight">
{`┌─────────┐  ┌─────────┐  ┌─────────┐
│ TODO    │  │ DOING   │  │ DONE    │
├─────────┤  ├─────────┤  ├─────────┤
│ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │
│ │     │ │  │ │     │ │  │ │     │ │
│ └─────┘ │  │ └─────┘ │  │ └─────┘ │
│         │  │         │  │         │
│ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │
│ │     │ │  │ │     │ │  │ │     │ │
│ └─────┘ │  │ └─────┘ │  │ └─────┘ │
└─────────┘  └─────────┘  └─────────┘`}
                </pre>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    ステータストラッキングを開始
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    データベースを選択して、かんばんボードでタスクやディールを管理しましょう
                </p>

                <div className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 text-xs font-mono text-gray-500" style={{ borderRadius: '2px' }}>
                    ↑ 上のドロップダウンからデータベースを選択してください
                </div>
            </div>
        </div>
    );
}

/**
 * Empty state shown when selected table has no data
 */
export function NoDataState({ tableName }: { tableName: string }) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
                {/* ASCII Art - Empty Box */}
                <pre className="text-gray-300 text-xs mb-6 font-mono leading-tight">
{`    ╔═══════════════════╗
    ║                   ║
    ║                   ║
    ║       EMPTY       ║
    ║                   ║
    ║                   ║
    ╚═══════════════════╝`}
                </pre>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {tableName} にデータがありません
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    レコードを追加すると、ここにカードとして表示されます
                </p>

                <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700" style={{ borderRadius: '2px' }}>
                    データベースページでレコードを追加してください
                </div>
            </div>
        </div>
    );
}

/**
 * Empty state shown when selected status column has no values
 */
export function NoStatusColumnState() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
                {/* ASCII Art - Question Mark */}
                <pre className="text-gray-300 text-xs mb-6 font-mono leading-tight">
{`        ██████╗ 
        ╚════██╗
         █████╔╝
        ██╔═══╝ 
        ███████╗
        ╚══════╝
           ██║   
           ╚═╝   `}
                </pre>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    ステータス列が見つかりません
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    選択したステータス列に値がないか、適切なカラムタイプではありません
                </p>

                <div className="inline-block px-4 py-2 bg-yellow-50 border border-yellow-200 text-xs font-mono text-yellow-700" style={{ borderRadius: '2px' }}>
                    別のステータス列を選択するか、データを追加してください
                </div>
            </div>
        </div>
    );
}

/**
 * Loading state with pixelated aesthetic
 */
export function LoadingState() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                {/* Animated ASCII Spinner */}
                <div className="text-blue-600 text-2xl mb-4 font-mono animate-pulse">
                    ░░░░░░░░░
                </div>
                <div className="text-sm font-mono text-gray-500">
                    読み込み中...
                </div>
            </div>
        </div>
    );
}

/**
 * Error state
 */
export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
                {/* ASCII Art - Error Symbol */}
                <pre className="text-red-400 text-xs mb-6 font-mono leading-tight">
{`    ╔═══════════════════╗
    ║   ⚠️  ERROR      ║
    ╚═══════════════════╝`}
                </pre>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    エラーが発生しました
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    {error}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                        style={{ borderRadius: '2px' }}
                    >
                        再試行
                    </button>
                )}
            </div>
        </div>
    );
}

