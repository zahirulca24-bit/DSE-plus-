import { theme } from '../theme';
import { StatusBadgeProps } from '../types';

export default function StatusBadge({ status, label, id }: StatusBadgeProps) {
  let styleClasses = theme.colors.accentBg;

  switch (status.toLowerCase()) {
    case 'positive':
    case 'green':
    case 'up':
    case 'bullish':
      styleClasses = theme.colors.positiveBg;
      break;
    case 'negative':
    case 'red':
    case 'down':
    case 'bearish':
      styleClasses = theme.colors.negativeBg;
      break;
    case 'warning':
    case 'amber':
    case 'watch':
    case 'pending':
      styleClasses = theme.colors.warningBg;
      break;
    case 'accent':
    case 'blue':
    case 'neutral':
      styleClasses = theme.colors.accentBg;
      break;
    default:
      styleClasses = 'bg-slate-800/50 text-slate-400 border border-slate-700/50';
  }

  return (
    <span
      id={id || `status-badge-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border uppercase tracking-wider ${styleClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse opacity-85" />
      {label}
    </span>
  );
}
