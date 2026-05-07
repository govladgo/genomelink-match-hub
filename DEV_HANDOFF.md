# Match Hub — Dev Handoff

**Live prototype:** https://genomelink-match-hub.vercel.app
**Help page:** https://genomelink-match-hub.vercel.app/help
**Repo:** https://github.com/govladgo/genomelink-match-hub
**Vercel project:** `genomelink-match-hub` (org `team_y8a7U6xWwk5oWePbjjxOW46n`)

---

## What it does

A **unified, deduplicated DNA-match inbox across 5 vendors** (23andMe, Ancestry, FTDNA, MyHeritage, GEDmatch). The same biological match often appears on 2–3 vendors with slightly different cM and segment data. Match Hub detects those duplicates so the effective inbox is the count of distinct people, not the count of records across all vendors.

Two tabs:
- **Unified Inbox** — every match from every vendor in one list, with vendor-color-coded chips and a vendor filter bar. Sibling records that the user merges into a primary collapse out of the inbox; the primary stays visible.
- **Duplicates** — auto-detected cross-vendor groups grouped by **shared cM bracket** (±5%) and confirmed by **segment overlap** (≥ 70%). Names are not used for grouping — they're computed and shown for context (with a "Name varies" badge when spellings diverge across vendors), but the engine never gates on name. Each non-primary sibling has its own per-record decision: `Merge` (confirm same person) or `Not a duplicate`. Mixed-state groups are supported. Bulk action: `Merge all high-confidence` accepts every still-pending sibling across groups whose confidence is ≥ 0.9.

A header user-switcher lets you preview 10 demo users with different network shapes (e.g. Ashkenazi-heavy vs. East Asian vs. British/Irish).

The **23andMe Migration Assistant** was previously at `/migrate` but is currently hidden from the frontend (route returns 404, code preserved as a `/* */` block in `app/migrate/page.tsx` for easy re-enable).

**Visual design (Figma DNA-Match-Tools):** The tab switcher (nodes 11842:24304 / 11842:24403), stats bar (11842:23945 / 11842:23955), vendor filter chips (12177:8870–72 / 12183:12392–94), and in-row vendor pills all follow the published Figma tokens. Each Figma node ID is referenced in the source where the relevant style block lives (search for `Figma node`).

---

## Architecture

**Stack:**
- Next.js 14.2.35 App Router (no API routes — pure client-side)
- React 18, TypeScript 5, Tailwind 3.4.1 (`tw-` prefix, mostly unused; inline styles + GL design tokens preferred)
- ES5 target — **no `for...of` on iterators, no regex `s` flag**

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
app/page.tsx                              ← UI state (active user, tab, filters)
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

## Dedup algorithm (`utils/dedupEngine.ts`)

**Grouping signals (v2 — cM-bucketed):**

| Signal | Role | Computation |
|--------|------|-------------|
| cM bracket | Bucket key (binary) | Both records' shared cM within ±5% AND both ≥ 30 cM |
| Segment overlap | Confidence | `totalOverlapBp / min(totalA, totalB)` summed across chromosomes |
| Name similarity | Display only — not in confidence | Token-aware Levenshtein, surfaces a "Name varies" badge when spellings diverge |

Confidence = segment overlap (0–1).

**Tunable thresholds (constants exported from `dedupEngine.ts`):**
```
MIN_CM_FOR_DEDUP             = 30     // skip pairs below — too noisy
CM_TOLERANCE                 = 0.05   // ±5% bucket width
SEGMENT_OVERLAP_THRESHOLD    = 0.7    // floor for "is this pair a candidate?"
HIGH_CONFIDENCE_THRESHOLD    = 0.9    // floor for "Merge all high-confidence" bulk action
```

**Critical correctness rule — segments are required.** Without segment data on both sides, a pair cannot auto-merge (`segmentSimilarity` returns 0). MyHeritage profiles often hide segment positions — those records appear in the inbox as singletons even when they describe the same person as another vendor's record. v2 should add a "Likely candidates" surface for cM-only pairs needing manual review.

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
  6. Sort groups by confidence DESC
```

**Performance:** sort is O(n log n) ≈ 14K ops for 1,737 matches; sliding window is O(n × avg_window) where the window is small at most cM values (2–30 candidates per anchor). Total: well under 100ms per user.

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
| Close (parent/sibling/aunt/etc.) | 4 |
| First-cousin range | 8 |
| Mid (3rd–4th cousin) | 60 |
| Distant (5th cousin) | 200 |
| Very distant (6th cousin range) | ~1,450 |

**What's real:** cM, segment positions, kinship labels.
**What's synthesized (deterministically per user_id hash):** display names, primary + secondary ancestry profiles, surname pools, vendor assignments.

**Cross-vendor duplicates injection:** ~12% of an anchor's matches get replicated across 2–3 vendors with ±5% cM and ±200kb segment perturbation, so the dedup engine has something to find. Without this, the demo would be all singletons. The injection is deterministic per anchor + match ID seed.

**Pipeline:** `scripts/preprocess_pickle.py` (root of project) reads the pickle, stratifies, synthesizes, injects duplicates, writes one JSON per user. Runs once; output committed to `public/data/`. `scripts/synthesize.py` is the deterministic name/ancestry/vendor generator used by it.

---

## Key files

| File | Role |
|------|------|
| `app/page.tsx` | Main route, ~430 lines. Header (logo + How-to-use + UserSwitcher + BETA), stats bar, tab switcher (Inbox/Duplicates), VendorFilterBar, list rendering, DuplicateGroupCard list, bulk actions, footer disclaimer |
| `app/help/page.tsx` | Help/docs page (`/help`), ~530 lines. Mirrors DNA Painter v2 help layout |
| `app/migrate/page.tsx` | **Disabled.** Returns `notFound()` (404). Original migration wizard preserved as a `/* */` comment block for easy re-enable. See top of file for restoration instructions |
| `data/adapters/realData.ts` | `loadUserIndex()`, `loadUserDataset(userId)`, URL state helpers. In-memory caches |
| `data/types.ts` | `DNAMatch` interface (id, name, sharedCM, sharedPercentage, relationship, source, segments, ancestryComposition, sharedSurnames, etc.), `Segment`, `AncestryComponent`, `CrossVendorLink` |
| `data/mock/matches.ts` | Phase-1 mock dataset (15 hand-crafted matches). Still used by the disabled `/migrate` route. Real data lives in `public/data/*.json` |
| `utils/dedupEngine.ts` | Pure-function dedup core. Public exports: `findDuplicateGroups()`, `scorePair()`, `nameSimilarity()`, `cmSimilarity()`, `segmentSimilarity()`, `SUGGEST_THRESHOLD` (0.7), `HIGH_CONFIDENCE_THRESHOLD` (0.9) |
| `hooks/useDeduplication.ts` | Per-record state machine. Public API: `mergedMatchIds`, `rejectedMatchIds`, `mergedAwayMatchIds` (alias of merged), `pendingGroups`, `highConfidenceCount` (sibling count, not group count), `matchDecisionState(id)` → `'pending' \| 'merged' \| 'rejected' \| 'primary'`, `mergeMatch(id)`, `rejectMatch(id)`, `undoDecision(id)`, `mergeAllHighConfidence()`, `reset()` |
| `components/UserSwitcher.tsx` | Header dropdown, click-outside handling, active highlight |
| `components/hub/UnifiedInbox.tsx` | Inbox list rendering |
| `components/hub/MatchRow.tsx` | Single match row (avatar, name, vendor pill, lineage badge, cM/segments) |
| `components/hub/DuplicateGroupCard.tsx` | Single duplicate group. Header (avatar, group label, confidence pct, expand chevron, "Resolved" pill when fully decided). Member rows: primary at top with `Primary` tag and no buttons; each sibling row has inline `[Merge]` `[Not a duplicate]` actions until decided, then a status pill + Undo link. Internal `MemberRow` and `DecisionStatusPill` subcomponents |
| `components/hub/VendorPill.tsx` | Color-coded vendor chip |
| `components/hub/VendorFilterBar.tsx` | Vendor toggle chips with counts |

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
  kinship?: string;         // raw label from source pickle
  source: '23andme' | 'myheritage' | 'ftdna' | 'gedmatch' | 'ancestry' | 'manual' | 'other';
  profileType: 'open' | 'limited';
  isNew: boolean;
  segments: Segment[];
  tags: string[];
  avatarColor: string;
  initials: string;
  lineage?: 'paternal' | 'maternal' | 'unassigned';
  sharedSurnames?: string[];
  ancestryComposition?: AncestryComponent[];
  endogamyScore?: number;
  crossVendorLink?: CrossVendorLink;
}
```

---

## Performance

| Metric | Value |
|--------|-------|
| Initial JSON fetch (largest user) | ~1 MB gzipped, ~250 ms cold |
| Dedup engine (1,737 matches) | ~0.5–1 sec first run, < 50 ms when cached via `useMemo` keyed on user |
| User switch | Async fetch + dedup, ~1 sec total |
| Build size | First-load JS ~93 KB, route bundle ~6.3 KB |

---

## Known limits (flagged for prod discussion)

1. **MyHeritage / low-segment-data vendors under-merge.** Records without segment positions can never auto-group in v2 because segment overlap is the confidence signal. Profiles that appear on multiple vendors but only have segments on one vendor will show as separate inbox entries. **Prod v2 should add a "Likely candidates" surface** that lists cM-bucketed candidates without segment data for manual user review.
2. **Pairs >5% cM apart never group.** Same biological match across vendors with very different cM algorithms (e.g. 23andMe v3 vs Ancestry's reweighted estimates) can sit just outside ±5%. v2 could add a "loose" tier (±10–15%) requiring manual confirmation.
3. **Distant-cousin matches under 30 cM are skipped entirely.** Below this threshold, hundreds of unrelated matches share similar cM and the false-positive chains overwhelm the signal. If users want to dedup these, a future "loose mode" toggle could lower the floor.
4. **23andMe Migration Assistant is mock-only.** Currently disabled. The 4-step wizard structure is preserved in code but the upload/parse logic is a stub.
5. **No real upload pipeline.** All data is preprocessed JSON. Production needs a CSV/ZIP ingestion endpoint that maps each vendor's export format to the `DNAMatch` shape.
6. **Synthesized fields aren't biologically realistic.** A 3rd cousin to a Polish anchor might be Sub-Saharan African (random per pair seed). Production data won't have this issue but demos sometimes look odd. Possible v2: bias matched-user ancestry to share at least the anchor's primary population.
7. **No state persistence across sessions.** Per-record merged/rejected decisions reset on page reload. Production needs server-side `DedupSuggestion` rows persisting state across sessions.
8. **Performance ceiling at ~10K matches.** The cM sliding-window approach scales to ~10K easily. Beyond that, production should move dedup server-side as an async job.

---

## Backend integration roadmap

When productionizing against the Django backend (`web-tier/app/dna_match/`):

**New models — note the per-record granularity:**

The frontend tracks decisions per non-primary sibling, not per group. Production should mirror that: one row per *suggestion edge* (primary ↔ sibling pair), each with its own user decision. A "group" is then a derived view of all edges anchored on the same primary record.

```python
class DedupGroup(models.Model):
    """One row per detected duplicate group. Created by the dedup engine,
       holds the engine-level confidence + basis. Doesn't store user decisions."""
    user = ForeignKey(User, on_delete=CASCADE)
    primary_match = ForeignKey(DNAMatchResults, related_name='dedup_groups_as_primary')
    confidence = FloatField()
    basis = ArrayField(CharField(max_length=20))   # ['name', 'cm', 'segments']
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
GET  /api/inbox/?user_id=X                 → unified inbox; hides DNAMatchResults that are
                                              the sibling_match of any merged DedupSuggestion
```

**Data shape conversion:**
The current TypeScript `DNAMatch` interface is the canonical wire shape. Production should:
- Build a Django serializer that emits exactly this shape from `DNAMatchResults` + relationships
- Publish the schema as OpenAPI / a shared TS package (`@genomelink/dna-match-types`) to avoid the current copy-paste pattern across 9 apps

**Caching:**
- Recompute trigger: new vendor upload, OR `MAX(DNAMatchResults.updated_at) > last_dedup_at`
- Cache TTL: 24h (dedup is expensive; users won't notice slight staleness)
- Per-user worker: `dedup_for_user.delay(user_id)` async via existing worker tier (no Celery — use the management-command pattern from `worker-tier/`)

**Job flow:**
1. User uploads new vendor data → `dedup_for_user.delay(user_id)` enqueued
2. Worker scans matches, computes pair scores within name buckets, runs union-find to assemble groups
3. Persists `DedupGroup` rows + `DedupSuggestion` rows (one per non-primary sibling, `state='pending'`)
4. Frontend polls `/api/dedup/jobs/{id}/` for completion
5. User reviews each sibling → POST to `suggestions/{id}/merge/` or `/reject/` flips its `state`
6. Sibling rows with `state='merged'` are filtered out of the unified inbox query

---

## Things to discuss with the dev team

1. **Where does the dedup job run?** Sync API call? Async via existing worker tier? What's the current pattern for long-running per-user batch work in the Django app?
2. **Real upload pipeline for the 23andMe Migration flow.** The TTAM closure already happened (Jan 2026); is migration capture still relevant? If so, what's the expected file format we should parse?
3. **Phonetic / transliteration handling — now obsolete?** v2 dropped name as a grouping signal entirely (segments + cM bracket are the only criteria). Cyrillic-romanisation and other name-divergence cases are no longer blockers — the engine groups them correctly via segments. The "Name varies" badge surfaces the divergence as context. Worth keeping name-similarity for the badge or remove `nameSimilarity()` entirely?
4. **Cross-app shared user state.** Currently each app has its own `?user=` query param — switching apps loses context. Should there be a session-cookie that propagates across `*.vercel.app` subdomains and the production Django frontend?
5. **`CrossVendorLink` field on `DNAMatchResults`.** Add it as a foreign key on the existing model, or keep the link in a separate table (current proposal)?
6. **Dedup engine portability.** The TypeScript implementation is pure-functional and ports cleanly to Python — want me to mirror it in `app/dna_match/services/dedup.py`?
7. **Real surnames + ancestry composition.** The pickle dataset has neither. Is there a separate Genomelink data source we can join on, or should we keep this synthesized for the demo and only enable surname-based features once production data is available?
8. **Performance budget.** What's the realistic max match count for a single user in production? If it's ≥10K, the bucketing optimization needs reinforcement (hash-LSH on names + parallel processing).
