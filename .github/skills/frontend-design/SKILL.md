---
name: frontend-design
description: Create distinctive, production-grade mobile UI with high design quality for React Native/Expo apps. Use this skill when the user asks to build screens, components, flows, or UI artifacts in an Expo Router + NativeWind stack. Generates creative, polished code and UI design that avoids generic AI aesthetics while respecting the repo's styling rules/tokens.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, screen, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Mobile Stack Constraints (Expo + NativeWind)

Obey the repo’s mobile rules and build within these constraints:

- **NativeWind**: keep `className` stable; Tailwind for static layout; Reanimated `style` for dynamic/motion.
- **Theming**: explicit Light/Dark pairs (`bg-white dark:bg-charcoal-900`); no CSS variables.
- **Tokens**: use Tailwind config colors/fonts; don’t invent new tokens; avoid hard-coded colors unless required for interpolation.
- **Components**: prefer `@/components/ui/*`; custom components must merge `className` via `cn` (tailwind-merge).
- **Motion**: Reanimated + Gesture Handler; respect Reduced Motion; no per-frame `scheduleOnRN`.
- **i18n**: no hard-coded user-visible strings; design for DE/EN lengths.
- **Mobile UX**: safe areas, 44×44 touch targets, avoid heavy overdraw/blur.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Use the fonts defined in the Tailwind config. Create character through hierarchy (size/weight/spacing), rhythm, and layout—not by adding new font families.
- **Color & Theme**: Commit to a cohesive palette with dominant neutrals + sharp accents. Use explicit Light/Dark utility pairs and project tokens (no CSS variables).
- **Motion**: Prioritize one or two high-impact moments (screen enter, key CTA micro-interaction). Use Reanimated for transforms/opacity/layout; don’t churn Tailwind classes per frame; honor Reduced Motion.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Don’t fight the repo’s tokens—differentiate via composition, color accents, motion, and texture that fits mobile performance constraints.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
