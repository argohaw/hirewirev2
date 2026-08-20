import { Filter, X } from 'lucide-react';
import { useJobs } from '../../context/JobsContext';
import TrueFocus from '../react-bits/TrueFocus';
import { JOB_STATUSES, STATUS_LABELS, type JobStatus } from '../../types/job';

export default function JobFilters() {
  const { filters, setFilters, filteredJobs, jobs } = useJobs();

  return (
    <section className="hw-card rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
          <Filter className="h-4 w-4 text-[var(--hw-gold)]" />
          Showing {filteredJobs.length} of {jobs.length}
        </div>
        {(filters.query ||
          filters.status !== 'all' ||
          filters.dateFrom ||
          filters.dateTo) && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-[var(--fg-muted)]"
            onClick={() =>
              setFilters({ query: '', status: 'all', dateFrom: '', dateTo: '' })
            }
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <label>
          <span className="hw-label">Company or role</span>
          <input
            className="hw-input"
            value={filters.query}
            onChange={(event) => setFilters({ query: event.target.value })}
            placeholder="Acme, Staff Engineer..."
          />
        </label>
        <label>
          <span className="hw-label">From</span>
          <input
            type="date"
            className="hw-input"
            value={filters.dateFrom}
            onChange={(event) => setFilters({ dateFrom: event.target.value })}
          />
        </label>
        <label>
          <span className="hw-label">To</span>
          <input
            type="date"
            className="hw-input"
            value={filters.dateTo}
            onChange={(event) => setFilters({ dateTo: event.target.value })}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="hw-label">Status</p>
        <TrueFocus
          words={['All', ...JOB_STATUSES.map((status) => STATUS_LABELS[status])]}
          active={
            filters.status === 'all' ? 'All' : STATUS_LABELS[filters.status]
          }
          onSelect={(word) => {
            if (word === 'All') {
              setFilters({ status: 'all' });
              return;
            }
            const match = JOB_STATUSES.find(
              (status) => STATUS_LABELS[status] === word,
            ) as JobStatus | undefined;
            if (match) setFilters({ status: match });
          }}
        />
      </div>
    </section>
  );
}
