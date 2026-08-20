import { Calendar, MapPin, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';
import { formatDate, formatSalary } from '../../lib/cn';
import StatusBadge from '../common/StatusBadge';

export default function JobCardGrid() {
  const { filteredJobs, openEdit } = useJobs();

  if (!filteredJobs.length) {
    return (
      <div className="hw-card rounded-2xl px-4 py-16 text-center text-[var(--fg-muted)] lg:hidden">
        No applications match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
      {filteredJobs.map((job, index) => (
        <motion.article
          key={job.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="hw-card rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg">{job.company}</p>
              <p className="text-sm text-[var(--fg-muted)]">{job.role}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="mt-3 space-y-1 text-xs text-[var(--fg-muted)]">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {job.location || 'Location TBD'}
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Applied {formatDate(job.appliedDate)}
            </p>
            <p>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
          </div>
          <button
            type="button"
            onClick={() => openEdit(job)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--hw-gold)] py-2 text-sm font-semibold text-[var(--hw-black)]"
          >
            <Pencil className="h-4 w-4" />
            Open details
          </button>
        </motion.article>
      ))}
    </div>
  );
}
