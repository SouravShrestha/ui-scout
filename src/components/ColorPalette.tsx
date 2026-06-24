'use client';
import { useState } from 'react';
import type { ColorEntry } from '../lib/types';

interface Props {
  palette: ColorEntry[];
}

export default function ColorPalette({ palette }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard API not available
    }
  }

  if (palette.length === 0) {
    return (
      <p className="text-sm text-gray-400">No explicit colors found — the site may use an external stylesheet</p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">{palette.length} colors · click to copy</p>
      <div className="flex flex-wrap gap-3">
        {palette.map((entry) => (
          <button
            key={entry.value}
            onClick={() => copy(entry.value)}
            title={`${entry.value} (used ${entry.occurrences}×)`}
            className="group flex flex-col items-center gap-1.5 focus:outline-none"
          >
            <div
              className="w-11 h-11 rounded-lg border border-black/10 dark:border-white/10 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-150"
              style={{ backgroundColor: entry.value }}
            />
            <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {copied === entry.value ? '✓' : entry.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
