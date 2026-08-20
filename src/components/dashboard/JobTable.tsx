import { ArrowUpDown, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useJobs } from '../../context/JobsContext';
import { formatDate, formatSalary } from '../../lib/cn';
import StatusBadge from '../common/StatusBadge';
import type { JobStatus, SortKey } from '../../types/job';
import { JOB_STATUSES, STATUS_LABELS } from '../../types/job';

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'appliedDate', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'salary', label: 'Salary' },
];

export default function JobTable() {
  const { filteredJobs, sort, setSort, openEdit, updateStatus, removeJob } = useJobs();

  return (
    <div className="hw-card hidden overflow-hidden rounded-2xl lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[var(--bg-muted)] text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => setSort(column.key)}
                  >
                    {column.label}
                    <ArrowUpDown
                      className={`h-3.5 w-3.5 ${
                        sort.key === column.key ? 'text-[var(--hw-gold)]' : ''
                      }`}
                    />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[var(--fg-muted)]">
                  No applications match the current filters.
                </td>
              </tr>
            )}
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                className="border-t border-[var(--border)] transition hover:bg-[var(--bg-muted)]"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold">{job.company}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{job.location}</p>
                </td>
                <td className="px-4 py-3">{job.role}</td>
                <td className="px-4 py-3">{formatDate(job.appliedDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={job.status} />
                    <select
                      className="hw-input py-1 text-xs"
                      value={job.status}
                      onChange={(event) =>
                        void updateStatus(job.id, event.target.value as JobStatus)
                      }
                    >
                      {JOB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-[var(--border)] p-2"
                      onClick={() => openEdit(job)}
                      aria-label={`Edit ${job.company}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[var(--border)] p-2"
                        aria-label={`Open ${job.company} listing`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      className="rounded-full border border-[var(--border)] p-2 text-[var(--hw-red)]"
                      onClick={() => {
                        if (window.confirm(`Delete ${job.role} at ${job.company}?`)) {
                          void removeJob(job.id);
                        }
                      }}
                      aria-label={`Delete ${job.company}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
