import { DNAMatch } from '../types';

const AVATAR_COLORS: Record<string, string> = {
  A: '#FF6B6B', B: '#4ECDC4', C: '#45B7D1', D: '#96CEB4',
  E: '#FFEAA7', F: '#DDA0DD', G: '#98D8C8', H: '#F7DC6F',
  I: '#BB8FCE', J: '#85C1E9', K: '#F0B27A', L: '#AED6F1',
  M: '#D5A6BD', N: '#A3E4D7', O: '#F5CBA7', P: '#AEB6BF',
  Q: '#D2B4DE', R: '#A9DFBF', S: '#FAD7A0', T: '#A9CCE3',
  U: '#D7BDE2', V: '#A2D9CE', W: '#F9E79F', X: '#ABEBC6',
  Y: '#F5B7B1', Z: '#D6DBDF',
};

function getAvatarColor(name: string): string {
  const letter = name.charAt(0).toUpperCase();
  return AVATAR_COLORS[letter] || '#AEB6BF';
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelationship(cM: number): string {
  if (cM > 3400) return 'Self';
  if (cM > 2200) return 'Full Sibling';
  if (cM > 1500) return 'Grandparent';
  if (cM > 1000) return 'Uncle/Aunt';
  if (cM > 500) return '1st Cousin';
  if (cM > 200) return '2nd Cousin';
  if (cM > 90) return '3rd Cousin';
  if (cM > 40) return '4th Cousin';
  if (cM > 20) return '5th Cousin';
  if (cM > 10) return '6th Cousin Once Removed';
  return '6th Cousin or Beyond';
}

function makeMatch(
  id: string, name: string, sharedCM: number,
  source: DNAMatch['source'],
  opts: Partial<DNAMatch> = {}
): DNAMatch {
  return {
    id, name, sharedCM,
    sharedPercentage: +(sharedCM / 7082.58 * 100).toFixed(2),
    relationship: formatRelationship(sharedCM),
    source,
    profileType: 'open',
    isNew: false,
    segments: [],
    tags: [],
    avatarColor: getAvatarColor(name),
    initials: getInitials(name),
    ...opts,
  };
}

/**
 * Cross-vendor mock data — same biological people show up on multiple vendors
 * with slight cM variation (different chip versions, different match algorithms).
 *
 * Duplicate groups (intentional, for dedup engine to find):
 *   Alex Romanov: 23andme + ancestry (high — name+cM+segment overlap)
 *   Sarah Romanov: 23andme + ftdna + gedmatch (very high — 3-way)
 *   Michelle Featherstone: ancestry + myheritage (medium — name diff "M.")
 *   James T Morrow: ancestry + ftdna (high — slight name diff)
 *   Marta Bell: gedmatch + myheritage (medium — "Marta" vs "Marta Bell")
 *
 * Singletons: Nikolai Petrov, Incognito Otter, Anastasiya, J. Smith, Eleanor Hartmann
 */
export const mockMatches: DNAMatch[] = [
  // === Alex Romanov: 23andme + ancestry ===
  makeMatch('23m-alex-romanov', 'Alex Romanov', 65.3, '23andme', {
    lineage: 'maternal',
    sharedSurnames: ['Romanov', 'Petrov', 'Ivanova', 'Sokolova', 'Morozova'],
    ancestryComposition: [
      { region: 'Eastern European', percentage: 42 },
      { region: 'Ashkenazi Jewish', percentage: 18 },
    ],
    segments: [
      { chromosome: 2, startBp: 85000000, endBp: 97000000, cM: 12.1, snps: 950, isTriangulated: true, clusterId: 2 },
      { chromosome: 4, startBp: 84000000, endBp: 92000000, cM: 8.2, snps: 640, isTriangulated: true, clusterId: 2 },
      { chromosome: 10, startBp: 48000000, endBp: 60000000, cM: 11.5, snps: 900, isTriangulated: true, clusterId: 2 },
      { chromosome: 11, startBp: 94000000, endBp: 106000000, cM: 11.8, snps: 920, isTriangulated: true, clusterId: 2 },
      { chromosome: 22, startBp: 18000000, endBp: 32000000, cM: 11.2, snps: 870, isTriangulated: true, clusterId: 2 },
    ],
  }),
  makeMatch('anc-alex-romanov', 'Alex Romanov', 67.1, 'ancestry', {
    lineage: 'maternal',
    sharedSurnames: ['Romanov', 'Petrov'],
    segments: [
      { chromosome: 2, startBp: 85200000, endBp: 96800000, cM: 11.9, snps: 940, isTriangulated: false },
      { chromosome: 4, startBp: 84200000, endBp: 91800000, cM: 8.0, snps: 630, isTriangulated: false },
      { chromosome: 10, startBp: 48500000, endBp: 59800000, cM: 11.3, snps: 890, isTriangulated: false },
      { chromosome: 11, startBp: 94300000, endBp: 105800000, cM: 11.6, snps: 910, isTriangulated: false },
      { chromosome: 22, startBp: 18200000, endBp: 31900000, cM: 11.0, snps: 860, isTriangulated: false },
    ],
  }),

  // === Sarah Romanov: 23andme + ftdna + gedmatch ===
  makeMatch('23m-sarah-romanov', 'Sarah Romanov', 62.8, '23andme', {
    lineage: 'maternal',
    sharedSurnames: ['Romanov', 'Petrov', 'Morozova', 'Bell'],
    segments: [
      { chromosome: 2, startBp: 86000000, endBp: 96000000, cM: 10.8, snps: 840, isTriangulated: true, clusterId: 2 },
      { chromosome: 4, startBp: 83000000, endBp: 91000000, cM: 7.8, snps: 610, isTriangulated: true, clusterId: 2 },
      { chromosome: 10, startBp: 49000000, endBp: 59000000, cM: 10.2, snps: 800, isTriangulated: true, clusterId: 2 },
      { chromosome: 22, startBp: 19000000, endBp: 33000000, cM: 13.8, snps: 1070, isTriangulated: true, clusterId: 2 },
    ],
  }),
  makeMatch('ftd-sarah-romanov', 'Sarah Romanov', 64.2, 'ftdna', {
    lineage: 'maternal',
    sharedSurnames: ['Romanov', 'Bell'],
    segments: [
      { chromosome: 2, startBp: 86100000, endBp: 96100000, cM: 10.9, snps: 845, isTriangulated: false },
      { chromosome: 4, startBp: 83200000, endBp: 90900000, cM: 7.7, snps: 605, isTriangulated: false },
      { chromosome: 22, startBp: 19200000, endBp: 32900000, cM: 13.6, snps: 1060, isTriangulated: false },
    ],
  }),
  makeMatch('gm-sarah-romanov', 'Sarah Romanov', 63.5, 'gedmatch', {
    lineage: 'maternal',
    sharedSurnames: ['Romanov'],
    segments: [
      { chromosome: 2, startBp: 86050000, endBp: 96050000, cM: 10.85, snps: 842, isTriangulated: true, clusterId: 2 },
      { chromosome: 22, startBp: 19100000, endBp: 32950000, cM: 13.7, snps: 1065, isTriangulated: true, clusterId: 2 },
    ],
  }),

  // === Michelle Featherstone: ancestry + myheritage ===
  makeMatch('anc-michelle-feather', 'Michelle Featherstone', 51.6, 'ancestry', {
    lineage: 'paternal',
    sharedSurnames: ['Featherstone', 'Bell', 'Hartmann'],
    ancestryComposition: [
      { region: 'British & Irish', percentage: 48 },
      { region: 'Germanic Europe', percentage: 22 },
    ],
    segments: [
      { chromosome: 1, startBp: 180000000, endBp: 187000000, cM: 7.0, snps: 510, isTriangulated: false },
      { chromosome: 9, startBp: 98000000, endBp: 105600000, cM: 7.6, snps: 600, isTriangulated: true, clusterId: 1 },
      { chromosome: 14, startBp: 66000000, endBp: 76000000, cM: 10.0, snps: 810, isTriangulated: true, clusterId: 3 },
      { chromosome: 19, startBp: 12000000, endBp: 24400000, cM: 12.4, snps: 980, isTriangulated: true, clusterId: 1 },
    ],
  }),
  makeMatch('mh-m-featherstone', 'M. Featherstone', 50.2, 'myheritage', {
    lineage: 'paternal',
    sharedSurnames: ['Featherstone'],
    segments: [], // MyHeritage doesn't expose segment data in this profile
  }),

  // === James T Morrow: ancestry + ftdna ===
  makeMatch('anc-james-morrow', 'James T Morrow', 45.9, 'ancestry', {
    lineage: 'paternal',
    sharedSurnames: ['Morrow', 'Bell'],
    ancestryComposition: [
      { region: 'British & Irish', percentage: 55 },
      { region: 'Germanic Europe', percentage: 18 },
    ],
    segments: [
      { chromosome: 5, startBp: 118000000, endBp: 125700000, cM: 7.7, snps: 580, isTriangulated: true, clusterId: 1 },
      { chromosome: 8, startBp: 62000000, endBp: 71200000, cM: 9.2, snps: 720, isTriangulated: true, clusterId: 1 },
      { chromosome: 12, startBp: 88000000, endBp: 98300000, cM: 10.3, snps: 830, isTriangulated: false },
      { chromosome: 18, startBp: 22000000, endBp: 33300000, cM: 11.3, snps: 910, isTriangulated: false },
    ],
  }),
  makeMatch('ftd-james-morrow', 'James Morrow', 47.2, 'ftdna', {
    lineage: 'paternal',
    sharedSurnames: ['Morrow'],
    segments: [
      { chromosome: 5, startBp: 118100000, endBp: 125600000, cM: 7.6, snps: 575, isTriangulated: false },
      { chromosome: 8, startBp: 62100000, endBp: 71100000, cM: 9.1, snps: 715, isTriangulated: false },
      { chromosome: 18, startBp: 22100000, endBp: 33200000, cM: 11.2, snps: 905, isTriangulated: false },
    ],
  }),

  // === Marta Bell: gedmatch + myheritage (name slightly different) ===
  makeMatch('gm-marta', 'Marta', 57.7, 'gedmatch', {
    lineage: 'unassigned',
    sharedSurnames: ['Sokolova', 'Ivanova'],
    segments: [
      { chromosome: 2, startBp: 88000000, endBp: 95100000, cM: 7.1, snps: 530, isTriangulated: true, clusterId: 2 },
      { chromosome: 7, startBp: 100000000, endBp: 107800000, cM: 7.8, snps: 610, isTriangulated: true, clusterId: 3 },
      { chromosome: 10, startBp: 50000000, endBp: 58000000, cM: 8.0, snps: 640, isTriangulated: true, clusterId: 2 },
      { chromosome: 22, startBp: 20000000, endBp: 31100000, cM: 11.1, snps: 890, isTriangulated: true, clusterId: 2 },
    ],
  }),
  makeMatch('mh-marta-bell', 'Marta Bell', 56.4, 'myheritage', {
    lineage: 'unassigned',
    sharedSurnames: ['Bell'],
    segments: [
      { chromosome: 2, startBp: 88200000, endBp: 94900000, cM: 7.0, snps: 525, isTriangulated: false },
      { chromosome: 10, startBp: 50100000, endBp: 57900000, cM: 7.9, snps: 635, isTriangulated: false },
      { chromosome: 22, startBp: 20100000, endBp: 31000000, cM: 10.9, snps: 880, isTriangulated: false },
    ],
  }),

  // === Singletons (one vendor only) ===
  makeMatch('23m-nikolai-petrov', 'Nikolai Petrov', 58.1, '23andme', {
    lineage: 'maternal',
    sharedSurnames: ['Petrov', 'Romanov', 'Sokolova'],
    segments: [
      { chromosome: 5, startBp: 53000000, endBp: 64000000, cM: 10.8, snps: 840, isTriangulated: true, clusterId: 3 },
      { chromosome: 11, startBp: 38000000, endBp: 49000000, cM: 10.5, snps: 820, isTriangulated: true, clusterId: 3 },
      { chromosome: 15, startBp: 44000000, endBp: 56000000, cM: 11.2, snps: 870, isTriangulated: true, clusterId: 3 },
    ],
  }),
  makeMatch('23m-incognito', 'Incognito Otter', 22.9, '23andme', {
    lineage: 'unassigned',
    isNew: true,
    sharedSurnames: [],
    segments: [
      { chromosome: 3, startBp: 55000000, endBp: 65000000, cM: 10.2, snps: 780, isTriangulated: false },
      { chromosome: 9, startBp: 72000000, endBp: 82000000, cM: 8.5, snps: 640, isTriangulated: true, clusterId: 5 },
    ],
  }),
  makeMatch('ftd-anastasiya', 'Anastasiya', 15.72, 'ftdna', {
    lineage: 'unassigned',
    location: 'Russia',
    sharedSurnames: ['Ivanova'],
    segments: [
      { chromosome: 9, startBp: 74000000, endBp: 82000000, cM: 7.4, snps: 560, isTriangulated: false },
    ],
  }),
  makeMatch('gm-j-smith', 'J. Smith', 28.4, 'gedmatch', {
    lineage: 'unassigned',
    sharedSurnames: ['Smith'],
    segments: [
      { chromosome: 6, startBp: 30000000, endBp: 40000000, cM: 9.2, snps: 720, isTriangulated: false },
      { chromosome: 12, startBp: 55000000, endBp: 64000000, cM: 8.1, snps: 640, isTriangulated: false },
    ],
  }),
  makeMatch('anc-eleanor-hartmann', 'Eleanor Hartmann', 33.6, 'ancestry', {
    lineage: 'paternal',
    sharedSurnames: ['Hartmann', 'Bell'],
    segments: [
      { chromosome: 7, startBp: 22000000, endBp: 32000000, cM: 9.8, snps: 760, isTriangulated: false },
      { chromosome: 13, startBp: 45000000, endBp: 54000000, cM: 8.2, snps: 650, isTriangulated: false },
      { chromosome: 16, startBp: 50000000, endBp: 58000000, cM: 7.4, snps: 580, isTriangulated: false },
    ],
  }),
];

export function getMatchById(id: string): DNAMatch | undefined {
  return mockMatches.find(m => m.id === id);
}
