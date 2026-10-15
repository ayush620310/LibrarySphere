const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    {Icon && (
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-surface-800 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <Icon size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
        <div className="absolute -inset-1.5 rounded-3xl bg-primary-500/5 dark:bg-primary-500/10 -z-10 blur-sm" />
      </div>
    )}
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display mb-1.5">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export default EmptyState;
