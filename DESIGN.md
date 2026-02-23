# Design System: Garden Dashboard

**Project ID:** 598659763481821975

## 1. Visual Theme & Atmosphere

The Garden Dashboard embodies a **lush, botanical wellness sanctuary** — a mobile-first interface that feels like tending a digital garden in the palm of your hand. The aesthetic channels **earthy modernism**, blending the organic warmth of nature with the crisp clarity of structured data visualization. It is simultaneously **nurturing and technical**, inviting growers of all levels to feel at home while providing expert-level precision.

The overall mood is **fresh, sunlit, and alive**, anchored by verdant greens and whisper-soft botanical surfaces that evoke morning light filtering through greenhouse glass. The design philosophy prioritizes **calm productivity** — every metric, task, and action feels purposeful without overwhelming the user. Whitespace is generous but not sparse; the interface breathes like a well-ventilated grow room.

**Key Characteristics:**

- Botanical color palette rooted in forest greens and soft leaf whites
- Clean, modular card system with gentle separation and lift
- Data-rich yet visually calm — charts, metrics, and schedules coexist harmoniously
- Rounded, approachable geometry that feels tactile and inviting
- Dual-mode personality: sun-drenched light mode & deep forest dark mode
- Task-oriented hierarchy — today's actions always front-and-center

## 2. Color Palette & Roles

### Primary Foundation — Light Mode

- **Morning Dew Green** (#F1F8E9) – Primary app background. An almost imperceptible green-white wash that feels like early morning light on fresh leaves, creating a calming botanical canvas.
- **Pure Petal White** (#FFFFFF) – Card and elevated surface background. Clean and bright, providing crisp separation from the soft green backdrop. Used for all content cards, modals, and input fields.

### Brand & Interactive — The Green Spectrum

- **Forest Heart Green** (#2E7D32) – The primary brand color and CTA anchor. Used for primary buttons, active tab indicators, progress bars, and key interactive elements. Evokes the deep, confident green of established foliage.
- **Meadow Green** (#4CAF50) – Secondary interactive green. Lighter and more approachable, used for hover states, active toggles, light accents, and secondary emphasis.
- **Deep Canopy Green** (#1B5E20) – The darkest brand shade. Reserved for pressed states, high-emphasis text, and moments requiring authoritative visual weight.
- **Verdant Mist** (rgba(46, 125, 50, 0.15)) – Subtle green tint used for selected states, soft highlight backgrounds, chip fills, and gentle emphasis areas.
- **Leaf Shadow** (rgba(46, 125, 50, 0.3)) – Slightly stronger green overlay for focus rings, progress track fills, and bordered emphasis containers.

### Typography & Text Hierarchy — Light Mode

- **Rich Soil Black** (#1A1A1A) – Primary text color for headlines, plant names, and key labels. Warm near-black that feels grounded and readable without the harshness of pure black.
- **Stone Path Gray** (#6B7280) – Secondary text for descriptions, metadata, timestamps, and supporting copy. Creates clear hierarchy while remaining comfortably legible.
- **Morning Fog Gray** (#9CA3AF) – Muted text for placeholders, disabled states, hints, and tertiary labels. Recessive enough to fade into the background gracefully.

### Borders & Structural Elements — Light Mode

- **Soft Fern Border** (#E8F5E9) – Primary border and divider color. An extremely gentle green-tinted separator that structures content without visual noise.
- **Whisper Gray Border** (#F0F0F0) – Secondary border for cards, metric containers, and form inputs. Neutral and nearly invisible, providing just enough definition.

### Functional & Semantic Colors

- **Alert Crimson** (#E53935) – Danger states, destructive actions, critical plant health warnings, and error indicators.
- **Crimson Mist** (#FFEBEE) – Light danger background for subtle error containers and warning banners.
- **Harvest Amber** (#FFA000) – Warning states, attention-needed indicators, nutrient alerts, and moderate urgency signals.
- **Amber Glow** (#FFF3E0) – Light warning background for gentle caution containers.
- **Issue Burnt Orange** (#E65100) – Plant issue markers and pest/disease severity indicators.
- **Success Leaf** (#C8E6C9) – Completed task backgrounds and positive state indicators.
- **Heart Rose** (#FB7185) – Liked/favorited state for strains and community content.

### Strain Type Badges — Light Mode

- **Indica Tint** (#E8F5E9) – Indica strain badge background, soft green.
- **Sativa Tint** (#FFFDE7) – Sativa strain badge background, warm sunny yellow.
- **Hybrid Tint** (#F3E5F5) – Hybrid strain badge background, gentle lavender.

### Category & Feature Accents

- **Indoor Blue** (#1565C0) – Indoor growing category accent, paired with light background (#E3F2FD).
- **Intermediate Amber** (#F57C00) – Intermediate skill level accent, paired with light background (#FFF3E0).
- **Expert Indigo** (#5C6BC0) – Expert skill level accent, paired with light background (#E8EAF6).

---

### Dark Mode — Deep Forest After Midnight

- **Midnight Canopy** (#1B2E1C) – Primary dark background. A rich, deep forest green that feels immersive and alive — like a grow room bathed in the soft glow of equipment LEDs.
- **Shadow Fern** (#203421) – Elevated surface color. Slightly lighter than the background, providing subtle layering depth.
- **Mossy Stone** (#2A4A2C) – Card background color. Warm enough to distinguish from the background, cool enough to maintain the nocturnal forest atmosphere.
- **Undergrowth Edge** (#2D4A30) – Primary border in dark mode. A soft green-dark divider that separates without harsh contrast.
- **Twilight Fern** (#3D5A47) – Brighter border accent for focused elements and interactive edges.
- **Neon Growth** (#00FF88) – The electrifying primary bright accent in dark mode. Used for CTAs, active states, success indicators, and key interactive elements. Evokes the glow of LED grow lights.
- **Pale Leaf White** (#E8F5E9) – Primary text in dark mode. A soft, botanical-tinted white that is easy on the eyes during extended night sessions.
- **Silver Sage** (#A5C9AD) – Secondary text color in dark mode. Green-tinged silver creating comfortable reading hierarchy.
- **Moss Mist** (#7A9A83) – Muted text in dark mode for placeholders and tertiary labels.
- **Dormant Green** (#4A5D52) – Disabled text in dark mode. Low-contrast but still perceptible.

### Dark Mode — Semantic States

- **Warning Honey** (#FFB74D) – Warning states in dark mode.
- **Error Flame** (#FF5252) – Danger and error states in dark mode.
- **Info Stream** (#64B5F6) – Informational highlights in dark mode.

### Dark Mode — Strain Type Badges

- **Indica Violet** (#7B2CBF) – Indica badge in dark mode, rich purple.
- **Sativa Amber** (#FFB74D) – Sativa badge in dark mode, warm amber.
- **Hybrid Azure** (#64B5F6) – Hybrid badge in dark mode, calming blue.

## 3. Typography Rules

**Primary Font Family:** Space Grotesk
**Character:** A geometric sans-serif with a technical, modern personality. Its slightly squared letterforms have a utilitarian edge softened by subtle humanist qualities — perfect for a tool-meets-nature interface.

### Hierarchy & Weights

- **Screen Titles / Hero Numbers:** Bold weight (700), generous sizing (2–3rem). Used for day counts ("Day 42"), screen headers, and key stat callouts. These are confident, grounding anchors.
- **Section Headers:** Semi-bold weight (600), 1.5–1.75rem. Used for card titles, section dividers ("Today's Tasks", "Terpene Profile"), and navigation labels.
- **Body Text & Descriptions:** Regular weight (400), relaxed line-height (1.6–1.7), 1rem. Strain descriptions, task instructions, and supporting copy prioritize comfortable readability.
- **Metadata & Labels:** Regular weight (400), 0.875rem. Timestamps, secondary stats, and subtle labels stay legible but visually recessive.
- **Button Labels / CTAs:** Medium weight (500), 1rem, with subtle letter-spacing (0.01em) for quiet confidence.

### Spacing Principles

- Section headers maintain generous margin-top for clear zone separation
- Body text uses relaxed line-height (1.6–1.7) for effortless scanning
- Consistent 16px base unit between related text blocks
- Large vertical gaps (24–32px) between major content sections

## 4. Component Stylings

### Buttons

- **Shape:** Comfortably rounded corners (8px radius) — approachable and modern, fitting the botanical geometry without appearing childish
- **Primary CTA:** Forest Heart Green (#2E7D32) background with pure white text. Generous padding for confident, thumb-friendly touch targets
- **Dark Mode Primary:** Neon Growth (#00FF88) background with Midnight Canopy (#1B2E1C) text for striking contrast
- **Pressed State:** Deep Canopy Green (#1B5E20) in light mode; slightly dimmed Neon Growth in dark mode
- **Secondary/Outline:** Transparent with Forest Heart Green border and green text, fills with Verdant Mist on press
- **Destructive:** Alert Crimson (#E53935) background with white text

### Cards & Containers

- **Corner Style:** Comfortably rounded (8px radius) — the ROUND_EIGHT geometry gives a structured yet friendly feel, like neatly organized plant pots
- **Light Mode:** Pure Petal White (#FFFFFF) background on Morning Dew Green (#F1F8E9) canvas, with Whisper Gray Border (#F0F0F0) or Soft Fern Border (#E8F5E9)
- **Dark Mode:** Mossy Stone (#2A4A2C) background on Midnight Canopy (#1B2E1C) canvas, with Undergrowth Edge (#2D4A30) borders
- **Shadow Strategy:** Minimal and flat by default. On interaction or elevation, whisper-soft diffused shadow (`0 2px 8px rgba(0,0,0,0.06)`) creates gentle lift
- **Internal Padding:** Generous 16–20px providing comfortable breathing room for content
- **Metric Cards:** Feature subtle icon backgrounds using Verdant Mist (light) or Neon Growth at 12% opacity (dark)

### Task Items

- **Structure:** Horizontal row layout with icon/indicator, task title, and supporting description
- **Active Tasks:** Forest Heart Green left indicator or checkbox accent
- **Completed Tasks:** Success Leaf (#C8E6C9) background tint with muted text treatment
- **Spacing:** 12–16px vertical gap between task rows for easy scanning and tapping

### Inputs & Forms

- **Stroke Style:** 1px border in Whisper Gray (#F0F0F0) — clean and minimal
- **Background:** Pure Petal White with transition to Verdant Mist fill on focus
- **Corner Style:** Matching card roundness (8px) for visual consistency
- **Focus State:** Border color shifts to Forest Heart Green with subtle outer glow
- **Dark Mode:** Shadow Fern (#203421) background, Undergrowth Edge (#2D4A30) border, shifting to Neon Growth border on focus
- **Placeholder Text:** Morning Fog Gray (#9CA3AF) light mode, Moss Mist (#6B8A73) dark mode

### Selection Cards (Onboarding / Wizards)

- **Unselected:** Subtle border with neutral background, gentle rounded corners
- **Selected:** Forest Heart Green border with Verdant Mist background fill and green checkmark indicator
- **Dark Mode Selected:** Neon Growth border with subtle green-tinted background

### Navigation (Bottom Tab Bar)

- **Style:** Clean bottom tab bar with icon + label for each section
- **Active State:** Forest Heart Green icon and label in light mode, Neon Growth in dark mode
- **Inactive State:** Stone Path Gray (#6B7280) icon and label
- **Background:** Pure Petal White (light) / Mossy Stone (#2A4A2C, dark) with top border separator

### Strain Type Badges

- **Shape:** Compact pill/chip with subtle background tint and matching text
- **Light:** Indica (soft green #E8F5E9), Sativa (warm yellow #FFFDE7), Hybrid (gentle lavender #F3E5F5)
- **Dark:** Indica (rich violet #7B2CBF), Sativa (warm amber #FFB74D), Hybrid (calm azure #64B5F6)

## 5. Layout Principles

### Grid & Structure

- **Target Device:** Mobile-first (390pt width), all screens designed at 780px (2x)
- **Content Width:** Full-width with comfortable horizontal padding (16–20px per side)
- **Card Grid:** Single column scrolling feed; cards stack vertically with 12–16px gap
- **Section Organization:** Content grouped into clearly labeled sections with generous header spacing

### Whitespace Strategy (Critical to the Design)

- **Base Unit:** 8px micro-spacing, 16px component spacing
- **Between Cards:** 12–16px vertical gap — tight enough for visual cohesion, loose enough for thumb comfort
- **Section Margins:** 24–32px between major sections creating clear content zones
- **Edge Padding:** 16–20px horizontal padding for comfortable framing on all screen sizes
- **Status Bar Clearance:** Generous top safe-area padding to avoid system UI overlap

### Content Hierarchy

- **Dashboard Pattern:** Greeting + key stat hero → today's tasks → plant cards → secondary metrics
- **Detail Pattern:** Hero image/stat → descriptive content → supporting data sections → action buttons anchored at bottom
- **Wizard Pattern:** Progress indicator → question/prompt → selection cards → forward navigation button

### Responsive Behavior & Touch

- **Touch Targets:** Minimum 44×44px for all interactive elements — buttons, task rows, and selection cards are all generously sized
- **Scroll Behavior:** Smooth vertical scrolling with momentum; no horizontal scroll on main content
- **Safe Areas:** Full respect for iOS/Android system bars and notches via safe-area-context insets

## 6. Design System Notes for Stitch Generation

When creating new screens for this project using Stitch, reference these specific instructions:

### Language to Use

- **Atmosphere:** "Lush botanical wellness sanctuary with calm productivity and earthy modernism"
- **Button Shapes:** "Comfortably rounded corners" (8px radius)
- **Card Shapes:** "Comfortably rounded corners with gentle lift"
- **Shadows:** "Whisper-soft diffused shadows" or "Flat with subtle elevation on interaction"
- **Spacing:** "Generous breathing room with clear section zones"
- **Typography:** "Space Grotesk with confident, technically grounded personality"

### Color References

Always use the descriptive names with hex codes:

- Brand CTA: "Forest Heart Green (#2E7D32)"
- App Background: "Morning Dew Green (#F1F8E9)"
- Card Surface: "Pure Petal White (#FFFFFF)"
- Primary Text: "Rich Soil Black (#1A1A1A)"
- Secondary Text: "Stone Path Gray (#6B7280)"
- Dark Background: "Midnight Canopy (#1B2E1C)"
- Dark CTA: "Neon Growth (#00FF88)"
- Dark Card: "Mossy Stone (#2A4A2C)"

### Component Prompts

- "Create a task card with comfortably rounded corners (8px), Pure Petal White background, and Forest Heart Green left accent indicator"
- "Design a primary action button in Forest Heart Green (#2E7D32) with comfortably rounded corners and generous thumb-friendly padding"
- "Add a bottom navigation bar with Forest Heart Green active states on a Pure Petal White background"
- "Build a metric display card with subtle green icon background, Rich Soil Black headline number, and Stone Path Gray supporting label"
- "Design a selection card grid for onboarding with Verdant Mist fill and Forest Heart Green border on selected state"

### Incremental Iteration

When refining existing screens:

1. Focus on ONE component at a time (e.g., "Refine the task list cards")
2. Be specific about what to change (e.g., "Increase internal card padding and soften the border to Whisper Gray")
3. Reference this design system language consistently
4. Always specify both light and dark mode treatments when relevant
