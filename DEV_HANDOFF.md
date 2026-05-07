# Match Hub — Dev Handoff

**Live prototype:** https://genomelink-match-hub.vercel.app
**Help page:** https://genomelink-match-hub.vercel.app/match-hub/help
**Repo:** https://github.com/govladgo/genomelink-match-hub
**Vercel project:** `genomelink-match-hub`

---

## What it does

A **cross-vendor DNA-match deduplication tool** for 5 vendors (23andMe, Ancestry, FTDNA, MyHeritage, GEDmatch). The same biological match often appears on 2–3 vendors with slightly different cM and segment data. Match Hub detects those duplicates so the user knows which records describe the same person.

The app is two pages:

- **`/`** — DNA Matches PRO **tools selector**: a 6-card grid (Network Graph, Clusters, **Match Hub** — only working card —, Common Ancestor cM, DNA Painter, Family Tree). The 5 non-Match-Hub cards are visual placeholders for the broader DNA Matches PRO surface.
- **`/match-hub`** — the actual hub. Top row shows the active demo user (name + population + synthesized kit id) with a `UserSwitcher` dropdown to preview 10 demo profiles, plus 4 stat cards (`Total entries`, `Vendors`, `Duplicates`, `Merged`). Below that, two tabs:
  - **Duplicates** — every group with at least one undecided sibling. The work-to-do.
  - **Assessed** — groups where every sibling has been resolved (merged or dismissed). Each row has an `Undo` button.

Each duplicate group renders as a card. Header is **cM-led**: `~XX.X cM · N candidates`, subtitle `N vendors`, right side shows confidence % + chevron-down to collapse. Inside the card, each member is a row with a 32-px avatar, name, vendor pill (white bg + brand-color text), status pill (`Primary` / `Merged` / `Not a duplicate`), and the `Dismiss` / `Merge` action pair (or `Undo` once decided). The primary record is picked automatically as the canonical one to keep — see "Primary selection" below.

When members of a group spell the name differently across vendors, an orange `NAME VARIES` badge appears next to the cM title to surface the divergence. Names never participate in grouping — they're context only.

A help page at `/match-hub/help` covers the algorithm, confidence levels, glossary, and the demo-data caveats.

---

## Architecture

**Stack:**
- Next.js 14.2.35 App Router (no API routes — all client-side)
- React 18, TypeScript 5
- Tailwind 3.4.1 is installed but **mostly unused** — inline styles + Genomelink CSS custom properties (`var(--gl-color-*)`, `var(--gl-font)`) are the convention
- ES5 target — **no `for...of` on iterators, no regex `s` flag**
- SF Pro Text typography throughout (Figma DNA-Match-Tools)

**Data flow:**

```
public/data/index.json                    ← list of 10 demo users (~10 KB)
public/data/user-{1..10}.json             ← per-user dataset (~1 MB each, ~1,737 matches)
       │
       │ fetch on mount + on user-switch
       ▼
data/adapters/realData.ts                 ← loadUserIndex(), loadUserDataset(userId)
       │
       ▼
app/match-hub/page.tsx                    ← UI state (active user, active tab)
       │
       ▼
hooks/useDeduplication.ts                 ← runs dedup engine in useMemo, manages
                                            per-record merged/rejected match-ID sets
       │
       ▼
utils/dedupEngine.ts                      ← pure-function dedup engine
```

URL state: the active user is stored in `?user=user-N` so reloads and shares preserve the demo context.

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `app/page.tsx` | Tools selector — 6-card grid; only Match Hub navigates |
| `/match-hub` | `app/match-hub/page.tsx` | The hub. Stats + Duplicates/Assessed tabs |
| `/match-hub/help` | `app/match-hub/help/page.tsx` | How-it-works docs page |
| `/match-hub/migrate` | `app/match-hub/migrate/page.tsx` | **Disabled** — returns 404. Original 23andMe-migration wizard preserved as a `/* */` comment block for re-enable |

---

## Dedup algorithm (`utils/dedupEngine.ts`)

**Grouping signals (cM-bucketed):**

| Signal | Role | Computation |
|--------|------|-------------|
| cM bracket | Bucket key (binary) | Both records' shared cM within ±5% AND both ≥ 30 cM |
| Segment overlap | Confidence | `totalOverlapBp / min(totalA, totalB)` summed across chromosomes |
| Name similarity | Display only — not in confidence math | Token-aware Levenshtein, surfaces a "Name varies" badge when spellings diverge |

Confidence = average pair segment overlap across the group (0–1).

**Tunable thresholds** (constants exported from `dedupEngine.ts`):

```
MIN_CM_FOR_DEDUP             = 30     // skip pairs below — too noisy
CM_TOLERANCE                 = 0.05   // ±5% bucket width
SEGMENT_OVERLAP_THRESHOLD    = 0.7    // floor for "is this pair a candidate?"
HIGH_CONFIDENCE_THRESHOLD    = 0.9    // "high confidence" classification
```

**Critical correctness rule — segments are required.** Without segment data on both sides, a pair cannot auto-group (`segmentSimilarity` returns 0). Records that appear on multiple vendors but only have segments on one vendor will show as separate inbox entries. Production v2 should add a "Likely candidates" surface for cM-only pairs needing manual user review.

**How false-positive chains are prevented:** the original cM-bucketing engine produced false-positive groups by chaining 4–7 unrelated people whose pairwise overlaps individually passed a 0.3 threshold (A↔B at 0.4, B↔C at 0.5 → A, B, C grouped via union-find). Calibrated against the demo dataset, real cross-vendor duplicates score 0.8–0.99 (same person, slightly perturbed segment positions) while unrelated chains score 0.3–0.62. Setting `SEGMENT_OVERLAP_THRESHOLD = 0.7` cleanly separates them.

**Algorithm:**

```
findDuplicateGroups(matches):
  1. Filter to matches with sharedCM >= MIN_CM_FOR_DEDUP   (≥ 30)
  2. Sort by sharedCM ascending                            (O(n log n))
  3. Sliding-window pair scoring:
     for each match A:
       walk forward through B until B.sharedCM > A.sharedCM × 1.05
       skip same-vendor pairs
       skip pairs without segments on either side
       overlap = segmentSimilarity(A.segments, B.segments)
       if overlap >= SEGMENT_OVERLAP_THRESHOLD: record pair
  4. Union-find groups across all qualifying pairs
  5. Group confidence = average pair overlap
  6. Pick a primary record per group (see below)
  7. Sort groups by confidence DESC
```

**Performance:** sort is O(n log n) ≈ 14K ops for 1,737 matches; the sliding window is O(n × avg_window) where the window is small at most cM values (2–30 candidates per anchor). Total: well under 100 ms per user.

### Primary selection (within each group)

The first record in `group.matchIds[0]` is the **primary** — the row tagged `Primary` in the UI and the only row without action buttons. Siblings get merged into the primary.

The engine picks the primary as the canonical record to keep, in this order:

1. **Highest `sharedCM`** — most reported DNA wins.
2. **Most segments** — richest segment data (which is what drives confidence).
3. **Vendor preference** when cM and segments tie:
   `FTDNA → MyHeritage → GEDmatch → 23andMe → Ancestry → manual/other`.
   Vendors that ship full segment data rank higher; Ancestry comes last because it doesn't expose segments.
4. **Lowest id** — deterministic final fallback.

Siblings are then sorted by id so the rest of the group is stable across renders.

---

## Per-record decision state machine (`hooks/useDeduplication.ts`)

Decisions are tracked **per non-primary sibling**, not per group. This lets a 3-record group land in a mixed state (one merged, another still pending) without forcing the user to resolve everything at once.

State transitions (one record):

```
                   ┌──── mergeMatch(id) ────┐
                   ▼                         │
   pending  ──────►  merged   ◄──────────────┤
       │       ┌──── undo ────┐              │
       │       ▼              │              │
       └──► rejected ─────────┘ ◄──── rejectMatch(id)
                              undo
```

- `pending` — engine flagged this sibling but the user hasn't decided.
- `merged` — user confirmed it's the same person as the primary. Row turns green.
- `rejected` — user marked "Not a duplicate". Row dims, name strikes through.
- `primary` — pseudo-state for the anchor record (returned by `matchDecisionState` for convenience).

Group classification (derived):

- A group is **pending** if at least one sibling is still in `pending` state → shows in the **Duplicates** tab.
- A group is **assessed** when every sibling has a decision (merged or rejected) → shows in the **Assessed** tab.

`reset()` clears every decision and moves all groups back to Duplicates.

The bulk action `mergeAllHighConfidence()` exists in the hook but the UI doesn't currently surface a button for it (the previous "Detected duplicates" banner was removed per Figma 12292:21156). Easy to re-expose if needed.

---

## Demo data

The 10 demo users are derived from a real DNA-pair dataset (~254,000 pairs with segment-level data and computed kinship labels) at `/Users/vlad/Downloads/Claude projects/DNAMatch tools/dna_match_pairs_encrypted.pickle`. The pickle has:

- `shared_cm` (Decimal)
- `matched_segments[]` — chromosome, start_pos, end_pos, cM, snps, IBD type, reliability
- `primary_kinship` — pre-computed relationship label (parent / sibling / 2nd cousin / 6th cousin once removed / etc.)
- **No user IDs** (`user_1`/`user_2` are null — stripped before encryption)

Because the pickle has no user attribution, we synthesize 10 anchor users via stratified sampling (~1,737 matches each, weighted toward closer kinship):

| Bucket | Count per user |
|--------|---------------:|
| Close (parent / sibling / aunt) | 4 |
| First-cousin range | 8 |
| Mid (3rd–4th cousin) | 60 |
| Distant (5th cousin) | 200 |
| Very distant (6th cousin range) | ~1,450 |

**What's real:** cM, segment positions, kinship labels.
**What's synthesized (deterministically per user_id hash):** display names, primary + secondary ancestry profiles, surname pools, vendor assignments.

**Cross-vendor duplicate injection:** ~12% of an anchor's matches get replicated across 2–3 vendors with ±5% cM and ±200kb segment perturbation, so the dedup engine has something to find. Without this, the demo would be all singletons. The injection is deterministic per anchor + match-ID seed.

**Pipeline:** `../scripts/preprocess_pickle.py` reads the pickle, stratifies, synthesizes, injects duplicates, and writes one JSON per user. Runs once; output is committed to `public/data/`. `../scripts/synthesize.py` is the deterministic name/ancestry/vendor generator.

---

## Key files

| File | Role |
|------|------|
| `app/page.tsx` | Tools selector. Title + List/Tools sub-pill, 6-card grid. Inline lucide-style SVG icons for each card. |
| `app/match-hub/page.tsx` | Main route. Loads index + active user dataset, runs dedup via the hook, renders top row (identity + stats), section row (h3 + tab pill), and group list. |
| `app/match-hub/help/page.tsx` | Help/docs page. Single white card on F9FCFF page bg; sections + table + glossary + CTA. Uses the shared `MatchHubSubHeader` with `backLabel="Back to hub"`. |
| `app/match-hub/migrate/page.tsx` | **Disabled.** Returns 404. Original migration wizard preserved as a comment block. |
| `app/layout.tsx` | Root layout. Loads global CSS + sets the SF Pro font stack. |
| `app/globals.css` | Genomelink CSS variables (colors, shadows), vendor pill rules, mobile responsive overrides for the duplicate group card. |
| `data/adapters/realData.ts` | `loadUserIndex()`, `loadUserDataset(userId)`, URL state helpers. In-memory caches. |
| `data/types.ts` | `DNAMatch`, `Segment`, `AncestryComponent`, `CrossVendorLink` interfaces. |
| `data/mock/matches.ts` | Phase-1 mock dataset (15 hand-crafted matches). Used only by the disabled `/match-hub/migrate` restore block. |
| `utils/dedupEngine.ts` | Pure-function dedup core. Public exports: `findDuplicateGroups()`, `scorePair()`, `nameSimilarity()`, `cmSimilarity()`, `segmentSimilarity()`, `MIN_CM_FOR_DEDUP`, `CM_TOLERANCE`, `SEGMENT_OVERLAP_THRESHOLD`, `HIGH_CONFIDENCE_THRESHOLD`. |
| `hooks/useDeduplication.ts` | Per-record state machine. Public API: `groups`, `mergedMatchIds`, `rejectedMatchIds`, `mergedAwayMatchIds` (alias), `pendingGroups`, `assessedGroups`, `highConfidenceCount` (sibling count, not group count), `matchDecisionState(id) → 'pending' \| 'merged' \| 'rejected' \| 'primary'`, `mergeMatch(id)`, `rejectMatch(id)`, `undoDecision(id)`, `mergeAllHighConfidence()`, `reset()`. |
| `components/UserSwitcher.tsx` | Identity dropdown with click-outside handling. |
| `components/layout/GenomelinkHeader.tsx` | Visual-only top nav. Uses production logo SVGs from `public/brand/`. Mobile (≤600 px) hides the wordmark. |
| `components/layout/MatchHubSubHeader.tsx` | Back-to-tools / title / right-link row. Configurable via `backHref`, `backLabel`, `rightHref`, `rightLabel` props so the help page reuses it with `backLabel="Back to hub"`. |
| `components/tools/ToolCard.tsx` | Tool selector card. Default + ComingSoon variants. |
| `components/hub/DuplicateGroupCard.tsx` | Single duplicate group. Header (cM-led title, vendor count, confidence, chevron). Member rows with avatar + name + vendor pill + status pill + actions (`Dismiss`/`Merge` while pending, `Undo` after a decision). Internal `MemberRow` and `StatusPill` subcomponents. |
| `components/hub/VendorPill.tsx` | Vendor chip. `tinted` variant (top-of-card filter look) + `outlined` variant (in-row member look — white bg, gray border, brand-color text per Figma 12292:24219). |
| `public/brand/genomelink-x.svg` + `genomelink-wordmark.svg` | Production wordmark assets. |
| `public/data/index.json` + `user-*.json` | Preprocessed demo datasets. |

---

## Data shape (from `data/types.ts`)

```typescript
interface Segment {
  chromosome: number;       // 1–22, 23 = X, 24 = Y
  startBp: number;
  endBp: number;
  cM: number;
  snps: number;
  isTriangulated: boolean;  // reliability >= 4 in source
  clusterId?: number;       // not populated by this app
}

interface AncestryComponent {
  region: string;           // e.g. "Eastern European"
  percentage: number;       // 0–100
}

interface CrossVendorLink {
  linkedMatchIds: string[];
  confidence: number;       // 0–1
  basis: ('name' | 'cm' | 'segments')[];
}

interface DNAMatch {
  id: string;
  name: string;
  sharedCM: number;
  sharedPercentage: number; // sharedCM / 7082.58 * 100
  relationship: string;     // "3rd cousin", "Parent / Child", etc.
  source: '23andme' | 'myheritage' | 'ftdna' | 'gedmatch' | 'ancestry' | 'manual' | 'other';
  profileType: 'open' | 'limited';
  isNew: boolean;
  segments: Segment[];
  tags: string[];
  avatarColor: string;
  initials: string;
  birthYear?: string;
  location?: string;
  treeUrl?: string;
  lineage?: 'paternal' | 'maternal' | 'unassigned';
  sharedSurnames?: string[];
  ancestryComposition?: AncestryComponent[];
  endogamyScore?: number;
  sharedTraits?: number;
  dissimilarTraits?: number;
  crossVendorLink?: CrossVendorLink;
}
```

---

## Visual design — Figma references

The whole prototype is built against the **DNA-Match-Tools** Figma file. Each component header comments the Figma node ID it implements. Key nodes:

| Surface | Figma node |
|---------|------------|
| Tools selector — desktop | `12291:4738` |
| Tools selector — mobile | `12291:4764` |
| Match Hub — Duplicates tab | `12292:21156` |
| Match Hub — Assessed tab | `12292:27433` |
| Group card (post-avatar-removal) | `12327:2058` |
| Help page — desktop | `12307:2027` |
| Help page — mobile | `12308:2435` |
| Production header | `11364:6865` |
| Sub-header (Back / Title / Right link) | `12292:21249` + `12292:21254` + `12292:22163` |
| Vendor pill — outlined | `12292:24219` |
| Status pill — Primary / Merged / Not a duplicate | `12292:25673` / `12292:25744` / `3807:45820` |

When updating styles, **search for the node ID in source** to find the matching block.

---

## Performance

| Metric | Value |
|--------|-------|
| Initial JSON fetch (largest user) | ~1 MB gzipped, ~250 ms cold |
| Dedup engine (1,737 matches) | ~0.5–1 sec first run, < 50 ms when cached via `useMemo` keyed on user |
| User switch | Async fetch + dedup, ~1 sec total |
| Build first-load JS | ~87 KB shared + ~3–8 KB per route |

---

## Known limits (flagged for prod discussion)

1. **MyHeritage / low-segment-data vendors under-merge.** Records without segment positions can never auto-group because segment overlap is the confidence signal. Profiles that appear on multiple vendors but only have segments on one vendor will show as separate inbox entries. **Prod v2 should add a "Likely candidates" surface** that lists cM-bucketed candidates without segment data for manual user review.
2. **Pairs >5 % cM apart never group.** Same biological match across vendors with very different cM algorithms (e.g. 23andMe v3 vs Ancestry's reweighted estimates) can sit just outside ±5 %. v2 could add a "loose" tier (±10–15 %) requiring manual confirmation.
3. **Distant-cousin matches under 30 cM are skipped entirely.** Below this threshold, hundreds of unrelated matches share similar cM and false-positive chains overwhelm the signal. If users want to dedup these, a future "loose mode" toggle could lower the floor.
4. **23andMe Migration Assistant is mock-only.** Currently disabled. The 4-step wizard structure is preserved in code but the upload/parse logic is a stub.
5. **No real upload pipeline.** All data is preprocessed JSON. Production needs a CSV/ZIP ingestion endpoint that maps each vendor's export format to the `DNAMatch` shape.
6. **Synthesized fields aren't biologically realistic.** A 3rd cousin to a Polish anchor might be Sub-Saharan African (random per pair seed). Production data won't have this issue but demos sometimes look odd.
7. **No state persistence across sessions.** Per-record merged/rejected decisions reset on page reload. Production needs server-side `DedupSuggestion` rows persisting state across sessions.
8. **Performance ceiling at ~10K matches.** The cM sliding-window approach scales to ~10K easily. Beyond that, production should move dedup server-side as an async job.
9. **Bulk merge button is hidden.** The Figma redesign dropped the "Merge X high-confidence" banner. The hook still exposes `mergeAllHighConfidence()` if product wants it back — wire a button into `app/match-hub/page.tsx` and it works.

---

## Backend integration roadmap

When productionizing against the Django backend (`web-tier/app/dna_match/`):

**New models — note the per-record granularity.**

The frontend tracks decisions per non-primary sibling, not per group. Production should mirror that: one row per *suggestion edge* (primary ↔ sibling pair), each with its own user decision. A "group" is then a derived view of all edges anchored on the same primary record.

```python
class DedupGroup(models.Model):
    """One row per detected duplicate group. Created by the dedup engine,
       holds the engine-level confidence + basis. Doesn't store user decisions."""
    user = ForeignKey(User, on_delete=CASCADE)
    primary_match = ForeignKey(DNAMatchResults, related_name='dedup_groups_as_primary')
    confidence = FloatField()
    basis = ArrayField(CharField(max_length=20))   # ['cm', 'segments']
    created_at = DateTimeField(auto_now_add=True)

class DedupSuggestion(models.Model):
    """One row per non-primary sibling. Each carries its own user decision."""
    group = ForeignKey(DedupGroup, on_delete=CASCADE, related_name='suggestions')
    sibling_match = ForeignKey(DNAMatchResults, related_name='dedup_suggestions')
    pair_confidence = FloatField()                 # this sibling's score vs the primary
    state = CharField(max_length=10, choices=[
        ('pending',  'Pending'),
        ('merged',   'Merged'),
        ('rejected', 'Rejected'),
    ], default='pending')
    decided_at = DateTimeField(null=True)
    class Meta:
        unique_together = [('group', 'sibling_match')]
```

This shape supports the mixed-state UX: one group can have one merged sibling and another rejected without conflict.

**New endpoints:**

```
POST /api/dedup/scan/?user_id=X            → triggers async dedup job, returns job_id (cache 24h)
GET  /api/dedup/jobs/{id}/                 → poll for groups + suggestions
POST /api/dedup/suggestions/{id}/merge/    → set state='merged', stamp decided_at
POST /api/dedup/suggestions/{id}/reject/   → set state='rejected', stamp decided_at
POST /api/dedup/suggestions/{id}/undo/     → set state='pending', clear decided_at
POST /api/dedup/bulk-merge/                → body: {min_confidence: 0.9}; merges all
                                              still-pending suggestions ≥ threshold
POST /api/dedup/reset/?user_id=X           → clears all user decisions (suggestions back to pending)
```

**Primary selection in production.** Mirror the frontend ranking: highest `sharedCM` → most segments → vendor preference (`FTDNA > MyHeritage > GEDmatch > 23andMe > Ancestry`) → lowest `id`. Recompute on every dedup run; persisted as `DedupGroup.primary_match`.

**Data shape conversion.**
The current TypeScript `DNAMatch` interface is the canonical wire shape. Production should:
- Build a Django serializer that emits exactly this shape from `DNAMatchResults` + relationships
- Publish the schema as OpenAPI / a shared TS package (`@genomelink/dna-match-types`) to avoid the current copy-paste pattern across 9 apps

**Caching.**
- Recompute trigger: new vendor upload, OR `MAX(DNAMatchResults.updated_at) > last_dedup_at`
- Cache TTL: 24 h (dedup is expensive; users won't notice slight staleness)
- Per-user worker: `dedup_for_user.delay(user_id)` async via existing worker tier

**Job flow:**

1. User uploads new vendor data → `dedup_for_user.delay(user_id)` enqueued
2. Worker scans matches via the cM sliding-window algorithm; runs union-find to assemble groups; picks primary per the ranking above
3. Persists `DedupGroup` rows + `DedupSuggestion` rows (one per non-primary sibling, `state='pending'`)
4. Frontend polls `/api/dedup/jobs/{id}/` for completion
5. User reviews each sibling → POST to `suggestions/{id}/merge/` or `/reject/` flips its `state`
6. Sibling rows with `state='merged'` are filtered out of the unified inbox query

---

## Local development

```bash
cd genomelink-match-hub
npm install
npm run dev          # → http://localhost:3000
npm run lint         # → ESLint + Next plugin
npm run build        # → production build
```

**Deploy:** `vercel --prod --yes` from the project directory. Vercel project is already linked (see `.vercel/project.json`).

**No env vars required.** Everything is static / client-side.

---

## Things to discuss with the dev team

1. **Where does the dedup job run?** Sync API call? Async via existing worker tier? What's the current pattern for long-running per-user batch work in the Django app?
2. **Real upload pipeline for the 23andMe Migration flow.** The TTAM closure already happened (Jan 2026); is migration capture still relevant? If so, what's the expected file format we should parse?
3. **Phonetic / transliteration handling — now obsolete.** v2 dropped name as a grouping signal entirely (segments + cM bracket are the only criteria). Cyrillic-romanisation and other name-divergence cases are no longer blockers — the engine groups them correctly via segments. The "Name varies" badge surfaces the divergence as context. Worth keeping `nameSimilarity()` for the badge or remove entirely?
4. **Cross-app shared user state.** Currently each app has its own `?user=` query param — switching apps loses context. Should there be a session-cookie that propagates across `*.vercel.app` subdomains and the production Django frontend?
5. **`CrossVendorLink` field on `DNAMatchResults`.** Add it as a foreign key on the existing model, or keep the link in a separate table (current proposal)?
6. **Dedup engine portability.** The TypeScript implementation is pure-functional and ports cleanly to Python — want it mirrored in `app/dna_match/services/dedup.py`?
7. **Real surnames + ancestry composition.** The pickle dataset has neither. Is there a separate Genomelink data source we can join on, or keep these synthesized for the demo and only enable surname-based features once production data is available?
8. **Performance budget.** What's the realistic max match count for a single user in production? If it's ≥10K, the cM sliding-window approach holds; beyond that the dedup needs to move server-side as an async job.

---

## Recent change log (May 2026)

- **2026-05-08** Primary selection is now picked by record quality (highest cM → most segments → vendor preference → id fallback) instead of arbitrary id order. Help page docs updated to match.
- **2026-05-08** Group card header simplified per Figma 12327:2058 — removed the 48 px avatar; subtitle is now `N vendors` instead of `N vendors · matched on cM + segments`. Grouping basis stays in the row's `title` tooltip.
- **2026-05-07** Help page rewritten — drops Unified Inbox / bulk-merge references, adds Duplicates+Assessed tab coverage, proper Figma styling (callouts, table, CTA button).
- **2026-05-07** Mobile responsive pass — header collapses to logo-only at ≤600 px, subheader stacks Back/Right on row 1 + title on row 2, stats becomes 2×2 grid, group-card member rows wrap action buttons to a new row.
- **2026-05-07** Genomelink wordmark + colorful X mark adopted from production Figma assets (`public/brand/`).
- **2026-05-06** Title row in group card became cM-led (`~XX cM · N candidates`) regardless of name agreement. Names now appear only in member rows.
- **2026-05-06** Dedup engine switched from name-bucketed grouping to cM-bucketed (±5 %) + segment overlap (≥0.7). Names are no longer in the confidence math.
- **2026-05-06** Routing restructure: tools selector at `/`, hub at `/match-hub`, help at `/match-hub/help`. Drops the Unified Inbox tab; adds Assessed tab.
