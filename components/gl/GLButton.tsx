'use client';
import React from 'react';

interface GLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-blue' | 'secondary' | 'success' | 'error' | 'link';
  size?: 'promo' | 'normal' | 'sm' | 'xs' | 'mobile';
  icon?: boolean;
  loading?: boolean;
}

export function GLButton({
  variant,
  size,
  icon,
  loading,
  className = '',
  children,
  disabled,
  ...props
}: GLButtonProps) {
  const classes = [
    'gl-btn',
    variant && `gl-btn--${variant}`,
    size && `gl-btn--${size}`,
    icon && 'gl-btn--icon',
    loading && 'gl-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {children}
    </button>
  );
}
