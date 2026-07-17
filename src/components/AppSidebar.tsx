import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Zap,
  Star,
  Briefcase,
  BookOpen,
  TrendingUp,
  PieChart,
  History,
  Bell,
  UploadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  id?: string;
}

export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Scanner', path: '/scanner', icon: Radar },
  { id: 'signals', label: 'Signals', path: '/signals', icon: Zap },
  { id: 'watchlist', label: 'Watchlist', path: '/watchlist', icon: Star },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { id: 'journal', label: 'Trade Journal', path: '/journal', icon: BookOpen },
  { id: 'market-regime', label: 'Market Regime', path: '/market-regime', icon: TrendingUp },
  { id: 'sector-analysis', label: 'Sector Analysis', path: '/sector-analysis', icon: PieChart },
  { id: 'backtest', label: 'Backtest', path: '/backtest', icon: History },
  { id: 'alerts', label: 'Alerts', path: '/alerts', icon: Bell },
  { id: 'data-import', label: 'Data Import', path: '/data-import', icon: UploadCloud },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

export default function AppSidebar({ isCollapsed, setIsCollapsed, id }: AppSidebarProps) {
  return (
    <aside
      id={id || 'app-sidebar'}
      className={`hidden md:flex flex-col h-screen bg-surface-dark border-r border-border-dark transition-all duration-300 relative select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border-dark justify-between overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-[#0D1117] font-bold shadow-sm shrink-0">
            <span className="text-sm tracking-wider flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#0D1117] rotate-180" strokeWidth={2.5} />
            </span>
          </div>
          {!isCollapsed && (
            <span className="font-sans font-bold text-lg tracking-tight text-white truncate">
              DSE Pulse
            </span>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-3.5 -right-3 w-6 h-6 rounded-full bg-elevated-dark border border-border-dark text-text-secondary hover:text-white flex items-center justify-center cursor-pointer shadow-lg z-20 focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              id={`nav-item-${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent ${
                  isActive
                    ? 'bg-elevated-dark text-white shadow-sm'
                    : 'text-text-secondary hover:bg-[#161B22] hover:text-white'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* App Version Footer */}
      <div className="border-t border-border-dark p-4 bg-[#0a0e1b]/20 shrink-0 overflow-hidden">
        {isCollapsed ? (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-[#238636] block" title="Shell Online"></span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8B949E]">
            <span>v1.0.0-stable</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#238636]"></span> Shell Online
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
