Visual Dialect: Clean Swiss Tech. A stark, modern, white/gray structure that acts as a clean container for retro, pixelated "terminal" content.

1. Core Philosophy
Structure vs. Content: The UI chrome (buttons, inputs, cards) is clean, vector-based, and softly rounded. The content (graphics, icons, background patterns, data displays) is pixelated, sharp, and terminal-inspired.

Whitespace is King: Do not use lines to separate sections. Use massive amounts of whitespace.

Grayscale Layering: Depth is created by layering very light gray containers on pure white backgrounds (or vice-versa).

2. Color Palette
Strict adherence is required. If the UI looks colorful, it is wrong.

The Structure (Grayscale)
Pure White #FFFFFF (Main Backgrounds)

Off-White / Wash Gray #F5F5F7 (Input fields, secondary card backgrounds)

Subtle Border #E6E8EB (Used sparingly for definition)

Ink Black #0A0B0D (Primary text, primary buttons)

Ink Gray #5B616E (Secondary text, supporting labels)

The Interaction
Electric Blue #0052FF (Note: Use this vivid web blue, not standard pure blue)

Usage: Links, active states, cursors, and accent pixels. Never large backgrounds.

3. Typography & Terminal Vibe
Primary Interface: Inter (Headings, Body). Tight letter-spacing on large headings for a modern feel.

Data / Terminal: JetBrains Mono (or similar quality monospace).

Usage: Crucial for the "vibe". Use it for input field text, numbers, financial data, timestamps, and small "system status" labels.

4. Components & Construction
The Input Field (Modern Container, Terminal Content)
Container: A soft rectangle. Background #F5F5F7, Radius 12px. No border by default.

Content: Text inside should be JetBrains Mono to feel like a command line input.

Focus State: A sharp, 2px Electric Blue ring.

The Card / Window
Appearance: Clean gray blocks on white, or white blocks on gray.

Radius: Distinctly rounded (16px to 24px).

Shadows: Avoid heavy drop shadows. Use flat colors or extremely subtle borders (#E6E8EB).

Buttons
Primary: Solid Ink Black rectangle with slightly rounded corners (8px - 12px). White text.

Secondary: White background with a thin Ink Gray border.

5. Pixelated & Terminal Textures
This is how we inject the "soul" into the clean UI.

Pixel Graphics: All illustrative icons, background patterns, and hero images must be rendered with visible pixels (aliased). No smooth gradients or anti-aliased vectors for graphics.

ASCII/Bitmap Scrollers: Background text textures (like the "CREATE EARN TRADE" pattern) should look like dot-matrix printing or low-res bitmap fonts.

Data Visualization: Charts and graphs should use blocky, pixelated lines or stepped bars, not smooth d3.js curves.

The "Blink": Consider subtle blinking cursor effects on empty states or terminal-style prompts using the Blue accent.