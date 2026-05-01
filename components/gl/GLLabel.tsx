'use client';
import React from 'react';

interface GLLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export function GLLabel({ children, htmlFor }: GLLabelProps) {
  return (
    <label className="gl-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
