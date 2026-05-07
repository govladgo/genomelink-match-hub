/**
 * Cross-vendor deduplication engine for DNA matches.
 *
 * Pure functions only — no React, no fetch, no localStorage. ES5-compat:
 * no `for...of` on iterators, no regex `s` flag, use Array.from + index loops.
 *
 * ALGORITHM (v2 — cM-bucketed)
 * ============================
 * Same biological match across two vendors should report:
 *   1. Very similar shared cM (within ±5%, since vendors' cM calculators differ)
 *   2. Substantially overlapping segment positions (same DNA segment ⇒ same person)
 *
 * Names are not used for grouping — users mistype them, vendors store them
 * differently, and Cyrillic / non-Latin names get romanised inconsistently
 * across platforms. Name similarity is still computed for UI display
 * (so the card can surface "name varies across vendors") but does not
 * influence whether a pair clears the threshold.
 *
 * Pairs below 30 cM are skipped entirely: at distant-cousin levels, hundreds
 * of unrelated matches share similar cM, producing too many false-positive
 * groups for any reasonable threshold to filter.
 */

import { DNAMatch, Segment } from '@/data/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Signals that can contribute to a pair being grouped as duplicates. */
export type Signal = 'cm' | 'segments';

export interface PairScore {
  /** the lower-id match (sorted lexicographically for stable pair keys) */
  matchAId: string;
  matchBId: string;
  /** name similarity 0-1 — computed for UI display only, NOT in confidence math */
  nameSim: number;
  /** cM closeness 0-1 — must clear the ±5% bucket to be considered */
  cmSim: number;
  /** segment overlap 0-1 — the actual confidence value */
  segmentSim: number;
  /** weighted total (0-1) — currently equal to segmentSim */
  confidence: number;
  /** which signals contributed (>0) */
  basis: Signal[];
}

export interface DuplicateGroup {
  /** stable id derived from member ids, e.g. "anc-x|23m-y" */
  id: string;
  /** member match ids (≥ 2) */
  matchIds: string[];
  /** average pair confidence (segment overlap) across all pairs in the group */
  confidence: number;
  /** combined basis across all pairs */
  basis: Signal[];
  /** average shared cM across the group's members — used as the group label */
  averageCM: number;
}

// ---------------------------------------------------------------------------
// Tunable thresholds (exported for tests & UI display)
// ---------------------------------------------------------------------------

/** Below this cM, dedup is skipped — too many same-cM unrelated matches. */
export const MIN_CM_FOR_DEDUP = 30;

/** Same biological match across vendors usually sits within ±5% cM. */
export const CM_TOLERANCE = 0.05;

/**
 * Minimum segment overlap to count a pair as a candidate duplicate.
 *
 * Calibrated against the demo dataset: genuine cross-vendor duplicates
 * (same person, slightly perturbed segment positions) score 0.8–0.99,
 * while unrelated pairs that happen to share a cM bracket and partial
 * segment overlap score 0.3–0.62. Setting the floor at 0.7 cleanly
 * separates real duplicates from false-positive chains. Without this,
 * union-find chains 4–7 distinct people into a single group when their
 * partial overlaps daisy-chain.
 */
export const SEGMENT_OVERLAP_THRESHOLD = 0.7;

/**
 * Pairs at or above this overlap are eligible for "Merge all high-confidence".
 * Real cross-vendor duplicates routinely hit 0.95+, so 0.9 is the right
 * cutoff — bulk merging only the very-confidently-the-same-person groups.
 */
export const HIGH_CONFIDENCE_THRESHOLD = 0.9;

/**
 * @deprecated Use SEGMENT_OVERLAP_THRESHOLD. Kept for back-compat with
 * any callers that imported the old name.
 */
export const SUGGEST_THRESHOLD = SEGMENT_OVERLAP_THRESHOLD;

// ---------------------------------------------------------------------------
// Levenshtein-based name similarity (display-only — not in confidence math)
// ---------------------------------------------------------------------------

/** Normalize a name: lowercase, collapse whitespace, strip punctuation. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,'"`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev: number[] = new Array(b.length + 1);
  let curr: number[] = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[b.length];
}

/**
 * Display-only name similarity for the duplicate-group UI. Returns 0–1.
 *
 * NOT used in dedup confidence math — name is no longer a signal because
 * users mistype names and vendors store them inconsistently. The UI uses
 * this to flag "name varies across vendors" as a context hint.
 */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, 1 - dist / maxLen);
}

// ---------------------------------------------------------------------------
// cM closeness (binary: in-bucket or out)
// ---------------------------------------------------------------------------

/**
 * Returns 1 if both cM values fall within ±CM_TOLERANCE of each other, else 0.
 * cM is the *bucket* key, not a continuous similarity signal.
 */
export function cmSimilarity(cmA: number, cmB: number): number {
  if (cmA === cmB) return 1;
  const avg = (cmA + cmB) / 2;
  if (avg === 0) return 0;
  const deltaPct = Math.abs(cmA - cmB) / avg;
  return deltaPct <= CM_TOLERANCE ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Segment overlap similarity (the confidence signal)
// ---------------------------------------------------------------------------

/** Returns the overlap length in base pairs between two segments on the same chromosome. */
function segmentOverlapBp(a: Segment, b: Segment): number {
  if (a.chromosome !== b.chromosome) return 0;
  const start = Math.max(a.startBp, b.startBp);
  const end = Math.min(a.endBp, b.endBp);
  return Math.max(0, end - start);
}

/**
 * Segment overlap similarity: total overlap length / min(totalA, totalB).
 *
 * Returns 0 if either segment list is empty (no segments → no signal,
 * pair cannot auto-merge in the new model).
 *
 * Uses the smaller side as denominator: if A is much shorter than B but
 * is fully contained inside B's segments, that's still strong evidence
 * the same DNA was inherited.
 */
export function segmentSimilarity(segsA: Segment[], segsB: Segment[]): number {
  if (segsA.length === 0 || segsB.length === 0) return 0;

  let overlapSum = 0;
  let totalA = 0;
  let totalB = 0;

  for (let i = 0; i < segsA.length; i++) {
    totalA += Math.max(0, segsA[i].endBp - segsA[i].startBp);
    for (let j = 0; j < segsB.length; j++) {
      overlapSum += segmentOverlapBp(segsA[i], segsB[j]);
    }
  }
  for (let j = 0; j < segsB.length; j++) {
    totalB += Math.max(0, segsB[j].endBp - segsB[j].startBp);
  }

  const denom = Math.min(totalA, totalB);
  if (denom === 0) return 0;
  return Math.min(1, overlapSum / denom);
}

// ---------------------------------------------------------------------------
// Pair scoring
// ---------------------------------------------------------------------------

/**
 * Score a single pair (a, b). Confidence equals segment overlap; the cM bucket
 * is a binary precondition (returns 0 confidence if outside ±5%). Same vendor
 * → 0 (cross-vendor dedup only).
 *
 * Pairs with no segment data on either side return confidence 0 — they
 * cannot be auto-grouped without the biological signal.
 */
export function scorePair(a: DNAMatch, b: DNAMatch): PairScore {
  const sameVendor = a.source === b.source;
  // Sort match IDs lexicographically for stable pair identity
  const [aId, bId] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];

  const nameSim = sameVendor ? 0 : nameSimilarity(a.name, b.name);

  if (sameVendor || a.sharedCM < MIN_CM_FOR_DEDUP || b.sharedCM < MIN_CM_FOR_DEDUP) {
    return { matchAId: aId, matchBId: bId, nameSim, cmSim: 0, segmentSim: 0, confidence: 0, basis: [] };
  }

  const cmSim = cmSimilarity(a.sharedCM, b.sharedCM);
  if (cmSim === 0) {
    return { matchAId: aId, matchBId: bId, nameSim, cmSim: 0, segmentSim: 0, confidence: 0, basis: [] };
  }

  const segmentSim = segmentSimilarity(a.segments, b.segments);
  const confidence = segmentSim;

  const basis: Signal[] = [];
  if (cmSim > 0) basis.push('cm');
  if (segmentSim >= SEGMENT_OVERLAP_THRESHOLD) basis.push('segments');

  return { matchAId: aId, matchBId: bId, nameSim, cmSim, segmentSim, confidence, basis };
}

// ---------------------------------------------------------------------------
// Group assembly: cM sliding window + segment-overlap confidence + union-find
// ---------------------------------------------------------------------------

/**
 * Run dedup across all matches. Returns groups of 2+ matches that likely
 * represent the same person across vendors.
 *
 * Strategy (v2):
 *   1. Filter to matches with sharedCM ≥ MIN_CM_FOR_DEDUP
 *   2. Sort by sharedCM ascending
 *   3. For each match A, walk forward through B until B.sharedCM > A.sharedCM × 1.05
 *   4. Score each candidate pair on segment overlap
 *   5. Union-find groups for pairs whose overlap ≥ SEGMENT_OVERLAP_THRESHOLD
 *
 * Performance: O(n log n) sort + O(n × avg_window). On the demo dataset
 * (~1700 matches/user) this finishes well under 100ms.
 */
export function findDuplicateGroups(
  matches: DNAMatch[],
  threshold: number = SEGMENT_OVERLAP_THRESHOLD
): DuplicateGroup[] {
  // 1. Filter + sort
  const eligible: DNAMatch[] = [];
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].sharedCM >= MIN_CM_FOR_DEDUP) eligible.push(matches[i]);
  }
  eligible.sort((a, b) => a.sharedCM - b.sharedCM);

  // 2. Sliding-window pair scoring
  const pairs: PairScore[] = [];
  for (let i = 0; i < eligible.length; i++) {
    const a = eligible[i];
    const upperBound = a.sharedCM * (1 + CM_TOLERANCE);
    for (let j = i + 1; j < eligible.length; j++) {
      const b = eligible[j];
      if (b.sharedCM > upperBound) break; // out of bucket — sorted, so all further are too
      // Verify the pair is symmetric in tolerance (a vs b's lower bound):
      // since we sorted ascending, a.sharedCM ≤ b.sharedCM, so a sits inside
      // b's window iff b.sharedCM ≤ a.sharedCM × 1.05 — which is our break.
      const score = scorePair(a, b);
      if (score.confidence >= threshold) {
        pairs.push(score);
      }
    }
  }

  // 3. Union-find to assemble groups
  const parent: Record<string, string> = {};
  function find(x: string): string {
    if (parent[x] === undefined) parent[x] = x;
    if (parent[x] === x) return x;
    parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a: string, b: string): void {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  for (let i = 0; i < pairs.length; i++) {
    union(pairs[i].matchAId, pairs[i].matchBId);
  }

  // 4. Bucket members by root
  const buckets: Record<string, string[]> = {};
  for (let i = 0; i < pairs.length; i++) {
    const root = find(pairs[i].matchAId);
    if (!buckets[root]) buckets[root] = [];
    if (buckets[root].indexOf(pairs[i].matchAId) === -1) buckets[root].push(pairs[i].matchAId);
    if (buckets[root].indexOf(pairs[i].matchBId) === -1) buckets[root].push(pairs[i].matchBId);
  }

  // 5. Build groups with averaged confidence + cM + combined basis
  const matchById: Record<string, DNAMatch> = {};
  for (let i = 0; i < matches.length; i++) matchById[matches[i].id] = matches[i];

  const rootKeys = Object.keys(buckets);
  const groups: DuplicateGroup[] = [];
  for (let k = 0; k < rootKeys.length; k++) {
    const memberIds = buckets[rootKeys[k]];
    if (memberIds.length < 2) continue;

    let confSum = 0;
    let pairCount = 0;
    const basisSet: Record<string, boolean> = {};
    for (let p = 0; p < pairs.length; p++) {
      if (
        memberIds.indexOf(pairs[p].matchAId) !== -1 &&
        memberIds.indexOf(pairs[p].matchBId) !== -1
      ) {
        confSum += pairs[p].confidence;
        pairCount++;
        for (let b = 0; b < pairs[p].basis.length; b++) {
          basisSet[pairs[p].basis[b]] = true;
        }
      }
    }
    const avgConf = pairCount > 0 ? confSum / pairCount : 0;

    let cmSum = 0;
    for (let m = 0; m < memberIds.length; m++) {
      const mm = matchById[memberIds[m]];
      if (mm) cmSum += mm.sharedCM;
    }
    const averageCM = memberIds.length > 0 ? cmSum / memberIds.length : 0;

    const sortedIds = memberIds.slice().sort();
    groups.push({
      id: sortedIds.join('|'),
      matchIds: sortedIds,
      confidence: avgConf,
      basis: Object.keys(basisSet) as Signal[],
      averageCM,
    });
  }

  groups.sort((a, b) => b.confidence - a.confidence);
  return groups;
}
