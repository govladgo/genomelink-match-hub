'use client';
import { useState, useMemo, useCallback } from 'react';
import { DNAMatch } from '@/data/types';
import {
  findDuplicateGroups,
  DuplicateGroup,
  HIGH_CONFIDENCE_THRESHOLD,
} from '@/utils/dedupEngine';

interface UseDedupResult {
  groups: DuplicateGroup[];
  mergedGroupIds: Set<string>;
  rejectedGroupIds: Set<string>;
  /** Match IDs that are inside a merged group (so the inbox can hide non-primary entries) */
  mergedAwayMatchIds: Set<string>;
  pendingGroups: DuplicateGroup[];
  highConfidenceCount: number;
  merge: (groupId: string) => void;
  unmerge: (groupId: string) => void;
  reject: (groupId: string) => void;
  mergeAllHighConfidence: () => void;
  reset: () => void;
}

export function useDeduplication(matches: DNAMatch[]): UseDedupResult {
  const groups = useMemo(() => findDuplicateGroups(matches), [matches]);

  const [mergedGroupIds, setMergedGroupIds] = useState<Set<string>>(new Set());
  const [rejectedGroupIds, setRejectedGroupIds] = useState<Set<string>>(new Set());

  const merge = useCallback((groupId: string) => {
    setMergedGroupIds(prev => {
      const next = new Set(prev);
      next.add(groupId);
      return next;
    });
    setRejectedGroupIds(prev => {
      if (!prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  }, []);

  const unmerge = useCallback((groupId: string) => {
    setMergedGroupIds(prev => {
      if (!prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  }, []);

  const reject = useCallback((groupId: string) => {
    setRejectedGroupIds(prev => {
      const next = new Set(prev);
      next.add(groupId);
      return next;
    });
    setMergedGroupIds(prev => {
      if (!prev.has(groupId)) return prev;
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  }, []);

  const mergeAllHighConfidence = useCallback(() => {
    setMergedGroupIds(prev => {
      const next = new Set(prev);
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].confidence >= HIGH_CONFIDENCE_THRESHOLD && !rejectedGroupIds.has(groups[i].id)) {
          next.add(groups[i].id);
        }
      }
      return next;
    });
  }, [groups, rejectedGroupIds]);

  const reset = useCallback(() => {
    setMergedGroupIds(new Set());
    setRejectedGroupIds(new Set());
  }, []);

  // Match IDs that are inside a merged group, except the "primary" (first by id) — those get hidden from the inbox
  const mergedAwayMatchIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (mergedGroupIds.has(g.id)) {
        // Keep the first match as the primary; hide the rest
        for (let j = 1; j < g.matchIds.length; j++) {
          ids.add(g.matchIds[j]);
        }
      }
    }
    return ids;
  }, [groups, mergedGroupIds]);

  const pendingGroups = useMemo(() => {
    return groups.filter(g => !mergedGroupIds.has(g.id) && !rejectedGroupIds.has(g.id));
  }, [groups, mergedGroupIds, rejectedGroupIds]);

  const highConfidenceCount = useMemo(() => {
    return pendingGroups.filter(g => g.confidence >= HIGH_CONFIDENCE_THRESHOLD).length;
  }, [pendingGroups]);

  return {
    groups,
    mergedGroupIds,
    rejectedGroupIds,
    mergedAwayMatchIds,
    pendingGroups,
    highConfidenceCount,
    merge,
    unmerge,
    reject,
    mergeAllHighConfidence,
    reset,
  };
}
