---
title: Use expo-image for Optimized Images
impact: HIGH
impactDescription: memory efficiency, caching, blurhash placeholders, progressive loading
tags: images, performance, expo-image, ui
---

## Use expo-image for Optimized Images

Use `expo-image` instead of React Native's `Image`. In this repo, always prefer the wrappers in `@/components/ui` so className, placeholders, and defaults stay consistent.

**Incorrect (React Native Image):**

```tsx
import { Image } from 'react-native';

function Avatar({ url }: { url: string }) {
  return <Image source={{ uri: url }} style={styles.avatar} />;
}
```

**Correct (app wrapper):**

```tsx
import { Image } from '@/components/ui';

function Avatar({ url }: { url: string }) {
  return <Image source={{ uri: url }} style={styles.avatar} />;
}
```

**With blurhash placeholder:**

```tsx
<Image
  source={{ uri: url }}
  placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
  contentFit="cover"
  transition={200}
  style={styles.image}
/>
```

**With priority and caching:**

```tsx
<Image
  source={{ uri: url }}
  priority="high"
  cachePolicy="memory-disk"
  style={styles.hero}
/>
```

**Key props:**

- `placeholder` — Blurhash or thumbnail while loading
- `contentFit` — `cover`, `contain`, `fill`, `scale-down`
- `transition` — Fade-in duration (ms)
- `priority` — `low`, `normal`, `high`
- `cachePolicy` — `memory`, `disk`, `memory-disk`, `none`
- `recyclingKey` — Unique key for list recycling

**Lists/feeds:**

- Use `OptimizedImage` from `@/components/ui` for remote images in lists/feeds.
- Or use feature helpers like `getListImageProps()` (strains) / `getCommunityImageProps()` (community) and set `transition={0}` for scroll performance.

For cross-platform (web + native), use `SolitoImage` from `solito/image` which uses `expo-image` under the hood.

Reference: [expo-image](https://docs.expo.dev/versions/latest/sdk/image/)
