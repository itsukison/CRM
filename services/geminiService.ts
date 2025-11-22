
import { GoogleGenAI, Type } from "@google/genai";
import { Column, Row, TableData } from "../types";

const getClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
    throw new Error("API Key not found. Please set NEXT_PUBLIC_GOOGLE_GENAI_API_KEY in .env");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Generate Data for a Table
export const generateRows = async (
  columns: Column[],
  count: number,
  context: string
): Promise<Row[]> => {
  const ai = getClient();

  const properties: Record<string, any> = {};
  const propertyOrdering: string[] = [];

  columns.forEach(col => {
    properties[col.id] = {
      type: col.type === 'number' ? Type.NUMBER : Type.STRING,
      description: col.description || col.title
    };
    propertyOrdering.push(col.id);
  });

  const prompt = `コンテキスト: "${context}" に基づいて、テーブル用のデータを${count}行生成してください。
  データは日本語で、現実的かつ多様な内容にしてください。
  JSON配列として返してください。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: properties,
            propertyOrdering: propertyOrdering
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");

    // Add unique IDs to rows
    return rawData.map((row: any) => ({
      ...row,
      id: `gen_${Math.random().toString(36).substr(2, 9)}`
    }));
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};

// 2. Data Enrichment with Google Search
export const enrichRowData = async (
  row: Row,
  targetColumn: Column,
  otherColumns: Column[]
): Promise<string | number> => {
  const ai = getClient();

  // Construct a context string from the existing row data
  const rowContext = otherColumns
    .map(c => `${c.title}: ${row[c.id]}`)
    .join(', ');

  const prompt = `
    私は以下のデータを持っています: { ${rowContext} }。
    この情報に基づいて、カラム "${targetColumn.title}" (${targetColumn.description}) の値をGoogle検索を使って見つけてください。
    最新かつ正確な情報を探してください。
    値のみを返してください。数値の場合は数値のみを返してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const result = response.text?.trim();
    if (!result) return "";

    // Simple parsing based on expected type
    if (targetColumn.type === 'number') {
      const num = parseFloat(result.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? result : num;
    }

    return result;
  } catch (error) {
    console.error("Enrichment error:", error);
    return "取得エラー";
  }
};

// 3. Chat Interface - Analyze Intent & Filter
export const analyzeChatIntent = async (
  userMessage: string,
  currentTable: TableData,
  selectionContext: { selectedRowIds: string[], selectedCellIds: string[] },
  mode: 'chat' | 'agent' = 'chat'
) => {
  const ai = getClient();

  // Build column list string
  const columnsInfo = currentTable.columns.map(c => `ID:${c.id} 名前:${c.name}`).join(', ');

  // Build selection context string
  let selectionPrompt = "";
  if (selectionContext.selectedRowIds.length > 0) {
    const selectedRows = currentTable.rows.filter(r => selectionContext.selectedRowIds.includes(r.id));
    // Limit data size for context
    const rowsPreview = selectedRows.slice(0, 5).map(r => JSON.stringify(r)).join("\n");
    selectionPrompt = `
        ユーザーは現在、以下の行を選択しています (ID: ${selectionContext.selectedRowIds.join(', ')}):
        データサンプル:
        ${rowsPreview}
        ... (全 ${selectionContext.selectedRowIds.length} 行)
        
        ユーザーが「選択した行を...」「これらを...」と言及した場合、この選択データコンテキストを使用してください。
        `;
  }

  const prompt = `
    あなたはAIデータベースアシスタントです。
    現在のモード: ${mode === 'agent' ? 'AGENT (編集・操作可能)' : 'CHAT (閲覧・分析のみ)'}
    
    テーブル情報:
    テーブル名: ${currentTable.name}
    カラム: ${columnsInfo}

    ${selectionPrompt}

    ユーザーの発言: "${userMessage}"

    ユーザーの意図を以下から判断しJSONで返してください。

    Intentの種類:
    1. FILTER: データの絞り込み。「～を含む」「～以上の」など。
    2. SORT: データの並び替え。「～で並べて」「～順にして」。
    3. EDIT: データの追加、変更、エンリッチ。(AGENTモードのみ可能。CHATモードの場合はSuggestActionでモード切替を促す)
    4. CHAT: 一般的な会話、質問、データの要約。

    レスポンス形式:
    {
        "intent": "FILTER" | "SORT" | "EDIT" | "CHAT",
        "reply": "ユーザーへの返答(日本語)",
        "filterParams": { "columnId": "...", "operator": "contains/equals/greater/less", "value": "..." } (FILTERの場合),
        "sortParams": { "columnId": "...", "direction": "asc/desc" } (SORTの場合),
        "suggestedAction": "..." (EDITの場合のアクション案)
    }
    
    注意:
    - "SORT" の場合、directionは "asc" (昇順) か "desc" (降順) です。
    - カラムIDは提供されたリストから最も適切なものを選択してください。
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Intent analysis failed", e);
    return { intent: "CHAT", reply: "申し訳ありません、理解できませんでした。" };
  }
}
