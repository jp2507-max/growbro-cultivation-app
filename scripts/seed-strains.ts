/**
 * Seed script: Migrate ~1936 strains from Supabase strain_cache to InstantDB.
 *
 * Usage:
 *   INSTANT_APP_ADMIN_TOKEN=<token> bun run scripts/seed-strains.ts
 *
 * Requires:
 *   - EXPO_PUBLIC_INSTANT_APP_ID in .env (auto-loaded by bun)
 *   - INSTANT_APP_ADMIN_TOKEN env var (get from InstantDB dashboard → App → Admin tokens)
 *   - Supabase project must be active
 */

import { id as instantId, init } from '@instantdb/admin';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const INSTANT_APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN;

const SUPABASE_URL = 'https://mgbekkpswaizzthgefbc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYmVra3Bzd2Fpenp0aGdlZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjM0MjIsImV4cCI6MjA3MTY5OTQyMn0.xLyrORmBLCBDYnoJg5krYP3Qav4yDBUC1EGqtZ3tRFs';

if (!INSTANT_APP_ID) {
  console.error('Missing EXPO_PUBLIC_INSTANT_APP_ID in .env');
  process.exit(1);
}
if (!INSTANT_ADMIN_TOKEN) {
  console.error(
    'Missing INSTANT_APP_ADMIN_TOKEN env var.\n' +
      'Get it from: https://www.instantdb.com/dash → your app → Admin tokens'
  );
  process.exit(1);
}

const db = init({
  appId: INSTANT_APP_ID,
  adminToken: INSTANT_ADMIN_TOKEN,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SupabaseRow = {
  id: string;
  slug: string;
  name: string;
  race: string | null;
  data: Record<string, unknown>;
};

type NormalizedStrain = {
  name: string;
  slug: string;
  type: string;
  genetics: string;
  isAutoflower: boolean;
  thc: number | undefined;
  thcMin: number | undefined;
  thcMax: number | undefined;
  cbdDisplay: string;
  effects: string; // JSON array string
  flavors: string; // JSON array string
  difficulty: string;
  floweringTimeLabel: string;
  floweringWeeksMin: number | undefined;
  floweringWeeksMax: number | undefined;
  yieldIndoor: string;
  yieldOutdoor: string;
  heightIndoor: string;
  heightOutdoor: string;
  description: string;
  sourceUrl: string;
  trait: string;
  imageUrl: string;
  isAdminSeeded: true;
};

// ---------------------------------------------------------------------------
// Fetch from Supabase (paginated, 1000 per page)
// ---------------------------------------------------------------------------

async function fetchAllStrains(): Promise<SupabaseRow[]> {
  const allRows: SupabaseRow[] = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${SUPABASE_URL}/rest/v1/strain_cache?select=id,slug,name,race,data&order=name.asc&offset=${offset}&limit=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      throw new Error(
        `Supabase fetch failed: ${res.status} ${await res.text()}`
      );
    }
    const rows: SupabaseRow[] = await res.json();
    allRows.push(...rows);
    hasMore = rows.length === pageSize;
    offset += pageSize;
    console.log(`  Fetched ${allRows.length} rows so far...`);
  }

  return allRows;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function deriveType(race: string | null, genetics: string): string {
  // If race column is set, use it directly
  if (race) {
    const r = race.toLowerCase();
    if (r === 'indica') return 'Indica';
    if (r === 'sativa') return 'Sativa';
    if (r === 'hybrid') return 'Hybrid';
  }

  // Derive from genetics string
  const g = genetics.toLowerCase();

  // Pure indica/sativa (90-100%)
  if (g.includes('indica (90') || g.includes('indica (100')) return 'Indica';
  if (g.includes('sativa (90') || g.includes('sativa (100')) return 'Sativa';

  // Dominant
  if (g.includes('indica-dominant')) return 'Indica';
  if (g.includes('sativa-dominant')) return 'Sativa';

  // Balanced / hybrid markers
  if (
    g.includes('indica/sativa') ||
    g.includes('50/50') ||
    g.includes('hybrid')
  )
    return 'Hybrid';

  // Fallback based on percentage mentions
  if (g.includes('indica')) return 'Indica';
  if (g.includes('sativa')) return 'Sativa';

  return 'Hybrid';
}

function normalizeDifficulty(raw: string | undefined): string {
  if (!raw) return '';
  const d = raw.toLowerCase().trim();
  if (d === 'easy' || d === 'beginner') return 'Easy';
  if (d === 'medium' || d === 'intermediate') return 'Medium';
  if (d === 'difficult' || d === 'hard' || d === 'advanced') return 'Difficult';
  if (d === 'unknown') return '';
  return raw; // keep as-is if unexpected
}

function parseWeeks(label: string | undefined): { min?: number; max?: number } {
  if (!label) return {};
  const match = label.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return { min: Number(match[1]), max: Number(match[2]) };
  const single = label.match(/(\d+)/);
  if (single) return { min: Number(single[1]), max: Number(single[1]) };
  return {};
}

function getFirstEffect(effects: string[]): string {
  if (effects.length === 0) return '';
  return effects[0];
}

// ---------------------------------------------------------------------------
// Normalize a single Supabase row
// ---------------------------------------------------------------------------

function normalizeRow(row: SupabaseRow): NormalizedStrain {
  const d = row.data;

  // --- Genetics ---
  let genetics = '';
  if (typeof d.genetics === 'string') {
    // Older format: plain string like "Indica-dominant (80%)"
    genetics = d.genetics;
  } else if (d.genetics && typeof d.genetics === 'object') {
    // Newer format: {lineage: string, parents: []}
    genetics = (d.genetics as { lineage?: string }).lineage ?? '';
  }

  const isAutoflower = genetics.toLowerCase().includes('autoflower');

  // --- Type ---
  const type = deriveType(row.race, genetics);

  // --- THC ---
  let thcMin: number | undefined;
  let thcMax: number | undefined;
  if (d.thc && typeof d.thc === 'object') {
    // Newer format: {min, max}
    const thcObj = d.thc as { min?: number; max?: number };
    thcMin = thcObj.min;
    thcMax = thcObj.max;
  } else if (typeof d.THC === 'string') {
    // Older format: "High", "Medium", "Low", or specific like "20%"
    const numMatch = (d.THC as string).match(/(\d+)/);
    if (numMatch) {
      thcMax = Number(numMatch[1]);
      thcMin = thcMax;
    }
  }

  // --- CBD ---
  let cbdDisplay = '';
  if (d.cbd && typeof d.cbd === 'object') {
    cbdDisplay = (d.cbd as { label?: string }).label ?? 'Unknown';
  } else if (typeof d.CBD === 'string') {
    cbdDisplay = d.CBD as string;
  }

  // --- Effects ---
  let effects: string[] = [];
  if (Array.isArray(d.effects)) {
    // Newer: [{name: "Relaxed"}, ...]
    effects = (d.effects as { name: string }[]).map((e) => e.name);
  } else if (Array.isArray(d.effect)) {
    // Older: ["Cerebral", "Relaxed", ...]
    effects = d.effect as string[];
  }

  // --- Flavors ---
  let flavors: string[] = [];
  if (Array.isArray(d.flavors)) {
    // Newer: [{name: "Sweet"}, ...]
    flavors = (d.flavors as { name: string }[]).map((f) => f.name);
  } else if (Array.isArray(d.smellAndFlavour)) {
    // Older: ["Sweet", "Citrus", ...]
    flavors = d.smellAndFlavour as string[];
  }

  // --- Difficulty ---
  let difficultyRaw: string | undefined;
  if (d.grow && typeof d.grow === 'object') {
    difficultyRaw = (d.grow as { difficulty?: string }).difficulty;
  } else if (typeof d.growDifficulty === 'string') {
    difficultyRaw = d.growDifficulty as string;
  }
  const difficulty = normalizeDifficulty(difficultyRaw);

  // --- Flowering time ---
  let floweringTimeLabel = '';
  let floweringWeeksMin: number | undefined;
  let floweringWeeksMax: number | undefined;
  if (d.grow && typeof d.grow === 'object') {
    const grow = d.grow as {
      flowering_time?: {
        label?: string;
        min_weeks?: number;
        max_weeks?: number;
      };
    };
    floweringTimeLabel = grow.flowering_time?.label ?? '';
    floweringWeeksMin = grow.flowering_time?.min_weeks;
    floweringWeeksMax = grow.flowering_time?.max_weeks;
  } else if (typeof d.floweringTime === 'string') {
    floweringTimeLabel = d.floweringTime as string;
    const parsed = parseWeeks(floweringTimeLabel);
    floweringWeeksMin = parsed.min;
    floweringWeeksMax = parsed.max;
  }

  // --- Yield ---
  let yieldIndoor = '';
  let yieldOutdoor = '';
  if (d.grow && typeof d.grow === 'object') {
    const grow = d.grow as {
      yield?: { indoor?: { label?: string }; outdoor?: { label?: string } };
    };
    yieldIndoor = grow.yield?.indoor?.label ?? '';
    yieldOutdoor = grow.yield?.outdoor?.label ?? '';
  } else {
    yieldIndoor = (
      typeof d.yieldIndoor === 'string' ? d.yieldIndoor : ''
    ) as string;
    yieldOutdoor = (
      typeof d.yieldOutdoor === 'string' ? d.yieldOutdoor : ''
    ) as string;
  }

  // --- Height ---
  let heightIndoor = '';
  let heightOutdoor = '';
  if (d.grow && typeof d.grow === 'object') {
    heightIndoor =
      (d.grow as { height?: { label?: string } }).height?.label ?? '';
    heightOutdoor = heightIndoor; // newer format only has one label
  } else {
    heightIndoor = (
      typeof d.heightIndoor === 'string' ? d.heightIndoor : ''
    ) as string;
    heightOutdoor = (
      typeof d.heightOutdoor === 'string' ? d.heightOutdoor : ''
    ) as string;
  }

  // --- Description ---
  let description = '';
  if (Array.isArray(d.description)) {
    description = (d.description as string[]).join('\n\n');
  }

  // --- Source URL ---
  const sourceUrl = (typeof d.link === 'string' ? d.link : '') as string;

  // --- Image ---
  const imageUrl = (typeof d.imageUrl === 'string' ? d.imageUrl : '') as string;

  // --- Trait (first effect as quick label) ---
  const trait = getFirstEffect(effects);

  return {
    name: row.name,
    slug: row.slug,
    type,
    genetics,
    isAutoflower,
    thc: thcMax,
    thcMin,
    thcMax,
    cbdDisplay,
    effects: JSON.stringify(effects),
    flavors: JSON.stringify(flavors),
    difficulty,
    floweringTimeLabel,
    floweringWeeksMin,
    floweringWeeksMax,
    yieldIndoor,
    yieldOutdoor,
    heightIndoor,
    heightOutdoor,
    description,
    sourceUrl,
    trait,
    imageUrl,
    isAdminSeeded: true,
  };
}

// ---------------------------------------------------------------------------
// Batch insert into InstantDB
// ---------------------------------------------------------------------------

async function seedBatch(
  strains: NormalizedStrain[],
  batchIndex: number
): Promise<void> {
  const txs = strains.map((s) => {
    const strainId = instantId();
    // Build update object, omitting undefined values
    const update: Record<string, unknown> = {
      name: s.name,
      slug: s.slug,
      type: s.type,
      genetics: s.genetics,
      isAutoflower: s.isAutoflower,
      cbdDisplay: s.cbdDisplay,
      effects: s.effects,
      flavors: s.flavors,
      difficulty: s.difficulty,
      floweringTimeLabel: s.floweringTimeLabel,
      yieldIndoor: s.yieldIndoor,
      yieldOutdoor: s.yieldOutdoor,
      heightIndoor: s.heightIndoor,
      heightOutdoor: s.heightOutdoor,
      description: s.description,
      sourceUrl: s.sourceUrl,
      trait: s.trait,
      imageUrl: s.imageUrl,
      isAdminSeeded: true,
    };
    if (s.thc !== undefined) update.thc = s.thc;
    if (s.thcMin !== undefined) update.thcMin = s.thcMin;
    if (s.thcMax !== undefined) update.thcMax = s.thcMax;
    if (s.floweringWeeksMin !== undefined)
      update.floweringWeeksMin = s.floweringWeeksMin;
    if (s.floweringWeeksMax !== undefined)
      update.floweringWeeksMax = s.floweringWeeksMax;

    return db.tx.strains[strainId]!.update(update);
  });

  await db.transact(txs);
  console.log(`  Batch ${batchIndex + 1}: inserted ${strains.length} strains`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== Strain Seed Script ===\n');

  // 1. Fetch from Supabase
  console.log('1. Fetching strains from Supabase...');
  const rows = await fetchAllStrains();
  console.log(`   Total rows: ${rows.length}\n`);

  // 2. Normalize
  console.log('2. Normalizing data...');
  const normalized = rows.map(normalizeRow);

  // Quick stats
  const typeCount: Record<string, number> = {};
  for (const s of normalized) {
    typeCount[s.type] = (typeCount[s.type] ?? 0) + 1;
  }
  console.log('   Type distribution:', typeCount);
  console.log(`   With image: ${normalized.filter((s) => s.imageUrl).length}`);
  console.log(
    `   With effects: ${normalized.filter((s) => s.effects !== '[]').length}`
  );
  console.log(
    `   With difficulty: ${normalized.filter((s) => s.difficulty).length}\n`
  );

  // 3. Insert in batches
  console.log('3. Inserting into InstantDB...');
  const BATCH_SIZE = 50;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    await seedBatch(batch, Math.floor(i / BATCH_SIZE));
  }

  console.log(`\n✅ Done! Seeded ${normalized.length} strains into InstantDB.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
