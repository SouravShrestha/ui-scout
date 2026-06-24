import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gray-900 dark:bg-white flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white dark:text-gray-900">
            <rect x="1" y="1" width="4" height="4" fill="currentColor" />
            <rect x="9" y="1" width="4" height="4" fill="currentColor" />
            <rect x="1" y="9" width="4" height="4" fill="currentColor" />
            <rect x="9" y="9" width="4" height="4" fill="currentColor" opacity="0.4" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">UI Scout</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
