import { Link } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold text-blue-700">
            WolloShare
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-blue-700">
              Home
            </Link>
            <Link to="/login" className="hover:text-blue-700">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-700">
              Register
            </Link>
            <Link to="/dashboard" className="hover:text-blue-700">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
          © 2026 WolloShare. Academic sharing made simple.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
