import { BookOpen } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-slate-200/80 dark:border-slate-800 border-t-primary-500 dark:border-t-primary-400 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PageLoader = ({ message = 'Loading details...' }) => (
  <div className="flex items-center justify-center min-h-[320px] p-8 animate-fade-in">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 dark:from-primary-500/30 dark:to-indigo-500/30 flex items-center justify-center animate-pulse-subtle">
          <BookOpen size={22} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border border-primary-500/30 animate-ping opacity-25" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Please wait a moment</p>
      </div>
    </div>
  </div>
);

export const RouteLoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-surface-950/80 backdrop-blur-md">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-glow shadow-primary-500/30 animate-bounce">
        <BookOpen size={26} />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">
          Loading LibraryOS
        </span>
      </div>
    </div>
  </div>
);

export default Spinner;
