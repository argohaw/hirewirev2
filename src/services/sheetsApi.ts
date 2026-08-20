import { SEED_JOBS } from '../data/seedJobs';
import {
  coerceJobApplication,
  type JobApplication,
  type JobStatus,
  type SheetsListResponse,
  type SyncStatus,
} from '../types/job';

const CACHE_KEY = 'hirewire.jobs.cache';
const REQUEST_TIMEOUT_MS = 9000;

interface SheetsMutationBody {
  action: 'list' | 'create' | 'update' | 'delete' | 'updateStatus';
  apiKey?: string;
  payload?: unknown;
}

export class GoogleSheetsService {
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(endpoint: string | undefined, apiKey: string | undefined) {
    this.endpoint = (endpoint ?? '').trim();
    this.apiKey = (apiKey ?? '').trim();
  }

  get hasRemoteEndpoint(): boolean {
    return this.endpoint.length > 0;
  }

  readCache(): JobApplication[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const jobs = parsed
        .map((item) => coerceJobApplication(item))
        .filter((item): item is JobApplication => item !== null);
      return jobs;
    } catch {
      return null;
    }
  }

  writeCache(jobs: JobApplication[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(jobs));
    } catch {
      /* quota / private mode */
    }
  }

  seedFallback(): JobApplication[] {
    const cached = this.readCache();
    if (cached !== null) return cached;
    this.writeCache(SEED_JOBS);
    return SEED_JOBS.map((job) => ({ ...job }));
  }

  async fetchApplications(): Promise<{ jobs: JobApplication[]; syncStatus: SyncStatus }> {
    if (!this.hasRemoteEndpoint) {
      return { jobs: this.seedFallback(), syncStatus: 'offline' };
    }

    try {
      const response = await this.request({ action: 'list' });
      const jobs = this.parseJobList(response.data);
      this.writeCache(jobs);
      return { jobs, syncStatus: 'connected' };
    } catch {
      return { jobs: this.seedFallback(), syncStatus: 'offline' };
    }
  }

  async addApplication(
    job: JobApplication,
  ): Promise<{ job: JobApplication; syncStatus: SyncStatus }> {
    const local = this.upsertLocal(job);
    if (!this.hasRemoteEndpoint) {
      return { job: local, syncStatus: 'offline' };
    }

    try {
      const response = await this.request({ action: 'create', payload: job });
      const remote = coerceJobApplication(response.data) ?? local;
      this.upsertLocal(remote);
      return { job: remote, syncStatus: 'connected' };
    } catch {
      return { job: local, syncStatus: 'offline' };
    }
  }

  async updateApplicationStatus(
    id: string,
    status: JobStatus,
  ): Promise<{ job: JobApplication | null; syncStatus: SyncStatus }> {
    const current = this.readCache() ?? [];
    const existing = current.find((job) => job.id === id);
    if (!existing) {
      return { job: null, syncStatus: this.hasRemoteEndpoint ? 'connected' : 'offline' };
    }

    const updated: JobApplication = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.upsertLocal(updated);

    if (!this.hasRemoteEndpoint) {
      return { job: updated, syncStatus: 'offline' };
    }

    try {
      const response = await this.request({
        action: 'updateStatus',
        payload: { id, status },
      });
      const remote = coerceJobApplication(response.data) ?? updated;
      this.upsertLocal(remote);
      return { job: remote, syncStatus: 'connected' };
    } catch {
      return { job: updated, syncStatus: 'offline' };
    }
  }

  async updateApplication(
    job: JobApplication,
  ): Promise<{ job: JobApplication; syncStatus: SyncStatus }> {
    const local = this.upsertLocal(job);
    if (!this.hasRemoteEndpoint) {
      return { job: local, syncStatus: 'offline' };
    }

    try {
      const response = await this.request({ action: 'update', payload: job });
      const remote = coerceJobApplication(response.data) ?? local;
      this.upsertLocal(remote);
      return { job: remote, syncStatus: 'connected' };
    } catch {
      return { job: local, syncStatus: 'offline' };
    }
  }

  async deleteApplication(id: string): Promise<{ syncStatus: SyncStatus }> {
    const remaining = (this.readCache() ?? []).filter((job) => job.id !== id);
    this.writeCache(remaining);

    if (!this.hasRemoteEndpoint) {
      return { syncStatus: 'offline' };
    }

    try {
      await this.request({ action: 'delete', payload: { id } });
      return { syncStatus: 'connected' };
    } catch {
      return { syncStatus: 'offline' };
    }
  }

  private upsertLocal(job: JobApplication): JobApplication {
    const current = this.readCache() ?? [];
    const index = current.findIndex((item) => item.id === job.id);
    if (index >= 0) {
      current[index] = job;
    } else {
      current.unshift(job);
    }
    this.writeCache(current);
    return job;
  }

  private parseJobList(data: unknown): JobApplication[] {
    const source = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { jobs?: unknown }).jobs)
        ? (data as { jobs: unknown[] }).jobs
        : null;

    if (!source) {
      throw new Error('Unexpected Google Sheets payload shape.');
    }

    const jobs = source
      .map((item) => coerceJobApplication(item))
      .filter((item): item is JobApplication => item !== null);

    if (!jobs.length && source.length) {
      throw new Error('Google Sheets returned unreadable job rows.');
    }

    return jobs;
  }

  private async request(body: SheetsMutationBody): Promise<SheetsListResponse> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    // Ensure apiKey is attached to all request payloads
    const payloadWithKey = {
      ...body,
      apiKey: this.apiKey || undefined,
    };

    try {
      // 1. GET Request for 'list' action to bypass Google's POST CORS limitations
      if (body.action === 'list') {
        const params = new URLSearchParams({
          body: JSON.stringify(payloadWithKey),
        });
        const url = `${this.endpoint}?${params.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow', // Crucial for handling Google 302 redirects
          signal: controller.signal,
        });

        return await this.handleResponse(response);
      }

      // 2. POST Request for mutations ('create', 'update', 'delete', 'updateStatus')
      const response = await fetch(this.endpoint, {
        method: 'POST',
        redirect: 'follow', // Crucial for handling Google 302 redirects
        headers: {
          // 'text/plain' prevents browser from triggering restrictive CORS preflight (OPTIONS)
          'Content-Type': 'text/plain;charset=utf-8',
        },
        signal: controller.signal,
        body: JSON.stringify(payloadWithKey),
      });

      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Sheets request timed out.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  private async handleResponse(response: Response): Promise<SheetsListResponse> {
    if (!response.ok) {
      throw new Error(`Sheets endpoint failed with HTTP ${response.status}.`);
    }

    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      throw new Error('Sheets endpoint returned invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Sheets endpoint returned a non-object payload.');
    }

    const payload = parsed as SheetsListResponse;
    if (payload.ok === false) {
      throw new Error(payload.error || 'Sheets endpoint reported a failure.');
    }

    return payload;
  }
}

export const sheetsService = new GoogleSheetsService(
  import.meta.env.VITE_SHEETS_ENDPOINT,
  import.meta.env.VITE_SHEETS_API_KEY,
);
