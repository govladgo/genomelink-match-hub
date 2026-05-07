'use client';

/**
 * DNA Matches PRO — tools selector page.
 *
 * Six tool cards. Only the Match Hub card actually navigates; the others
 * (Network Graph, Clusters, Common Ancestor cM, DNA Painter, Family Tree)
 * are visual-only placeholders.
 *
 * Figma references:
 *   12291:4738 (desktop) — 3-col grid at 1312, gap 32
 *   12291:4764 (mobile)  — single column, cards 335 wide
 *   12291:4756 (List|Tools sub-pill)
 *   12291:4760-4763, 12291:5360, 12291:5377 (individual card variants)
 */

import { GenomelinkHeader } from '@/components/layout/GenomelinkHeader';
import { ToolCard } from '@/components/tools/ToolCard';

// ----------------------------------------------------------------------------
// Tool icons (lucide-style 18×18 stroke 1.5, currentColor)
// ----------------------------------------------------------------------------

// dataflow-02 — three nodes (top, bottom-left, bottom-right) connected
const NetworkGraphIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="6" y="1.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1.5" y="12.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10.5" y="12.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 5.5V9 M4.5 12.5V11a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// dataflow-03 — single top node + three bottom nodes
const ClustersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="6" y="1.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="0.75" y="12.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6.5" y="12.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="12.25" y="12.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M9 5.5V9 M3.25 12.5V10.5a1 1 0 0 1 1-1h9.5a1 1 0 0 1 1 1v2 M9 9.5v3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// users-01 — primary user + secondary user (lucide)
const MatchHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="7" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M2.25 15.75c0-2.62 2.13-4.75 4.75-4.75s4.75 2.13 4.75 4.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 6.75a2 2 0 1 0 0-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13.5 15.75H16c0-2.07-1.43-3.81-3.36-4.32"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// link-04 — vertical chain link
const CommonAncestorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M11.25 6.75a2.5 2.5 0 0 1 0 3.54l-2.12 2.12a2.5 2.5 0 1 1-3.54-3.54l.7-.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.75 11.25a2.5 2.5 0 0 1 0-3.54l2.12-2.12a2.5 2.5 0 1 1 3.54 3.54l-.7.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// hugeicons:dna-01 — DNA helix
const DnaPainterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M5 1.5c0 3.5 8 4.5 8 8s-8 4.5-8 8 M13 1.5c0 3.5-8 4.5-8 8s8 4.5 8 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M6.5 4h5 M5.7 6.5h6.6 M5.7 11.5h6.6 M6.5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// dataflow-01 — three nodes vertically stacked with branching tree
const FamilyTreeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="6" y="1.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1.5" y="12.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10.5" y="12.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M9 5.5V9 M4.5 12.5V11a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// list — three horizontal lines with leading dots (Figma 11842:23971)
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M6 4.5h9.5 M6 9h9.5 M6 13.5h9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="3" cy="4.5" r="1" fill="currentColor" />
    <circle cx="3" cy="9" r="1" fill="currentColor" />
    <circle cx="3" cy="13.5" r="1" fill="currentColor" />
  </svg>
);

// bar-chart-square-01 — bar chart inside rounded square
const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2.25" y="2.25" width="13.5" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 12V8 M9 12V6 M12 12v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
        {/* Title row + visual-only List/Tools tab — Figma 12291:4750 / 12291:4756 */}
        <div
          className="tools-title-row"
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
            {/* PRO badge: Figma 12291:4753 — w-66 p-8 gap-4 radius-8 */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 66,
                background: '#263856',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px',
                textTransform: 'uppercase',
                padding: 8,
                borderRadius: 8,
                fontFamily: 'var(--gl-font)',
              }}
            >
              PRO
            </span>
          </div>

          {/* Visual-only List | Tools sub-pill — Figma 12291:4756 */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'rgba(201, 214, 228, 0.6)',
              borderRadius: 16,
            }}
          >
            <ListToolsTab active={false} icon={<ListIcon />} label="List" />
            <ListToolsTab active={true} icon={<BarChartIcon />} label="Tools" />
          </div>
        </div>

        {/* Card grid — flex-wrap so 3 cols at 1312, 2 cols below, 1 on mobile */}
        <div
          className="tools-grid"
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
            title="Common Ancestor cM"
            description="Predict the most likely relationship behind a shared cM value, adjusted for population background, endogamy, and match context."
            icon={<CommonAncestorIcon />}
            comingSoon
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
          /* Tablet: cards become single column wider once below 3-col threshold */
          @media (max-width: 900px) {
            :global(.tools-page-content) {
              padding: 24px 20px 48px !important;
              max-width: 100% !important;
            }
            :global(.tools-grid) {
              gap: 16px !important;
              flex-direction: column !important;
            }
            :global(.tools-grid > .tool-card) {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// ============================================================================
// List|Tools tab pill (Figma 12291:4757 / 12291:4758)
// ============================================================================

function ListToolsTab({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '6px 24px',
        borderRadius: 12,
        background: active ? '#FFFFFF' : 'transparent',
        boxShadow: active ? '0px 4px 5px rgba(74, 93, 128, 0.13)' : 'none',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        color: '#263856',
        fontFamily: 'var(--gl-font)',
        cursor: 'default',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#263856',
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </span>
  );
}
