'use client';
import { useState } from 'react';
import { DNAMatch } from '@/data/types';
import { DuplicateGroup, Signal } from '@/utils/dedupEngine';
import { VendorPill } from './VendorPill';

const BASIS_LABELS: Record<Signal, string> = {
  cm: 'cM',
  segments: 'segments',
};

/**
 * Duplicate group card — Figma 12292:22608 / 12292:27476.
 *
 * Layout:
 *   [card border 1px gray-60, radius 12, p-24, gap 16]
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  [48 avatar] Name, ~XX cM            [match%] [chevron]     │
 *   │              N vendors · matched on …                       │
 *   ├─────────────────────────────────────────────────────────────┤
 *   │  [32 avatar] Name [vendor pill] [PRIMARY badge]             │
 *   │              13.3 cM · 1 seg · 6th cousin                   │
 *   ├─────────────────────────────────────────────────────────────┤
 *   │  [32 avatar] Name [vendor pill]    [Dismiss] [Merge]        │
 *   │              13.3 cM · 1 seg · 6th cousin                   │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Sibling row backgrounds:
 *   pending  → transparent
 *   merged   → rgba(122,191,67,0.10) + MERGED green pill
 *   rejected → rgba(201,214,228,0.10) + opacity 0.5 + line-through + NOT A
 *              DUPLICATE gray pill
 */

type DecisionState = 'pending' | 'merged' | 'rejected' | 'primary';

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  matches: DNAMatch[];
  decisionState: (matchId: string) => DecisionState;
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

  const primary = groupMatches[0];
  const siblings = groupMatches.slice(1);

  // Distinct vendor count for the header line.
  const vendorSet: Record<string, true> = {};
  for (let i = 0; i < groupMatches.length; i++) vendorSet[groupMatches[i].source] = true;
  const vendorCount = Object.keys(vendorSet).length;

  // Distinct name spellings — surfaces "name varies across vendors", which is
  // the case the cM-based dedup logic was designed to handle (vendors store
  // names inconsistently — initials, transliteration, married names, etc).
  const distinctNames: string[] = [];
  for (let i = 0; i < groupMatches.length; i++) {
    const n = groupMatches[i].name;
    if (distinctNames.indexOf(n) === -1) distinctNames.push(n);
  }
  const hasNameVariation = distinctNames.length > 1;

  const cmLabel = `~${group.averageCM.toFixed(1)} cM`;
  const confidencePct = Math.round(group.confidence * 100);

  // Subtitle was previously "N vendors · matched on cM + segments" — Figma
  // 12327:2058 simplifies it to just "N vendors". Keeping `basisLabel` for
  // the tooltip / accessibility hint so the cM-based grouping is still
  // discoverable when needed.
  const basisLabel = group.basis.length
    ? group.basis.map(b => BASIS_LABELS[b]).join(' + ')
    : 'cM';

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(201, 214, 228, 0.6)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header row — Figma 12327:2058: no avatar, cM-led title +
          "N vendors" subtitle, % confidence + chevron on the right.

          Rendered as a real <button> so the toggle is keyboard-activatable
          (Enter / Space) and announced as a button by screen readers
          (QA_RESULTS.md → Nit N1). The element is a full-width button
          styled to look exactly like the previous <div onClick>. */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} duplicate group: ${cmLabel}, ${groupMatches.length} candidates, ${confidencePct}% confidence`}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '8px 0',
          width: '100%',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                lineHeight: '24px',
                color: '#263856',
                fontFamily: 'var(--gl-font)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
              title={hasNameVariation ? distinctNames.join(' · ') : primary.name}
            >
              {/* Title is always cM-led to make it visible that grouping is
                  cM-based, not name-based. Names are surfaced in the per-row
                  list below; if vendors disagree on the name, a "Name varies"
                  badge sits next to the title. */}
              {`${cmLabel} · ${groupMatches.length} candidates`}
            </p>
            {hasNameVariation && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(255, 124, 17, 0.10)',
                  color: '#FF7C11',
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: '14px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--gl-font)',
                }}
                title="Names differ across vendors — grouped by cM + segments, not name."
              >
                Name varies
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: '24px',
              color: '#6786AC',
              fontFamily: 'var(--gl-font)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={`Grouped by ${basisLabel}`}
          >
            {vendorCount} vendors
          </p>
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
            color: '#263856',
            fontFamily: 'var(--gl-font)',
            flexShrink: 0,
          }}
        >
          {confidencePct}%
        </span>
        <svg
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          style={{
            transform: expanded ? 'rotate(0)' : 'rotate(180deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
            color: '#263856',
          }}
          aria-hidden="true"
        >
          <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <>
          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(201, 214, 228, 0.6)', width: '100%' }} />

          {/* Member rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MemberRow
              match={primary}
              state="primary"
              onMerge={() => {}}
              onReject={() => {}}
              onUndo={() => {}}
            />
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
        </>
      )}
    </div>
  );
}

// ============================================================================
// Per-record row
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

  const rowBg =
    isMerged ? 'rgba(122, 191, 67, 0.10)' :
    isRejected ? 'rgba(201, 214, 228, 0.10)' :
    'transparent';

  // The Figma applies opacity:0.5 to the identity column for "not a duplicate"
  // rows (with the action buttons remaining at full opacity).
  const identityOpacity = isRejected ? 0.5 : 1;

  return (
    <div
      className="dup-member-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 8,
        borderRadius: 8,
        background: rowBg,
        transition: 'background 0.15s',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          flex: '1 0 0',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: identityOpacity,
        }}
      >
        <span
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: match.avatarColor, color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, flexShrink: 0,
            fontFamily: 'var(--gl-font)',
          }}
        >
          {match.initials}
        </span>
        <div style={{ flex: '1 0 0', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '20px',
                color: '#263856',
                fontFamily: 'var(--gl-font)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: isRejected ? 'line-through' : 'none',
              }}
            >
              {match.name}
            </span>
            <VendorPill vendor={match.source} size="sm" variant="outlined" />
            {isPrimary && <StatusPill label="Primary" tone="primary" />}
            {isMerged && <StatusPill label="Merged" tone="merged" />}
            {isRejected && <StatusPill label="Not a duplicate" tone="rejected" />}
          </div>
          <p
            style={{
              margin: 0,
              marginTop: 0,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '20px',
              color: '#6786AC',
              fontFamily: 'var(--gl-font)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {match.sharedCM} cM · {match.segments.length} seg · {match.relationship}
          </p>
        </div>
      </div>

      {/* Actions */}
      {!isPrimary && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isMerged || isRejected ? (
            <button
              onClick={onUndo}
              style={btnSecondary}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(38, 56, 86, 0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Undo
            </button>
          ) : (
            <>
              <button
                onClick={onReject}
                style={btnSecondary}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(38, 56, 86, 0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Dismiss
              </button>
              <button
                onClick={onMerge}
                style={btnPrimary}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f2690b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FF7C11'; }}
              >
                Merge
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Status pill (PRIMARY / MERGED / NOT A DUPLICATE)
// ============================================================================

type PillTone = 'primary' | 'merged' | 'rejected';

function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const styles =
    tone === 'primary'  ? { bg: 'rgba(255, 124, 17, 0.10)', fg: '#FF7C11' } :
    tone === 'merged'   ? { bg: 'rgba(122, 191, 67, 0.10)', fg: '#5EA634' } :
                          { bg: 'rgba(201, 214, 228, 0.6)', fg: '#263856' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        background: styles.bg,
        color: styles.fg,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: '14px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--gl-font)',
      }}
    >
      {label}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Button styles (Figma 12247:13593 + 12247:13594 / 12247:19506)
// ----------------------------------------------------------------------------

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  padding: '8px 16px',
  borderRadius: 32,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '16px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  width: 120,
  fontFamily: 'var(--gl-font)',
  transition: 'background 0.15s, border-color 0.15s',
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  border: '1px solid rgba(38, 56, 86, 0.6)',
  color: '#263856',
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: '#FF7C11',
  border: '1px solid transparent',
  color: '#FFFFFF',
};
