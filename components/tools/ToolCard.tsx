'use client';

import Link from 'next/link';
import React from 'react';

/**
 * Tool card used on the / Tools selector page.
 *
 * Tokens (Figma 11842:15407 / 11842:15412 desktop, 11842:19807 mobile):
 *   card        bg #FFFFFF, drop-shadow(0 5px 5px rgba(74,93,128,0.16)),
 *               radius 24, padding 24/32, width 416 desktop, 100% mobile
 *   title       18/26 SF Pro Semibold #263856 (60% opacity for coming-soon)
 *   body        14/20 SF Pro Regular #263856
 *   button      Desktop: outline 1px rgba(38,56,86,0.6), padding 14/24,
 *               radius 32, uppercase Medium 14/20 #263856 + arrow-next 20px
 *               Mobile: padding 8/16, uppercase Medium 12/16 + arrow-next 16px
 *   coming-soon bg rgba(255,124,17,0.10), text #FF7C11 uppercase 12/18,
 *               padding 3/16, radius 6
 */

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonLabel?: string;
  href?: string;
  comingSoon?: boolean;
}

export function ToolCard({
  title,
  description,
  icon,
  buttonLabel,
  href,
  comingSoon = false,
}: ToolCardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        boxShadow: '0px 5px 5px rgba(74, 93, 128, 0.16)',
        borderRadius: 24,
        padding: '24px 32px',
        width: 416,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
      className="tool-card"
    >
      {/* Title + description block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: comingSoon ? 'rgba(38, 56, 86, 0.6)' : '#263856',
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
          <p
            style={{
              flex: '1 0 0',
              minWidth: 0,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '26px',
              color: comingSoon ? 'rgba(38, 56, 86, 0.6)' : '#263856',
              margin: 0,
              fontFamily: 'var(--gl-font)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </p>
          {comingSoon && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255, 124, 17, 0.10)',
                color: '#FF7C11',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: '18px',
                textTransform: 'uppercase',
                padding: '3px 16px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--gl-font)',
              }}
            >
              Coming soon
            </span>
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            color: '#263856',
            fontFamily: 'var(--gl-font)',
          }}
        >
          {description}
        </p>
      </div>

      {/* Button (skipped for coming-soon variants) */}
      {!comingSoon && buttonLabel && (
        <Link
          href={href || '#'}
          className="tool-card-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '14px 24px',
            borderRadius: 32,
            border: '1px solid rgba(38, 56, 86, 0.6)',
            background: 'transparent',
            color: '#263856',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: '20px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
            textDecoration: 'none',
            fontFamily: 'var(--gl-font)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(38, 56, 86, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {buttonLabel}
          {/* Arrow-next icon — Figma 5833:88401 (20×20 desktop, 16×16 mobile).
              The chevron sits at the inset specified by the original asset. */}
          <ArrowNextIcon />
        </Link>
      )}
    </div>
  );
}

function ArrowNextIcon() {
  return (
    <svg className="tool-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.17 10h11.66 M11.67 5.83L15.83 10L11.67 14.17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
