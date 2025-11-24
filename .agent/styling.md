# BaseCRM Design System

Inspired by the Base.org aesthetic ("Swiss Style met Tech").
Uses a lot of pixelated ascii terminal style images

## 1. Philosophy

*   **Bold & Minimal:** Use high contrast. Do not hide complexity, organize it.
*   **Solid Colors:** Avoid gradients in core communications. Use solid blocks of vibrant color against strict monochrome.
*   **Typography:** Functional and robust. `Inter` for interface, `JetBrains Mono` for data/code, monospace typography for technical/pixelated aesthetic.
*   **Shapes:** Sharp edges or minimal rounding (2px-4px recommended). No excessive rounded corners unless strictly for tags or specific UI elements.
*   **Pixelated Vibe:** Embrace blocky, grid-based, terminal-inspired aesthetics. Think retro computing meets modern web.

## 2. Color Palette

### Primary Colors

**BLUE** `#0000FF`
- RGB: R 0, G 0, B 255
- Usage: Hero color, primary actions, core brand identity
- This is THE most effective element color - use sparingly and strategically

**CERULEAN** `#3C8AFF`
- RGB: R 60, G 138, B 255
- Usage: Secondary actions, lighter accent, hover states for blue elements

### Secondary Colors (Bursts of Energy)

**YELLOW** `#FFD12F`
- RGB: R 255, G 209, B 47
- Usage: Highlights, notifications, calls to attention

**GREEN** `#66C800`
- RGB: R 102, G 200, B 0
- Usage: Success states, positive indicators, growth metrics

**LINE GREEN** `#B6F569`
- RGB: R 182, G 245, B 105
- Usage: Lighter green accent, progressive states

**RED** `#FC401F`
- RGB: R 252, G 64, B 31
- Usage: Errors, alerts, critical actions, destructive operations

**PINK** `#FEA8CD`
- RGB: R 254, G 168, B 205
- Usage: Creative accents, special features, playful elements

**TAN** `#B8A581`
- RGB: R 184, G 165, B 129
- Usage: Neutral accent, earthy contrast, warm backgrounds

### Grayscale Spectrum

**GRAY 0 (White)** `#FFFFFF`
- RGB: R 255, G 255, B 255
- Usage: Canvas, primary backgrounds, maximum contrast

**GRAY 10** `#EEF0F3`
- RGB: R 238, G 240, B 243
- Usage: Subtle backgrounds, cards, containers

**GRAY 15** `#DEE1E7`
- RGB: R 222, G 225, B 231
- Usage: Borders, dividers, disabled states

**GRAY 30** `#B1B7C3`
- RGB: R 177, G 183, B 195
- Usage: Secondary text, placeholder text, muted elements

**GRAY 50** `#717886`
- RGB: R 113, G 120, B 134
- Usage: Helper text, tertiary information

**GRAY 60** `#5B616E`
- RGB: R 91, G 97, B 110
- Usage: De-emphasized text, subtle UI elements

**GRAY 80** `#32353D`
- RGB: R 50, G 53, B 61
- Usage: Dark backgrounds, navigation, headers

**GRAY 100 (Black)** `#0A0B0D`
- RGB: R 10, G 11, B 13
- Usage: Primary text, headings, strong emphasis, terminal backgrounds

## 3. Color Usage Guidelines

### CORE (Product & Web Default)

**Combination:** Grayscale + Blue

The core color combination is **grayscale and blue**. The secondary palette can be used to enrich marketing and social content, but it should **never overshadow the primary colors**.

**Key Principles:**
- Always reserve the use of Base Blue for the most effective element and avoid overusing it
- Our grayscale and negative space should outweigh Base Blue in terms of color hierarchy
- The design stays mostly grayscale, but uses bursts of vibrant color in key interactions to add expression and impact

### MARKETING & SOCIAL

**Combination:** Grayscale + Blue + Secondary Colors (Cerulean, Yellow, Green, Line Green, Red, Pink, Tan)

For campaigns or special novelty projects, colors outside the brand palette may be used to keep the brand from feeling stagnant.

**Key Principles:**
- Use vibrant secondary colors to create energy and expression in unexpected moments
- Love surprising with color in unusual contexts
- Maintain grayscale as the foundation, adding color for impact

### NOVELTY (Special Projects)

**Combination:** Grayscale + Full Spectrum (including gradients)

For special campaigns or novelty projects only. May include gradients and colors outside the standard palette.

## 4. Misuse - DO NOT DO THE FOLLOWING

### ❌ DO NOT USE GRADIENTS IN CORE COMMUNICATIONS
- Avoid gradients in core comms
- Avoid opacity, layering and other visual effects
- Never hero a color other than Blue, Black, White, or Gray

### ❌ DO NOT LEAD WITH SECONDARY COLORS
- Secondary colors should not be the primary visual element
- Do not use excessive amounts of Red, Yellow, Pink, Green, or Tan
- These colors are accents, not foundations

### ❌ DO NOT MAKE THE BRAND FEEL TOO ELEMENTARY
- Avoid overly playful or childish combinations
- Maintain sophistication through restraint
- Use color strategically, not excessively

### ❌ DO NOT OVERUSE BASE BLUE ON PRODUCT OR WEB
- Reserve blue for the most important interactive element
- Too much blue dilutes its impact
- Prioritize grayscale with strategic blue accents

## 5. Typography

*   **Interface Font:** `Inter` - Clean, modern, highly readable
*   **Data/Code Font:** `JetBrains Mono` - Monospace, technical, terminal aesthetic
*   **Hierarchy:** Use font weight and size, not color, to establish hierarchy within grayscale elements
*   **Pixelated Option:** For special ASCII-style elements or retro aesthetics, consider pixelated/bitmap fonts

## 6. Layout & Spacing

*   **Grid-Based:** Embrace strict grid systems, blocky layouts
*   **Sharp Alignment:** Everything should align to a consistent grid (8px or 4px base unit recommended)
*   **Negative Space:** Use generous whitespace/grayscale areas to let color accents breathe
*   **Terminal Aesthetic:** Monospace grids, ASCII art, command-line inspired layouts where appropriate

## 7. Shapes & Corner Rounding

*   **Minimal Rounding:** 2px-4px border radius recommended
*   **Sharp Edges:** Prefer 0px radius for a more technical, pixelated feel
*   **No Pill Shapes:** Avoid excessive rounding (like 999px) unless strictly for tags or badges
*   **Consistency:** Maintain the same corner radius across similar UI components

## 8. Interaction & Motion

*   **Hover States:** Sharp, immediate transitions. No easing unless intentional
*   **Feedback:** Terminal-style system messages, monospace status indicators
*   **Data Visualization:** Pixelated, block-based, bar chart style rather than smooth curves
*   **ASCII Animation:** Consider using ASCII art or character-based animations for special interactions
*   **Loading States:** Use monospace characters, progress bars with solid blocks, terminal-style indicators

## 9. Design Principles Summary

### Web Color Philosophy
Without careful execution, our palette can feel very saturated and too poppy. To avoid it, we want to be thoughtful about selecting colors in application.

**Always:**
- Reserve Base Blue for the most effective, high-priority element
- Let grayscale and negative space dominate the hierarchy
- Use bursts of vibrant color for surprise and impact in key moments

**The Result:**
- Design stays mostly grayscale
- Strategic use of vibrant color adds expression and directs attention
- Color becomes a powerful tool rather than visual noise

## 10. Localization

*   **Target Audience:** Japanese market
*   **Cool Factor:** Keep English technical terms for authenticity (e.g., "Auto Generate", "Enrich", "Terminal")
*   **Typography:** Ensure proper Japanese font rendering with appropriate fallbacks
*   **Cultural Sensitivity:** Balance global tech aesthetic with local market preferences
