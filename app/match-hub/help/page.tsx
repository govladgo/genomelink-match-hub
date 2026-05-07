'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

function BackArrow() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
      <path
        d="M9 1L1 9L9 17M1 9H21"
        stroke="#6786AC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#263856" strokeOpacity="0.6" strokeWidth="2" />
      <circle cx="4" cy="6" r="1.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="20" cy="6" r="1.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="4" cy="18" r="1.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="20" cy="18" r="1.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="6" y1="7.5" x2="10" y2="10.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="18" y1="7.5" x2="14" y2="10.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="6" y1="16.5" x2="10" y2="13.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="18" y1="16.5" x2="14" y2="13.5" stroke="#263856" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
}

export default function MatchHubHelpPage() {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--gl-color-bg)',
        fontFamily: 'var(--gl-font)',
      }}
    >
      <div
        style={{
          maxWidth: 1144,
          margin: '0 auto',
          padding: isMobile ? '16px 16px 60px' : '24px 32px 60px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: 32,
            minHeight: 32,
          }}
        >
          <button
            onClick={() => router.push('/match-hub')}
            style={{
              position: 'absolute',
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--gl-font)',
              padding: 0,
            }}
            aria-label="Back to inbox"
            className="back-button"
          >
            <BackArrow />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#6786AC',
                lineHeight: '24px',
              }}
              className="back-label"
            >
              Back to inbox
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <HubIcon />
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#263856',
                lineHeight: '32px',
              }}
            >
              Match Hub
            </span>
          </div>
        </div>

        {/* Help card */}
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: isMobile ? 16 : '48px 96px',
            border: '1px solid rgba(201, 214, 228, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
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
              <li>Pick a demo user from the switcher in the top-right header.</li>
              <li>Browse the <strong>Unified Inbox</strong> tab — every match from every vendor in one list.</li>
              <li>Use the vendor chips to filter by vendor (toggle on/off).</li>
              <li>Switch to the <strong>Duplicates</strong> tab to see automatically-detected cross-vendor matches.</li>
              <li>Inside each group, decide each sibling record one by one with its own <strong>Merge</strong> or <strong>Not a duplicate</strong> button — or use <strong>Merge all high-confidence</strong> to bulk-process every sibling across high-confidence groups.</li>
            </ol>

            <div style={tipCallout}>
              <div style={calloutTitle}>Tip</div>
              <div>
                The same dataset is shared with the Common Ancestor cM tool. Once you merge duplicates here,
                opening the same demo user there shows the consolidated view.
              </div>
            </div>
          </section>

          {/* === Reference TOC === */}
          <section style={sectionGroup}>
            <h2 style={h2Style}>Reference</h2>
            <div style={tocLabel}>Table of contents</div>
            <div style={tocGrid} className="toc-grid">
              <div style={tocColumn}>
                <div style={tocGroupTitle}>Getting started</div>
                <a href="#cross-vendor" style={tocLink}>
                  What is cross-vendor matching?
                </a>
                <a href="#vendors-supported" style={tocLink}>
                  The 5 supported vendors
                </a>
                <a href="#why-vendors-differ" style={tocLink}>
                  Why vendors report different cM
                </a>
                <a href="#unified-inbox" style={tocLink}>
                  Reading the Unified Inbox
                </a>
              </div>
              <div style={tocColumn}>
                <div style={tocGroupTitle}>Duplicate detection</div>
                <a href="#how-grouped" style={tocLink}>
                  How matches are grouped
                </a>
                <a href="#confidence" style={tocLink}>
                  Confidence levels
                </a>
                <a href="#why-cm" style={tocLink}>
                  Why cM (not name) is the grouping key
                </a>
                <a href="#review-actions" style={tocLink}>
                  Reviewing groups: per-record decisions
                </a>
                <div style={{ ...tocGroupTitle, marginTop: 16 }}>Demo &amp; glossary</div>
                <a href="#demo-data" style={tocLink}>
                  About the demo data
                </a>
                <a href="#performance" style={tocLink}>
                  Performance
                </a>
                <a href="#glossary" style={tocLink}>
                  Glossary
                </a>
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
              your effective inbox is the count of <em>distinct people</em>, not the count of <em>match
              records across all vendors</em>.
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
              Differences of ±5–15% are normal for the same biological match. Match Hub allows up to ±15% cM
              variation when scoring duplicate confidence.
            </p>
          </section>

          {/* === Unified inbox === */}
          <section id="unified-inbox" style={sectionGroup}>
            <h3 style={h3Style}>Reading the Unified Inbox</h3>
            <p style={bodyText}>
              The default tab shows all matches from all vendors — but matches you&apos;ve confirmed as
              duplicates are <strong>collapsed</strong> so each person appears only once, with their primary
              record visible (the higher-cM record by default). Hidden duplicates are noted in the footer.
            </p>
            <p style={bodyText}>
              Use the vendor chips at the top to filter the view. The chip count shows how many matches you
              have on each vendor.
            </p>
          </section>

          {/* === How matches are grouped === */}
          <section id="how-grouped" style={sectionGroup}>
            <h3 style={h3Style}>How matches are grouped</h3>
            <p style={bodyText}>
              The engine groups potential duplicates by <strong>shared cM</strong> first and confirms with
              <strong> segment overlap</strong>. Names are not used for grouping — they&apos;re shown for
              context but a different name spelling never blocks a match.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Step</th>
                    <th style={th}>Computation</th>
                    <th style={th}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={td}>cM bracket</td>
                    <td style={td}>Both records&apos; shared cM within ±5% of each other; both ≥ 30 cM</td>
                    <td style={tdNum}>Bucket key (binary)</td>
                  </tr>
                  <tr style={tdAlt}>
                    <td style={td}>Segment overlap</td>
                    <td style={td}>Total overlapping bp / min total bp of both</td>
                    <td style={tdNum}>Confidence</td>
                  </tr>
                  <tr>
                    <td style={td}>Name similarity</td>
                    <td style={td}>Token-aware Levenshtein (display only)</td>
                    <td style={tdNum}>Hint, not gate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={bodyText}>
              Group confidence equals the average segment overlap across pairs in the group. Pairs without
              segment data on either side cannot be auto-grouped — they show up in the inbox as singletons
              and need manual review.
            </p>
          </section>

          {/* === Confidence === */}
          <section id="confidence" style={sectionGroup}>
            <h3 style={h3Style}>Confidence levels</h3>
            <ul style={unorderedList}>
              <li><strong>≥0.90</strong> — High confidence. Eligible for &ldquo;Merge all high-confidence&rdquo; bulk action.</li>
              <li><strong>0.70–0.89</strong> — Suggested. Review individually before merging.</li>
              <li><strong>&lt;0.70</strong> — Filtered out. Pair is treated as different people; not shown.</li>
            </ul>
            <p style={bodyText}>
              Real cross-vendor duplicates routinely score 0.9+ because the same biological match has nearly
              identical segment positions across platforms. Borderline scores (0.7–0.9) usually indicate one
              vendor reporting fewer or differently-broken segments than the other.
            </p>
          </section>

          {/* === Why cM, not name === */}
          <section id="why-cm" style={sectionGroup}>
            <h3 style={h3Style}>Why cM (not name) is the grouping key</h3>
            <p style={bodyText}>
              Names are unreliable across vendors. The same person commonly appears as
              <em> Birgit Pettersen</em> on Ancestry, <em>B. Pettersen</em> on FTDNA, and
              <em> Brigitte P.</em> on MyHeritage. Cyrillic and other non-Latin names get romanised
              differently per vendor. Users mistype their own names on signup.
            </p>

            <div style={tipCallout}>
              <div style={calloutTitle}>The new model</div>
              <div>
                The engine groups by <strong>cM bracket + segment overlap</strong>. If two records sit in
                the same ±5% cM bucket and share substantial segment positions, they&apos;re very likely the
                same biological person regardless of how their names were entered.
              </div>
            </div>

            <p style={bodyText}>
              When a group&apos;s members spell the name differently, the card header shows a small{' '}
              <strong>&ldquo;Name varies&rdquo;</strong> badge to highlight the divergence. Family members
              (siblings, cousins) inherit similar cM brackets but their segment positions differ — segment
              overlap stays low for them, so they don&apos;t auto-group.
            </p>
          </section>

          {/* === Review actions === */}
          <section id="review-actions" style={sectionGroup}>
            <h3 style={h3Style}>Reviewing groups: per-record decisions</h3>
            <p style={bodyText}>
              Each duplicate group has one <strong>primary</strong> record (marked with a <em>Primary</em>
              tag) and one or more <strong>sibling</strong> records the engine thinks describe the same
              person. You decide each sibling individually — useful when a group has 3+ records and you&apos;re
              confident about one but not another.
            </p>
            <ul style={unorderedList}>
              <li><strong>Merge</strong> — confirm this sibling is the same person as the primary. The sibling collapses out of the unified inbox.</li>
              <li><strong>Not a duplicate</strong> — confirm this sibling is a different person. It stays in the inbox as its own record, ignored by future dedup runs.</li>
              <li><strong>Undo</strong> — appears next to a decision pill; reverts that one record to pending.</li>
              <li><strong>Merge all high-confidence</strong> (bulk) — accepts every still-pending sibling across all groups whose confidence is ≥ 0.9.</li>
              <li><strong>Reset</strong> — clears every per-record decision and returns the entire Duplicates tab to its initial state.</li>
            </ul>
            <div style={tipCallout}>
              <div style={calloutTitle}>Group state</div>
              <div>
                A group shows a <strong>Resolved</strong> badge once every sibling has a decision (merged or
                rejected) and at least one was merged. Groups with no decisions yet appear at the top of the
                list; resolved groups sort to the bottom so the work-to-do is always visible first.
              </div>
            </div>
          </section>

          {/* === Demo data === */}
          <section id="demo-data" style={sectionGroup}>
            <h3 style={h3Style}>About the demo data</h3>
            <p style={bodyText}>
              The 10 demo users are derived from a real DNA-pair dataset (~254,000 pairs with segment-level
              data and computed kinship labels). Each demo user has ~1,737 matches stratified across kinship
              classes — a few close, more mid-range, mostly distant cousins (which is what real match lists
              look like).
            </p>
            <p style={bodyText}>
              <strong>Synthesized:</strong> names, ancestry profiles, vendor assignments, and ~12% intentional
              cross-vendor duplicates per user (with ±5% cM and ±200kb segment perturbations) so the dedup
              engine has something to find.
            </p>
            <p style={bodyText}>
              <strong>Real:</strong> shared cM, segment positions, kinship labels.
            </p>
          </section>

          {/* === Performance === */}
          <section id="performance" style={sectionGroup}>
            <h3 style={h3Style}>Performance</h3>
            <p style={bodyText}>
              The dedup engine is naively O(n²), which would mean ~3 million comparisons per user at 1,737
              matches. To keep this fast in the browser, we bucket pairs by normalized last-name first
              character before scoring — pairs across buckets can&apos;t share a last name, so they&apos;d fail the
              name gate anyway.
            </p>
            <p style={bodyText}>
              That cuts comparisons by roughly 25× (effectively O(n²/26)). Dedup completes in ~1–2 seconds
              for the largest demo user.
            </p>
          </section>

          {/* === Glossary === */}
          <section id="glossary" style={sectionGroup}>
            <h3 style={h3Style}>Glossary</h3>
            <dl style={glossary}>
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
              <dd style={dd}>The dedup engine&apos;s 0–1 score equal to the average segment overlap across pairs in a group. ≥0.7 to suggest, ≥0.9 for high-confidence bulk merge. Pairs below 0.7 are filtered out (treated as different people).</dd>

              <dt style={dt}>cM bracket</dt>
              <dd style={dd}>The ±5% range around a shared cM value used to bucket potential duplicates. Two records must sit in the same cM bracket to be considered as candidates; segment overlap then confirms or rejects.</dd>

              <dt style={dt}>Primary record</dt>
              <dd style={dd}>The first record (lowest ID) in a duplicate group — the anchor. Sibling records get merged into the primary; the primary itself never has a merge button.</dd>

              <dt style={dt}>Sibling record</dt>
              <dd style={dd}>Any non-primary record inside a duplicate group. Each sibling has its own merge / not-a-duplicate decision.</dd>

              <dt style={dt}>Resolved group</dt>
              <dd style={dd}>A group where every sibling has a decision. Shown with a green &ldquo;Resolved&rdquo; badge in the header and sorted to the bottom of the Duplicates tab.</dd>
            </dl>
          </section>

          {/* === CTA === */}
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => router.push('/match-hub')}
              style={{
                padding: '12px 28px',
                borderRadius: 32,
                background: 'var(--gl-color-primary-attention)',
                color: 'white',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--gl-font)',
                lineHeight: '20px',
              }}
            >
              Open the inbox
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 600px) {
          .toc-grid {
            grid-template-columns: 1fr !important;
          }
          .back-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Style constants (mirrors cm-predictor /help)
// ============================================================================

const sectionGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  scrollMarginTop: 24,
};

const h1Style: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '36px',
  margin: 0,
};

const tagline: React.CSSProperties = {
  fontSize: 16,
  color: '#6786AC',
  lineHeight: '24px',
  margin: 0,
};

const h2Style: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '32px',
  margin: 0,
  marginTop: 8,
};

const h3Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: '#263856',
  lineHeight: '28px',
  margin: 0,
};

const bodyText: React.CSSProperties = {
  fontSize: 16,
  color: '#263856',
  lineHeight: '24px',
  margin: 0,
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
};

const unorderedList: React.CSSProperties = { ...orderedList };

const tipCallout: React.CSSProperties = {
  background: 'rgba(122, 184, 255, 0.1)',
  border: '1px solid rgba(122, 184, 255, 0.3)',
  borderRadius: 16,
  padding: '12px 16px',
  fontSize: 14,
  color: '#263856',
  lineHeight: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const calloutTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#245FA4',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const tocLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6786AC',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
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
  fontSize: 13,
  fontWeight: 700,
  color: '#263856',
};

const tocLink: React.CSSProperties = {
  fontSize: 14,
  color: '#FF7C11',
  textDecoration: 'none',
  paddingLeft: 4,
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  background: 'rgba(122, 184, 255, 0.12)',
  color: '#263856',
  fontWeight: 700,
  padding: '10px 12px',
  borderBottom: '1px solid rgba(201, 214, 228, 0.6)',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  color: '#263856',
  lineHeight: '20px',
  borderBottom: '1px solid rgba(201, 214, 228, 0.4)',
};

const tdNum: React.CSSProperties = {
  ...td,
  textAlign: 'right',
  fontWeight: 600,
};

const tdAlt: React.CSSProperties = {
  background: 'rgba(245, 248, 252, 0.6)',
};

const glossary: React.CSSProperties = {
  margin: 0,
  display: 'grid',
  gridTemplateColumns: '180px 1fr',
  gap: '8px 16px',
};

const dt: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#263856',
  paddingTop: 4,
};

const dd: React.CSSProperties = {
  fontSize: 14,
  color: '#263856',
  lineHeight: '22px',
  margin: 0,
};
