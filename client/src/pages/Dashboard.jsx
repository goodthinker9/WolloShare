import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStudentDashboard, getRecentNotifications } from '../services/dashboardService';

/**
 * Dashboard – main landing page after login.
 *
 * Data is loaded from two backend endpoints:
 *   • GET /api/dashboard/student  → stats + recent_uploads
 *   • GET /api/notifications      → recent notifications
 *
 * Architecture:  Page → dashboardService → Axios → Backend
 */
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashResult, notifResult] = await Promise.all([
        getStudentDashboard(),
        getRecentNotifications(),
      ]);

      setDashboardData(dashResult);
      setNotifications(notifResult);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load dashboard data. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner message="Loading dashboard…" />;
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="mb-4 text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentUploads = dashboardData?.recent_uploads || [];

  // ── Success: render dashboard content ──────────────────────
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your academic resource activity"
      />

      {/* ── Summary cards ──────────────────────────────────── */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Uploads"
          value={stats?.total_uploads ?? 0}
          icon={<UploadIcon />}
          color="blue"
        />
        <StatCard
          label="Total Downloads"
          value={stats?.total_downloads ?? 0}
          icon={<DownloadIcon />}
          color="green"
        />
        <StatCard
          label="Total Bookmarks"
          value={stats?.total_bookmarks ?? 0}
          icon={<BookmarkIcon />}
          color="purple"
        />
        <StatCard
          label="Average Rating"
          value={
            stats?.average_rating != null
              ? Number(stats.average_rating).toFixed(1)
              : '—'
          }
          icon={<StarIcon />}
          color="amber"
        />
      </section>

      {/* ── Two-column layout for tables ────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Recent Uploads ──────────────────────────────── */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Uploads
            </h2>
          </div>

          {recentUploads.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No resources uploaded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium uppercase text-slate-500">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((resource) => (
                    <tr
                      key={resource.id}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                    >
                      <td className="max-w-[140px] truncate px-5 py-3 font-medium text-slate-800">
                        {resource.title}
                      </td>
                      <td className="max-w-[140px] truncate px-5 py-3 text-slate-600">
                        {resource.course_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {resource.resource_type}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(resource.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <ApprovalBadge status={resource.approval_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Recent Notifications ─────────────────────────── */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Notifications
            </h2>
          </div>

          {notifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.slice(0, 5).map((notif) => (
                <li
                  key={notif.id}
                  className={`px-5 py-4 transition-colors hover:bg-slate-50 ${
                    !notif.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm ${
                          !notif.is_read
                            ? 'font-semibold text-slate-900'
                            : 'font-medium text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {notif.message}
                        </p>
                      )}
                    </div>
                    <span className="mt-0.5 shrink-0 whitespace-nowrap text-xs text-slate-400">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

// ── Stat card sub-component ──────────────────────────────────

const StatCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          colorClasses[color] || colorClasses.blue
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

// ── Approval badge sub-component ────────────────────────────

const ApprovalBadge = ({ status }) => {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status || 'pending'}
    </span>
  );
};

// ── Date / time helpers ─────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateStr);
};

// ── Inline SVG icons (zero dependencies) ────────────────────

const UploadIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5m0 0L7.5 13m4.5 3.5L16.5 13M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export default Dashboard;

