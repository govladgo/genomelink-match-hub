'use client';
import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GLTabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'line';
  fullWidth?: boolean;
}

export function GLTabs({ items, activeId, onChange, variant = 'pill', fullWidth }: GLTabsProps) {
  const base = variant === 'pill' ? 'gl-pill-tabs' : 'gl-line-tabs';
  const tabClass = `${base}__tab`;
  const activeClass = `${tabClass}--active`;

  return (
    <div className={`${base}${fullWidth ? ` ${base}--full` : ''}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${tabClass}${item.id === activeId ? ` ${activeClass}` : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.icon && <span style={{ marginRight: 6, display: 'inline-flex' }}>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
