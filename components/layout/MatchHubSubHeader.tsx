'use client';

import React from 'react';
import Link from 'next/link';
import { supportHubUrl } from '@/lib/supportHubUrl';

/**
 * Sub-header for the Match Hub page. Three slots:
 *   left:   ← Back to tools (links to /)
 *   center: users-01 icon + Match Hub (h3 24/32)
 *   right:  ? help-circle + How it works? (links to /match-hub/help)
 *
 * Tokens (Figma 12292:21249 / 12292:21254 / 12292:22163):
 *   - "Back to tools" + "How it works?": SF Pro Semibold 16/24, #6786AC
 *   - "Match Hub": SF Pro Semibold 24/32, #263856
 *   - users-01 icon: 24×24 currentColor
 *   - help-circle icon: 18×18 currentColor
 */
interface MatchHubSubHeaderProps {
  /** Where the back link goes. Default: `/` (tools selector). */
  backHref?: string;
  /** Back link label. Default: "Back to tools". */
  backLabel?: string;
  /** Right-side link text + target. When omitted, "How it works?" → /match-hub/help. */
  rightHref?: string;
  rightLabel?: string;
  /**
   * Tag used for the "Match Hub" title. Defaults to `h1` so /match-hub has
   * a top-level page heading. Pages that already provide their own `<h1>`
   * (notably /match-hub/help with "How to use Match Hub") should pass
   * `titleAs="span"` to avoid emitting two `<h1>`s — that's an a11y / SEO
   * smell flagged in QA_RESULTS.md (Bug B2).
   */
  titleAs?: 'h1' | 'span';
}

export function MatchHubSubHeader({
  backHref = '/',
  backLabel = 'Back to tools',
  rightHref = supportHubUrl('match-hub'),
  rightLabel = 'How it works?',
  titleAs = 'h1',
}: MatchHubSubHeaderProps = {}) {
  return (
    <div
      style={{
        background: '#F9FCFF',
        padding: '24px 64px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 24,
        fontFamily: 'var(--gl-font)',
      }}
      className="match-hub-subheader"
    >
      {/* Left — Back to tools */}
      <div style={{ justifySelf: 'start' }}>
        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 600,
            color: '#6786AC',
            textDecoration: 'none',
            fontFamily: 'var(--gl-font)',
          }}
        >
          <BackArrow />
          {backLabel}
        </Link>
      </div>

      {/* Center — users-01 icon + Match Hub */}
      <div
        style={{
          justifySelf: 'center',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <UsersIcon />
        {titleAs === 'h1' ? (
          <h1 style={titleStyle}>Match Hub</h1>
        ) : (
          <span style={titleStyle}>Match Hub</span>
        )}
      </div>

      {/* Right — How it works? (cross-domain to the unified DNA Match Support
          hub by default, so use a plain <a> rather than next/link). */}
      <div style={{ justifySelf: 'end' }}>
        <a
          href={rightHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 600,
            color: '#6786AC',
            textDecoration: 'none',
            fontFamily: 'var(--gl-font)',
          }}
        >
          <HelpCircleIcon />
          {rightLabel}
        </a>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.match-hub-subheader) {
            padding: 16px !important;
            grid-template-columns: auto 1fr !important;
            grid-template-rows: auto auto !important;
            row-gap: 8px !important;
            column-gap: 16px !important;
          }
          :global(.match-hub-subheader > :nth-child(1)) {
            grid-column: 1 !important;
            grid-row: 1 !important;
          }
          :global(.match-hub-subheader > :nth-child(3)) {
            grid-column: 2 !important;
            grid-row: 1 !important;
            justify-self: end !important;
          }
          :global(.match-hub-subheader > :nth-child(2)) {
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
            justify-self: start !important;
          }
          :global(.match-hub-subheader h1) {
            font-size: 22px !important;
            line-height: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared style for the centred "Match Hub" title (used by both h1 and span
// variants so the visual rendering is identical regardless of element).
// ---------------------------------------------------------------------------

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: '32px',
  color: '#263856',
  fontFamily: 'var(--gl-font)',
  whiteSpace: 'nowrap',
};

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------

// 22×18 right arrow — rendered rotated 180° via flex transform on the parent
// in Figma; we just draw a left-facing arrow directly.
function BackArrow() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
      <path
        d="M21 9H1 M8 2L1 9L8 16"
        stroke="#6786AC"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 24×24 users-01 (two-figure user icon)
function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3.5" stroke="#263856" strokeWidth="1.6" />
      <path
        d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6"
        stroke="#263856"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 9a3 3 0 1 0 0-5"
        stroke="#263856"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.5 19.5H21c0-2.78-2.06-5.08-4.74-5.46"
        stroke="#263856"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 18×18 help-circle
function HelpCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="#6786AC" strokeWidth="1.6" />
      <path
        d="M7 7c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.4-1.2 1.7-.5.2-.8.6-.8 1.1V10"
        stroke="#6786AC"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="9" cy="12.7" r="0.7" fill="#6786AC" />
    </svg>
  );
}
