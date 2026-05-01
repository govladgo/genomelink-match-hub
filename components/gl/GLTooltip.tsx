'use client';
import React, { useState } from 'react';

interface GLTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function GLTooltip({ content, children, position = 'top' }: GLTooltipProps) {
  const [visible, setVisible] = useState(false);

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    ...(position === 'top'
      ? { bottom: '100%', marginBottom: 6 }
      : { top: '100%', marginTop: 6 }),
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="gl-tooltip" style={tooltipStyle}>
          <span className="gl-tooltip__content">{content}</span>
        </span>
      )}
    </span>
  );
}
