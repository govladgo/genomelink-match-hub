'use client';
import React, { useEffect, useCallback } from 'react';

interface GLModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function GLModal({ open, onClose, title, children, size = 'md' }: GLModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="gl-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`gl-modal gl-modal--${size}`} style={{ maxHeight: '85vh', overflow: 'auto' }}>
        <button className="gl-modal__close" aria-label="Close" onClick={onClose}>
          &#x2715;
        </button>
        {title && <h2 className="gl-modal__title" style={{ marginBottom: 16, paddingRight: 32, textAlign: 'left', width: '100%' }}>{title}</h2>}
        <div style={{ width: '100%' }}>{children}</div>
      </div>
    </div>
  );
}
