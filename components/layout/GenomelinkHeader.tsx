'use client';

/**
 * Visual-only top header bar matching the Genomelink production app shell.
 * Figma reference: 11364:6865 (HeaderOld) — the version used by the May 7
 * Tools / Match Hub screens (12291:4738, 12292:21156).
 *
 * Nothing here is functional — links don't navigate, dropdowns don't open.
 */

interface NavItem {
  label: string;
  /** Render an orange notification dot to the right of the label. */
  notify?: boolean;
  /** Render a chevron-down to indicate a dropdown. */
  hasMenu?: boolean;
  /** Show the active-page underline. */
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'HOME',      active: true },
  { label: 'TRAITS',    hasMenu: true, notify: true },
  { label: 'REPORTS' },
  { label: 'GENEALOGY', hasMenu: true, notify: true },
  { label: 'BONUS' },
];

export function GenomelinkHeader() {
  return (
    <header
      style={{
        background: '#F9FCFF',
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 64px',
        fontFamily: 'var(--gl-font)',
      }}
      className="gl-top-header"
    >
      {/* Logo + primary nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 60, flex: 1, minWidth: 0 }}>
        <GenomelinkLogo />

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="gl-top-nav">
          {NAV_ITEMS.map((item) => (
            <NavMenuItem key={item.label} item={item} />
          ))}
        </nav>
      </div>

      {/* Right side — upgrade copy + button + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <span
          className="gl-top-upgrade-text"
          style={{
            fontSize: 14,
            lineHeight: '20px',
            color: '#8FABCF',
            textAlign: 'right',
          }}
        >
          Upgrade to unlock <strong style={{ color: '#8FABCF', fontWeight: 600 }}>312+</strong> traits
        </span>
        <button
          style={{
            width: 127,
            padding: '8px 16px',
            borderRadius: 32,
            background: '#FF7C11',
            border: '1px solid transparent',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '16px',
            textTransform: 'uppercase',
            cursor: 'default',
            fontFamily: 'var(--gl-font)',
          }}
        >
          Upgrade
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #6786AC 0%, #FF7C11 100%)',
              flexShrink: 0,
              border: '1px solid rgba(38, 56, 86, 0.06)',
            }}
            aria-label="Profile avatar"
          />
          <Chevron20 />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.gl-top-nav) {
            gap: 12px !important;
          }
          :global(.gl-top-upgrade-text) {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          :global(.gl-top-header) {
            padding: 0 16px !important;
            height: 64px !important;
          }
          :global(.gl-top-nav) {
            display: none !important;
          }
        }
        /* On phones the wordmark would overflow the viewport; show just the X
           mark next to UPGRADE + avatar. Production app does the same. */
        @media (max-width: 600px) {
          :global(.gl-logo-wordmark) {
            display: none !important;
          }
          :global(.gl-logo-x) {
            width: 32px !important;
            height: 40px !important;
          }
        }
      `}</style>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Nav item with notification dot + chevron + active underline
// ---------------------------------------------------------------------------

function NavMenuItem({ item }: { item: NavItem }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            color: '#263856',
            cursor: 'default',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </span>
        {item.active && (
          <span
            style={{
              marginTop: 1,
              width: '100%',
              height: 2,
              background: '#263856',
              borderRadius: 1,
            }}
          />
        )}
      </div>
      {item.notify && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#FF7C11',
            alignSelf: 'flex-start',
            marginTop: 2,
          }}
          aria-hidden="true"
        />
      )}
      {item.hasMenu && <Chevron20 />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 20×20 chevron-down used by nav items + user avatar
// ---------------------------------------------------------------------------

function Chevron20() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 8L10 12L14 8"
        stroke="#263856"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Genomelink wordmark — colorful "X" mark + "Genomelink" text
// (visual-only approximation of the production logo)
// ---------------------------------------------------------------------------

// Production wordmark from Figma node 8643:23378 — colorful "X" mark + the
// "Genomelink" wordmark, both shipped as SVGs in /public/brand. Sized to match
// the Figma frame: total 206×46, X mark ≈36×46, gap 8, wordmark ≈160×22.
function GenomelinkLogo() {
  return (
    <div
      aria-label="Genomelink"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        height: 46,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/genomelink-x.svg"
        alt=""
        width={36}
        height={46}
        style={{ display: 'block', flexShrink: 0 }}
        className="gl-logo-x"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/genomelink-wordmark.svg"
        alt="Genomelink"
        width={160}
        height={22}
        style={{ display: 'block', flexShrink: 0 }}
        className="gl-logo-wordmark"
      />
    </div>
  );
}
