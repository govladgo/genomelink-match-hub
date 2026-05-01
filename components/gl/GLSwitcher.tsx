'use client';
import React from 'react';

interface GLSwitcherProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function GLSwitcher({ checked, onChange, label, disabled }: GLSwitcherProps) {
  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: 40,
    height: 22,
    borderRadius: 11,
    background: checked ? '#4f46e5' : '#ccc',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 0.2s',
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    left: checked ? 20 : 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  return (
    <label
      className="gl-switcher"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <span
        className="gl-switcher__track"
        style={trackStyle}
        onClick={() => { if (!disabled) onChange(!checked); }}
      >
        <span className="gl-switcher__thumb" style={thumbStyle} />
      </span>
      {label && <span className="gl-switcher__label">{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => { if (!disabled) onChange(e.target.checked); }}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </label>
  );
}
