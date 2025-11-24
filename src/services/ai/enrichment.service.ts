import { GoogleGenAI, Type } from "@google/genai";
import { Row, Column } from "@/types";


const getClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please set NEXT_PUBLIC_GOOGLE_GENAI_API_KEY in .env");
    }
    return new GoogleGenAI({ apiKey });
};

export interface EnrichmentResult {
    field: string;
    value: string | number;
    confidence: 'high' | 'medium' | 'low';
    source?: string; // URL where data was found
}

export interface EnrichmentProgress {
    rowId: string;
    columnId: string;
    phase: 'discovery' | 'extraction' | 'financial' | 'complete' | 'error';
    result?: EnrichmentResult;
    error?: string;
}

export type ProgressCallback = (progress: EnrichmentProgress) => void;

/**
 * Build a targeted search query for Japanese company data
 */
function buildJapaneseCompanySearchQuery(
    companyName: string,
    targetField: string
): string {
    // Map common field names to Japanese company info pages
    const fieldKeywords: Record<string, string[]> = {
        '代表者': ['特定商品取引法', '会社概要', '代表取締役'],
        'CEO': ['特定商品取引法', '会社概要', '代表取締役'],
        '電話': ['特定商品取引法', '会社概要', '電話番号'],
        '電話番号': ['特定商品取引法', '会社概要', 'お問い合わせ'],
        'メール': ['特定商品取引法', '会社概要', 'お問い合わせ'],
        'メールアドレス': ['特定商品取引法', '会社概要', 'メールアドレス'],
        '住所': ['特定商品取引法', '会社概要', '本社'],
        '設立': ['会社概要', '沿革', '設立年'],
        '従業員': ['会社概要', '従業員数'],
        '資本金': ['会社概要', '資本金'],
        '売上': ['決算報告', 'IR情報', '業績'],
        '利益': ['決算報告', 'IR情報', '業績'],
    };

    // Find relevant keywords for this field
    let keywords: string[] = [];
    for (const [key, values] of Object.entries(fieldKeywords)) {
        if (targetField.includes(key)) {
            keywords = values;
            break;
        }
    }

    // Default to 会社概要 if no specific match
    if (keywords.length === 0) {
        keywords = ['会社概要', '特定商品取引法'];
    }

    // Build query targeting .co.jp domains
    const keyword = keywords[0];
    return `site:*.co.jp "${companyName}" "${keyword}"`;
}

/**
 * Determine if we should mark data as "not found" based on confidence
 */
function shouldMarkAsNotFound(confidence: string, value: string): boolean {
    if (confidence === 'low') return true;
    if (!value || value.trim() === '') return true;

    // Check for vague/hedging language that suggests uncertainty
    const uncertainPhrases = [
        '不明', '情報なし', 'わかりません', '見つかりません',
        '確認できません', '公開されていません', '非公開',
        'おそらく', '可能性', 'と思われる', 'かもしれません'
    ];

    return uncertainPhrases.some(phrase => value.includes(phrase));
}

/**
 * Helper to extract and parse JSON from model response
 */
function extractJson<T>(text: string): T {
    try {
        // First try to clean up markdown code blocks
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        // If that fails, try to find the first JSON object or array
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON:", match[0]);
            }
        }
        console.error("Failed to parse JSON from text:", text);
        throw new Error("Invalid JSON response");
    }
}

/**
 * Phase 1: Discovery - Find relevant company URLs using Google Search
 */
async function discoverCompanyUrls(
    ai: ReturnType<typeof getClient>,
    companyName: string,
    targetField: string
): Promise<string[]> {
    const searchQuery = buildJapaneseCompanySearchQuery(companyName, targetField);

    console.log(`Searching: ${searchQuery}`);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `次の検索クエリで最も関連性の高いURLを最大3つ見つけてください: ${searchQuery}
      
      重要: 公式企業サイトのURLのみを返してください。Wikipedia、求人サイト、ニュースサイトなどは除外してください。
      URLのみをJSON配列で返してください。例: ["https://example.co.jp", "https://example.com"]`,
            config: {
                tools: [{ googleSearch: {} }],
                // @ts-ignore - thinking_level is a new feature
                thinking_level: "low"
            }
        });

        const text = response.text || '[]';
        const urls = extractJson<string[] | { urls: string[] }>(text);

        if (Array.isArray(urls)) {
            return urls;
        } else if (urls && Array.isArray(urls.urls)) {
            return urls.urls;
        }
        return [];
    } catch (error) {
        console.error('Discovery phase error:', error);
        return [];
    }
}

/**
 * Phase 2: Extraction - Extract specific data from discovered URLs
 */
async function extractDataFromUrl(
    ai: ReturnType<typeof getClient>,
    url: string,
    targetField: string,
    targetFieldDescription: string,
    columnType: string
): Promise<EnrichmentResult | null> {
    console.log(`Extracting from: ${url}`);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `このURLから「${targetField}」の情報を抽出してください: ${url}

重要な指示:
1. 確実に見つかった情報のみを返してください
2. 推測や憶測で情報を埋めないでください
3. 情報が見つからない場合は「見つかりません」と返してください
4. ${targetFieldDescription ? targetFieldDescription : targetField}に関する情報を探してください

返答形式: JSON
{
  "value": "抽出された値または'見つかりません'",
  "confidence": "high/medium/low",
  "reasoning": "判断の理由"
}`,
            config: {
                tools: [{ urlContext: {} }],
                // @ts-ignore - thinking_level is a new feature
                thinking_level: "low"
            }
        });

        const text = response.text || '{"value":"見つかりません","confidence":"low"}';
        const result = extractJson<{ value: string, confidence: string, reasoning?: string }>(text);

        // Check if we should mark as not found
        if (shouldMarkAsNotFound(result.confidence, result.value)) {
            return null;
        }

        // Convert to number if needed
        let finalValue: string | number = result.value;
        if (columnType === 'number' && result.value !== '見つかりません') {
            const num = parseFloat(result.value.replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) {
                finalValue = num;
            }
        }

        return {
            field: targetField,
            value: finalValue,
            confidence: result.confidence as 'high' | 'medium' | 'low',
            source: url
        };
    } catch (error) {
        console.error('Extraction phase error:', error);
        return null;
    }
}

/**
 * Main enrichment function with progress callbacks
 */
// GenerationProgress is still used for UI state in TableView
export interface GenerationProgress {
    phase: 'generating_names' | 'enriching_details' | 'complete';
    currentRow?: number;
    totalRows: number;
    currentColumn?: string;
    rowId?: string;
}
