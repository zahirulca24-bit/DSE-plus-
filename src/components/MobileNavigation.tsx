import { NavLink } from 'react-router-dom';
import { X, TrendingDown } from 'lucide-react';
import { sidebarItems } from './AppSidebar';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
}

export default function MobileNavigation({ isOpen, onClose, id }: MobileNavigationProps) {
  if (!isOpen) return null;

  return (
    <div
      id={id || 'mobile-nav-root'}
      className="fixed inset-0 z-50 md:hidden flex"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#02040a]/80 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-surface-dark border-r border-border-dark shadow-2xl z-10 transition-transform duration-300 transform ease-out">
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-dark shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-[#0D1117] font-bold shadow-sm shrink-0">
              <span className="text-sm tracking-wider flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#0D1117] rotate-180" strokeWidth={2.5} />
              </span>
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white">
              DSE Pulse
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-elevated-dark text-text-secondary hover:text-white cursor-pointer focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                id={`mobile-nav-item-${item.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-elevated-dark text-white shadow-sm'
                      : 'text-text-secondary hover:bg-[#161B22] hover:text-white'
                  }`
                }
              >
                <IconComponent className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* App Version Footer */}
        <div className="border-t border-border-dark p-4 bg-[#0a0e1b]/20 shrink-0">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8B949E]">
            <span>v1.0.0-stable</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#238636]"></span> Shell Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
