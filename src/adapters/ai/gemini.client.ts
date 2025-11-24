
import { GoogleGenAI } from "@google/genai";
import { AnalyzeChatResult, ChatTool, TableData } from "@/types";


const getClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC"))
    );
    throw new Error(
      "API Key not found. Please set NEXT_PUBLIC_GOOGLE_GENAI_API_KEY in .env"
    );
  }
  return new GoogleGenAI({ apiKey });
};

// Chat Interface - Analyze Intent & Tool Usage
export const analyzeChatIntent = async (
  userMessage: string,
  currentTable: TableData,
  selectionContext: { selectedRowIds: string[]; selectedCellIds: string[] },
  mode: "chat" | "agent" = "chat"
): Promise<AnalyzeChatResult> => {
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
現在のモード: ${mode === "agent" ? "AGENT (編集・操作可能)" : "CHAT (閲覧・分析のみ)"}
    
    テーブル情報:
    テーブル名: ${currentTable.name}
カラム一覧 (IDと表示名): ${columnsInfo}

選択コンテキスト:
${selectionPrompt || "現在選択されている行はありません。"}

ユーザーの発言: """${userMessage}"""

タスク:
- ユーザーの意図 (intent) と、必要であれば実行すべき「ツール(tool)」とそのパラメータをJSONで返してください。
- 「選択した行」「これらの3社」「この行たち」などの表現は、必ず selectionContext.selectedRowIds を指していると解釈してください。

    Intentの種類:
    1. FILTER: データの絞り込み。「～を含む」「～以上の」など。
    2. SORT: データの並び替え。「～で並べて」「～順にして」。
3. EDIT: データの追加、変更、エンリッチ、行生成など。(AGENTモードのみ可能。CHATモードでは提案のみ)
4. CHAT: 一般的な会話、質問、データの要約や説明。

利用可能なtoolの種類:
- "none": ツールは使わずに説明やサマリだけ返す。
- "filter": rowsを条件で絞り込む (view更新に利用)。
- "sort": rowsを特定カラムで並べ替える。
- "enrich": 選択された行や全行に対して会社情報などをエンリッチする。
- "generate_data": 新しい行を生成する (主に企業リストなど)。
- "calculate_max": 数値カラムの最大値を計算する。
- "calculate_min": 数値カラムの最小値を計算する。
- "calculate_mean": 数値カラムの平均値を計算する。

scopeの考え方:
- scope: "selected" の場合は selectionContext.selectedRowIds に含まれる行のみを対象にしてください。
- scope: "all" または未指定の場合はテーブル全体の全行を対象にしてください。

- 重要な制約:
- mode === "chat" (Askモード) のとき:
  - データやビューを変更するようなtool ("enrich", "generate_data" など) は実行しないでください。
  - 既存データに基づいた読み取り・要約・比較は行ってかまいません。
  - ユーザーが「〜の会社名は？」「〜のCEOは？」「〜のメールアドレスは？」のように**単に値を知りたいだけ**の場合は、
    - intent はできるだけ "CHAT" にし、
    - tool は "none" にしてください。
    - reply では「Agentモードに切り替えてください」「フィルタしてください」などの手順説明ではなく、**可能であれば直接答えを述べる文**を書いてください。
  - 行やカラムを特定する助けとして filterParams/sortParams を埋めてもかまいませんが、その場合でも reply は「最終的な答え」を自然文で返すようにしてください。
- mode === "agent" (Agentモード) のとき:
  - ユーザーが明確に操作を依頼している場合、最も適切なtoolを1つ選択してください。
  - もし選択された行だけを対象にすべき文脈なら scope は "selected" にしてください。

レスポンスJSON形式:
    {
        "intent": "FILTER" | "SORT" | "EDIT" | "CHAT",
  "tool": "none" | "filter" | "sort" | "enrich" | "generate_data" | "calculate_max" | "calculate_min" | "calculate_mean",
  "reply": "ユーザーへの日本語での返答。何をしようとしているか、または結果を簡潔に説明する。",

  "filterParams": {
    "columnId": "既存カラムID",
    "operator": "contains" | "equals" | "greater" | "less",
    "value": "比較値 (文字列)",
    "scope": "all" | "selected"
  },

  "sortParams": {
    "columnId": "既存カラムID",
    "direction": "asc" | "desc",
    "scope": "all" | "selected"
  },

  "enrichParams": {
    "targetColumnIds": ["既存カラムIDの配列"],
    "scope": "selected" | "all"
  },

  "generateParams": {
    "count": 10,
    "targetColumnIds": ["既存カラムIDの配列"],
    "prompt": "生成に使う説明テキスト (任意)",
    "scope": "all" | "selected"
  },

  "aggregateParams": {
    "columnId": "数値カラムのID",
    "operation": "max" | "min" | "mean",
    "scope": "all" | "selected"
  },

  "suggestedAction": "CHATモードでEDIT要求があった場合に、Agentモードに切り替えるよう促すメッセージ (任意)"
}

必ず有効なJSONだけを返してください。説明文は reply フィールドに書き、JSONの外側には何も書かないでください。
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const raw = response.text || "{}";
    const parsed = JSON.parse(raw) as Partial<AnalyzeChatResult>;

    const safeResult: AnalyzeChatResult = {
      intent: parsed.intent ?? "CHAT",
      tool: (parsed.tool as ChatTool) ?? "none",
      reply: parsed.reply ?? "処理結果を返します。",
      filterParams: parsed.filterParams,
      sortParams: parsed.sortParams,
      enrichParams: parsed.enrichParams,
      generateParams: parsed.generateParams,
      aggregateParams: parsed.aggregateParams,
      suggestedAction: parsed.suggestedAction,
    };

    return safeResult;
  } catch (e) {
    console.error("Intent analysis failed", e);
    const fallback: AnalyzeChatResult = {
      intent: "CHAT",
      tool: "none",
      reply: "申し訳ありません、理解できませんでした。",
    };
    return fallback;
  }
}
