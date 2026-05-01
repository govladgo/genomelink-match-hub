import { DNAMatch } from '@/data/types';
import { VendorPill } from './VendorPill';

interface MatchRowProps {
  match: DNAMatch;
  compact?: boolean;
}

export function MatchRow({ match, compact = false }: MatchRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: compact ? '6px 0' : '10px 12px',
      borderRadius: compact ? 0 : 8,
    }}>
      <span style={{
        width: compact ? 32 : 36,
        height: compact ? 32 : 36,
        borderRadius: '50%',
        background: match.avatarColor,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
        flexShrink: 0,
      }}>
        {match.initials}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 600,
            color: 'var(--gl-color-primary-dark)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {match.name}
          </span>
          <VendorPill vendor={match.source} size={compact ? 'sm' : 'md'} />
          {match.lineage && match.lineage !== 'unassigned' && (
            <span style={{
              padding: '1px 6px',
              borderRadius: 4,
              background: match.lineage === 'maternal' ? 'rgba(155, 89, 182, 0.1)' : 'rgba(69, 130, 201, 0.1)',
              color: match.lineage === 'maternal' ? '#7D3C98' : '#245FA4',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {match.lineage}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', marginTop: 2 }}>
          {match.sharedCM} cM · {match.segments.length} seg · {match.relationship}
        </div>
      </div>
    </div>
  );
}
