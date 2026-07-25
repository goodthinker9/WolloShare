/**
 * PageHeader – reusable heading block for dashboard pages.
 *
 * Props:
 *   title    – string (required) – main heading text
 *   subtitle – string (optional) – smaller descriptive text
 *   actions  – ReactNode (optional) – action buttons / controls
 */
const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;

