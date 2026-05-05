'use client';

import { DNAMatch } from '@/data/types';

const VENDORS: DNAMatch['source'][] = ['23andme', 'ancestry', 'ftdna', 'myheritage', 'gedmatch'];

const LABELS: Record<DNAMatch['source'], string> = {
  '23andme': '23andMe',
  ancestry: 'Ancestry',
  ftdna: 'FTDNA',
  myheritage: 'MyHeritage',
  gedmatch: 'GEDmatch',
  manual: 'Manual',
  other: 'Other',
};

// Figma brand colors per vendor (DNA-Match-Tools / Status Label):
//   23andMe   #d50f67  (Figma node 12177:8870)
//   Ancestry  #9cbe30  (Figma node 12177:8871)
//   MyHeritage #e56c30 (Figma node 12177:8872)
// FTDNA + GEDmatch aren't in the published Figma palette yet — using each
// vendor's actual brand color as a placeholder. Override here when design
// publishes them.
const VENDOR_COLORS: Record<DNAMatch['source'], string> = {
  '23andme': '#d50f67',
  ancestry: '#9cbe30',
  myheritage: '#e56c30',
  ftdna: '#003D7A',     // FTDNA brand navy (placeholder until Figma publishes)
  gedmatch: '#F2A03D',  // GEDmatch brand gold (placeholder until Figma publishes)
  manual: '#6786AC',
  other: '#6786AC',
};

interface VendorFilterBarProps {
  vendorCounts: Record<string, number>;
  selectedVendors: Set<DNAMatch['source']>;
  onToggle: (vendor: DNAMatch['source']) => void;
}

export function VendorFilterBar({ vendorCounts, selectedVendors, onToggle }: VendorFilterBarProps) {
  return (
    <div className="vendor-filter-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {VENDORS.map(v => {
        const count = vendorCounts[v] || 0;
        const isActive = selectedVendors.has(v);
        const brandColor = VENDOR_COLORS[v];
        return (
          <button
            key={v}
            onClick={() => onToggle(v)}
            className={`vendor-chip${isActive ? ' vendor-chip--active' : ''}`}
            style={{
              // Figma tokens (Status Label 12177:8870–72 desktop, 12183:12392–94 mobile):
              //   active   = bg rgba(201,214,228,0.3), no border
              //   inactive = bg #FFFFFF, 1px border #C9D6E4
              //   common   = padding 4/16, radius 6, semibold 600
              //   font     = 12/16 desktop, 14/20 mobile
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 16px',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 600,
              fontFamily: 'var(--gl-font)',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              background: isActive ? 'rgba(201, 214, 228, 0.3)' : '#FFFFFF',
              color: brandColor,
              border: isActive ? '1px solid transparent' : '1px solid #C9D6E4',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{LABELS[v]}</span>
            {count > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  // Same brand color, slightly muted via opacity so the count
                  // reads as secondary info rather than competing with the label.
                  opacity: 0.75,
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* Mobile: bump font size per Figma (14/20 vs 12/16 desktop) */}
      <style jsx>{`
        @media (max-width: 600px) {
          :global(.vendor-chip) {
            font-size: 14px !important;
            line-height: 20px !important;
          }
          :global(.vendor-chip > span:last-child) {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
