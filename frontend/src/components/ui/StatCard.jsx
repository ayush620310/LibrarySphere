const StatCard = ({ label, value, icon: Icon, color = 'blue', subtitle, onClick }) => {
  const colorStyles = {
    blue: {
      bg: 'bg-primary-50 dark:bg-primary-950/40',
      text: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-100 dark:border-primary-900/40',
      glow: 'group-hover:shadow-glow-sm',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      glow: 'group-hover:shadow-glow-emerald',
    },
    red: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/40',
      glow: 'group-hover:shadow-glow-red',
    },
    yellow: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
      glow: '',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/40',
      glow: '',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-surface-800',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      glow: '',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`card group p-5 relative overflow-hidden transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:border-primary-500/40 dark:hover:border-primary-500/40 hover:-translate-y-0.5 hover:shadow-card-hover'
          : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 ${style.bg} ${style.text} ${style.border} ${style.glow}`}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      {/* Decorative ambient subtle highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-200/20 dark:from-white/[0.02] to-transparent pointer-events-none rounded-bl-full" />
    </div>
  );
};

export default StatCard;
