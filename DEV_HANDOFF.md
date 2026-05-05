# Match Hub — Dev Handoff

**Live prototype:** https://genomelink-match-hub.vercel.app
**Help page:** https://genomelink-match-hub.vercel.app/help
**Repo:** https://github.com/govladgo/genomelink-match-hub
**Vercel project:** `genomelink-match-hub` (org `team_y8a7U6xWwk5oWePbjjxOW46n`)

---

## What it does

A **unified, deduplicated DNA-match inbox across 5 vendors** (23andMe, Ancestry, FTDNA, MyHeritage, GEDmatch). The same biological match often appears on 2–3 vendors with slightly different cM and segment data. Match Hub detects those duplicates so the effective inbox is the count of distinct people, not the count of records across all vendors.

Two tabs:
- **Unified Inbox** — every match from every vendor in one list, with vendor-color-coded chips and a vendor filter bar. Records merged into duplicate groups collapse to one primary entry; secondary records are hidden.
- **Duplicates** — auto-detected cross-vendor groups, each with confidence score and basis (name + cM + segments). Users review and merge/reject per group, or bulk-merge all high-confidence.

A header user-switcher lets you preview 10 demo users with different network shapes (e.g. Ashkenazi-heavy vs. East Asian vs. British/Irish).

The **23andMe Migration Assistant** was previously at `/migrate` but is currently hidden from the frontend (route returns 404, code preserved as a `/* */` block in `app/migrate/page.tsx` for easy re-enable).

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
                                            merged/rejected sets
       │
       ▼
utils/dedupEngine.ts                      ← pure-function dedup engine
```

URL state: the active user is stored in `?user=user-N` so reloads and shares preserve the demo context.

---

## Dedup algorithm (`utils/dedupEngine.ts`)

For every cross-vendor pair, three signals are computed and weighted:

| Signal | Weight | Computation |
|--------|-------:|-------------|
| Name similarity | **0.30** | Token-aware Levenshtein with last-name + first-initial logic (see `nameSimilarity()`) |
| cM bracket | **0.30** | Linear falloff: 1 − (\|cmA − cmB\| / avgCM) / 0.15. Same biology → ±5%; ±15% upper edge |
| Segment overlap | **0.40** | totalOverlapBp / min(totalA, totalB) summed across chromosomes |

Confidence = weighted sum, capped at 1.0.

**Critical correctness rule — name is a hard gate.** When `nameSim < 0.7`, confidence = 0 regardless of other signals. Without this, sibling/cousin pairs across vendors merge incorrectly because they share surnames + segment regions + cM brackets (caught and fixed during initial verification).

**Name-similarity logic** (handles common cross-vendor patterns):
```
Same last name + same first name      → 1.00
Same last name + initial-style match  → 0.95   ("M." prefix of "Michelle")
Subset name                            → 0.90   ("Marta" ⊂ "Marta Bell")
Same last name + first letter match   → 0.60–0.95   (Levenshtein-scored)
Same last name + DIFFERENT first letter → 0.40   (siblings/cousins gate)
Different last names                   → ≤ 0.65 (capped — never enough to clear gate)
```

**Group assembly:** union-find across all pairs scoring ≥ 0.7. Confidence ≥ 0.9 marks a group as eligible for the "Merge all high-confidence" bulk action.

**Performance optimization (in production):**
The naive O(n²) at 1,737 matches = ~3M comparisons per user. We bucket matches by normalized last-name first character before pairwise scoring — pairs across buckets can't share a last name and would fail the 0.7 gate anyway. Drops effective work to ~O(n²/26) = ~85K compares ≈ 0.5–1 sec in-browser. Code: `findDuplicateGroups()` builds a `nameBuckets` index, then loops only within buckets.

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
| `hooks/useDeduplication.ts` | React state for merged/rejected sets, computed `mergedAwayMatchIds`, bulk actions |
| `components/UserSwitcher.tsx` | Header dropdown, click-outside handling, active highlight |
| `components/hub/UnifiedInbox.tsx` | Inbox list rendering |
| `components/hub/MatchRow.tsx` | Single match row (avatar, name, vendor pill, lineage badge, cM/segments) |
| `components/hub/DuplicateGroupCard.tsx` | Single duplicate group: header, expand/collapse, member rows, merge/reject actions, evidence basis |
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

1. **No transliteration / phonetic matching.** Cyrillic names that get romanized differently by different vendors will miss the name gate. Soundex / Metaphone / RapidFuzz on the production pipeline would help.
2. **23andMe Migration Assistant is mock-only.** Currently disabled. The 4-step wizard structure is preserved in code but the upload/parse logic is a stub.
3. **No real upload pipeline.** All data is preprocessed JSON. Production needs a CSV/ZIP ingestion endpoint that maps each vendor's export format to the `DNAMatch` shape.
4. **Synthesized fields aren't biologically realistic.** A 3rd cousin to a Polish anchor might be Sub-Saharan African (random per pair seed). Production data won't have this issue but demos sometimes look odd. Possible v2: bias matched-user ancestry to share at least the anchor's primary population.
5. **No state persistence across sessions.** Merged/rejected groups reset on page reload. Production needs server-side `CrossVendorMatchLink` records keyed on user.
6. **Performance ceiling at ~10K matches.** The last-name bucketing currently helps but pathological cases (e.g. 200+ "Smiths") would still be slow. Production should add a fallback to similarity-LSH or move dedup server-side as an async job.
7. **No fuzzy-match across very different name spellings.** Could relax the 0.7 gate when segment overlap is >0.5 (high biological certainty even with name differences).

---

## Backend integration roadmap

When productionizing against the Django backend (`web-tier/app/dna_match/`):

**New model:**
```python
class CrossVendorMatchLink(models.Model):
    user = ForeignKey(User, on_delete=CASCADE)
    primary_match = ForeignKey(DNAMatchResults, related_name='primary_links')
    linked_matches = ManyToManyField(DNAMatchResults, related_name='secondary_links')
    confidence = FloatField()
    basis = ArrayField(CharField(max_length=20))   # ['name', 'cm', 'segments']
    user_confirmed = BooleanField(default=False)   # True after merge, False = pending suggestion
    created_at = DateTimeField(auto_now_add=True)
```

**New endpoints:**
```
POST /api/dedup/scan/?user_id=X         → triggers async dedup job, returns job_id (cache 24h)
GET  /api/dedup/jobs/{id}/              → poll for groups
POST /api/dedup/groups/{id}/merge/      → mark group as user_confirmed=True
POST /api/dedup/groups/{id}/reject/     → record rejection
GET  /api/inbox/?user_id=X              → unified inbox with collapsed duplicates
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
2. Worker scans matches, computes pair scores within name buckets
3. Persists `CrossVendorMatchLink` rows (one per detected group, `user_confirmed=False`)
4. Frontend polls `/api/dedup/jobs/{id}/` for completion
5. User reviews each group → POST to `merge/` or `reject/` flips `user_confirmed`
6. Confirmed merges flow into `/api/inbox/` collapsing logic

---

## Things to discuss with the dev team

1. **Where does the dedup job run?** Sync API call? Async via existing worker tier? What's the current pattern for long-running per-user batch work in the Django app?
2. **Real upload pipeline for the 23andMe Migration flow.** The TTAM closure already happened (Jan 2026); is migration capture still relevant? If so, what's the expected file format we should parse?
3. **Phonetic / transliteration handling.** Production users with Cyrillic / Cyrillic-romanized names need fuzzy matching beyond Levenshtein. Worth the effort vs. defer?
4. **Cross-app shared user state.** Currently each app has its own `?user=` query param — switching apps loses context. Should there be a session-cookie that propagates across `*.vercel.app` subdomains and the production Django frontend?
5. **`CrossVendorLink` field on `DNAMatchResults`.** Add it as a foreign key on the existing model, or keep the link in a separate table (current proposal)?
6. **Dedup engine portability.** The TypeScript implementation is pure-functional and ports cleanly to Python — want me to mirror it in `app/dna_match/services/dedup.py`?
7. **Real surnames + ancestry composition.** The pickle dataset has neither. Is there a separate Genomelink data source we can join on, or should we keep this synthesized for the demo and only enable surname-based features once production data is available?
8. **Performance budget.** What's the realistic max match count for a single user in production? If it's ≥10K, the bucketing optimization needs reinforcement (hash-LSH on names + parallel processing).
