import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar from './components/AppSidebar';
import AppHeader from './components/AppHeader';
import MobileNavigation from './components/MobileNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import { MarketProvider } from './store/marketStore';

// Import Pages
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Signals from './pages/Signals';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';
import Journal from './pages/Journal';
import MarketRegime from './pages/MarketRegime';
import SectorAnalysis from './pages/SectorAnalysis';
import Backtest from './pages/Backtest';
import Alerts from './pages/Alerts';
import DataImport from './pages/DataImport';
import DataCollector from './pages/DataCollector';
import Settings from './pages/Settings';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <ErrorBoundary>
        <MarketProvider>
          <div className="flex h-screen overflow-hidden bg-bg-dark text-text-primary antialiased font-sans">
            {/* Collapsible Desktop Sidebar */}
            <AppSidebar
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              id="dse-desktop-sidebar"
            />

            {/* Mobile Drawer Navigation (renders drawer overlay on mobile screens) */}
            <MobileNavigation
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              id="dse-mobile-drawer"
            />

            {/* Main Layout Stage */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
              {/* Top Toolbar Navigation */}
              <AppHeader
                onMenuClick={() => setIsMobileMenuOpen(true)}
                id="dse-terminal-header"
              />

              {/* Scrollable Content Pane */}
              <main
                id="dse-main-pane"
                className="flex-1 overflow-y-auto bg-bg-dark focus:outline-none"
              >
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/signals" element={<Signals />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/market-regime" element={<MarketRegime />} />
                  <Route path="/sector-analysis" element={<SectorAnalysis />} />
                  <Route path="/backtest" element={<Backtest />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/data-import" element={<DataImport />} />
                  <Route path="/data-collector" element={<DataCollector />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Root Redirection & Fallback */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </MarketProvider>
      </ErrorBoundary>
    </Router>
  );
}
