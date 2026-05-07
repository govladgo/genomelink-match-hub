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

const POPULATION_LABELS: Record<string, string> = {
  eastern_european: 'Eastern European',
  ashkenazi_jewish: 'Ashkenazi Jewish',
  british_irish: 'British & Irish',
  iberian_latam: 'Iberian / LatAm',
  germanic: 'Germanic Europe',
  scandinavian: 'Scandinavian',
  sub_saharan: 'Sub-Saharan African',
  east_asian: 'East Asian',
};

// Synthetic kit-id for the Figma-style "{vendor} | Kit: XX-XXXXXX" subtitle.
function syntheticKitId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  const yy = (24 + (Math.abs(hash) % 3)).toString();
  return `${yy}-${hex}`;
}

export default function MatchHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('duplicates');

  const [userIndex, setUserIndex] = useState<IndexEntry[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('user-1');
  const [matches, setMatches] = useState<DNAMatch[]>([]);
  const [loading, setLoading] = useState(true);

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
    groups, mergedMatchIds,
    pendingGroups, assessedGroups,
    matchDecisionState,
    mergeMatch, rejectMatch, undoDecision,
  } = useDeduplication(matches);

  const vendorCount = useMemo(() => {
    const set: Record<string, true> = {};
    for (let i = 0; i < matches.length; i++) set[matches[i].source] = true;
    return Object.keys(set).length;
  }, [matches]);

  const visibleGroups = activeTab === 'duplicates' ? pendingGroups : assessedGroups;

  const activeUser = userIndex.find((u) => u.id === activeUserId) || userIndex[0];
  const populationLabel = activeUser
    ? (POPULATION_LABELS[activeUser.primaryPopulation] || activeUser.primaryPopulation)
    : '';
  const kitId = activeUser ? syntheticKitId(activeUser.id) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F9FCFF', fontFamily: 'var(--gl-font)' }}>
      <GenomelinkHeader />
      <MatchHubSubHeader />

      <div
        style={{ maxWidth: 1312, margin: '0 auto', padding: '24px 64px 64px' }}
        className="match-hub-content"
      >
        {/* Top row: user identity (left) · stats (right) — Figma 12292:21168 */}
        <div
          className="match-hub-top-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 24,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          {activeUser && (
            <div className="match-hub-identity" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 320px', minWidth: 0 }}>
              <div className="match-hub-identity-row" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 600,
                    lineHeight: '28px',
                    color: '#263856',
                    fontFamily: 'var(--gl-font)',
                  }}
                >
                  {activeUser.displayName}
                </h2>
                {userIndex.length > 1 && (
                  <UserSwitcher
                    users={userIndex}
                    activeId={activeUserId}
                    onSelect={handleSelectUser}
                  />
                )}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#6786AC',
                  fontFamily: 'var(--gl-font)',
                }}
              >
                {populationLabel} | Kit: {kitId}
              </p>
            </div>
          )}

          <div className="match-hub-stats" style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <StatCard value={matches.length.toLocaleString()} label="Total entries" />
            <StatCard value={vendorCount.toString()} label="Vendors" />
            <StatCard value={groups.length.toString()} label="Duplicates" />
            <StatCard value={mergedMatchIds.size.toString()} label="Merged" />
          </div>
        </div>

        {/* Loading hint */}
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

        {/* Section row: "Duplicate Matches" h2 left + tab pill right — Figma 12292:21204 */}
        <div
          className="match-hub-section-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              lineHeight: '28px',
              color: '#263856',
              fontFamily: 'var(--gl-font)',
            }}
          >
            Duplicate Matches
          </h3>

          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'rgba(201, 214, 228, 0.6)',
              borderRadius: 16,
              flexShrink: 0,
            }}
          >
            <TabPill
              active={activeTab === 'duplicates'}
              onClick={() => setActiveTab('duplicates')}
              icon={<CopyIcon />}
              label={`Duplicates${pendingGroups.length > 0 ? ` (${pendingGroups.length})` : ''}`}
            />
            <TabPill
              active={activeTab === 'assessed'}
              onClick={() => setActiveTab('assessed')}
              icon={<CheckCircleIcon />}
              label={`Assessed${assessedGroups.length > 0 ? ` (${assessedGroups.length})` : ''}`}
            />
          </div>
        </div>

        {/* Group list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleGroups.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(201, 214, 228, 0.6)',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                color: '#6786AC',
                fontSize: 14,
                lineHeight: '20px',
                fontFamily: 'var(--gl-font)',
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

        <style jsx>{`
          @media (max-width: 900px) {
            :global(.match-hub-content) {
              padding: 16px !important;
              max-width: 100% !important;
            }
            :global(.match-hub-top-row) {
              flex-direction: column !important;
              gap: 16px !important;
              margin-bottom: 20px !important;
            }
            :global(.match-hub-identity) {
              width: 100%;
              flex: 1 1 100% !important;
            }
            :global(.match-hub-identity-row) {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 8px !important;
            }
            :global(.match-hub-stats) {
              width: 100%;
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 8px !important;
            }
            :global(.match-hub-stats > div) {
              width: auto !important;
            }
            :global(.match-hub-section-row) {
              gap: 12px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// ============================================================================
// Stat card (Figma 12292:21174)
// ============================================================================

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: 'rgba(201, 214, 228, 0.20)',
        borderRadius: 12,
        padding: '8px 6px',
        width: 112,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        textAlign: 'center',
        fontFamily: 'var(--gl-font)',
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: '28px',
          color: '#263856',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '16px',
          color: '#6786AC',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// Tab pill (Figma 12292:22588 — gray-60 track, white active card with shadow)
// ============================================================================

function TabPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '6px 24px',
        borderRadius: 12,
        background: active ? '#FFFFFF' : 'transparent',
        border: 'none',
        boxShadow: active ? '0px 4px 5px rgba(74, 93, 128, 0.13)' : 'none',
        cursor: 'pointer',
        fontFamily: 'var(--gl-font)',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '20px',
        color: '#263856',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      <span
        style={{
          width: 18, height: 18,
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
    </button>
  );
}

// ----- Tab icons --------------------------------------------------------------

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="6" y="6" width="9" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6V5a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 3 5v6A1.5 1.5 0 0 0 4.5 12.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 9.2L8 11L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
