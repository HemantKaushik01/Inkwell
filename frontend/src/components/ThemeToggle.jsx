import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className={`theme-toggle`}
      onClick={() => setDark(d => !d)}
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ background: dark ? 'var(--color-primary)' : 'var(--color-bg-3)' }}
    >
      <span
        className="theme-toggle-thumb"
        style={{ transform: dark ? 'translateX(20px)' : 'translateX(0)' }}
      >
        {dark ? <Moon size={10} /> : <Sun size={10} style={{ color: 'hsl(38,92%,50%)' }} />}
      </span>
    </button>
  );
}
