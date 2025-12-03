import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "API Key not found. Please set NEXT_PUBLIC_GOOGLE_GENAI_API_KEY in .env"
    );
  }

  return new GoogleGenAI({ apiKey });
};

export const identifyCompanies = async (
  query: string,
  count: number
): Promise<string[]> => {
  const ai = getClient();

  const prompt = `
  List exactly ${count} Japanese companies that match the description: "${query}".
  Return ONLY a list of company names separated by newlines. Do not add numbering or bullet points.
  Example:
  Company A
  Company B
  Company C
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const companies = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return companies.slice(0, count);
  } catch (error) {
    console.error("Error identifying companies:", error);
    return Array.from({ length: count }, (_, i) => `Unidentified Company ${i + 1}`);
  }
};

// Column alias mapping for better matching
const COLUMN_ALIASES: Record<string, string[]> = {
  '会社概要': ['会社概要', '企業概要', '概要', 'Company Summary', 'Summary', '会社説明', '企業説明', '事業内容', '事業概要'],
  'ウェブサイト': ['ウェブサイト', 'Website', 'URL', 'ホームページ', 'HP', 'サイト', 'Webサイト'],
  '従業員規模': ['従業員規模', '従業員数', 'Employees', 'Employee Count', '社員数', '人員数'],
  '想定売上規模': ['想定売上規模', '売上', 'Revenue', 'Sales', '売上高', '年間売上', '売上規模'],
  'SNS': ['SNS', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'ソーシャルメディア', 'リンク', 'リンクドイン'],
  'カテゴリー': ['カテゴリー', 'Category', '業種', '業界', 'Industry', '分野', 'タグ'],
  'フィットスコア': ['フィットスコア', 'Fit Score', '適合度', 'マッチ度'],
  'フィットスコア理由': ['フィットスコア理由', 'Fit Score Explanation', '適合理由', 'マッチ理由', '理由', 'Explanation']
};

// Get column-specific instruction
const getColumnInstruction = (columnTitle: string): string => {
  const normalized = columnTitle.trim();
  
  if (normalized === '会社概要' || normalized.includes('概要') || normalized.includes('Summary')) {
    return 'CRITICAL: This field is MANDATORY. You MUST generate a short 1-2 sentence summary describing what the company does, its main business activities, and industry. Even if you find limited information, create a summary based on what you know. Never return N/A for this field. Example: "SaaS型の勤怠管理システムを提供する企業。中小企業向けにクラウドベースの人材管理ソリューションを開発・販売している。"';
  }
  if (normalized === 'ウェブサイト' || normalized.includes('Website') || normalized.includes('URL') || normalized.includes('サイト')) {
    return 'Return the official company website domain or homepage URL (e.g., https://example.co.jp or example.co.jp).';
  }
  if (normalized === '従業員規模' || normalized.includes('従業員') || normalized.includes('Employees')) {
    return 'Find the number of employees. Use Japanese format like "50-100名", "100-300名", "300-1000名", or exact numbers like "150名".';
  }
  if (normalized === '想定売上規模' || normalized.includes('売上') || normalized.includes('Revenue') || normalized.includes('Sales')) {
    return 'Find or estimate revenue/sales figures. Can be approximate ranges (e.g., "10億円-50億円", "50億円-100億円") or specific values if available. If exact data is not found, estimate based on company size, industry averages, and employee count. Only use N/A if estimation is truly impossible. This field MUST be filled - never leave it empty.';
  }
  if (normalized === 'SNS' || normalized.includes('LinkedIn') || normalized.includes('Twitter') || normalized.includes('Facebook')) {
    return 'Find social media URLs. You MUST attempt to find at least one. PRIORITY ORDER: 1) LinkedIn URL (preferred - search for "company name LinkedIn"), 2) Twitter/X URL (search for "company name Twitter"), 3) Facebook URL (search for "company name Facebook"). Return the first one found. Format as full URL (e.g., https://www.linkedin.com/company/example). If none found after thorough search, use N/A.';
  }
  if (normalized === 'カテゴリー' || normalized.includes('Category') || normalized.includes('業種') || normalized.includes('業界')) {
    return 'Select 2-3 most relevant industry tags from this list: [IT・通信, 製造業, 建設業, 小売・卸売, 金融・保険, 不動産, サービス業, 医療・福祉, 教育, 官公庁, コンサルティング, 人材, 物流, エネルギー, エンタメ]. Return them as a comma-separated list.';
  }
  if (normalized === 'フィットスコア理由' || normalized.includes('理由') || normalized.includes('Explanation') || normalized.includes('理由')) {
    return 'MANDATORY FIELD: You MUST provide a detailed explanation (1-2 sentences in Japanese) explaining WHY the fit score was assigned. DO NOT return N/A. Analyze the company and explain specific factors such as: industry alignment, company size match, business needs, market segment compatibility, or potential use cases. The explanation must be substantive and explain the reasoning behind the score assignment. Example format: "同社はIT・通信業界でSaaSサービスを提供しており、ユーザー企業のターゲット顧客層（中小企業）と一致。クラウドベースのソリューションへの理解も高く、導入可能性が高い。"';
  }
  
  return `Find information for "${columnTitle}".`;
};

export const scrapeCompanyDetails = async (
  companyName: string,
  columns: string[],
  companyContext?: string
): Promise<{ data: Record<string, string>; sources: string[] }> => {
  const ai = getClient();

  // Exclude status column from enrichment
  const columnsToEnrich = columns.filter(col => 
    col !== 'ステータス' && 
    !col.toLowerCase().includes('status')
  );

  // Build column-specific instructions
  const columnInstructions = columnsToEnrich.map(col => {
    const instruction = getColumnInstruction(col);
    return `- "${col}": ${instruction}`;
  }).join('\n');

  const columnsStr = columnsToEnrich.join(", ");
  
  // Check for fit score and explanation columns (used in multiple places)
  const hasFitScoreColumn = columnsToEnrich.some(col => 
    col === 'フィットスコア' || col.includes('フィットスコア') || col.toLowerCase().includes('fit score')
  );
  const hasFitExplanationColumn = columnsToEnrich.some(col => 
    col === 'フィットスコア理由' || col.includes('理由') || col.toLowerCase().includes('explanation')
  );
  
  let prompt = `
  I need accurate information for the Japanese company "${companyName}".
  Please use Google Search to find the values for ALL of the following fields: [${columnsStr}].
  
  IMPORTANT: You MUST attempt to find information for EVERY field listed below. Only use "N/A" if you have thoroughly searched and truly cannot find any information after multiple attempts.
  ${hasFitExplanationColumn ? '⚠️ EXCEPTION: The フィットスコア理由 field is MANDATORY and MUST contain an explanation - NEVER return N/A for this field.' : ''}
  
  Focus on finding official information from the company website, "Company Overview" (会社概要), "Specified Commercial Transactions Law" (特定商取引法), or "Financial Statements" (決算書).

  Format the output as lines of "KEY::VALUE". 
  Use the EXACT column names provided below as the KEY.
  
  Column-Specific Instructions:
${columnInstructions}
  `;

  if (companyContext) {

    if (hasFitScoreColumn) {
      prompt += `
    
    CRITICAL: Evaluate the "フィットスコア" (Fit Score) for "${companyName}" based on the following User Company Context:
    "${companyContext}"
    
    You MUST carefully analyze and return a fit score. Do NOT default to "中" - make an actual judgment based on:
    
    **Criteria for 高 (High Fit):**
    - Industry alignment: Target company operates in the same or closely related industry
    - Company size match: Target company size aligns with User Company's typical customer profile
    - Business needs: Target company likely has clear needs that User Company's products/services address
    - Market segment: Target company serves similar customer segments or has complementary business model
    - Geographic fit: If relevant, operates in regions where User Company can serve
    
    **Criteria for 中 (Medium Fit):**
    - Partial industry match: Some overlap but not perfect alignment
    - Size may be slightly off: Company size is close but not ideal
    - Potential needs exist: Some potential use cases but not immediately obvious
    - Moderate alignment: Some factors align but others don't
    
    **Criteria for 低 (Low Fit):**
    - Different industry: Operates in unrelated or incompatible industry
    - Size mismatch: Company size is significantly different from User Company's target
    - No clear need: No obvious use case for User Company's products/services
    - Different business model: Serves different customer segments or has incompatible business model
    
    IMPORTANT: Analyze the actual business of "${companyName}" and compare it to the User Company context. Make a real judgment, not a default.
    Return EXACTLY "フィットスコア::高", "フィットスコア::中", or "フィットスコア::低" based on your analysis.
    `;

    if (hasFitExplanationColumn) {
      prompt += `
    
    ⚠️ MANDATORY REQUIREMENT FOR フィットスコア理由 (Fit Score Reason):
    You MUST ALWAYS return "フィットスコア理由::[your explanation]" - this field is REQUIRED and CANNOT be N/A.
    
    Requirements for the explanation:
    1. Write 1-2 sentences in Japanese explaining WHY you assigned the specific fit score
    2. DO NOT just repeat the score value (高/中/低) - provide actual reasoning
    3. DO NOT return N/A - you must provide an explanation based on your analysis
    4. Mention specific factors such as:
       - Industry alignment: How does the target company's industry relate to the user company's context?
       - Company size match: Does the company size align with the user company's typical customers?
       - Business needs: What specific needs might the target company have that the user company addresses?
       - Market segment: Do they serve similar customer segments?
       - Use cases: What potential use cases exist?
    
    Example for 高 (High Fit):
    "同社はIT・通信業界でSaaSサービスを提供しており、ユーザー企業のターゲット顧客層（中小企業）と一致。クラウドベースのソリューションへの理解も高く、導入可能性が高い。"
    
    Example for 中 (Medium Fit):
    "業界は部分的に一致しているが、企業規模がやや異なる。潜在的なニーズは存在するものの、即座の導入可能性は中程度。"
    
    Example for 低 (Low Fit):
    "異なる業界に属しており、ユーザー企業のターゲット顧客層とは大きく異なる。明確な使用ケースが見当たらず、適合性は低い。"
    
    CRITICAL: The explanation must be at least 30 characters and must contain actual reasoning based on your analysis of the company. Never return N/A for this field.
    `;
    }
    
    prompt += `
    `;
    }
  }

  prompt += `
  Example Output Format:
  会社概要::SaaS型の勤怠管理システムを提供する企業。中小企業向けにクラウドベースの人材管理ソリューションを開発・販売している。
  ウェブサイト::https://example.co.jp
  従業員規模::50-100名
  想定売上規模::10億円-50億円
  SNS::https://www.linkedin.com/company/example
  カテゴリー::IT・通信, SaaS, B2B
  ${companyContext ? `フィットスコア::高
  フィットスコア理由::同社はIT・通信業界でSaaSサービスを提供しており、ユーザー企業のターゲット顧客層（中小企業）と一致。クラウドベースのソリューションへの理解も高く、導入可能性が高い。` : ''}
  
  Remember: 
  - Use the EXACT column names from the list above as keys
  - Attempt to find information for ALL columns
  - For revenue (想定売上規模), if you cannot find exact data, estimate based on company size and industry averages, or use N/A only if truly impossible to estimate
  ${hasFitExplanationColumn ? '- CRITICAL: The フィットスコア理由 field is MANDATORY and MUST contain an explanation - NEVER return N/A for this field' : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const data: Record<string, string> = {};

    // Helper function to find matching column using aliases
    const findMatchingColumn = (key: string): string | null => {
      // Direct match first
      if (columnsToEnrich.includes(key)) {
        return key;
      }
      
      // Check aliases
      for (const [columnTitle, aliases] of Object.entries(COLUMN_ALIASES)) {
        if (columnsToEnrich.includes(columnTitle)) {
          // Check if key matches any alias
          if (aliases.some(alias => 
            key.toLowerCase().includes(alias.toLowerCase()) || 
            alias.toLowerCase().includes(key.toLowerCase())
          )) {
            return columnTitle;
          }
        }
      }
      
      // Fuzzy match: check if key contains column or column contains key
      const fuzzyMatch = columnsToEnrich.find(col => {
        const colLower = col.toLowerCase();
        const keyLower = key.toLowerCase();
        return colLower.includes(keyLower) || keyLower.includes(colLower);
      });
      
      if (fuzzyMatch) {
        return fuzzyMatch;
      }
      
      // Partial match for compound names (e.g., "会社概要" matches "会社" or "概要")
      const partialMatch = columnsToEnrich.find(col => {
        const colWords = col.split(/[・\s]/);
        const keyWords = key.split(/[・\s]/);
        return colWords.some(cw => keyWords.some(kw => 
          cw.toLowerCase().includes(kw.toLowerCase()) || 
          kw.toLowerCase().includes(cw.toLowerCase())
        ));
      });
      
      return partialMatch || null;
    };

    const lines = text.split("\n");
    lines.forEach((line) => {
      if (line.includes("::")) {
        const [rawKey, val] = line.split("::");
        const key = rawKey.trim();
        let value = val.trim();

        // Skip if value is empty or just whitespace
        if (!value || value.trim() === '') {
          return;
        }

        // Normalize fit score to ensure it matches tag options
        if (key === 'フィットスコア' || key.includes('フィットスコア') || key.toLowerCase().includes('fit score')) {
          const normalizedValue = value.toLowerCase();
          // Map variations to correct values
          if (normalizedValue === 'high' || normalizedValue === '高' || normalizedValue.includes('高')) {
            value = '高';
          } else if (normalizedValue === 'medium' || normalizedValue === '中' || normalizedValue.includes('中')) {
            value = '中';
          } else if (normalizedValue === 'low' || normalizedValue === '低' || normalizedValue.includes('低')) {
            value = '低';
          } else {
            // Default to 中 if unclear
            value = '中';
          }
        }

        // Prevent fit score values from being assigned to reason/explanation columns
        const isReasonColumn = key === 'フィットスコア理由' || key.includes('理由') || key.toLowerCase().includes('explanation') || key.toLowerCase().includes('reason');
        if (isReasonColumn) {
          // Reject if the value is just a fit score (高/中/低) without explanation
          const normalizedValue = value.trim().toLowerCase();
          // Check for exact score values (single character or word)
          if (normalizedValue === '高' || normalizedValue === '中' || normalizedValue === '低' || 
              normalizedValue === 'high' || normalizedValue === 'medium' || normalizedValue === 'low' ||
              // Check for combinations like "低中高" or "high, medium, low"
              /^[高中低\s,]+$/.test(value.trim()) ||
              /^(high|medium|low)[\s,]*$/.test(normalizedValue) ||
              // Reject very short values that are likely just scores (less than 10 chars)
              (normalizedValue.length < 10 && /[高中低]/.test(value.trim()))) {
            // Skip this value - it's just the score, not an explanation
            return;
          }
        }

        // Find matching column using improved matching logic
        const matchedColumn = findMatchingColumn(key);
        if (matchedColumn) {
          // Set value, preferring non-N/A values but allowing N/A to fill empty cells
          if (!data[matchedColumn]) {
            // No existing value, set it
            data[matchedColumn] = value;
          } else if (data[matchedColumn] === 'N/A' && value !== 'N/A' && value.toLowerCase() !== 'n/a') {
            // Replace N/A with actual value if found
            data[matchedColumn] = value;
          } else if (!data[matchedColumn] || data[matchedColumn].trim() === '') {
            // Empty string, set to value (including N/A)
            data[matchedColumn] = value;
          }
        }
      }
    });

    // Only set N/A for columns that were requested for enrichment (ensure empty strings are also filled)
    // EXCEPT for fit score reason - it should never be N/A, it must have an explanation
    columnsToEnrich.forEach((col) => {
      const isFitReasonColumn = col === 'フィットスコア理由' || col.includes('理由') || col.toLowerCase().includes('explanation');
      if (!data[col] || data[col].trim() === '') {
        if (isFitReasonColumn) {
          // For fit score reason, generate a default explanation if missing
          // Try to infer from the fit score if available
          const fitScore = data['フィットスコア'] || data[columnsToEnrich.find(c => c.includes('フィットスコア') && !c.includes('理由')) || ''];
          if (fitScore === '高' || fitScore === '中' || fitScore === '低') {
            // Generate a basic explanation based on the score
            const explanations: Record<string, string> = {
              '高': '業界や企業規模がユーザー企業のターゲット顧客層と一致しており、明確なニーズと導入可能性が高い。',
              '中': '部分的に適合する要素はあるが、完全な一致ではない。潜在的なニーズは存在するものの、導入には追加の検討が必要。',
              '低': '業界や企業規模がユーザー企業のターゲット顧客層と大きく異なり、明確な適合性は見られない。'
            };
            data[col] = explanations[fitScore] || 'フィットスコアに基づく分析が必要です。';
          } else {
            // Fallback if no fit score available
            data[col] = '企業情報の分析に基づく適合性評価が必要です。';
          }
        } else {
          data[col] = "N/A";
        }
      }
    });

    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web?.uri) sources.push(chunk.web.uri);
      });
    }

    return { data, sources };
  } catch (error) {
    console.error(`Error scraping ${companyName}:`, error);
    const emptyData: Record<string, string> = {};
    columns.forEach((c) => (emptyData[c] = "N/A"));
    return { data: emptyData, sources: [] };
  }
};


