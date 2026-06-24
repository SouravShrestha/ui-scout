'use client';
import Header from '../components/Header';
import UrlForm from '../components/UrlForm';
import WireframeCanvas from '../components/WireframeCanvas';
import ColorPalette from '../components/ColorPalette';
import { useAnalyze } from '../hooks/useAnalyze';

export default function Home() {
  const { analyze, data, error, isLoading } = useAnalyze();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Hero */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight">
              Website Color Layout Scout
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter any URL to extract its color palette and visualize the page layout as a wireframe
            </p>
          </div>

          {/* URL input */}
          <UrlForm onSubmit={analyze} isLoading={isLoading} />

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
              <span className="text-sm">Fetching and analyzing…</span>
            </div>
          )}

          {/* Results */}
          {data && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="truncate max-w-xs">{data.url}</span>
                <span className="shrink-0 ml-4">{data.palette.length} colors extracted</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Wireframe */}
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Layout Wireframe
                  </h2>
                  <WireframeCanvas tree={data.tree} url={data.url} />
                </div>

                {/* Palette */}
                <div className="space-y-3">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Color Palette
                  </h2>
                  <ColorPalette palette={data.palette} />
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data && !isLoading && !error && (
            <div className="text-center py-16 text-gray-300 dark:text-gray-700">
              <svg className="mx-auto mb-4 opacity-50" width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="12" y="12" width="24" height="6" rx="1" fill="currentColor" opacity="0.4" />
                <rect x="12" y="22" width="24" height="14" rx="1" fill="currentColor" opacity="0.2" />
              </svg>
              <p className="text-sm">Enter a URL above to get started</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
