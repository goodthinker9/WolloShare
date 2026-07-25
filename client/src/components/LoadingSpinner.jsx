/**
 * LoadingSpinner – centred spinner with an optional message.
 *
 * Props:
 *   message – string (optional) – text shown below the spinner
 */
const LoadingSpinner = ({ message }) => {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center">
      <svg
        className="h-10 w-10 animate-spin text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {message && (
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

