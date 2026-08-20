import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useJobs } from '../../context/JobsContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  EMPTY_DRAFT,
  JOB_STATUSES,
  STATUS_LABELS,
  jobToDraft,
  type JobDraft,
} from '../../types/job';

interface FieldErrors {
  company?: string;
  role?: string;
  appliedDate?: string;
  salary?: string;
  recruiterEmail?: string;
  jobUrl?: string;
}

function validateDraft(draft: JobDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.company.trim()) errors.company = 'Company is required.';
  if (!draft.role.trim()) errors.role = 'Role is required.';
  if (!draft.appliedDate) errors.appliedDate = 'Applied date is required.';

  const min = draft.salaryMin.trim() ? Number(draft.salaryMin.replace(/,/g, '')) : null;
  const max = draft.salaryMax.trim() ? Number(draft.salaryMax.replace(/,/g, '')) : null;
  if (draft.salaryMin && Number.isNaN(min)) errors.salary = 'Salary min must be a number.';
  if (draft.salaryMax && Number.isNaN(max)) errors.salary = 'Salary max must be a number.';
  if (min != null && max != null && !Number.isNaN(min) && !Number.isNaN(max) && min > max) {
    errors.salary = 'Minimum salary cannot exceed maximum.';
  }

  if (draft.recruiterEmail.trim()) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recruiterEmail.trim());
    if (!emailOk) errors.recruiterEmail = 'Enter a valid recruiter email.';
  }

  if (draft.jobUrl.trim()) {
    try {
      new URL(draft.jobUrl.trim());
    } catch {
      errors.jobUrl = 'Job URL must be a valid absolute URL.';
    }
  }

  return errors;
}

export default function JobDetailModal() {
  const {
    isEditorOpen,
    editorMode,
    selectedJob,
    closeEditor,
    saveDraft,
    removeJob,
    updateStatus,
  } = useJobs();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditorOpen) return;
    setErrors({});
    setFormError(null);
    setDraft(selectedJob ? jobToDraft(selectedJob) : { ...EMPTY_DRAFT });
  }, [isEditorOpen, selectedJob]);

  useEffect(() => {
    if (!isEditorOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeEditor();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditorOpen, closeEditor]);

  const title = editorMode === 'create' ? 'New application' : draft.company || 'Edit application';
  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  const patch = (key: keyof JobDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError('Fix the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await saveDraft(draft, selectedJob ?? undefined);
      closeEditor();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save application.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isEditorOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close editor overlay"
            className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--hw-black)_55%,transparent)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditor}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-editor-title"
            initial={
              isDesktop ? { x: '100%' } : { y: '100%' }
            }
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: '100%' } : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={
              isDesktop
                ? 'fixed right-0 top-0 z-50 flex h-dvh w-full max-w-xl flex-col border-l border-[var(--border)] bg-[var(--bg-elevated)]'
                : 'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border border-[var(--border)] bg-[var(--bg-elevated)]'
            }
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--hw-gold)]">
                  {editorMode === 'create' ? 'Create' : 'Edit'}
                </p>
                <h2 id="job-editor-title" className="font-display text-2xl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-[var(--border)] p-2"
                aria-label="Close editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(event) => void onSubmit(event)} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="hw-label">Company</span>
                    <input
                      className="hw-input"
                      value={draft.company}
                      onChange={(event) => patch('company', event.target.value)}
                    />
                    {errors.company && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.company}</p>
                    )}
                  </label>
                  <label>
                    <span className="hw-label">Role</span>
                    <input
                      className="hw-input"
                      value={draft.role}
                      onChange={(event) => patch('role', event.target.value)}
                    />
                    {errors.role && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.role}</p>
                    )}
                  </label>
                  <label>
                    <span className="hw-label">Location</span>
                    <input
                      className="hw-input"
                      value={draft.location}
                      onChange={(event) => patch('location', event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="hw-label">Status</span>
                    <select
                      className="hw-input"
                      value={draft.status}
                      onChange={(event) => {
                        const status = event.target.value as JobDraft['status'];
                        patch('status', status);
                        if (selectedJob) void updateStatus(selectedJob.id, status);
                      }}
                    >
                      {JOB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="hw-label">Applied date</span>
                    <input
                      type="date"
                      className="hw-input"
                      value={draft.appliedDate}
                      onChange={(event) => patch('appliedDate', event.target.value)}
                    />
                    {errors.appliedDate && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.appliedDate}</p>
                    )}
                  </label>
                  <label>
                    <span className="hw-label">Interview date</span>
                    <input
                      type="datetime-local"
                      className="hw-input"
                      value={draft.interviewDate}
                      onChange={(event) => patch('interviewDate', event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="hw-label">Salary min</span>
                    <input
                      className="hw-input"
                      inputMode="numeric"
                      value={draft.salaryMin}
                      onChange={(event) => patch('salaryMin', event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="hw-label">Salary max</span>
                    <input
                      className="hw-input"
                      inputMode="numeric"
                      value={draft.salaryMax}
                      onChange={(event) => patch('salaryMax', event.target.value)}
                    />
                    {errors.salary && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.salary}</p>
                    )}
                  </label>
                  <label>
                    <span className="hw-label">Currency</span>
                    <input
                      className="hw-input"
                      value={draft.salaryCurrency}
                      onChange={(event) => patch('salaryCurrency', event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="hw-label">Job URL</span>
                    <input
                      className="hw-input"
                      value={draft.jobUrl}
                      onChange={(event) => patch('jobUrl', event.target.value)}
                    />
                    {errors.jobUrl && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.jobUrl}</p>
                    )}
                  </label>
                  <label>
                    <span className="hw-label">Recruiter</span>
                    <input
                      className="hw-input"
                      value={draft.recruiterName}
                      onChange={(event) => patch('recruiterName', event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="hw-label">Recruiter email</span>
                    <input
                      className="hw-input"
                      value={draft.recruiterEmail}
                      onChange={(event) => patch('recruiterEmail', event.target.value)}
                    />
                    {errors.recruiterEmail && (
                      <p className="mt-1 text-xs text-[var(--hw-red)]">{errors.recruiterEmail}</p>
                    )}
                  </label>
                </div>
                <label className="block">
                  <span className="hw-label">Recruiter notes</span>
                  <textarea
                    className="hw-input min-h-24"
                    value={draft.notes}
                    onChange={(event) => patch('notes', event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="hw-label">Job description</span>
                  <textarea
                    className="hw-input min-h-32"
                    value={draft.jobDescription}
                    onChange={(event) => patch('jobDescription', event.target.value)}
                  />
                </label>
                {formError && (
                  <p className="rounded-xl border border-[var(--hw-red)] px-3 py-2 text-sm text-[var(--hw-red)]">
                    {formError}
                    {errorCount > 0 ? ` (${errorCount} field${errorCount > 1 ? 's' : ''})` : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
                {selectedJob ? (
                  <button
                    type="button"
                    className="text-sm text-[var(--hw-red)]"
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedJob.role} at ${selectedJob.company}?`)) {
                        void removeJob(selectedJob.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[var(--hw-gold)] px-5 py-2 text-sm font-semibold text-[var(--hw-black)] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save application'}
                  </button>
                </div>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
