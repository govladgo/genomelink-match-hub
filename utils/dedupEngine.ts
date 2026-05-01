/**
 * Cross-vendor deduplication engine for DNA matches.
 *
 * Pure functions only — no React, no fetch, no localStorage. ES5-compat:
 * no `for...of` on iterators, no regex `s` flag, use Array.from + index loops.
 */

import { DNAMatch, Segment } from '@/data/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type Signal = 'name' | 'cm' | 'segments';

export interface PairScore {
  /** the lower-id match (sorted lexicographically for stable pair keys) */
  matchAId: string;
  matchBId: string;
  /** raw similarity per signal (0-1) */
  nameSim: number;
  cmSim: number;
  segmentSim: number;
  /** weighted total (0-1) */
  confidence: number;
  /** which signals contributed (>0) */
  basis: Signal[];
}

export interface DuplicateGroup {
  /** stable id derived from member ids, e.g. "anc-x|23m-y" */
  id: string;
  /** member match ids (≥ 2) */
  matchIds: string[];
  /** average pair confidence across all pairs in the group */
  confidence: number;
  /** combined basis across all pairs */
  basis: Signal[];
}

// ---------------------------------------------------------------------------
// Levenshtein-based name similarity
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

  // Two-row DP for memory efficiency.
  let prev: number[] = new Array(b.length + 1);
  let curr: number[] = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost      // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[b.length];
}

/**
 * Token-aware name similarity for cross-vendor dedup. Returns 0-1.
 *
 * Critical: this is a hard gate. Family members (siblings, cousins) share surnames
 * AND segments AND cM brackets, so name is the only reliable discriminator.
 * Different first names with the same surname → low similarity (0.4) regardless
 * of other shared structure.
 */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  const ta = na.split(' ');
  const tb = nb.split(' ');
  const lastA = ta[ta.length - 1];
  const lastB = tb[tb.length - 1];
  const firstA = ta[0];
  const firstB = tb[0];

  // Subset case (e.g., "Marta" in "Marta Bell" — one record gives only first name)
  // Only trust if it's truly a single-token name being a prefix of the other.
  if (ta.length === 1 && tb.length > 1 && tb.indexOf(na) !== -1) return 0.9;
  if (tb.length === 1 && ta.length > 1 && ta.indexOf(nb) !== -1) return 0.9;

  // Same last name → discriminator is the first name
  if (lastA === lastB) {
    // Initial-style match: one first name is 1–2 chars that prefix the other
    if (firstA.length <= 2 && firstB.indexOf(firstA) === 0) return 0.95;
    if (firstB.length <= 2 && firstA.indexOf(firstB) === 0) return 0.95;
    // Full first names match exactly
    if (firstA === firstB) return 1;
    // First letters match → could be name variants or middle-name differences
    if (firstA.charAt(0) === firstB.charAt(0)) {
      const firstDist = levenshtein(firstA, firstB);
      const firstLen = Math.max(firstA.length, firstB.length);
      const sim = 1 - firstDist / firstLen;
      // Map to 0.6–0.95 range so close-but-not-exact still passes the 0.7 threshold
      return 0.6 + sim * 0.35;
    }
    // Same surname, different first letter → likely siblings/cousins, not duplicates
    return 0.4;
  }

  // Different last names → fall back to global Levenshtein similarity but cap below 0.7
  // so this branch alone cannot produce a duplicate suggestion.
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  const sim = Math.max(0, 1 - dist / maxLen);
  return Math.min(sim, 0.65);
}

// ---------------------------------------------------------------------------
// cM bracket similarity
// ---------------------------------------------------------------------------

/**
 * Same biological person on different vendors usually shows close-but-not-identical cM
 * because vendors use different chip versions and matching algorithms. We expect
 * variance in the ±5% range for the same person; ±15% is the upper edge of plausible.
 */
export function cmSimilarity(cmA: number, cmB: number): number {
  if (cmA === cmB) return 1;
  const avg = (cmA + cmB) / 2;
  if (avg === 0) return 0;
  const deltaPct = Math.abs(cmA - cmB) / avg;

  // Linear falloff: 0% diff → 1.0, 15% diff → 0.0
  return Math.max(0, 1 - deltaPct / 0.15);
}

// ---------------------------------------------------------------------------
// Segment overlap similarity
// ---------------------------------------------------------------------------

/** Returns the overlap length in base pairs between two segments on the same chromosome. */
function segmentOverlapBp(a: Segment, b: Segment): number {
  if (a.chromosome !== b.chromosome) return 0;
  const start = Math.max(a.startBp, b.startBp);
  const end = Math.min(a.endBp, b.endBp);
  return Math.max(0, end - start);
}

/**
 * Segment overlap similarity: total overlap length / total combined length.
 * 0 if no overlapping segments. 1 if segment lists are identical.
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

  // Use min of total lengths as denominator: if A has 50% overlap with B's segments,
  // and A is much smaller, that's still a strong signal.
  const denom = Math.min(totalA, totalB);
  if (denom === 0) return 0;
  return Math.min(1, overlapSum / denom);
}

// ---------------------------------------------------------------------------
// Pair scoring
// ---------------------------------------------------------------------------

const WEIGHTS = { name: 0.3, cm: 0.3, segments: 0.4 };

/**
 * Name is the primary discriminator across vendors — the same person should have
 * essentially the same name on different platforms. If nameSim falls below this
 * floor we treat the pair as different people regardless of cM/segment overlap
 * (which is naturally high for related family members across vendors).
 */
const NAME_FLOOR = 0.7;

export function scorePair(a: DNAMatch, b: DNAMatch): PairScore {
  // Same vendor → not a cross-vendor duplicate (don't dedup within a single vendor)
  const sameVendor = a.source === b.source;

  const nameSim = sameVendor ? 0 : nameSimilarity(a.name, b.name);
  const cmSim = sameVendor ? 0 : cmSimilarity(a.sharedCM, b.sharedCM);
  const segmentSim = sameVendor ? 0 : segmentSimilarity(a.segments, b.segments);

  // Name is a hard gate: family members share surnames + segments + cM bracket,
  // so without a strong name match we cannot conclude two records are the same person.
  let confidence = 0;
  if (nameSim < NAME_FLOOR) {
    confidence = 0;
  } else {
    // Confidence = weighted sum of signals that have data.
    // If one match has no segments, redistribute that weight to name+cm.
    const hasSegments = a.segments.length > 0 && b.segments.length > 0;
    if (hasSegments) {
      confidence =
        nameSim * WEIGHTS.name + cmSim * WEIGHTS.cm + segmentSim * WEIGHTS.segments;
    } else {
      const total = WEIGHTS.name + WEIGHTS.cm;
      confidence = (nameSim * WEIGHTS.name + cmSim * WEIGHTS.cm) / total;
    }
  }

  const basis: Signal[] = [];
  if (nameSim > 0.5) basis.push('name');
  if (cmSim > 0.5) basis.push('cm');
  if (segmentSim > 0.3) basis.push('segments');

  // Sort match IDs lexicographically for stable pair identity
  const [aId, bId] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];

  return {
    matchAId: aId,
    matchBId: bId,
    nameSim,
    cmSim,
    segmentSim,
    confidence,
    basis,
  };
}

// ---------------------------------------------------------------------------
// Group assembly via union-find
// ---------------------------------------------------------------------------

/** Confidence threshold above which two matches are considered the same person. */
export const SUGGEST_THRESHOLD = 0.7;
export const HIGH_CONFIDENCE_THRESHOLD = 0.9;

/**
 * Run dedup across all matches. Returns groups of 2+ matches that likely
 * represent the same person across vendors.
 */
export function findDuplicateGroups(
  matches: DNAMatch[],
  threshold: number = SUGGEST_THRESHOLD
): DuplicateGroup[] {
  // Score every cross-vendor pair
  const pairs: PairScore[] = [];
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const score = scorePair(matches[i], matches[j]);
      if (score.confidence >= threshold) {
        pairs.push(score);
      }
    }
  }

  // Union-find to assemble groups
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

  // Bucket members by root
  const buckets: Record<string, string[]> = {};
  for (let i = 0; i < pairs.length; i++) {
    const root = find(pairs[i].matchAId);
    if (!buckets[root]) buckets[root] = [];
    if (buckets[root].indexOf(pairs[i].matchAId) === -1) buckets[root].push(pairs[i].matchAId);
    if (buckets[root].indexOf(pairs[i].matchBId) === -1) buckets[root].push(pairs[i].matchBId);
  }

  // Build groups with averaged confidence + combined basis
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

    const sortedIds = memberIds.slice().sort();
    groups.push({
      id: sortedIds.join('|'),
      matchIds: sortedIds,
      confidence: avgConf,
      basis: Object.keys(basisSet) as Signal[],
    });
  }

  groups.sort((a, b) => b.confidence - a.confidence);
  return groups;
}
