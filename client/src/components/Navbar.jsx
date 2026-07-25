import useAuth from '../hooks/useAuth';

/**
 * Navbar – top bar shown inside the dashboard layout.
 *
 * Displays the current user's name, an avatar circle with
 * their initial, and a notification bell icon.
 *
 * Props:
 *   onToggleSidebar – callback invoked when the hamburger
 *                     button is clicked (mobile / tablet).
 */
const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const displayName = user?.full_name || user?.email || 'Student';
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      {/* ── Left side ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger – visible on tablet / mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page indicator – visible only on small screens */}
        <span className="text-sm font-medium text-slate-700 lg:hidden">
          Dashboard
        </span>
      </div>

      {/* ── Right side ───────────────────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Notifications"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Unread indicator dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {displayName}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

