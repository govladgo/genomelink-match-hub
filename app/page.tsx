'use client';

import { useState, useMemo, useEffect } from 'react';
// 23andMe Migration feature hidden — re-enable by uncommenting below + the
// <Link>...</Link> block in the header further down + restoring the body of
// app/migrate/page.tsx
// import Link from 'next/link';
import { DNAMatch } from '@/data/types';
import { useDeduplication } from '@/hooks/useDeduplication';
import { VendorFilterBar } from '@/components/hub/VendorFilterBar';
import { MatchRow } from '@/components/hub/MatchRow';
import { DuplicateGroupCard } from '@/components/hub/DuplicateGroupCard';
import { UserSwitcher } from '@/components/UserSwitcher';
import {
  loadUserIndex, loadUserDataset,
  getSelectedUserIdFromUrl, setSelectedUserIdInUrl,
} from '@/data/adapters/realData';

const ALL_VENDORS: DNAMatch['source'][] = [
  '23andme', 'ancestry', 'ftdna', 'myheritage', 'gedmatch',
];

type Tab = 'inbox' | 'duplicates';

interface IndexEntry {
  id: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  primaryPopulation: string;
  matchCount: number;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [selectedVendors, setSelectedVendors] = useState<Set<DNAMatch['source']>>(
    new Set(ALL_VENDORS)
  );

  // User selection + data loading
  const [userIndex, setUserIndex] = useState<IndexEntry[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('user-1');
  const [matches, setMatches] = useState<DNAMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load index on mount, then load the active user's data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const index = await loadUserIndex();
        if (cancelled) return;
        setUserIndex(index);
        const initialId = getSelectedUserIdFromUrl();
        const validId = index.find((u) => u.id === initialId) ? initialId : index[0]?.id;
        if (validId) {
          setActiveUserId(validId);
          const ds = await loadUserDataset(validId);
          if (!cancelled) {
            setMatches(ds.matches);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSelectUser = async (userId: string) => {
    setLoading(true);
    setActiveUserId(userId);
    setSelectedUserIdInUrl(userId);
    try {
      const ds = await loadUserDataset(userId);
      setMatches(ds.matches);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const {
    groups, mergedGroupIds, rejectedGroupIds, mergedAwayMatchIds,
    pendingGroups, highConfidenceCount,
    merge, unmerge, reject, mergeAllHighConfidence, reset,
  } = useDeduplication(matches);

  const vendorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < matches.length; i++) {
      counts[matches[i].source] = (counts[matches[i].source] || 0) + 1;
    }
    return counts;
  }, [matches]);

  // Inbox: all matches except those merged into another (the secondary entries of merged groups)
  const inboxMatches = useMemo(() => {
    return matches.filter(m =>
      selectedVendors.has(m.source) && !mergedAwayMatchIds.has(m.id)
    );
  }, [matches, selectedVendors, mergedAwayMatchIds]);

  const toggleVendor = (vendor: DNAMatch['source']) => {
    setSelectedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendor)) {
        next.delete(vendor);
      } else {
        next.add(vendor);
      }
      return next;
    });
  };

  const allGroupsForReview = pendingGroups.concat(
    groups.filter(g => mergedGroupIds.has(g.id))
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gl-color-bg)',
      fontFamily: 'var(--gl-font)',
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--gl-color-surface)',
        borderBottom: '1px solid var(--gl-color-border-light)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--gl-color-primary-dark)' }}>
              Match Hub
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gl-color-text-muted)', margin: '2px 0 0' }}>
              Unified cross-vendor DNA match inbox
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {userIndex.length > 0 && (
              <UserSwitcher
                users={userIndex}
                activeId={activeUserId}
                onSelect={handleSelectUser}
              />
            )}
            {/* 23andMe Migration link hidden for now. To re-enable:
              1. Uncomment the `import Link from 'next/link'` at the top
              2. Uncomment this block
              3. Restore the body of app/migrate/page.tsx
            <Link
              href="/migrate"
              className="gl-btn gl-btn--secondary"
              style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}
            >
              23andMe Migration →
            </Link>
            */}
            <span style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(69, 130, 201, 0.1)',
              color: 'var(--gl-color-secondary)',
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            }}>
              BETA
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
        {loading && (
          <div style={{
            padding: 32, textAlign: 'center',
            background: 'var(--gl-color-surface)',
            borderRadius: 12,
            boxShadow: 'var(--gl-shadow-sm)',
            marginBottom: 20,
            fontSize: 13, color: 'var(--gl-color-text-muted)',
          }}>
            Loading matches…
          </div>
        )}
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={statCard}>
            <div style={statValue}>{matches.length.toLocaleString()}</div>
            <div style={statLabel}>Total entries</div>
          </div>
          <div style={statCard}>
            <div style={{ ...statValue, color: 'var(--gl-color-secondary)' }}>{Object.keys(vendorCounts).length}</div>
            <div style={statLabel}>Vendors</div>
          </div>
          <div style={statCard}>
            <div style={{ ...statValue, color: 'var(--gl-color-primary-attention)' }}>{groups.length}</div>
            <div style={statLabel}>Duplicate groups</div>
          </div>
          <div style={statCard}>
            <div style={{ ...statValue, color: 'var(--gl-color-positive)' }}>{mergedGroupIds.size}</div>
            <div style={statLabel}>Merged</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: 20,
          background: 'var(--gl-color-surface)',
          borderRadius: 10,
          padding: 4,
          boxShadow: 'var(--gl-shadow-sm)',
          width: 'fit-content',
        }}>
          <button
            onClick={() => setActiveTab('inbox')}
            style={tabButton(activeTab === 'inbox')}
          >
            Unified Inbox ({inboxMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            style={tabButton(activeTab === 'duplicates')}
          >
            Duplicates ({pendingGroups.length}{pendingGroups.length > 0 && highConfidenceCount > 0 ? ` · ${highConfidenceCount} high-confidence` : ''})
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'inbox' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <VendorFilterBar
                vendorCounts={vendorCounts}
                selectedVendors={selectedVendors}
                onToggle={toggleVendor}
              />
            </div>

            <div style={{
              background: 'var(--gl-color-surface)',
              borderRadius: 12,
              padding: 8,
              boxShadow: 'var(--gl-shadow-sm)',
            }}>
              {inboxMatches.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--gl-color-text-muted)', fontSize: 13 }}>
                  No matches in the selected vendors.
                </div>
              ) : (
                inboxMatches.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      borderBottom: i < inboxMatches.length - 1 ? '1px solid var(--gl-color-border-light)' : 'none',
                    }}
                  >
                    <MatchRow match={m} />
                  </div>
                ))
              )}
            </div>

            {mergedAwayMatchIds.size > 0 && (
              <p style={{
                fontSize: 11, color: 'var(--gl-color-text-muted)',
                marginTop: 12, textAlign: 'center',
              }}>
                {mergedAwayMatchIds.size} duplicate {mergedAwayMatchIds.size === 1 ? 'entry' : 'entries'} hidden — they&apos;re merged into the matches above.
              </p>
            )}
          </>
        ) : (
          <>
            {/* Duplicates header + bulk actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
              padding: '12px 16px',
              background: 'var(--gl-color-surface)',
              borderRadius: 10,
              boxShadow: 'var(--gl-shadow-sm)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gl-color-primary-dark)' }}>
                  Detected duplicates
                </div>
                <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', marginTop: 2 }}>
                  Same person across multiple vendors. Review and merge to deduplicate your inbox.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {highConfidenceCount > 0 && (
                  <button
                    onClick={mergeAllHighConfidence}
                    className="gl-btn gl-btn--primary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Merge {highConfidenceCount} high-confidence
                  </button>
                )}
                {(mergedGroupIds.size > 0 || rejectedGroupIds.size > 0) && (
                  <button
                    onClick={reset}
                    className="gl-btn gl-btn--secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allGroupsForReview.length === 0 ? (
                <div style={{
                  background: 'var(--gl-color-surface)',
                  borderRadius: 10,
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--gl-color-text-muted)',
                  fontSize: 13,
                }}>
                  {groups.length === 0
                    ? 'No duplicates detected across your matches.'
                    : 'All duplicate groups have been resolved.'}
                </div>
              ) : (
                allGroupsForReview.map(g => (
                  <DuplicateGroupCard
                    key={g.id}
                    group={g}
                    matches={matches}
                    isMerged={mergedGroupIds.has(g.id)}
                    onMerge={merge}
                    onUnmerge={unmerge}
                    onReject={reject}
                  />
                ))
              )}

              {rejectedGroupIds.size > 0 && (
                <p style={{
                  fontSize: 11, color: 'var(--gl-color-text-muted)',
                  textAlign: 'center', marginTop: 8,
                }}>
                  {rejectedGroupIds.size} group{rejectedGroupIds.size !== 1 ? 's' : ''} marked &quot;not a duplicate&quot;.
                </p>
              )}
            </div>
          </>
        )}

        {/* Synthetic data disclaimer */}
        <p style={{
          marginTop: 32, padding: '8px 12px',
          textAlign: 'center', fontSize: 10, color: 'var(--gl-color-text-muted)',
          background: 'rgba(255, 124, 17, 0.04)',
          border: '1px solid rgba(255, 124, 17, 0.15)',
          borderRadius: 6,
        }}>
          Demo: real DNA-pair data; names, ancestry, and vendor assignments are synthesized.
        </p>
      </div>
    </div>
  );
}

const statCard: React.CSSProperties = {
  flex: 1,
  minWidth: 110,
  padding: '10px 14px',
  borderRadius: 10,
  background: 'var(--gl-color-surface)',
  boxShadow: 'var(--gl-shadow-sm)',
  textAlign: 'center',
};
const statValue: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--gl-color-primary-dark)',
};
const statLabel: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--gl-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginTop: 2,
};

function tabButton(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    border: 'none',
    background: active ? 'var(--gl-color-primary-dark)' : 'transparent',
    color: active ? '#fff' : 'var(--gl-color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };
}
