'use client';

import { useState, useRef, useEffect } from 'react';

interface IndexEntry {
  id: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  primaryPopulation: string;
  matchCount: number;
}

interface UserSwitcherProps {
  users: IndexEntry[];
  activeId: string;
  onSelect: (userId: string) => void;
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

export function UserSwitcher({ users, activeId, onSelect }: UserSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside to close
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const active = users.find((u) => u.id === activeId) || users[0];
  if (!active) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px 6px 6px',
          borderRadius: 8,
          border: '1px solid var(--gl-color-border-light)',
          background: 'var(--gl-color-surface)',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--gl-color-text-secondary)',
          transition: 'all 0.15s',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: active.avatarColor,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {active.initials}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <span style={{ fontSize: 10, color: 'var(--gl-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demo user
          </span>
          <span style={{ fontWeight: 600, color: 'var(--gl-color-primary-dark)' }}>
            {active.displayName}
          </span>
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            marginLeft: 4,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 280,
            maxHeight: 480,
            overflowY: 'auto',
            background: 'var(--gl-color-surface)',
            border: '1px solid var(--gl-color-border-light)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            padding: 4,
          }}
        >
          <div
            style={{
              padding: '8px 12px 4px',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--gl-color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Switch demo user (synthetic data)
          </div>
          {users.map((u) => {
            const isActive = u.id === activeId;
            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelect(u.id);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: isActive ? 'rgba(38, 56, 86, 0.06)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--gl-color-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: u.avatarColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {u.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gl-color-primary-dark)' }}>
                    {u.displayName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)' }}>
                    {POPULATION_LABELS[u.primaryPopulation] || u.primaryPopulation} ·{' '}
                    {u.matchCount.toLocaleString()} matches
                  </div>
                </div>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="var(--gl-color-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
