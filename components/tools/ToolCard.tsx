'use client';

import Link from 'next/link';
import React from 'react';

/**
 * Tool card used on the / Tools selector page.
 *
 * Tokens (Figma 11842:15407 / 11842:19850):
 *   card        bg #FFFFFF, drop-shadow(0 5px 5px rgba(74,93,128,0.16)),
 *               radius 24, padding 32/24, width 416 (flex-wrappable)
 *   title       18/26 SF Pro Semibold #263856 (60% opacity for coming-soon)
 *   body        14/20 SF Pro Regular #263856
 *   button      outline 1px rgba(38,56,86,0.6), padding 14/24, radius 32,
 *               uppercase Medium 14/20 #263856, with arrow-next 20px icon
 *   coming-soon bg rgba(255,124,17,0.10), text #FF7C11 uppercase 12/18,
 *               padding 3/16, radius 6
 */

interface ToolCardProps {
  /** Title rendered next to the icon. */
  title: string;
  /** Body description (1–2 sentences). */
  description: string;
  /** Inline SVG icon at the start of the title row (18×18). */
  icon: React.ReactNode;
  /** Button label, e.g. "Open network". */
  buttonLabel?: string;
  /** Where the button navigates. */
  href?: string;
  /** When true, render the "coming soon" badge and hide the button. */
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
        // Default cards are auto-height; coming-soon cards omit the button row,
        // so let height be content-driven for both.
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M8 5L13 10L8 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
