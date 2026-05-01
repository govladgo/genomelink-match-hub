import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Match Hub — Genomelink',
  description: 'Unified cross-vendor DNA match inbox',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
