'use client';
import React from 'react';

interface GLSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function GLSelect({ label, className = '', id, children, ...props }: GLSelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const select = (
    <select id={selectId} className={`gl-select ${className}`.trim()} {...props}>
      {children}
    </select>
  );

  if (label) {
    return (
      <label className="gl-label" htmlFor={selectId}>
        {label}
        {select}
      </label>
    );
  }

  return select;
}
