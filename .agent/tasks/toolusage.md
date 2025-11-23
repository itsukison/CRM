Best Strategy for Using Them Together
Here's a recommended workflow:
Phase 1: Discovery (Google Search)

Use search grounding to find companies matching your criteria
Search for pages containing "特定商品取引法に基づく表記" in your target industry/region
Example query: site:*.co.jp "特定商品取引法に基づく表記" [industry keyword]
Let Gemini identify and collect URLs of relevant company websites

Phase 2: Data Extraction (URL Context)

Feed the discovered URLs to Gemini with URL context enabled
Ask it to navigate to the 特定商品取引法 page and extract specific fields
Request structured output (JSON/CSV format) with fields like:

Company name (会社名)
CEO name (代表者名)
Address (住所)
Phone (電話番号)
Email (メールアドレス)
Established date (設立年月日)



Phase 3: Financial Analysis (URL Context + Search)

Use search to find 決算報告書 URLs for each company
Use URL context to extract financial metrics from these documents
Compile financial health indicators

Tips for Best Quality

Iterative refinement: Start with a small batch (5-10 companies) to refine your prompts before scaling up
Structured prompts: Be very specific about the data format you want. Provide examples in your prompt.
Error handling: Japanese websites vary in structure. Ask Gemini to flag when it can't find specific information rather than guessing.
Validation layer: After extraction, have Gemini verify that extracted phone numbers/emails follow proper formats.
Batch processing: Process companies in batches rather than one at a time to stay within rate limits while maintaining quality.

Recommended Tiered Approach
Tier 1 - Basic Info (All companies):

特定商品取引法 page
会社概要 page
法人番号公表サイト data
Tier 2 - Growth Indicators (When available):

採用情報
プレスリリース
Recent news mentions
Tier 3 - Financial Details (Listed/larger companies):

決算報告書 via EDINET
IR資料
Annual reports
Search Strategy Recommendation
Have your agent:

Always search for: 特定商品取引法, 会社概要, and check 法人番号公表サイト
Try to find: 採用情報, ニュースリリース (higher availability)
Opportunistically grab: 決算報告書 if available (but don't fail if missing)
Flag company type: Mark whether it's 上場/非上場 to set expectations
This way you'll have useful data for 100% of companies, with rich financial data for the ~20-30% where it's available. Would you like help structuring the search queries for these different data sources?


