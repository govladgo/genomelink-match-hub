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

interface VendorFilterBarProps {
  vendorCounts: Record<string, number>;
  selectedVendors: Set<DNAMatch['source']>;
  onToggle: (vendor: DNAMatch['source']) => void;
}

export function VendorFilterBar({ vendorCounts, selectedVendors, onToggle }: VendorFilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {VENDORS.map(v => {
        const count = vendorCounts[v] || 0;
        const isActive = selectedVendors.has(v);
        return (
          <button
            key={v}
            onClick={() => onToggle(v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: isActive ? 'var(--gl-color-primary-dark)' : 'var(--gl-color-surface)',
              color: isActive ? '#fff' : 'var(--gl-color-text-secondary)',
              border: isActive ? '1px solid var(--gl-color-primary-dark)' : '1px solid var(--gl-color-border-light)',
            }}
          >
            {LABELS[v]}
            <span style={{
              padding: '0 6px',
              borderRadius: 10,
              background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--gl-color-bg)',
              fontSize: 10,
              fontWeight: 600,
              minWidth: 20,
              textAlign: 'center',
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
