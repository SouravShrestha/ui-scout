export type LayoutRole =
  | 'header'
  | 'nav'
  | 'hero'
  | 'section'
  | 'aside'
  | 'footer'
  | 'card'
  | 'image'
  | 'container'
  | 'unknown';

export interface LayoutNode {
  tag: string;
  role: LayoutRole;
  bgColor: string | null;
  textColor: string | null;
  depth: number;
  widthHint: number;
  children: LayoutNode[];
  isImage: boolean;
  hasText: boolean;
  id?: string;
  className?: string;
}

export interface ColorEntry {
  value: string;
  original: string;
  property: string;
  occurrences: number;
  luminance: number;
}

export interface AnalyzeResponse {
  url: string;
  tree: LayoutNode;
  palette: ColorEntry[];
  fetchedAt: string;
}

export interface AnalyzeError {
  error: string;
  code: 'INVALID_URL' | 'FETCH_FAILED' | 'PARSE_ERROR' | 'BLOCKED';
}
