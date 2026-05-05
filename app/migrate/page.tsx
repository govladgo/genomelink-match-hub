/**
 * 23andMe Migration Assistant — DISABLED
 *
 * The /migrate route is currently hidden. This stub returns 404 so the route
 * doesn't render publicly. The original implementation is preserved in the
 * comment block below — to re-enable:
 *
 *   1. Replace the `MigratePage` export below with the original (uncomment block)
 *   2. Re-add the link in app/page.tsx (see the commented-out <Link> block there)
 *
 * Hidden on 2026-05-05 per product decision; flow + dedup logic intact.
 */

import { notFound } from 'next/navigation';

export default function MigratePage() {
  notFound();
}

/* =============================================================================
   ORIGINAL IMPLEMENTATION — preserved for easy restoration. To re-enable, copy
   this block above the notFound stub and remove the stub.

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { GLStepper, StepDef } from '@/components/migrate/GLStepper';
import { mockMatches } from '@/data/mock/matches';
import { findDuplicateGroups } from '@/utils/dedupEngine';
import { DuplicateGroupCard } from '@/components/hub/DuplicateGroupCard';

const STEPS: StepDef[] = [
  { id: 'export', label: 'Export from 23andMe' },
  { id: 'upload', label: 'Upload to Genomelink' },
  { id: 'review', label: 'Review duplicates' },
  { id: 'done', label: 'Done' },
];

export default function MigratePage() {
  const [step, setStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [merged, setMerged] = useState<Set<string>>(new Set());
  const [, setRejected] = useState<Set<string>>(new Set());

  const groups = findDuplicateGroups(mockMatches);

  const handleUploadClick = useCallback(() => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('done');
      setStep(2);
    }, 1500);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gl-color-bg)',
      fontFamily: 'var(--gl-font)',
    }}>
      <header style={{
        background: 'var(--gl-color-surface)',
        borderBottom: '1px solid var(--gl-color-border-light)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--gl-color-primary-dark)' }}>
              23andMe Migration Assistant
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gl-color-text-muted)', margin: '2px 0 0' }}>
              Save your matches before TTAM data closure
            </p>
          </div>
          <Link
            href="/"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--gl-color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            ← Back to inbox
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
        <div style={{
          background: 'var(--gl-color-surface)',
          borderRadius: 12,
          padding: '16px 24px',
          boxShadow: 'var(--gl-shadow-sm)',
          marginBottom: 20,
        }}>
          <GLStepper steps={STEPS} currentStep={step} />
        </div>

        {step === 0 && (
          <div style={panelStyle}>
            <h3 style={panelTitle}>Step 1: Export your data from 23andMe</h3>
            <p style={panelDesc}>
              Before downloading their service, export your DNA Relatives list and segment data.
              This is the only way to preserve your matches outside TTAM.
            </p>

            <ol style={{ margin: '12px 0', paddingLeft: 20, lineHeight: 1.7, fontSize: 13, color: 'var(--gl-color-text-secondary)' }}>
              <li>Sign in to <strong>you.23andme.com</strong></li>
              <li>Go to <strong>Settings → Browse Raw Data</strong> and download your raw genome file</li>
              <li>Open <strong>DNA Relatives</strong> and click <strong>Download</strong> (CSV format)</li>
              <li>For each close match, open their profile and use the <strong>Aggregate</strong> tab to record shared segments</li>
              <li>Save all files locally — TTAM closure means you cannot re-export later</li>
            </ol>

            <div style={alertBox}>
              <strong>Why this matters:</strong> Once 23andMe closes, your match list and segment data become unrecoverable.
              Genomelink keeps these forever and can deduplicate them with your matches on Ancestry, FTDNA, MyHeritage, and GEDmatch.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setStep(1)} className="gl-btn gl-btn--primary">
                I've exported my data →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={panelStyle}>
            <h3 style={panelTitle}>Step 2: Upload to Genomelink</h3>
            <p style={panelDesc}>
              Upload your 23andMe export. We'll cross-reference it with your matches on
              other vendors and find duplicate people.
            </p>

            <div style={{
              border: '2px dashed var(--gl-color-border-light)',
              borderRadius: 12,
              padding: '32px 16px',
              textAlign: 'center',
              background: 'var(--gl-color-bg)',
              marginTop: 12,
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 12 }}>
                <path d="M20 8V28M20 8L13 15M20 8L27 15M8 32H32" stroke="var(--gl-color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gl-color-primary-dark)', marginBottom: 4 }}>
                Drop your 23andMe export here
              </div>
              <div style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', marginBottom: 16 }}>
                CSV or ZIP files up to 50MB
              </div>
              <button
                onClick={handleUploadClick}
                disabled={uploadStatus === 'uploading'}
                className="gl-btn gl-btn--primary"
                style={{ minWidth: 160 }}
              >
                {uploadStatus === 'uploading' ? 'Processing…' : uploadStatus === 'done' ? 'Done ✓' : 'Use sample data'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--gl-color-text-muted)', textAlign: 'center', marginTop: 12 }}>
              Mock mode: clicking "Use sample data" loads pre-built matches for you to try the dedup flow.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => setStep(0)} className="gl-btn gl-btn--secondary">
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={panelStyle}>
            <h3 style={panelTitle}>Step 3: Review duplicates</h3>
            <p style={panelDesc}>
              We found <strong>{groups.length} groups</strong> of matches that look like the same person across multiple vendors.
              Merge the ones you're confident about; reject false positives.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {groups.map(g => (
                <DuplicateGroupCard
                  key={g.id}
                  group={g}
                  matches={mockMatches}
                  isMerged={merged.has(g.id)}
                  onMerge={(id) => {
                    setMerged(prev => { const n = new Set(prev); n.add(id); return n; });
                    setRejected(prev => { const n = new Set(prev); n.delete(id); return n; });
                  }}
                  onUnmerge={(id) => {
                    setMerged(prev => { const n = new Set(prev); n.delete(id); return n; });
                  }}
                  onReject={(id) => {
                    setRejected(prev => { const n = new Set(prev); n.add(id); return n; });
                    setMerged(prev => { const n = new Set(prev); n.delete(id); return n; });
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(1)} className="gl-btn gl-btn--secondary">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="gl-btn gl-btn--primary">
                Save and finish ({merged.size} merged)
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ ...panelStyle, textAlign: 'center', padding: 40 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(122, 191, 67, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14L12 20L22 8" stroke="#7ABF43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ ...panelTitle, marginBottom: 8 }}>Migration complete</h3>
            <p style={{ ...panelDesc, marginBottom: 20 }}>
              Your 23andMe matches are saved alongside your other vendors.
              {merged.size > 0 && ` ${merged.size} duplicate ${merged.size === 1 ? 'group was' : 'groups were'} merged.`}
            </p>

            <Link href="/" className="gl-btn gl-btn--primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Open unified inbox →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'var(--gl-color-surface)',
  borderRadius: 12,
  padding: 24,
  boxShadow: 'var(--gl-shadow-sm)',
};
const panelTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  margin: '0 0 4px',
  color: 'var(--gl-color-primary-dark)',
};
const panelDesc: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--gl-color-text-muted)',
  margin: '0 0 12px',
  lineHeight: 1.5,
};
const alertBox: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 8,
  background: 'rgba(255, 124, 17, 0.06)',
  border: '1px solid rgba(255, 124, 17, 0.2)',
  fontSize: 12,
  color: 'var(--gl-color-text-secondary)',
  lineHeight: 1.5,
  marginTop: 12,
};

============================================================================= */
