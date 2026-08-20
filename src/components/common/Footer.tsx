import CountUp from '../react-bits/CountUp';
import { useJobs } from '../../context/JobsContext';
import type { JobStatus } from '../../types/job';

const QUICK: Array<{ label: string; status: JobStatus | 'all' }> = [
  { label: 'All', status: 'all' },
  { label: 'Applied', status: 'applied' },
  { label: 'Interviewing', status: 'interviewing' },
  { label: 'Offered', status: 'offered' },
  { label: 'Rejected', status: 'rejected' },
];

export default function Footer() {
  const { stats, setFilters, syncStatus, jobs } = useJobs();
  const latest = jobs.reduce((stamp, job) => {
    return job.updatedAt > stamp ? job.updatedAt : stamp;
  }, '');

  return (
    <footer className="mt-10 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-[var(--hw-gold)]">HireWire</p>
          <p className="mt-2 max-w-md text-sm text-[var(--fg-muted)]">
            Tracking {stats.total} applications
            {syncStatus === 'connected'
              ? ' with a live Google Sheets connection.'
              : ' from the local cache while Sheets is offline.'}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">
            © {new Date().getFullYear()} HireWire · Built for focused job search ops
          </p>
        </div>

        <div>
          <p className="hw-label">Live stats</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              Pipeline{' '}
              <CountUp to={stats.total} className="font-semibold text-[var(--hw-gold)]" />
            </p>
            <p>
              Interviews{' '}
              <CountUp
                to={stats.interviewing}
                className="font-semibold text-[var(--hw-gold)]"
              />
            </p>
            <p>
              Offers{' '}
              <CountUp to={stats.offered} className="font-semibold text-[var(--hw-neon)]" />
            </p>
            {latest && (
              <p className="text-xs text-[var(--fg-muted)]">
                Last mutation {new Date(latest).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="hw-label">Quick filters</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setFilters({ status: item.status });
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[var(--fg-muted)] hover:border-[var(--hw-gold)] hover:text-[var(--fg)]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
