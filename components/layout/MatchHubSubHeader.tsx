'use client';

import Link from 'next/link';

/**
 * Sub-header for the Match Hub page. Three slots:
 *   left:   ← Back to tools (links to /)
 *   center: Match Hub title
 *   right:  How it works? (links to /match-hub/help)
 *
 * Tokens (Figma 12142:8061 + 12142:8063):
 *   - "Back to tools": SF Pro Semibold 16/24, color #6786AC (Tertiary/Gray/Dark 2)
 *   - Back-arrow icon: same color
 */
export function MatchHubSubHeader() {
  return (
    <div
      style={{
        background: '#F9FCFF',
        padding: '24px 64px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 24,
        fontFamily: 'var(--gl-font)',
      }}
      className="match-hub-subheader"
    >
      <div style={{ justifySelf: 'start' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 600,
            color: '#6786AC',
            textDecoration: 'none',
            fontFamily: 'var(--gl-font)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M11.5 4.5L7 9L11.5 13.5"
              stroke="#6786AC"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to tools
        </Link>
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: '#263856',
          fontFamily: 'var(--gl-font)',
          textAlign: 'center',
        }}
      >
        Match Hub
      </h1>

      <div style={{ justifySelf: 'end' }}>
        <Link
          href="/match-hub/help"
          style={{
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 600,
            color: 'var(--gl-color-secondary)',
            textDecoration: 'underline',
            fontFamily: 'var(--gl-font)',
          }}
        >
          How it works?
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.match-hub-subheader) {
            padding: 16px !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
          }
          :global(.match-hub-subheader > h1) {
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
}
