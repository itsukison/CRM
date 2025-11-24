// Chat message model
export interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    type?: 'text' | 'action_log';
}

// Chat tool types
export type ChatTool =
    | 'none'
    | 'filter'
    | 'sort'
    | 'enrich'
    | 'generate_data'
    | 'calculate_max'
    | 'calculate_min'
    | 'calculate_mean';

// Chat aggregate parameters
export interface ChatAggregateParams {
    columnId: string;
    operation: 'max' | 'min' | 'mean';
    scope?: 'all' | 'selected';
}

// Chat enrichment parameters
export interface ChatEnrichParams {
    targetColumnIds: string[];
    scope: 'selected' | 'all';
}

// Chat generation parameters
export interface ChatGenerateParams {
    count: number;
    targetColumnIds: string[];
    prompt?: string;
    scope?: 'all' | 'selected';
}

// Chat analysis result from AI
export interface AnalyzeChatResult {
    intent: 'FILTER' | 'SORT' | 'EDIT' | 'CHAT';
    tool: ChatTool;
    reply: string;
    filterParams?: import('./table').Filter;
    sortParams?: import('./table').SortState;
    enrichParams?: ChatEnrichParams;
    generateParams?: ChatGenerateParams;
    aggregateParams?: ChatAggregateParams;
    suggestedAction?: string;
}
