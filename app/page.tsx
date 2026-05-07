'use client';

/**
 * DNA Matches PRO — tools selector page.
 *
 * Five tool cards. Only the Match Hub card actually navigates; the others
 * (Network Graph, Clusters, DNA Painter, Family Tree) are visual-only
 * placeholders for the prototype, per product direction.
 *
 * Figma: 11564:27120 (desktop) / 11564:27191 (mobile).
 */

import { GenomelinkHeader } from '@/components/layout/GenomelinkHeader';
import { ToolCard } from '@/components/tools/ToolCard';

// ----------------------------------------------------------------------------
// Tool icons (inline SVG so we don't ship the Figma asset URLs)
// ----------------------------------------------------------------------------

const NetworkGraphIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="3" cy="9" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="9" cy="3" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="15" cy="9" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="9" cy="15" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5 9 L7 9 M11 9 L13 9 M9 5 L9 7 M9 11 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4.5 7.5 L7.5 4.5 M10.5 4.5 L13.5 7.5 M4.5 10.5 L7.5 13.5 M13.5 10.5 L10.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ClustersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="13" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="5" cy="13" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 5 L11 5 M5 7 L5 11 M13 7 L13 11 M7 13 L11 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const MatchHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3 4.5h6 M3 9h6 M3 13.5h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="13.5" cy="4.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="13.5" cy="9" r="1.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="13.5" cy="13.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const DnaPainterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M5 2 C 9 4 9 8 5 10 C 1 12 1 16 5 18 M13 18 C 9 16 9 12 13 10 C 17 8 17 4 13 2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      transform="translate(0,-1) scale(0.95)"
      fill="none"
    />
  </svg>
);

const FamilyTreeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="3.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="4" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="9" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="14" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M9 5 V7 M4 11 V8.5 H14 V11 M9 7 V11.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ----------------------------------------------------------------------------

export default function ToolsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FCFF',
        fontFamily: 'var(--gl-font)',
      }}
    >
      <GenomelinkHeader />

      <div
        style={{
          maxWidth: 1312,
          margin: '0 auto',
          padding: '32px 64px 64px',
        }}
        className="tools-page-content"
      >
        {/* Title row + visual-only List/Tools tab */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 600,
                lineHeight: '36px',
                color: '#263856',
                fontFamily: 'var(--gl-font)',
              }}
            >
              DNA Matches
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#263856',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px',
                textTransform: 'uppercase',
                padding: '8px',
                borderRadius: 8,
                fontFamily: 'var(--gl-font)',
              }}
            >
              PRO
            </span>
          </div>

          {/* Visual-only List | Tools sub-pill */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'rgba(201, 214, 228, 0.6)',
              borderRadius: 16,
            }}
          >
            <span
              style={{
                padding: '6px 24px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#263856',
                fontFamily: 'var(--gl-font)',
                cursor: 'default',
              }}
            >
              List
            </span>
            <span
              style={{
                padding: '6px 24px',
                borderRadius: 12,
                background: '#FFFFFF',
                boxShadow: '0px 4px 5px rgba(74, 93, 128, 0.13)',
                fontSize: 14,
                fontWeight: 600,
                color: '#263856',
                fontFamily: 'var(--gl-font)',
                cursor: 'default',
              }}
            >
              Tools
            </span>
          </div>
        </div>

        {/* Card grid — flex-wrap so 3 fit at 1280, 2 below ~900, 1 on mobile */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'flex-start',
          }}
        >
          <ToolCard
            title="Network Graph"
            description="Explore how your DNA matches connect to each other. Reveal hidden relationships and see your genetic network as a whole."
            icon={<NetworkGraphIcon />}
            buttonLabel="Open network"
            href="#"
          />
          <ToolCard
            title="Clusters"
            description="Group your matches by genetic similarity. Identify which matches belong together across family lines."
            icon={<ClustersIcon />}
            buttonLabel="View clusters"
            href="#"
          />
          <ToolCard
            title="Match Hub"
            description="Unified cross-vendor DNA match inbox. Detect and merge the same person across 23andMe, Ancestry, FTDNA, MyHeritage, and GEDmatch."
            icon={<MatchHubIcon />}
            buttonLabel="View Hub"
            href="/match-hub"
          />
          <ToolCard
            title="DNA Painter"
            description="View your DNA matches on a chromosome map to identify shared genome segments with relatives and their parental origin."
            icon={<DnaPainterIcon />}
            comingSoon
          />
          <ToolCard
            title="Family Tree"
            description="You'll be able to link DNA matches directly to individuals in your family tree. This feature will help you verify relationships and build a clearer picture of your family history."
            icon={<FamilyTreeIcon />}
            comingSoon
          />
        </div>

        <style jsx>{`
          @media (max-width: 900px) {
            :global(.tools-page-content) {
              padding: 24px 16px 48px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
