export type JobStatus = 'applied' | 'interviewing' | 'offered' | 'rejected';

export type SyncStatus = 'idle' | 'syncing' | 'connected' | 'offline';

export type SortKey = 'company' | 'role' | 'appliedDate' | 'status' | 'salary';

export type SortDirection = 'asc' | 'desc';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  status: JobStatus;
  appliedDate: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  jobUrl: string;
  recruiterName: string;
  recruiterEmail: string;
  interviewDate: string;
  notes: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDraft {
  company: string;
  role: string;
  location: string;
  status: JobStatus;
  appliedDate: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  jobUrl: string;
  recruiterName: string;
  recruiterEmail: string;
  interviewDate: string;
  notes: string;
  jobDescription: string;
}

export interface JobFiltersState {
  query: string;
  status: JobStatus | 'all';
  dateFrom: string;
  dateTo: string;
}

export interface JobSortState {
  key: SortKey;
  direction: SortDirection;
}

export interface SheetsListResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export const JOB_STATUSES: JobStatus[] = [
  'applied',
  'interviewing',
  'offered',
  'rejected',
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Rejected',
};

export const EMPTY_DRAFT: JobDraft = {
  company: '',
  role: '',
  location: '',
  status: 'applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'USD',
  jobUrl: '',
  recruiterName: '',
  recruiterEmail: '',
  interviewDate: '',
  notes: '',
  jobDescription: '',
};

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function jobToDraft(job: JobApplication): JobDraft {
  return {
    company: job.company,
    role: job.role,
    location: job.location,
    status: job.status,
    appliedDate: job.appliedDate.slice(0, 10),
    salaryMin: job.salaryMin == null ? '' : String(job.salaryMin),
    salaryMax: job.salaryMax == null ? '' : String(job.salaryMax),
    salaryCurrency: job.salaryCurrency || 'USD',
    jobUrl: job.jobUrl,
    recruiterName: job.recruiterName,
    recruiterEmail: job.recruiterEmail,
    interviewDate: job.interviewDate ? job.interviewDate.slice(0, 16) : '',
    notes: job.notes,
    jobDescription: job.jobDescription,
  };
}

export function draftToJob(
  draft: JobDraft,
  existing?: JobApplication,
): JobApplication {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? createId(),
    company: draft.company.trim(),
    role: draft.role.trim(),
    location: draft.location.trim(),
    status: draft.status,
    appliedDate: draft.appliedDate,
    salaryMin: parseOptionalNumber(draft.salaryMin),
    salaryMax: parseOptionalNumber(draft.salaryMax),
    salaryCurrency: draft.salaryCurrency.trim() || 'USD',
    jobUrl: draft.jobUrl.trim(),
    recruiterName: draft.recruiterName.trim(),
    recruiterEmail: draft.recruiterEmail.trim(),
    interviewDate: draft.interviewDate,
    notes: draft.notes.trim(),
    jobDescription: draft.jobDescription.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function isJobStatus(value: unknown): value is JobStatus {
  return (
    value === 'applied' ||
    value === 'interviewing' ||
    value === 'offered' ||
    value === 'rejected'
  );
}

export function isJobApplication(value: unknown): value is JobApplication {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.company === 'string' &&
    typeof record.role === 'string' &&
    typeof record.location === 'string' &&
    isJobStatus(record.status) &&
    typeof record.appliedDate === 'string' &&
    (record.salaryMin === null || typeof record.salaryMin === 'number') &&
    (record.salaryMax === null || typeof record.salaryMax === 'number') &&
    typeof record.salaryCurrency === 'string' &&
    typeof record.jobUrl === 'string' &&
    typeof record.recruiterName === 'string' &&
    typeof record.recruiterEmail === 'string' &&
    typeof record.interviewDate === 'string' &&
    typeof record.notes === 'string' &&
    typeof record.jobDescription === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

export function coerceJobApplication(value: unknown): JobApplication | null {
  if (isJobApplication(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.company !== 'string' || typeof record.role !== 'string') {
    return null;
  }

  const status = isJobStatus(record.status) ? record.status : 'applied';
  const now = new Date().toISOString();

  return {
    id: typeof record.id === 'string' ? record.id : createId(),
    company: record.company,
    role: record.role,
    location: typeof record.location === 'string' ? record.location : '',
    status,
    appliedDate:
      typeof record.appliedDate === 'string'
        ? record.appliedDate
        : now.slice(0, 10),
    salaryMin: toNullableNumber(record.salaryMin ?? record.salary),
    salaryMax: toNullableNumber(record.salaryMax),
    salaryCurrency:
      typeof record.salaryCurrency === 'string' ? record.salaryCurrency : 'USD',
    jobUrl: typeof record.jobUrl === 'string' ? record.jobUrl : '',
    recruiterName:
      typeof record.recruiterName === 'string' ? record.recruiterName : '',
    recruiterEmail:
      typeof record.recruiterEmail === 'string' ? record.recruiterEmail : '',
    interviewDate:
      typeof record.interviewDate === 'string' ? record.interviewDate : '',
    notes: typeof record.notes === 'string' ? record.notes : '',
    jobDescription:
      typeof record.jobDescription === 'string' ? record.jobDescription : '',
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : now,
  };
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
