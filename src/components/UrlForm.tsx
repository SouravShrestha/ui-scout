'use client';
import { useState } from 'react';

interface Props {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const raw = value.trim();
    if (!raw) return;
    try {
      const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      onSubmit(url.href);
    } catch {
      setError('Enter a valid URL, e.g. https://stripe.com');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="https://stripe.com"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="shrink-0 px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
        >
          {isLoading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </form>
  );
}
