'use client';

import { useState, useMemo, useEffect } from 'react';
import { DNAMatch } from '@/data/types';
import { useDeduplication } from '@/hooks/useDeduplication';
import { DuplicateGroupCard } from '@/components/hub/DuplicateGroupCard';
import { UserSwitcher } from '@/components/UserSwitcher';
import { GenomelinkHeader } from '@/components/layout/GenomelinkHeader';
import { MatchHubSubHeader } from '@/components/layout/MatchHubSubHeader';
import {
  loadUserIndex, loadUserDataset,
  getSelectedUserIdFromUrl, setSelectedUserIdInUrl,
} from '@/data/adapters/realData';

type Tab = 'duplicates' | 'assessed';

interface IndexEntry {
  id: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  primaryPopulation: string;
  matchCount: number;
}

export default function MatchHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('duplicates');

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
    groups, mergedMatchIds, rejectedMatchIds,
    pendingGroups, assessedGroups, highConfidenceCount,
    matchDecisionState,
    mergeMatch, rejectMatch, undoDecision,
    mergeAllHighConfidence, reset,
  } = useDeduplication(matches);

  const vendorCount = useMemo(() => {
    const set: Record<string, true> = {};
    for (let i = 0; i < matches.length; i++) set[matches[i].source] = true;
    return Object.keys(set).length;
  }, [matches]);

  const visibleGroups = activeTab === 'duplicates' ? pendingGroups : assessedGroups;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FCFF', fontFamily: 'var(--gl-font)' }}>
      <GenomelinkHeader />
      <MatchHubSubHeader />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 64px 48px' }} className="match-hub-content">
        {/* User switcher row */}
        {userIndex.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <UserSwitcher
              users={userIndex}
              activeId={activeUserId}
              onSelect={handleSelectUser}
            />
          </div>
        )}

        {loading && (
          <div
            style={{
              padding: 32, textAlign: 'center',
              background: 'var(--gl-color-surface)',
              borderRadius: 12,
              boxShadow: 'var(--gl-shadow-sm)',
              marginBottom: 20,
              fontSize: 13, color: 'var(--gl-color-text-muted)',
            }}
          >
            Loading matches…
          </div>
        )}

        {/* Stats bar — Figma 11842:23945 (desktop) / 11842:23955 (mobile) */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={statCard}>
            <div style={statValue}>{matches.length.toLocaleString()}</div>
            <div style={statLabel}>Total entries</div>
          </div>
          <div style={statCard}>
            <div style={statValue}>{vendorCount}</div>
            <div style={statLabel}>Vendors</div>
          </div>
          <div style={statCard}>
            <div style={statValue}>{groups.length}</div>
            <div style={statLabel}>Duplicate groups</div>
          </div>
          <div style={statCard}>
            <div style={statValue}>{mergedMatchIds.size}</div>
            <div style={statLabel}>Merged</div>
          </div>
        </div>

        {/* Tab switcher — Duplicates vs Assessed */}
        <div
          className="tab-switcher"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 4,
            marginBottom: 20,
            background: 'rgba(201, 214, 228, 0.6)',
            borderRadius: 16,
            padding: 4,
            width: 'fit-content',
          }}
        >
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`tab-pill${activeTab === 'duplicates' ? ' tab-pill--active' : ''}`}
            style={tabButton(activeTab === 'duplicates')}
          >
            Duplicates ({pendingGroups.length}
            {pendingGroups.length > 0 && highConfidenceCount > 0 && (
              <span className="dup-suffix"> · {highConfidenceCount} high-confidence</span>
            )}
            )
          </button>
          <button
            onClick={() => setActiveTab('assessed')}
            className={`tab-pill${activeTab === 'assessed' ? ' tab-pill--active' : ''}`}
            style={tabButton(activeTab === 'assessed')}
          >
            Assessed ({assessedGroups.length})
          </button>
        </div>

        <style jsx>{`
          @media (max-width: 600px) {
            .tab-switcher {
              width: 100% !important;
            }
            .tab-pill {
              flex: 0 1 auto;
              min-width: 0;
            }
            .tab-pill--active {
              flex: 1 1 auto !important;
            }
            .dup-suffix {
              display: none;
            }
          }
          @media (max-width: 900px) {
            :global(.match-hub-content) {
              padding: 8px 16px 32px !important;
            }
          }
        `}</style>

        {/* Duplicates tab — pending review banner + bulk actions */}
        {activeTab === 'duplicates' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                padding: '12px 16px',
                background: '#FFFFFF',
                borderRadius: 10,
                boxShadow: 'var(--gl-shadow-sm)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#263856' }}>
                  Detected duplicates
                </div>
                <div style={{ fontSize: 11, color: '#6786AC', marginTop: 2 }}>
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
                {(mergedMatchIds.size > 0 || rejectedMatchIds.size > 0) && (
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
          </>
        )}

        {/* Group list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleGroups.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: 40,
                textAlign: 'center',
                color: '#6786AC',
                fontSize: 13,
              }}
            >
              {activeTab === 'duplicates'
                ? groups.length === 0
                  ? 'No duplicates detected across your matches.'
                  : 'All duplicate groups have been assessed. Switch to the Assessed tab to review them.'
                : 'No groups have been assessed yet. Decide each candidate in the Duplicates tab.'}
            </div>
          ) : (
            visibleGroups.map((g) => (
              <DuplicateGroupCard
                key={g.id}
                group={g}
                matches={matches}
                decisionState={matchDecisionState}
                onMergeMatch={mergeMatch}
                onRejectMatch={rejectMatch}
                onUndoDecision={undoDecision}
              />
            ))
          )}
        </div>

        {/* Synthetic-data disclaimer */}
        <p
          style={{
            marginTop: 32,
            padding: '8px 12px',
            textAlign: 'center',
            fontSize: 10,
            color: '#6786AC',
            background: 'rgba(255, 124, 17, 0.04)',
            border: '1px solid rgba(255, 124, 17, 0.15)',
            borderRadius: 6,
          }}
        >
          Demo: real DNA-pair data; names, ancestry, and vendor assignments are synthesized.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (Figma tokens preserved from the previous Match Hub version)
// ---------------------------------------------------------------------------

const statCard: React.CSSProperties = {
  flex: 1,
  minWidth: 112,
  padding: '8px 6px',
  borderRadius: 12,
  background: 'rgba(201, 214, 228, 0.2)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};
const statValue: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  lineHeight: '28px',
  color: '#263856',
  fontFamily: 'var(--gl-font)',
};
const statLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  color: '#6786AC',
  fontFamily: 'var(--gl-font)',
};

function tabButton(active: boolean): React.CSSProperties {
  return {
    padding: '6px 24px',
    border: 'none',
    background: active ? '#FFFFFF' : 'transparent',
    color: '#263856',
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background 0.15s, box-shadow 0.15s',
    boxShadow: active ? '0px 4px 5px rgba(74, 93, 128, 0.13)' : 'none',
    fontFamily: 'var(--gl-font)',
    whiteSpace: 'nowrap',
  };
}
