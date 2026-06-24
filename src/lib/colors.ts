import type { ColorEntry } from './types';

interface RawColor {
  value: string;
  property: string;
}

const SKIP_VALUES = new Set([
  'transparent', 'inherit', 'initial', 'currentcolor', 'none',
  'unset', 'revert', 'auto', 'currentColor',
]);

const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
  pink: '#ffc0cb', gray: '#808080', grey: '#808080', brown: '#a52a2a',
  navy: '#000080', teal: '#008080', cyan: '#00ffff', magenta: '#ff00ff',
  lime: '#00ff00', indigo: '#4b0082', violet: '#ee82ee', gold: '#ffd700',
  silver: '#c0c0c0', coral: '#ff7f50', salmon: '#fa8072', beige: '#f5f5dc',
  ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa', maroon: '#800000',
  olive: '#808000', tan: '#d2b48c', tomato: '#ff6347', crimson: '#dc143c',
};

// Extracts color declarations from raw HTML text using regex
export function extractColors(html: string): RawColor[] {
  const results: RawColor[] = [];
  // Order matters: more specific properties before 'color' to avoid substring matches
  const regex = /(background-color|border-color|background|(?<![a-z-])color)\s*:\s*([^;}"'\n,]{2,40})/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const property = match[1].trim().toLowerCase();
    const raw = match[3].trim();

    // Skip gradients, url(), var(), calc()
    if (/gradient|url\(|var\(|calc\(/.test(raw)) continue;

    results.push({ property, value: raw });
  }
  return results;
}

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function normalizeColor(raw: string): string | null {
  // Take the first token for shorthand background values
  const s = raw.trim().split(/\s+/)[0].toLowerCase().replace(/;.*$/, '');

  if (!s || SKIP_VALUES.has(s)) return null;

  if (s.startsWith('#')) {
    if (s.length === 4) return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    if (s.length === 7) return s;
    if (s.length === 9) return s.slice(0, 7);
    return null;
  }

  const rgbFull = raw.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbFull) {
    return toHex(parseInt(rgbFull[1]), parseInt(rgbFull[2]), parseInt(rgbFull[3]));
  }

  const hslFull = raw.trim().match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
  if (hslFull) {
    const [r, g, b] = hslToRgb(
      parseInt(hslFull[1]),
      parseInt(hslFull[2]) / 100,
      parseInt(hslFull[3]) / 100,
    );
    return toHex(r, g, b);
  }

  if (NAMED_COLORS[s]) return NAMED_COLORS[s];

  return null;
}

export function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function buildPalette(raws: RawColor[]): ColorEntry[] {
  const map = new Map<string, ColorEntry>();

  for (const raw of raws) {
    const hex = normalizeColor(raw.value);
    if (!hex) continue;

    const existing = map.get(hex);
    if (existing) {
      existing.occurrences++;
    } else {
      map.set(hex, {
        value: hex,
        original: raw.value.trim(),
        property: raw.property,
        occurrences: 1,
        luminance: getLuminance(hex),
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => b.occurrences - a.occurrences || a.luminance - b.luminance)
    .slice(0, 24);
}
