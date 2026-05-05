'use client';
import { useState, useMemo, useCallback } from 'react';
import { DNAMatch } from '@/data/types';
import {
  findDuplicateGroups,
  DuplicateGroup,
  HIGH_CONFIDENCE_THRESHOLD,
} from '@/utils/dedupEngine';

/**
 * Per-record dedup state machine.
 *
 * The dedup engine groups suggested duplicates via union-find. Each group has
 * one "primary" record (the lowest-id match — `group.matchIds[0]`) and one or
 * more sibling records that the engine thinks describe the same biological
 * person. The user reviews each sibling individually and either:
 *
 *   - Merges it into the primary  → record hides from the unified inbox
 *   - Marks it "not a duplicate"  → record stays in the inbox as a separate person
 *
 * Decisions are tracked per match ID, not per group, so one group can have
 * mixed states (e.g. one sibling merged, another still pending).
 */
interface UseDedupResult {
  groups: DuplicateGroup[];
  /** Match IDs the user has confirmed merged into their group's primary. */
  mergedMatchIds: Set<string>;
  /** Match IDs the user has confirmed are NOT duplicates (split from the group). */
  rejectedMatchIds: Set<string>;
  /** Alias of `mergedMatchIds` — used by the unified inbox to hide collapsed entries. */
  mergedAwayMatchIds: Set<string>;
  /** Groups that still have at least one undecided sibling record. */
  pendingGroups: DuplicateGroup[];
  /** Number of high-confidence pending sibling decisions remaining. */
  highConfidenceCount: number;

  /** Returns true if the given matchId is the primary (anchor) of its group. */
  isPrimaryMatchId: (matchId: string) => boolean;
  /** Find the group that contains this match (or undefined if it's a singleton). */
  groupForMatchId: (matchId: string) => DuplicateGroup | undefined;
  /** Per-record state: 'pending' | 'merged' | 'rejected' | 'primary'. */
  matchDecisionState: (matchId: string) => 'pending' | 'merged' | 'rejected' | 'primary';

  // ----- per-record actions -----
  mergeMatch: (matchId: string) => void;
  rejectMatch: (matchId: string) => void;
  /** Undo any prior decision (merge or reject) for this record. */
  undoDecision: (matchId: string) => void;

  // ----- bulk actions -----
  /** Merge every non-primary record across all high-confidence groups. */
  mergeAllHighConfidence: () => void;
  /** Clear all per-record decisions. */
  reset: () => void;
}

export function useDeduplication(matches: DNAMatch[]): UseDedupResult {
  const groups = useMemo(() => findDuplicateGroups(matches), [matches]);

  const [mergedMatchIds, setMergedMatchIds] = useState<Set<string>>(new Set());
  const [rejectedMatchIds, setRejectedMatchIds] = useState<Set<string>>(new Set());

  // Reverse index: matchId → group it belongs to (for fast lookups in callbacks)
  const groupByMatchId = useMemo(() => {
    const idx: Record<string, DuplicateGroup> = {};
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      for (let j = 0; j < g.matchIds.length; j++) {
        idx[g.matchIds[j]] = g;
      }
    }
    return idx;
  }, [groups]);

  const isPrimaryMatchId = useCallback(
    (matchId: string) => {
      const g = groupByMatchId[matchId];
      return g ? g.matchIds[0] === matchId : false;
    },
    [groupByMatchId]
  );

  const groupForMatchId = useCallback(
    (matchId: string) => groupByMatchId[matchId],
    [groupByMatchId]
  );

  const matchDecisionState = useCallback(
    (matchId: string): 'pending' | 'merged' | 'rejected' | 'primary' => {
      if (isPrimaryMatchId(matchId)) return 'primary';
      if (mergedMatchIds.has(matchId)) return 'merged';
      if (rejectedMatchIds.has(matchId)) return 'rejected';
      return 'pending';
    },
    [isPrimaryMatchId, mergedMatchIds, rejectedMatchIds]
  );

  const mergeMatch = useCallback((matchId: string) => {
    setMergedMatchIds(prev => {
      if (prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.add(matchId);
      return next;
    });
    setRejectedMatchIds(prev => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  }, []);

  const rejectMatch = useCallback((matchId: string) => {
    setRejectedMatchIds(prev => {
      if (prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.add(matchId);
      return next;
    });
    setMergedMatchIds(prev => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  }, []);

  const undoDecision = useCallback((matchId: string) => {
    setMergedMatchIds(prev => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
    setRejectedMatchIds(prev => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  }, []);

  const mergeAllHighConfidence = useCallback(() => {
    setMergedMatchIds(prev => {
      const next = new Set(prev);
      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (g.confidence < HIGH_CONFIDENCE_THRESHOLD) continue;
        // Mark every non-primary sibling as merged, unless the user already rejected it.
        for (let j = 1; j < g.matchIds.length; j++) {
          const id = g.matchIds[j];
          if (rejectedMatchIds.has(id)) continue;
          next.add(id);
        }
      }
      return next;
    });
  }, [groups, rejectedMatchIds]);

  const reset = useCallback(() => {
    setMergedMatchIds(new Set());
    setRejectedMatchIds(new Set());
  }, []);

  // Inbox alias: collapsed entries are exactly the records the user merged.
  const mergedAwayMatchIds = mergedMatchIds;

  // A group is "pending" if at least one of its non-primary siblings is still undecided.
  const pendingGroups = useMemo(() => {
    return groups.filter(g => {
      for (let j = 1; j < g.matchIds.length; j++) {
        const id = g.matchIds[j];
        if (!mergedMatchIds.has(id) && !rejectedMatchIds.has(id)) return true;
      }
      return false;
    });
  }, [groups, mergedMatchIds, rejectedMatchIds]);

  // Count of pending sibling decisions inside high-confidence groups.
  const highConfidenceCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.confidence < HIGH_CONFIDENCE_THRESHOLD) continue;
      for (let j = 1; j < g.matchIds.length; j++) {
        const id = g.matchIds[j];
        if (!mergedMatchIds.has(id) && !rejectedMatchIds.has(id)) count++;
      }
    }
    return count;
  }, [groups, mergedMatchIds, rejectedMatchIds]);

  return {
    groups,
    mergedMatchIds,
    rejectedMatchIds,
    mergedAwayMatchIds,
    pendingGroups,
    highConfidenceCount,
    isPrimaryMatchId,
    groupForMatchId,
    matchDecisionState,
    mergeMatch,
    rejectMatch,
    undoDecision,
    mergeAllHighConfidence,
    reset,
  };
}
