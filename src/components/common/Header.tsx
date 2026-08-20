import { Moon, Plus, RefreshCw, Search, Sun, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';
import { useTheme } from '../../context/ThemeContext';
import GradientText from '../react-bits/GradientText';
import type { JobStatus } from '../../types/job';

const NAV: Array<{ label: string; status: JobStatus | 'all' }> = [
  { label: 'Dashboard', status: 'all' },
  { label: 'Applied', status: 'applied' },
  { label: 'Interviews', status: 'interviewing' },
  { label: 'Offers', status: 'offered' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { filters, setFilters, syncStatus, refresh, openCreate } = useJobs();
  const connected = syncStatus === 'connected';
  const syncing = syncStatus === 'syncing';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-6">
        <a href="#dashboard" className="flex items-center gap-3">
          <img src="/logo.svg" alt="HireWire" className="h-10 w-10" />
          <div>
            <GradientText className="font-display text-xl font-bold tracking-tight">
              HireWire
            </GradientText>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
              Job tracker
            </p>
          </div>
        </a>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV.map((item) => {
            const isActive = filters.status === item.status;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setFilters({ status: item.status })}
                className={`rounded-full px-3 py-1.5 transition ${
                  isActive
                    ? 'bg-[var(--hw-gold)] text-[var(--hw-black)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input
            value={filters.query}
            onChange={(event) => setFilters({ query: event.target.value })}
            placeholder="Search company, role, notes..."
            className="hw-input pl-10"
            aria-label="Global search"
          />
        </label>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs"
            title={connected ? 'Google Sheets connected' : 'Offline cache mode'}
          >
            {connected ? (
              <Wifi className="h-3.5 w-3.5 text-[var(--hw-neon)]" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-[var(--hw-gold)]" />
            )}
            <span className="uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              {syncing ? 'Syncing' : connected ? 'Sheets live' : 'Offline'}
            </span>
            <motion.span
              className="h-2 w-2 rounded-full"
              animate={{
                backgroundColor: connected ? '#39FF14' : '#D4AF37',
                scale: syncing ? [1, 1.35, 1] : 1,
              }}
              transition={{ repeat: syncing ? Infinity : 0, duration: 0.9 }}
            />
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
            aria-label="Refresh applications"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--hw-gold)] px-3 py-2 text-sm font-semibold text-[var(--hw-black)]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </header>
  );
}
