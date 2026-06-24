import { parseHTML } from 'linkedom';
import { extractColors, buildPalette, normalizeColor, extractTailwindBgColor, extractTailwindColors } from './colors';
import type { LayoutNode, LayoutRole, ColorEntry } from './types';

const LAYOUT_TAGS = new Set([
  'body', 'header', 'nav', 'main', 'section', 'article',
  'aside', 'footer', 'div', 'img', 'picture', 'figure',
  'form', 'ul', 'ol', 'table',
]);

const TAILWIND_WIDTH: Record<string, number> = {
  'w-full': 1, 'w-screen': 1, 'w-1/2': 0.5, 'w-1/3': 0.333, 'w-2/3': 0.667,
  'w-1/4': 0.25, 'w-3/4': 0.75, 'container': 0.9,
  'max-w-xl': 0.5, 'max-w-2xl': 0.6, 'max-w-3xl': 0.7, 'max-w-4xl': 0.75,
  'max-w-5xl': 0.85, 'max-w-6xl': 0.9, 'max-w-7xl': 0.95,
};

function classifyRole(tag: string, id: string, cls: string): LayoutRole {
  const combined = `${tag} ${id} ${cls}`.toLowerCase();
  if (tag === 'header' || /\bheader\b|\bbanner\b/.test(combined)) return 'header';
  if (tag === 'nav' || /\bnav\b|\bmenu\b|\bnavbar\b|\bnavigation\b/.test(combined)) return 'nav';
  if (/\bhero\b|\bjumbotron\b|\bsplash\b|\bbillboard\b/.test(combined)) return 'hero';
  if (tag === 'footer' || /\bfooter\b/.test(combined)) return 'footer';
  if (tag === 'aside' || /\bsidebar\b|\baside\b/.test(combined)) return 'aside';
  if (tag === 'section' || tag === 'article' || tag === 'main') return 'section';
  if (/\bcard\b|\btile\b|\bitem\b|\bproduct\b|\bfeature\b/.test(combined)) return 'card';
  if (tag === 'img' || tag === 'picture' || tag === 'figure') return 'image';
  if (/\bwrapper\b|\bcontainer\b|\blayout\b/.test(combined)) return 'container';
  return 'unknown';
}

function parseWidthHint(el: Element): number {
  const style = el.getAttribute('style') || '';
  const widthMatch = style.match(/\bwidth\s*:\s*(\d+)%/);
  if (widthMatch) return parseInt(widthMatch[1]) / 100;

  const cls = el.getAttribute('class') || '';
  for (const [token, hint] of Object.entries(TAILWIND_WIDTH)) {
    if (cls.split(' ').includes(token)) return hint;
  }
  return 1;
}

function extractBgColor(styleAttr: string): string | null {
  const match = styleAttr.match(/background(?:-color)?\s*:\s*([^;}"']+)/i);
  if (!match) return null;
  const val = match[1].trim();
  if (/gradient|url\(|var\(/.test(val)) return null;
  return normalizeColor(val);
}

function extractTextColor(styleAttr: string): string | null {
  const match = styleAttr.match(/(?<![a-z-])color\s*:\s*([^;}"']+)/i);
  if (!match) return null;
  return normalizeColor(match[1].trim());
}

function buildNode(el: Element, depth: number): LayoutNode | null {
  if (depth > 6) return null;

  const tag = el.tagName?.toLowerCase();
  if (!tag || !LAYOUT_TAGS.has(tag)) return null;

  const id = el.getAttribute('id') || undefined;
  const cls = el.getAttribute('class') || '';
  const styleAttr = el.getAttribute('style') || '';
  const role = classifyRole(tag, id || '', cls);

  const bgColor = extractBgColor(styleAttr) ?? extractTailwindBgColor(cls);
  const textColor = extractTextColor(styleAttr);

  const children: LayoutNode[] = [];
  const maxChildren = Math.min(el.children.length, 40);
  for (let i = 0; i < maxChildren; i++) {
    const node = buildNode(el.children[i] as Element, depth + 1);
    if (node) children.push(node);
  }

  // Prune: uninformative divs with no color, no semantic role, no children
  if (tag === 'div' && role === 'unknown' && !bgColor && children.length === 0) return null;

  const hasText = (el.textContent?.trim().length ?? 0) > 15;
  const isImage = tag === 'img' || tag === 'picture' || tag === 'figure';
  const firstClass = cls.split(' ').find((c) => c.length > 0);

  return {
    tag,
    role,
    bgColor,
    textColor,
    depth,
    widthHint: parseWidthHint(el),
    children,
    isImage,
    hasText,
    id,
    className: firstClass,
  };
}

export function parseFromLayout(html: string, extraCss = ''): { tree: LayoutNode; palette: ColorEntry[] } {
  const rawColors = [
    ...extractColors(html + (extraCss ? '\n' + extraCss : '')),
    ...extractTailwindColors(html),
  ];
  const palette = buildPalette(rawColors);

  let rootChildren: LayoutNode[] = [];

  try {
    const { document } = parseHTML(html);
    const body = document.body;

    if (body) {
      const maxTop = Math.min(body.children.length, 40);
      for (let i = 0; i < maxTop; i++) {
        const node = buildNode(body.children[i] as Element, 1);
        if (node) rootChildren.push(node);
      }
    }
  } catch {
    // If linkedom parsing fails, return palette-only result
  }

  const tree: LayoutNode = {
    tag: 'body',
    role: 'container',
    bgColor: null,
    textColor: null,
    depth: 0,
    widthHint: 1,
    children: rootChildren,
    isImage: false,
    hasText: false,
  };

  return { tree, palette };
}
