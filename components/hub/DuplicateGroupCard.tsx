'use client';
import { useState } from 'react';
import { DNAMatch } from '@/data/types';
import { DuplicateGroup, Signal } from '@/utils/dedupEngine';
import { MatchRow } from './MatchRow';

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  matches: DNAMatch[];
  isMerged: boolean;
  onMerge: (groupId: string) => void;
  onUnmerge: (groupId: string) => void;
  onReject: (groupId: string) => void;
}

const BASIS_LABELS: Record<Signal, string> = {
  name: 'name',
  cm: 'cM',
  segments: 'segments',
};

export function DuplicateGroupCard({
  group, matches, isMerged, onMerge, onUnmerge, onReject,
}: DuplicateGroupCardProps) {
  const [expanded, setExpanded] = useState(true);
  const groupMatches = group.matchIds
    .map(id => matches.find(m => m.id === id))
    .filter((m): m is DNAMatch => Boolean(m));

  if (groupMatches.length === 0) return null;

  // Use the first match's name as the group label (they should be near-identical)
  const groupLabel = groupMatches[0].name;
  const confidencePct = Math.round(group.confidence * 100);

  const confidenceColor =
    group.confidence >= 0.9 ? 'var(--gl-color-positive)' :
    group.confidence >= 0.75 ? 'var(--gl-color-yellow)' :
    'var(--gl-color-text-muted)';

  return (
    <div className={`duplicate-group${isMerged ? ' duplicate-group--merged' : ''}`}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        cursor: 'pointer',
      }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: groupMatches[0].avatarColor,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
            flexShrink: 0,
          }}>
            {groupMatches[0].initials}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gl-color-primary-dark)' }}>
                {groupLabel}
              </span>
              {isMerged && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '1px 8px', borderRadius: 4,
                  background: 'var(--gl-color-positive)', color: '#fff',
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Merged
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', marginTop: 2 }}>
              {groupMatches.length} vendors · matched on {group.basis.map(b => BASIS_LABELS[b]).join(' + ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: confidenceColor,
            minWidth: 36, textAlign: 'right',
          }}>
            {confidencePct}%
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          >
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Member matches */}
      {expanded && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--gl-color-border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {groupMatches.map(m => <MatchRow key={m.id} match={m} compact />)}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--gl-color-border-light)',
          }}>
            {!isMerged ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onMerge(group.id); }}
                  className="gl-btn gl-btn--primary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                >
                  Merge into one match
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject(group.id); }}
                  className="gl-btn gl-btn--secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                >
                  Not a duplicate
                </button>
              </>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onUnmerge(group.id); }}
                className="gl-btn gl-btn--secondary"
                style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
              >
                Unmerge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
