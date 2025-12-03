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

export const scrapeCompanyDetails = async (
  companyName: string,
  columns: string[],
  companyContext?: string
): Promise<{ data: Record<string, string>; sources: string[] }> => {
  const ai = getClient();

  const columnsStr = columns.join(", ");
  let prompt = `
  I need accurate information for the Japanese company "${companyName}".
  Please use Google Search to find the values for the following fields: [${columnsStr}].
  
  Focus on finding official information from the company website, "Company Overview" (会社概要), "Specified Commercial Transactions Law" (特定商取引法), or "Financial Statements" (決算書).

  Format the output as lines of "KEY::VALUE". 
  If a value is not found, write "KEY::N/A".
  
  Special Instructions:
  - For "ウェブサイト" (Website), return only the domain or homepage URL.
  - For "SNS", return the LinkedIn, Twitter/X, or Facebook URL if found.
  - For "カテゴリー" (Category), select 2-3 most relevant tags from this list: [IT・通信, 製造業, 建設業, 小売・卸売, 金融・保険, 不動産, サービス業, 医療・福祉, 教育, 官公庁, コンサルティング, 人材, 物流, エネルギー, エンタメ]. Return them as a comma-separated list.
  `;

  if (companyContext) {
    prompt += `
    
    Also, evaluate the "フィットスコア" (Fit Score) for this company based on the following User Company Context:
    "${companyContext}"
    
    Determine if "${companyName}" is a good potential customer for the User Company.
    - 高: Strong match (industry, size, needs align).
    - 中: Partial match.
    - 低: Poor match.
    
    Return "フィットスコア::高", "フィットスコア::中", or "フィットスコア::低".
    `;
  }

  prompt += `
  Example Output:
  Founded Date::2010-05-01
  CEO Name::Taro Yamada
  フィットスコア::高
  カテゴリー::IT・通信, SaaS, B2B
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

    const lines = text.split("\n");
    lines.forEach((line) => {
      if (line.includes("::")) {
        const [rawKey, val] = line.split("::");
        const key = rawKey.trim();
        const value = val.trim();

        // Direct match
        if (columns.includes(key)) {
          data[key] = value;
        } else {
          // Fuzzy match
          const matchedColumn = columns.find(
            (col) => key.includes(col) || col.includes(key)
          );
          if (matchedColumn) {
            data[matchedColumn] = value;
          }
        }
      }
    });

    columns.forEach((col) => {
      if (!data[col]) {
        data[col] = "N/A";
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


