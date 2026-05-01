'use client';
import React from 'react';

interface GLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function GLInput({ label, className = '', id, ...props }: GLInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const input = (
    <input id={inputId} className={`gl-input ${className}`.trim()} {...props} />
  );

  if (label) {
    return (
      <label className="gl-label" htmlFor={inputId}>
        {label}
        {input}
      </label>
    );
  }

  return input;
}
