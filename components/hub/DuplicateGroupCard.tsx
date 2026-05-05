'use client';
import { useState } from 'react';
import { DNAMatch } from '@/data/types';
import { DuplicateGroup, Signal } from '@/utils/dedupEngine';
import { VendorPill } from './VendorPill';

const BASIS_LABELS: Record<Signal, string> = {
  name: 'name',
  cm: 'cM',
  segments: 'segments',
};

type DecisionState = 'pending' | 'merged' | 'rejected' | 'primary';

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  matches: DNAMatch[];
  /** Per-record state lookup (driven by useDeduplication). */
  decisionState: (matchId: string) => DecisionState;
  /** Per-record actions. */
  onMergeMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
  onUndoDecision: (matchId: string) => void;
}

export function DuplicateGroupCard({
  group, matches,
  decisionState,
  onMergeMatch, onRejectMatch, onUndoDecision,
}: DuplicateGroupCardProps) {
  const [expanded, setExpanded] = useState(true);

  const groupMatches = group.matchIds
    .map(id => matches.find(m => m.id === id))
    .filter((m): m is DNAMatch => Boolean(m));

  if (groupMatches.length === 0) return null;

  // The first record by ID is the primary anchor for the group.
  const primary = groupMatches[0];
  const siblings = groupMatches.slice(1);

  // A group is "fully resolved" when every sibling has a decision (merged or rejected).
  const allDecided = siblings.every(s => {
    const state = decisionState(s.id);
    return state === 'merged' || state === 'rejected';
  });
  const anyMerged = siblings.some(s => decisionState(s.id) === 'merged');

  const groupLabel = primary.name;
  const confidencePct = Math.round(group.confidence * 100);
  const confidenceColor =
    group.confidence >= 0.9 ? 'var(--gl-color-positive)' :
    group.confidence >= 0.75 ? 'var(--gl-color-yellow)' :
    'var(--gl-color-text-muted)';

  return (
    <div className={`duplicate-group${allDecided && anyMerged ? ' duplicate-group--merged' : ''}`}>
      {/* Header row */}
      <div
        style={{
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
            background: primary.avatarColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>
            {primary.initials}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gl-color-primary-dark)' }}>
                {groupLabel}
              </span>
              {allDecided && anyMerged && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '1px 8px', borderRadius: 4,
                  background: 'var(--gl-color-positive)', color: '#fff',
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Resolved
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

      {/* Member rows */}
      {expanded && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--gl-color-border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* Primary row — anchor, no actions */}
          <MemberRow
            match={primary}
            state="primary"
            onMerge={() => {}}
            onReject={() => {}}
            onUndo={() => {}}
          />
          {/* Sibling rows — each has its own merge / not-a-duplicate decision */}
          {siblings.map(s => (
            <MemberRow
              key={s.id}
              match={s}
              state={decisionState(s.id)}
              onMerge={(e) => { e.stopPropagation(); onMergeMatch(s.id); }}
              onReject={(e) => { e.stopPropagation(); onRejectMatch(s.id); }}
              onUndo={(e) => { e.stopPropagation(); onUndoDecision(s.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Per-record row with inline actions
// ============================================================================

interface MemberRowProps {
  match: DNAMatch;
  state: DecisionState;
  onMerge: (e: React.MouseEvent) => void;
  onReject: (e: React.MouseEvent) => void;
  onUndo: (e: React.MouseEvent) => void;
}

function MemberRow({ match, state, onMerge, onReject, onUndo }: MemberRowProps) {
  const isPrimary = state === 'primary';
  const isMerged = state === 'merged';
  const isRejected = state === 'rejected';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        background:
          isMerged ? 'rgba(122, 191, 67, 0.06)' :
          isRejected ? 'rgba(120, 120, 120, 0.04)' :
          'transparent',
        opacity: isRejected ? 0.6 : 1,
        transition: 'background 0.15s, opacity 0.15s',
      }}
    >
      {/* Avatar */}
      <span
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: match.avatarColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}
      >
        {match.initials}
      </span>

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--gl-color-primary-dark)',
              textDecoration: isRejected ? 'line-through' : 'none',
            }}
          >
            {match.name}
          </span>
          <VendorPill vendor={match.source} size="sm" />
          {isPrimary && (
            <span
              style={{
                fontSize: 10, fontWeight: 700,
                color: 'var(--gl-color-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '1px 6px',
                borderRadius: 3,
                background: 'rgba(69, 130, 201, 0.10)',
              }}
            >
              Primary
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', marginTop: 2 }}>
          {match.sharedCM} cM · {match.segments.length} seg · {match.relationship}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {isPrimary ? null : isMerged ? (
          <DecisionStatusPill
            label="Merged"
            tone="positive"
            onUndo={onUndo}
          />
        ) : isRejected ? (
          <DecisionStatusPill
            label="Not a duplicate"
            tone="muted"
            onUndo={onUndo}
          />
        ) : (
          <>
            <button
              onClick={onMerge}
              className="gl-btn gl-btn--primary"
              style={{ padding: '5px 12px', fontSize: 11, whiteSpace: 'nowrap' }}
            >
              Merge
            </button>
            <button
              onClick={onReject}
              className="gl-btn gl-btn--secondary"
              style={{ padding: '5px 12px', fontSize: 11, whiteSpace: 'nowrap' }}
            >
              Not a duplicate
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Status pill shown after a decision is made (with Undo)
// ============================================================================

interface DecisionStatusPillProps {
  label: string;
  tone: 'positive' | 'muted';
  onUndo: (e: React.MouseEvent) => void;
}

function DecisionStatusPill({ label, tone, onUndo }: DecisionStatusPillProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 4,
          fontSize: 11, fontWeight: 600,
          background: tone === 'positive' ? 'rgba(122, 191, 67, 0.15)' : 'rgba(120, 120, 120, 0.10)',
          color: tone === 'positive' ? 'var(--gl-color-positive)' : 'var(--gl-color-text-muted)',
        }}
      >
        {tone === 'positive' && (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {label}
      </span>
      <button
        onClick={onUndo}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 600,
          color: 'var(--gl-color-secondary)',
          textDecoration: 'underline',
          padding: 0,
          fontFamily: 'var(--gl-font)',
        }}
      >
        Undo
      </button>
    </div>
  );
}
