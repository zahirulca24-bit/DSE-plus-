import { BookOpen } from 'lucide-react';
import { EmptyStateProps } from '../types';

export default function EmptyState({ title, description, actionText, onAction, id }: EmptyStateProps) {
  return (
    <div
      id={id || 'empty-state-container'}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-dark bg-surface-dark/50 py-24 px-8 text-center max-w-3xl mx-auto my-6"
    >
      <div className="mb-4 flex h-16 h-16 w-16 items-center justify-center rounded-full bg-[#161B22]">
        <BookOpen className="h-8 w-8 text-border-dark" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>
      
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border-dark bg-[#161B22] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-warn"></span> UI Foundation
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border-dark bg-[#161B22] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-border-dark"></span> Data Ready
          </div>
        </div>

        {actionText && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:bg-[#2EA043] transition-colors cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
