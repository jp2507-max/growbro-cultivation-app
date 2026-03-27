# Screen Composition Recipe

Use this as the default blueprint for new screens to keep route files small and design iteration fast.

## Core building blocks

- `ScreenContainer` + `ScreenHeader`
- `AnimatedSection` for entrance transitions
- `AnimatedProgressBar` for step/progress state
- `SplitSummaryCard` for compact 2-column summaries
- `FormSectionCard` for form blocks (`title + icon + content`)
- `SelectionCard` for choice lists
- `Button`, `Title`, `Subtitle`, `Body`, `Caption`

## Recommended structure

1. **Screen frame**
   - `ScreenContainer` for background/insets
   - `KeyboardAvoidingView` + `ScrollView` where needed
2. **Hero/intro**
   - title/subtitle in a static block
3. **Summary block (optional)**
   - `SplitSummaryCard`
4. **Form/content sections**
   - wrap each section in `AnimatedSection`
   - use `FormSectionCard` for repeated section layout
5. **CTA area**
   - one primary `Button` and optional secondary action
6. **Feedback UI**
   - modal/toast extracted as reusable component if repeated in 2+ screens

## Animation rules

- Keep dynamic values in Reanimated `style`, not in `className`.
- Use motion tokens from `src/lib/animations/motion.ts`.
- Respect reduced motion with `rmTiming` / `withRM`.
- Avoid per-frame JS thread work; schedule side effects only at event boundaries.

## Styling rules

- Use tokenized light/dark class pairs.
- Keep class order consistent.
- Reuse existing UI primitives before adding new styles.

## Practical target

- Prefer route files under ~350 lines by pushing reusable UI into `src/components/ui/`.
- If a layout pattern appears in 2+ screens, extract it.
