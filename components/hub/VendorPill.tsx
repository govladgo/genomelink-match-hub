import { DNAMatch } from '@/data/types';

const VENDOR_LABELS: Record<DNAMatch['source'], string> = {
  '23andme': '23andMe',
  ancestry: 'Ancestry',
  ftdna: 'FTDNA',
  myheritage: 'MyHeritage',
  gedmatch: 'GEDmatch',
  manual: 'Manual',
  other: 'Other',
};

interface VendorPillProps {
  vendor: DNAMatch['source'];
  size?: 'sm' | 'md';
}

export function VendorPill({ vendor, size = 'md' }: VendorPillProps) {
  return (
    <span
      className={`vendor-pill vendor-pill--${vendor}`}
      style={size === 'sm' ? { fontSize: 10, padding: '1px 6px' } : undefined}
    >
      {VENDOR_LABELS[vendor]}
    </span>
  );
}
