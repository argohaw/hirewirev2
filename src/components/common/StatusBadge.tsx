import { cn } from '../../lib/cn';
import type { JobStatus } from '../../types/job';
import { STATUS_LABELS } from '../../types/job';

const STATUS_CLASS: Record<JobStatus, string> = {
  applied:
    'bg-[var(--chip-applied)] text-[color-mix(in_srgb,var(--hw-gold)_80%,var(--fg))]',
  interviewing:
    'bg-[var(--chip-interviewing)] text-[color-mix(in_srgb,var(--hw-gold)_70%,var(--fg))]',
  offered:
    'bg-[var(--chip-offered)] text-[color-mix(in_srgb,var(--hw-neon)_55%,var(--fg))]',
  rejected:
    'bg-[var(--chip-rejected)] text-[color-mix(in_srgb,var(--hw-red)_70%,var(--fg))]',
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase',
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
