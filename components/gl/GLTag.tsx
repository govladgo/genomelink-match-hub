'use client';
import React from 'react';

interface GLTagProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md';
}

export function GLTag({ children, color, variant = 'filled', size = 'md' }: GLTagProps) {
  const classes = [
    'gl-tag',
    `gl-tag--${variant}`,
    `gl-tag--${size}`,
  ].join(' ');

  const style: React.CSSProperties = color
    ? variant === 'filled'
      ? { backgroundColor: color, color: '#fff' }
      : { borderColor: color, color }
    : {};

  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
}
