'use client';

/**
 * Visual-only top header bar matching the Genomelink production app shell.
 * Figma reference: nodes 11842:* (header used in 11564:27120 tools screen).
 *
 * Nothing here is functional — links don't navigate, dropdowns don't open.
 * We only render the chrome so the prototype reads as a real page inside
 * the production app.
 */

const NAV_ITEMS = ['HOME', 'TRAITS', 'REPORTS', 'GENEALOGY', 'BONUS'];

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
        borderBottom: '1px solid rgba(201, 214, 228, 0.3)',
      }}
      className="gl-top-header"
    >
      {/* Logo placeholder — branded square with monogram */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 120,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
          aria-label="Genomelink"
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--gl-color-secondary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            GL
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#263856',
              letterSpacing: '-0.01em',
            }}
          >
            Genomelink
          </span>
        </div>

        {/* Primary nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="gl-top-nav">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: '#263856',
                cursor: 'default',
                position: 'relative',
              }}
            >
              {item}
              {item === 'GENEALOGY' && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--gl-color-primary-attention)',
                    marginLeft: 4,
                    verticalAlign: 'top',
                    marginTop: 2,
                  }}
                />
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 14,
            color: '#8FABCF',
            textAlign: 'right',
          }}
          className="gl-top-upgrade-text"
        >
          Upgrade to unlock <strong style={{ color: '#8FABCF' }}>200+</strong> traits
        </span>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 32,
            background: 'var(--gl-color-primary-attention)',
            border: 'none',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'uppercase',
            cursor: 'default',
            fontFamily: 'var(--gl-font)',
          }}
        >
          Upgrade
        </button>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--gl-color-secondary) 0%, var(--gl-color-primary-attention) 100%)',
            flexShrink: 0,
          }}
          aria-label="Profile avatar"
        />
      </div>

      {/* Hide nav text + upgrade copy on small screens — keep avatar + upgrade button */}
      <style jsx>{`
        @media (max-width: 900px) {
          :global(.gl-top-header) {
            padding: 0 16px !important;
          }
          :global(.gl-top-nav) {
            display: none !important;
          }
          :global(.gl-top-upgrade-text) {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
