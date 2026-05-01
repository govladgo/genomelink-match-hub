export interface Segment {
  chromosome: number;
  startBp: number;
  endBp: number;
  cM: number;
  snps: number;
  isTriangulated: boolean;
  clusterId?: number;
}

export interface DNAMatch {
  id: string;
  name: string;
  sharedCM: number;
  sharedPercentage: number;
  relationship: string;
  source: '23andme' | 'myheritage' | 'ftdna' | 'gedmatch' | 'ancestry' | 'manual' | 'other';
  profileType: 'open' | 'limited';
  isNew: boolean;
  segments: Segment[];
  tags: string[];
  avatarColor: string;
  initials: string;
  birthYear?: string;
  location?: string;
  treeUrl?: string;
  lineage?: 'paternal' | 'maternal' | 'unassigned';
  sharedSurnames?: string[];
  ancestryComposition?: AncestryComponent[];
  endogamyScore?: number;
  sharedTraits?: number;
  dissimilarTraits?: number;
  crossVendorLink?: CrossVendorLink;
}

export interface AncestryComponent {
  region: string;
  percentage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type CitationSource =
  | 'cm' | 'segments' | 'cluster' | 'lineage'
  | 'surnames' | 'ancestry' | 'endogamy' | 'traits' | 'source';

export interface Citation {
  source: CitationSource;
  value: string;
}

export interface CrossVendorLink {
  /** IDs of matches representing the same person on other vendors */
  linkedMatchIds: string[];
  /** 0-1 confidence score */
  confidence: number;
  /** Which signals contributed */
  basis: ('name' | 'cm' | 'segments')[];
}
