import { DNAMatch } from '@/data/types';

const VENDOR_LABELS: Record<DNAMatch['source'], string> = {
  '23andme': '23andMe',
  ancestry: 'Ancestry',
  ftdna: 'FTDNA',
  myheritage: 'MyHeritage',
  gedmatch: 'GedMatch',
  manual: 'Manual',
  other: 'Other',
};

interface VendorPillProps {
  vendor: DNAMatch['source'];
  size?: 'sm' | 'md';
  /** "outlined" matches Figma in-row provider chip (white bg, gray border). */
  variant?: 'tinted' | 'outlined';
}

export function VendorPill({ vendor, size = 'md', variant = 'tinted' }: VendorPillProps) {
  return (
    <span
      className={`vendor-pill vendor-pill--${vendor}${variant === 'outlined' ? ' vendor-pill--outlined' : ''}`}
      style={size === 'sm' ? { fontSize: 10, padding: '2px 6px', lineHeight: '14px' } : undefined}
    >
      {VENDOR_LABELS[vendor]}
    </span>
  );
}
