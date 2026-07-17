import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Clock } from 'lucide-react';
import { sidebarItems } from './AppSidebar';
import { useMarket } from '../store/marketStore';

interface AppHeaderProps {
  onMenuClick: () => void;
  id?: string;
}

export default function AppHeader({ onMenuClick, id }: AppHeaderProps) {
  const location = useLocation();
  const { backendConnectionStatus } = useMarket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dhakaTime, setDhakaTime] = useState('');

  const currentItem = sidebarItems.find(item => item.path === location.pathname);
  const pageTitle = currentItem ? currentItem.label : 'DSE Pulse';
  const backendConnected = backendConnectionStatus === 'Connected';
  const backendLabel = backendConnectionStatus === 'Checking' ? 'Checking' : backendConnected ? 'Connected' : 'Disconnected';

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        setDhakaTime(formatter.format(new Date()));
      } catch {
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * 6));
        setDhakaTime(nd.toTimeString().split(' ')[0]);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id={id || 'app-header'} className="h-16 border-b border-border-dark bg-surface-dark px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-1.5 rounded bg-[#161B22] border border-border-dark text-text-secondary hover:text-white focus:outline-none cursor-pointer" aria-label="Open navigation menu">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-base md:text-lg font-sans font-semibold text-white tracking-tight">{pageTitle}</h2>
          <div className="hidden sm:block h-4 w-px bg-border-dark"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>Asia/Dhaka</span>
            <span className="text-white font-semibold ml-1">{dhakaTime || '--:--:--'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Market Status:</span>
            <span className="rounded-full bg-[#161B22] px-2.5 py-0.5 font-medium text-warn font-mono">Waiting</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Backend:</span>
            <span className={`rounded-full bg-[#161B22] px-2.5 py-0.5 font-medium font-mono ${backendConnected ? 'text-[#238636]' : 'text-neg'}`}>
              {backendLabel}
            </span>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B22] border border-border-dark text-warn">
          <span>{backendConnected ? 'API' : 'LOCAL'}</span>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={`relative flex h-8 w-8 items-center justify-center rounded-md border border-border-dark hover:bg-[#21262D] transition-colors cursor-pointer focus:outline-none ${showNotifications ? 'text-accent border-accent/40 bg-[#21262D]' : 'text-text-secondary hover:text-white'}`}
            aria-expanded={showNotifications}
            aria-haspopup="true"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-surface-dark bg-accent animate-pulse" />
          </button>

          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="h-8 w-8 rounded-full border border-border-dark bg-gradient-to-br from-[#1F6FEB] to-[#238636] cursor-pointer shadow-inner focus:outline-none focus:ring-1 focus:ring-accent"
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-label="User profile menu"
          />

          {showNotifications && (
            <div className="absolute right-0 mt-2 top-8 w-80 rounded-md border border-border-dark bg-surface-dark shadow-2xl p-4 z-40">
              <div className="flex items-center justify-between border-b border-border-dark pb-2 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Terminal System Alerts</span>
                <span className="text-[10px] text-accent font-mono">1 ALERT</span>
              </div>
              <div className="space-y-3">
                <div className="p-2.5 rounded bg-elevated-dark border-l-2 border-warn text-[11px] font-sans">
                  <p className="text-white font-medium">Backend Connection Status</p>
                  <p className="text-text-secondary mt-1 leading-snug">
                    DSE Pulse is currently running with backend status: {backendLabel}. No broker connection or order execution is included.
                  </p>
                  <span className="text-[9px] font-mono text-text-muted mt-2 block">JUST NOW</span>
                </div>
              </div>
            </div>
          )}

          {showProfile && (
            <div className="absolute right-0 mt-2 top-8 w-64 rounded-md border border-border-dark bg-surface-dark shadow-2xl z-40 overflow-hidden">
              <div className="p-4 border-b border-border-dark bg-elevated-dark">
                <div className="font-sans font-semibold text-xs text-white">M. Zahi</div>
                <div className="font-mono text-[10px] text-text-secondary truncate mt-0.5">m.zahi2026@gmail.com</div>
                <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-accent/20 border border-accent/30 text-[9px] font-mono text-accent uppercase tracking-wider">Terminal Operator</span>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between px-3 py-1.5 rounded text-[11px] font-sans text-text-secondary">
                  <span>Connection Mode</span>
                  <span className={`text-[10px] font-mono ${backendConnected ? 'text-[#238636]' : 'text-warn'}`}>{backendConnected ? 'API CONNECTED' : 'LOCAL FALLBACK'}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 rounded text-[11px] font-sans text-text-secondary border-t border-border-dark/50 pt-2">
                  <span>Engine Build</span>
                  <span className="text-[10px] font-mono text-text-muted">v1.0.0-stable</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
