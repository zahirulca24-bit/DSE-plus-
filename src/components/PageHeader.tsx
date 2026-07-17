import { ChevronRight, Home } from 'lucide-react';
import { PageHeaderProps } from '../types';

export default function PageHeader({ title, description, breadcrumbs, action, id }: PageHeaderProps) {
  return (
    <div
      id={id || `page-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="pb-5 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
    >
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-text-secondary" aria-label="Breadcrumb">
            <span className="hover:text-white cursor-pointer transition-colors">DSE PULSE</span>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-text-secondary/60 shrink-0" strokeWidth={3} />
                <span className={idx === breadcrumbs.length - 1 ? 'text-white' : 'hover:text-white cursor-pointer transition-colors'}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs md:text-sm text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {/* Action Slot */}
      {action && (
        <div className="flex items-center gap-2 self-start md:self-end">
          {action}
        </div>
      )}
    </div>
  );
}
