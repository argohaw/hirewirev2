import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { sheetsService } from '../services/sheetsApi';
import {
  draftToJob,
  type JobApplication,
  type JobDraft,
  type JobFiltersState,
  type JobSortState,
  type JobStatus,
  type SyncStatus,
} from '../types/job';

interface JobsContextValue {
  jobs: JobApplication[];
  filteredJobs: JobApplication[];
  filters: JobFiltersState;
  sort: JobSortState;
  syncStatus: SyncStatus;
  loading: boolean;
  error: string | null;
  selectedJob: JobApplication | null;
  isEditorOpen: boolean;
  editorMode: 'create' | 'edit';
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    offered: number;
    rejected: number;
  };
  setFilters: (patch: Partial<JobFiltersState>) => void;
  setSort: (key: JobSortState['key']) => void;
  refresh: () => Promise<void>;
  saveDraft: (draft: JobDraft, existing?: JobApplication) => Promise<void>;
  updateStatus: (id: string, status: JobStatus) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  openCreate: () => void;
  openEdit: (job: JobApplication) => void;
  closeEditor: () => void;
}

const JobsContext = createContext<JobsContextValue | null>(null);

const DEFAULT_FILTERS: JobFiltersState = {
  query: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

function salaryValue(job: JobApplication): number {
  return job.salaryMax ?? job.salaryMin ?? -1;
}

function compareJobs(
  a: JobApplication,
  b: JobApplication,
  sort: JobSortState,
): number {
  let result = 0;
  switch (sort.key) {
    case 'company':
      result = a.company.localeCompare(b.company);
      break;
    case 'role':
      result = a.role.localeCompare(b.role);
      break;
    case 'appliedDate':
      result = a.appliedDate.localeCompare(b.appliedDate);
      break;
    case 'status':
      result = a.status.localeCompare(b.status);
      break;
    case 'salary':
      result = salaryValue(a) - salaryValue(b);
      break;
    default:
      result = 0;
  }
  return sort.direction === 'asc' ? result : -result;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filters, setFiltersState] = useState<JobFiltersState>(DEFAULT_FILTERS);
  const [sort, setSortState] = useState<JobSortState>({
    key: 'appliedDate',
    direction: 'desc',
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  const refresh = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    setError(null);
    try {
      const result = await sheetsService.fetchApplications();
      setJobs(result.jobs);
      setSyncStatus(result.syncStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load applications.');
      setJobs(sheetsService.seedFallback());
      setSyncStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setFilters = useCallback((patch: Partial<JobFiltersState>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
  }, []);

  const setSort = useCallback((key: JobSortState['key']) => {
    setSortState((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'company' || key === 'role' ? 'asc' : 'desc' },
    );
  }, []);

  const saveDraft = useCallback(
    async (draft: JobDraft, existing?: JobApplication) => {
      const job = draftToJob(draft, existing);
      setSyncStatus('syncing');
      const result = existing
        ? await sheetsService.updateApplication(job)
        : await sheetsService.addApplication(job);
      setJobs(sheetsService.readCache() ?? []);
      setSyncStatus(result.syncStatus);
      setSelectedJob(result.job);
      setEditorMode('edit');
    },
    [],
  );

  const updateStatus = useCallback(async (id: string, status: JobStatus) => {
    setSyncStatus('syncing');
    const result = await sheetsService.updateApplicationStatus(id, status);
    setJobs(sheetsService.readCache() ?? []);
    setSyncStatus(result.syncStatus);
    setSelectedJob((current) =>
      current && current.id === id && result.job ? result.job : current,
    );
  }, []);

  const removeJob = useCallback(async (id: string) => {
    setSyncStatus('syncing');
    const result = await sheetsService.deleteApplication(id);
    setJobs(sheetsService.readCache() ?? []);
    setSyncStatus(result.syncStatus);
    setSelectedJob((current) => (current?.id === id ? null : current));
    setIsEditorOpen(false);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedJob(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  }, []);

  const openEdit = useCallback((job: JobApplication) => {
    setSelectedJob(job);
    setEditorMode('edit');
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const filteredJobs = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return jobs
      .filter((job) => {
        const matchesQuery =
          !query ||
          job.company.toLowerCase().includes(query) ||
          job.role.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.notes.toLowerCase().includes(query);
        const matchesStatus =
          filters.status === 'all' || job.status === filters.status;
        const date = job.appliedDate.slice(0, 10);
        const matchesFrom = !filters.dateFrom || date >= filters.dateFrom;
        const matchesTo = !filters.dateTo || date <= filters.dateTo;
        return matchesQuery && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => compareJobs(a, b, sort));
  }, [jobs, filters, sort]);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      applied: jobs.filter((job) => job.status === 'applied').length,
      interviewing: jobs.filter((job) => job.status === 'interviewing').length,
      offered: jobs.filter((job) => job.status === 'offered').length,
      rejected: jobs.filter((job) => job.status === 'rejected').length,
    }),
    [jobs],
  );

  const value = useMemo(
    () => ({
      jobs,
      filteredJobs,
      filters,
      sort,
      syncStatus,
      loading,
      error,
      selectedJob,
      isEditorOpen,
      editorMode,
      stats,
      setFilters,
      setSort,
      refresh,
      saveDraft,
      updateStatus,
      removeJob,
      openCreate,
      openEdit,
      closeEditor,
    }),
    [
      jobs,
      filteredJobs,
      filters,
      sort,
      syncStatus,
      loading,
      error,
      selectedJob,
      isEditorOpen,
      editorMode,
      stats,
      setFilters,
      setSort,
      refresh,
      saveDraft,
      updateStatus,
      removeJob,
      openCreate,
      openEdit,
      closeEditor,
    ],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsContextValue {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within JobsProvider');
  }
  return context;
}
