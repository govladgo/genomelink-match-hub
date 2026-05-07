'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GenomelinkHeader } from '@/components/layout/GenomelinkHeader';
import { MatchHubSubHeader } from '@/components/layout/MatchHubSubHeader';

/**
 * Match Hub — How it works.
 *
 * Figma reference:
 *   12307:2027 (desktop) — single white card on F9FCFF page bg,
 *                          1312 wide, p-48/192, border 1 gray-60, radius 12.
 *   12308:2435 (mobile)  — same card stacked, p-16, no inner padding.
 *
 * Design tokens (from Figma):
 *   H1 32/36 semibold #263856
 *   H2 24/32 semibold #263856 (mobile: H4 20/28)
 *   Body 16/24 regular #263856
 *   Subtitle 16/24 regular #6786AC
 *   Callouts: bg rgba(122,184,255,0.1), border rgba(122,184,255,0.3),
 *             radius 16, p-20, label 12/16 semibold #8FABCF uppercase
 *   TOC links: 16/24 #FF7C11
 *   CTA button: 216 wide, p-14/24, radius-32, orange, uppercase Medium 14/20
 */

export default function MatchHubHelpPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#F9FCFF', fontFamily: 'var(--gl-font)' }}>
      <GenomelinkHeader />
      <MatchHubSubHeader backHref="/match-hub" backLabel="Back to hub" />

      <div
        style={{ maxWidth: 1312, margin: '0 auto', padding: '24px 64px 64px' }}
        className="help-page-container"
      >
        {/* Help card — Figma 12307:2042 / 12312:2794 */}
        <article
          className="help-card"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(201, 214, 228, 0.6)',
            borderRadius: 12,
            padding: '48px 192px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            overflow: 'hidden',
          }}
        >
          {/* === Intro === */}
          <section style={sectionGroup}>
            <h1 style={h1Style}>How to use Match Hub</h1>
            <p style={tagline}>
              One unified inbox for all your DNA matches across 23andMe, Ancestry, FTDNA, MyHeritage, and
              GEDmatch — automatically deduplicated.
            </p>
            <p style={bodyText}>
              The same biological match often appears on multiple vendors with slightly different cM and
              segment data. Match Hub detects those duplicates so your inbox shows each person only once,
              with a record of which vendors they appear on.
            </p>
          </section>

          {/* === Quick start === */}
          <section style={sectionGroup}>
            <h2 style={h2Style}>Quick start</h2>
            <ol style={orderedList}>
              <li>Pick a demo user from the switcher next to the user identity.</li>
              <li>
                The <strong>Duplicates</strong> tab shows every duplicate group the engine
                detected — sorted with pending work at the top.
              </li>
              <li>
                Inside each group, decide each sibling record one by one with its own{' '}
                <strong>Merge</strong> or <strong>Dismiss</strong> button.
              </li>
              <li>
                Switch to the <strong>Assessed</strong> tab to review groups where every sibling has
                already been resolved. Each row shows an <strong>Undo</strong> button if you change
                your mind.
              </li>
              <li>
                The header stats update live: <em>Total entries</em>, <em>Vendors</em>,{' '}
                <em>Duplicates</em> (group count), and <em>Merged</em> (records collapsed).
              </li>
            </ol>

            <Callout label="TIP">
              The same dataset is shared with the Common Ancestor cM tool. Once you merge duplicates here,
              opening the same demo user there shows the consolidated view.
            </Callout>
          </section>

          {/* === Reference TOC === */}
          <section style={sectionGroup}>
            <h2 style={h2Style}>Reference</h2>
            <div style={tocLabel}>Table of contents</div>
            <div className="toc-grid" style={tocGrid}>
              <div style={tocColumn}>
                <div style={tocGroupTitle}>Getting started</div>
                <a href="#cross-vendor" style={tocLink}>What is cross-vendor matching?</a>
                <a href="#vendors-supported" style={tocLink}>The 5 supported vendors</a>
                <a href="#why-vendors-differ" style={tocLink}>Why vendors report different cM</a>
                <a href="#tabs" style={tocLink}>Reading the Duplicates &amp; Assessed tabs</a>
              </div>
              <div style={tocColumn}>
                <div style={tocGroupTitle}>Duplicate detection</div>
                <a href="#how-grouped" style={tocLink}>How matches are grouped</a>
                <a href="#confidence" style={tocLink}>Confidence levels</a>
                <a href="#why-cm" style={tocLink}>Why cM (not name) is the grouping key</a>
                <a href="#review-actions" style={tocLink}>Reviewing groups: per-record decisions</a>
                <div style={{ ...tocGroupTitle, marginTop: 16 }}>Demo &amp; glossary</div>
                <a href="#demo-data" style={tocLink}>About the demo data</a>
                <a href="#performance" style={tocLink}>Performance</a>
                <a href="#glossary" style={tocLink}>Glossary</a>
              </div>
            </div>
          </section>

          {/* === Cross-vendor === */}
          <section id="cross-vendor" style={sectionGroup}>
            <h3 style={h3Style}>What is cross-vendor matching?</h3>
            <p style={bodyText}>
              Many DNA testers upload to multiple services to maximize their chance of finding relatives.
              That means the same biological person can appear in your match list on 2, 3, or even all 5
              major vendors — usually under slightly different names, with slightly different cM, and with
              segment data that may or may not be triangulated.
            </p>
            <p style={bodyText}>
              Match Hub identifies these duplicates automatically using a confidence-scored algorithm so
              your effective inbox is the count of <em>distinct people</em>, not the count of{' '}
              <em>match records across all vendors</em>.
            </p>
          </section>

          {/* === Vendors === */}
          <section id="vendors-supported" style={sectionGroup}>
            <h3 style={h3Style}>The 5 supported vendors</h3>
            <ul style={unorderedList}>
              <li><strong>23andMe</strong> — DNA Relatives, with optional segment data</li>
              <li><strong>Ancestry</strong> — DNA Matches, no segment data unless paired with the matching tool</li>
              <li><strong>FTDNA</strong> — Family Finder, full segment data including chromosome browser</li>
              <li><strong>MyHeritage</strong> — DNA Matches, with segment data on most matches</li>
              <li><strong>GEDmatch</strong> — Third-party hub; segment data via One-to-One and Triangulation</li>
            </ul>
          </section>

          {/* === Why vendors differ === */}
          <section id="why-vendors-differ" style={sectionGroup}>
            <h3 style={h3Style}>Why vendors report different cM</h3>
            <p style={bodyText}>
              The same two people can be reported as 285 cM by Ancestry and 297 cM by FTDNA. Reasons:
            </p>
            <ul style={unorderedList}>
              <li><strong>Chip versions</strong> — different SNP arrays test slightly different genomic positions</li>
              <li><strong>Matching algorithms</strong> — minimum segment length thresholds, gap-fill rules, IBD inference all vary</li>
              <li><strong>Population reference panels</strong> — vendors normalize against different populations</li>
            </ul>
            <p style={bodyText}>
              Differences of ±5–15% are normal for the same biological match. Match Hub allows up to ±5% cM
              variation when bucketing duplicate candidates, then confirms with segment overlap.
            </p>
          </section>

          {/* === Duplicates / Assessed tabs === */}
          <section id="tabs" style={sectionGroup}>
            <h3 style={h3Style}>Reading the Duplicates &amp; Assessed tabs</h3>
            <p style={bodyText}>
              Match Hub focuses on cross-vendor deduplication — your full match list still lives on the
              main DNA Matches surface. The hub splits its work into two tabs:
            </p>
            <ul style={unorderedList}>
              <li>
                <strong>Duplicates</strong> — every group with at least one undecided sibling. This is
                where the work-to-do lives.
              </li>
              <li>
                <strong>Assessed</strong> — groups where every sibling has been resolved (merged or
                marked Not a duplicate). You can reopen any decision here with <strong>Undo</strong>.
              </li>
            </ul>
            <p style={bodyText}>
              The stats card at the top of the page shows the count of duplicate groups detected and how
              many records you&apos;ve merged so far.
            </p>
          </section>

          {/* === How matches are grouped === */}
          <section id="how-grouped" style={sectionGroup}>
            <h3 style={h3Style}>How matches are grouped</h3>
            <p style={bodyText}>
              The engine groups potential duplicates by <strong>shared cM</strong> first and confirms with{' '}
              <strong>segment overlap</strong>. Names are not used for grouping — they&apos;re shown for
              context but a different name spelling never blocks a match.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Step</th>
                    <th style={th}>Computation</th>
                    <th style={{ ...th, textAlign: 'right' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={td}>cM bracket</td>
                    <td style={td}>Both records&apos; shared cM within ±5% of each other; both ≥ 30 cM</td>
                    <td style={tdRight}>Bucket key (binary)</td>
                  </tr>
                  <tr>
                    <td style={td}>Segment overlap</td>
                    <td style={td}>Total overlapping bp / min total bp of both</td>
                    <td style={tdRight}>Confidence</td>
                  </tr>
                  <tr>
                    <td style={td}>Name similarity</td>
                    <td style={td}>Token-aware Levenshtein (display only)</td>
                    <td style={tdRight}>Hint, not gate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={bodyText}>
              Group confidence equals the average segment overlap across pairs in the group. Pairs without
              segment data on either side cannot be auto-grouped — they&apos;re treated as singletons and
              ignored by the dedup engine.
            </p>
          </section>

          {/* === Confidence === */}
          <section id="confidence" style={sectionGroup}>
            <h3 style={h3Style}>Confidence levels</h3>
            <ul style={unorderedList}>
              <li><strong>≥0.90</strong> — High confidence. Real cross-vendor duplicates routinely score here.</li>
              <li><strong>0.70–0.89</strong> — Suggested. Review individually before merging.</li>
              <li><strong>&lt;0.70</strong> — Filtered out. Pair is treated as different people; not surfaced.</li>
            </ul>
            <p style={bodyText}>
              The percentage shown in each group&apos;s header is this same confidence score, scaled to
              0–100. Borderline scores (70–89%) usually indicate one vendor reporting fewer or
              differently-broken segments than the other.
            </p>
          </section>

          {/* === Why cM, not name === */}
          <section id="why-cm" style={sectionGroup}>
            <h3 style={h3Style}>Why cM (not name) is the grouping key</h3>
            <p style={bodyText}>
              Names are unreliable across vendors. The same person commonly appears as{' '}
              <em>Birgit Pettersen</em> on Ancestry, <em>B. Pettersen</em> on FTDNA, and{' '}
              <em>Brigitte P.</em> on MyHeritage. Cyrillic and other non-Latin names get romanised
              differently per vendor. Users mistype their own names on signup.
            </p>

            <Callout label="THE NEW MODEL">
              The engine groups by <strong>cM bracket + segment overlap</strong>. If two records sit in
              the same ±5% cM bucket and share substantial segment positions, they&apos;re very likely
              the same biological person regardless of how their names were entered.
            </Callout>

            <p style={bodyText}>
              When a group&apos;s members spell the name differently, the card header shows a small{' '}
              <strong>&ldquo;Name varies&rdquo;</strong> badge to highlight the divergence. The title
              itself stays cM-led (e.g. <em>~35.1 cM · 2 candidates</em>) to make it visible that
              grouping is cM-based. Family members (siblings, cousins) inherit similar cM brackets but
              their segment positions differ — segment overlap stays low for them, so they don&apos;t
              auto-group.
            </p>
          </section>

          {/* === Review actions === */}
          <section id="review-actions" style={sectionGroup}>
            <h3 style={h3Style}>Reviewing groups: per-record decisions</h3>
            <p style={bodyText}>
              Each duplicate group has one <strong>primary</strong> record (marked with an orange{' '}
              <em>Primary</em> tag) and one or more <strong>sibling</strong> records the engine thinks
              describe the same person. You decide each sibling individually — useful when a group has
              3+ records and you&apos;re confident about one but not another.
            </p>
            <p style={bodyText}>
              The primary is picked automatically as the record we recommend you keep as the canonical
              view of this person, in this order:
            </p>
            <ol style={orderedList}>
              <li><strong>Highest shared cM</strong> — most reported DNA wins.</li>
              <li>
                <strong>Most segments</strong> — richer segment data (which is what drives the
                confidence math).
              </li>
              <li>
                <strong>Vendor preference</strong> when cM and segments tie:{' '}
                <em>FTDNA → MyHeritage → GEDmatch → 23andMe → Ancestry</em>. Vendors that ship full
                segment data rank higher; Ancestry sits last because it doesn&apos;t expose segments.
              </li>
              <li>Deterministic id fallback if everything else is identical.</li>
            </ol>
            <ul style={unorderedList}>
              <li>
                <strong>Merge</strong> — confirm this sibling is the same person as the primary. The
                row turns green and the record is counted toward the <em>Merged</em> stat.
              </li>
              <li>
                <strong>Dismiss</strong> — confirm this sibling is a different person. The row dims,
                the name strikes through, and a <em>Not a duplicate</em> pill appears.
              </li>
              <li>
                <strong>Undo</strong> — replaces the action buttons after a decision; reverts that one
                record to pending.
              </li>
            </ul>
            <Callout label="GROUP LIFECYCLE">
              A group leaves the <strong>Duplicates</strong> tab and moves to <strong>Assessed</strong>{' '}
              once every sibling has a decision. Resetting any single decision (via Undo) moves the
              group back to Duplicates if at least one sibling becomes pending again.
            </Callout>
          </section>

          {/* === Demo data === */}
          <section id="demo-data" style={sectionGroup}>
            <h3 style={h3Style}>About the demo data</h3>
            <p style={bodyText}>
              The 10 demo users are derived from a real DNA-pair dataset (~254,000 pairs with
              segment-level data and computed kinship labels). Each demo user has ~1,737 matches
              stratified across kinship classes — a few close, more mid-range, mostly distant cousins
              (which is what real match lists look like).
            </p>
            <p style={bodyText}>
              <strong>Synthesized:</strong> names, ancestry profiles, vendor assignments, and ~12%
              intentional cross-vendor duplicates per user (with ±5% cM and ±200kb segment perturbations)
              so the dedup engine has something to find.
            </p>
            <p style={bodyText}>
              <strong>Real:</strong> shared cM, segment positions, kinship labels.
            </p>
          </section>

          {/* === Performance === */}
          <section id="performance" style={sectionGroup}>
            <h3 style={h3Style}>Performance</h3>
            <p style={bodyText}>
              The dedup engine is naively O(n²), which would mean ~3 million comparisons per user at
              1,737 matches. To keep this fast in the browser, we sort matches by cM and use a sliding
              window — pairs outside the ±5% cM window can&apos;t share a bucket, so they&apos;re skipped.
            </p>
            <p style={bodyText}>
              That cuts comparisons substantially in practice. Dedup completes in well under a second
              for the largest demo user.
            </p>
          </section>

          {/* === Glossary === */}
          <section id="glossary" style={sectionGroup}>
            <h3 style={h3Style}>Glossary</h3>
            <dl style={glossary} className="help-glossary">
              <dt style={dt}>centiMorgan (cM)</dt>
              <dd style={dd}>Unit of genetic distance. Two people share more cM the more recently they share a common ancestor.</dd>

              <dt style={dt}>IBD (Identity-by-Descent)</dt>
              <dd style={dd}>A DNA segment shared because both people inherited it from a common ancestor.</dd>

              <dt style={dt}>Segment</dt>
              <dd style={dd}>A continuous run of DNA shared between you and a match — defined by chromosome, start position, end position, and length in cM.</dd>

              <dt style={dt}>Segment overlap</dt>
              <dd style={dd}>The portion of base pairs that overlap between two records&apos; segment lists. The strongest signal that two records describe the same biological match.</dd>

              <dt style={dt}>Triangulation</dt>
              <dd style={dd}>A specific segment confirmed as shared between three or more matches at the same chromosomal coordinates — strong evidence of a true common ancestor at that segment.</dd>

              <dt style={dt}>Vendor</dt>
              <dd style={dd}>A DNA testing service (23andMe, Ancestry, FTDNA, MyHeritage, GEDmatch).</dd>

              <dt style={dt}>Confidence</dt>
              <dd style={dd}>The dedup engine&apos;s 0–1 score equal to the average segment overlap across pairs in a group. ≥0.7 to suggest, ≥0.9 for high confidence. Pairs below 0.7 are filtered out (treated as different people).</dd>

              <dt style={dt}>cM bracket</dt>
              <dd style={dd}>The ±5% range around a shared cM value used to bucket potential duplicates. Two records must sit in the same cM bracket to be considered as candidates; segment overlap then confirms or rejects.</dd>

              <dt style={dt}>Primary record</dt>
              <dd style={dd}>The canonical record inside a duplicate group — chosen automatically by highest shared cM, then most segments, then vendor preference (FTDNA &gt; MyHeritage &gt; GEDmatch &gt; 23andMe &gt; Ancestry). Sibling records get merged into the primary; the primary itself never has a merge button.</dd>

              <dt style={dt}>Sibling record</dt>
              <dd style={dd}>Any non-primary record inside a duplicate group. Each sibling has its own merge / dismiss decision.</dd>

              <dt style={dt}>Assessed group</dt>
              <dd style={dd}>A group where every sibling has a decision. Lives in the Assessed tab; can be reopened with Undo.</dd>
            </dl>
          </section>

          {/* === CTA === */}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => router.push('/match-hub')}
              className="help-cta"
              style={{
                width: 216,
                padding: '14px 24px',
                borderRadius: 32,
                background: '#FF7C11',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--gl-font)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f2690b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FF7C11'; }}
            >
              Open the inbox
            </button>
          </div>
        </article>

        <style jsx global>{`
          @media (max-width: 1100px) {
            .help-card {
              padding: 40px 64px !important;
            }
          }
          @media (max-width: 900px) {
            .help-page-container {
              padding: 16px !important;
              max-width: 100% !important;
            }
            .help-card {
              padding: 24px !important;
              border-radius: 12px !important;
            }
            .toc-grid {
              grid-template-columns: 1fr !important;
            }
            .help-glossary {
              grid-template-columns: 1fr !important;
            }
            .help-glossary dt {
              padding-top: 8px !important;
            }
          }
          @media (max-width: 600px) {
            .help-card {
              padding: 16px !important;
            }
            .help-card h1 {
              font-size: 24px !important;
              line-height: 32px !important;
            }
            .help-card h2 {
              font-size: 20px !important;
              line-height: 28px !important;
            }
            .help-card h3 {
              font-size: 18px !important;
              line-height: 26px !important;
            }
            .help-cta {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// ============================================================================
// Callout block (Figma 12308:2187 — TIP / THE NEW MODEL / GROUP LIFECYCLE)
// ============================================================================

function Callout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(122, 184, 255, 0.10)',
        border: '1px solid rgba(122, 184, 255, 0.30)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '16px',
          color: '#8FABCF',
          textTransform: 'uppercase',
          fontFamily: 'var(--gl-font)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 400,
          lineHeight: '24px',
          color: '#263856',
          fontFamily: 'var(--gl-font)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Style constants
// ============================================================================

const sectionGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  scrollMarginTop: 24,
};

const h1Style: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '36px',
  margin: 0,
  fontFamily: 'var(--gl-font)',
};

const tagline: React.CSSProperties = {
  fontSize: 16,
  color: '#6786AC',
  lineHeight: '24px',
  margin: 0,
  fontFamily: 'var(--gl-font)',
};

const h2Style: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '32px',
  margin: 0,
  marginTop: 8,
  fontFamily: 'var(--gl-font)',
};

const h3Style: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '32px',
  margin: 0,
  fontFamily: 'var(--gl-font)',
};

const bodyText: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 400,
  color: '#263856',
  lineHeight: '24px',
  margin: 0,
  fontFamily: 'var(--gl-font)',
};

const orderedList: React.CSSProperties = {
  margin: 0,
  paddingLeft: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontSize: 16,
  color: '#263856',
  lineHeight: '24px',
  fontFamily: 'var(--gl-font)',
};

const unorderedList: React.CSSProperties = { ...orderedList };

const tocLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#8FABCF',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontFamily: 'var(--gl-font)',
};

const tocGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
};

const tocColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const tocGroupTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  color: '#263856',
  fontFamily: 'var(--gl-font)',
};

const tocLink: React.CSSProperties = {
  fontSize: 16,
  lineHeight: '24px',
  color: '#FF7C11',
  textDecoration: 'none',
  fontFamily: 'var(--gl-font)',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
  fontFamily: 'var(--gl-font)',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  background: 'rgba(122, 184, 255, 0.10)',
  color: '#263856',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '20px',
  padding: 8,
  borderBottom: '1px solid rgba(201, 214, 228, 0.3)',
};

const td: React.CSSProperties = {
  padding: 8,
  color: '#263856',
  fontSize: 14,
  lineHeight: '20px',
  borderBottom: '1px solid rgba(201, 214, 228, 0.3)',
};

const tdRight: React.CSSProperties = {
  ...td,
  textAlign: 'right',
  fontWeight: 600,
};

const glossary: React.CSSProperties = {
  margin: 0,
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: '16px 16px',
  fontFamily: 'var(--gl-font)',
};

const dt: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '24px',
};

const dd: React.CSSProperties = {
  fontSize: 14,
  color: '#263856',
  lineHeight: '20px',
  margin: 0,
};
