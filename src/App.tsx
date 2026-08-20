import CountUp from './components/react-bits/CountUp';
import SplitText from './components/react-bits/SplitText';
import ErrorBoundary from './components/common/ErrorBoundary';
import Footer from './components/common/Footer';
import Header from './components/common/Header';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import ReactBitsBg from './components/common/ReactBitsBg';
import JobCardGrid from './components/dashboard/JobCardGrid';
import JobFilters from './components/dashboard/JobFilters';
import JobTable from './components/dashboard/JobTable';
import JobDetailModal from './components/modals/JobDetailModal';
import { useJobs } from './context/JobsContext';
import { BrowserRouter } from 'react-router-dom';

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <article className="hw-card rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">{label}</p>
      <p className="mt-2 font-display text-4xl" style={{ color: accent }}>
        <CountUp to={value} />
      </p>
    </article>
  );
}

function DashboardShell() {
  const { loading, error, stats, refresh } = useJobs();

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <ReactBitsBg />
      <div className="relative z-10 flex min-h-svh flex-col">
        <Header />
        <main id="dashboard" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--hw-gold)]">
              Command center
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
              <SplitText text="Keep every application on the wire." />
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">
              Sortable pipeline, Sheets-backed sync, and an offline cache so a dropped
              endpoint never blanks the board.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total" value={stats.total} accent="var(--hw-gold)" />
            <MetricCard label="Applied" value={stats.applied} accent="var(--hw-gold)" />
            <MetricCard
              label="Interviewing"
              value={stats.interviewing}
              accent="var(--hw-gold)"
            />
            <MetricCard label="Offered" value={stats.offered} accent="var(--hw-neon)" />
            <MetricCard label="Rejected" value={stats.rejected} accent="var(--hw-red)" />
          </div>

          <div className="space-y-5">
            <JobFilters />
            {error && (
              <div className="rounded-2xl border border-[var(--hw-red)] px-4 py-3 text-sm">
                {error}{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => void refresh()}
                >
                  Retry sync
                </button>
              </div>
            )}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <JobTable />
                <JobCardGrid />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
      <JobDetailModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
     <ErrorBoundary>
      <DashboardShell />
    </ErrorBoundary>
    </BrowserRouter>
    
  );
}
