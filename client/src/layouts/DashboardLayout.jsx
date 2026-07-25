import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/**
 * DashboardLayout – full application shell for authenticated pages.
 *
 * Structure:
 *   ┌──────────────┬─────────────────────────────┐
 *   │              │         Navbar               │
 *   │   Sidebar    │─────────────────────────────│
 *   │   (fixed)    │     <Outlet /> (scrollable)   │
 *   └──────────────┴─────────────────────────────┘
 *
 * Responsive behaviour:
 *   • Desktop (lg+)  – sidebar always visible, fixed left
 *   • Tablet (md)    – sidebar hidden, toggled via hamburger
 *   • Mobile         – sidebar opens as overlay drawer
 *
 * This layout only renders navigation chrome; page-specific
 * content is provided by the <Outlet />.
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* ── Main area ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        <Navbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

