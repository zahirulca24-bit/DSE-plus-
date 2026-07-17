import React, { useState } from 'react';
import { Briefcase, FileText, Info, PlusCircle, X } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import { PortfolioHolding } from '../types/portfolio';
import { GradeBadge, DemoDataBadge } from '../components/ScannerAndSignalsComponents';

export default function Portfolio() {
  const {
    isPortfolioConnected,
    portfolioHoldings,
    portfolioSummary,
    loadDemoPortfolio,
    disconnectPortfolio,
    addPortfolioHoldingNote,
    recordPortfolioExit,
  } = useMarket();

  const [activeExitSymbol, setActiveExitSymbol] = useState<string | null>(null);
  const [activeNoteSymbol, setActiveNoteSymbol] = useState<string | null>(null);
  const [exitPrice, setExitPrice] = useState('');
  const [exitQuantity, setExitQuantity] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [noteText, setNoteText] = useState('');

  const activeExitHolding = portfolioHoldings.find((h) => h.symbol === activeExitSymbol);
  const activeNoteHolding = portfolioHoldings.find((h) => h.symbol === activeNoteSymbol);

  const openExitModal = (holding: PortfolioHolding) => {
    setActiveExitSymbol(holding.symbol);
    setExitPrice(holding.lastPrice.toString());
    setExitQuantity(holding.quantity.toString());
    setExitReason('');
  };

  const openNoteModal = (holding: PortfolioHolding) => {
    setActiveNoteSymbol(holding.symbol);
    setNoteText(holding.notes || '');
  };

  const handleRecordExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExitSymbol || !activeExitHolding) return;

    const price = Number(exitPrice);
    const qty = Number(exitQuantity);
    if (!Number.isFinite(price) || price <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0 || qty > activeExitHolding.quantity) return;

    recordPortfolioExit(activeExitSymbol, price, qty, exitReason || 'Local demo portfolio exit recorded for journal review.');
    setActiveExitSymbol(null);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteSymbol) return;
    addPortfolioHoldingNote(activeNoteSymbol, noteText);
    setActiveNoteSymbol(null);
  };

  const isUpOverall = portfolioSummary.unrealizedPL >= 0;
  const isUpToday = portfolioSummary.todayPL >= 0;
  const highRiskWeight = portfolioHoldings
    .filter((h) => h.riskStatus === 'HIGH' || h.grade === 'REJECT')
    .reduce((sum, h) => sum + h.portfolioWeight, 0);

  return (
    <PageContainer id="portfolio-route">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Portfolio</h1>
              {isPortfolioConnected ? <DemoDataBadge /> : <span className="text-[10px] font-mono text-text-secondary border border-border-dark rounded px-2 py-0.5">Not Connected</span>}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Local demo portfolio tracking for holdings, allocation, notes, and journal review. No broker connection or order execution is included.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isPortfolioConnected ? (
              <button
                onClick={disconnectPortfolio}
                className="px-3.5 py-1.5 rounded-md bg-transparent hover:bg-[#DA3633]/10 text-[#DA3633] border border-border-dark hover:border-[#DA3633]/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              >
                CLEAR DEMO PORTFOLIO
              </button>
            ) : (
              <button
                onClick={loadDemoPortfolio}
                className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2EA043] text-white border border-[#238636] text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              >
                LOAD DEMO PORTFOLIO
              </button>
            )}
          </div>
        </div>

        {!isPortfolioConnected ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 max-w-2xl mx-auto my-12">
            <div className="p-3 bg-[#161B22] rounded-full text-text-secondary mb-4 border border-border-dark">
              <Briefcase className="w-6 h-6 opacity-85 text-[#8B949E]" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-1">Portfolio Not Connected</h4>
            <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed">
              No holdings are loaded. Use the local demo portfolio only for frontend validation. Live portfolio sync is pending.
            </p>
            <button
              onClick={loadDemoPortfolio}
              className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2EA043] border border-[#238636] text-xs font-mono font-bold text-white transition-colors"
            >
              LOAD DEMO PORTFOLIO
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Portfolio Value" value={`৳${portfolioSummary.portfolioValue.toLocaleString()}`} note={`Cash: ৳${portfolioSummary.cashValue.toLocaleString()}`} />
              <MetricCard label="Unrealized P/L" value={`৳${portfolioSummary.unrealizedPL.toLocaleString()}`} note={`${isUpOverall ? '+' : ''}${portfolioSummary.unrealizedPLPercent.toFixed(2)}% overall`} tone={isUpOverall ? 'positive' : 'negative'} />
              <MetricCard label="Today's Demo P/L" value={`৳${portfolioSummary.todayPL.toLocaleString()}`} note={`${isUpToday ? '+' : ''}${portfolioSummary.todayPLPercent.toFixed(2)}% today`} tone={isUpToday ? 'positive' : 'negative'} />
              <MetricCard label="Demo Risk Weight" value={`${highRiskWeight.toFixed(1)}%`} note="Local sample only" tone="warning" />
            </div>

            <div className="rounded-xl border border-border-dark bg-[#0D1117] overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">Demo Holdings ({portfolioHoldings.length})</h3>
                <span className="text-[10px] text-text-secondary font-mono">Local Only</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Local demo portfolio holdings">
                  <thead>
                    <tr className="bg-[#161B22]/50 text-[10px] uppercase border-b border-border-dark">
                      <th className="py-3 px-3 text-text-secondary font-semibold">Symbol</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Sector</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Quantity</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Avg Cost</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Last Price</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Market Value</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Unrealized P/L</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Weight</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold">Grade</th>
                      <th className="py-3 px-3 text-text-secondary font-semibold text-right">Local Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/40">
                    {portfolioHoldings.map((hold) => {
                      const plUp = hold.unrealizedPL >= 0;
                      return (
                        <tr key={hold.id} className="hover:bg-[#161B22]/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white uppercase">{hold.symbol}</div>
                            <div className="text-[9px] text-text-secondary truncate max-w-[150px]">{hold.company}</div>
                          </td>
                          <td className="py-3 px-3 text-text-secondary">{hold.sector}</td>
                          <td className="py-3 px-3 text-white font-semibold">{hold.quantity.toLocaleString()}</td>
                          <td className="py-3 px-3 text-text-secondary">৳{hold.averageCost.toFixed(2)}</td>
                          <td className="py-3 px-3 text-white">৳{hold.lastPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-white font-bold">৳{hold.marketValue.toLocaleString()}</td>
                          <td className={`py-3 px-3 font-bold ${plUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>৳{hold.unrealizedPL.toLocaleString()}</td>
                          <td className="py-3 px-3 text-white font-semibold">{hold.portfolioWeight}%</td>
                          <td className="py-3 px-3"><GradeBadge grade={hold.grade} /></td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => openNoteModal(hold)} className="px-2 py-1 rounded bg-[#161B22] border border-border-dark text-[9px] font-bold text-text-secondary hover:text-white">
                                ADD NOTE
                              </button>
                              <button onClick={() => openExitModal(hold)} className="px-2 py-1 rounded bg-[#161B22] border border-border-dark text-[9px] font-bold text-white hover:bg-[#21262D]">
                                RECORD EXIT
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#58A6FF]" /> Demo Risk Notes
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Demo concentration and grade warnings are based only on local sample data. Review manually before making any decision. This screen is not financial advice.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolioHoldings.map((hold) => (
                  <div key={hold.id} className="p-3 rounded border border-border-dark bg-[#161B22]/30 text-xs text-text-secondary">
                    <strong className="text-white">{hold.symbol}</strong>: {hold.grade === 'REJECT' ? 'Marked higher risk in demo data.' : 'No live risk engine connected.'}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {activeExitSymbol && activeExitHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setActiveExitSymbol(null)} />
          <form onSubmit={handleRecordExit} className="relative w-full max-w-md bg-[#0D1117] border border-border-dark rounded-xl shadow-2xl overflow-hidden font-mono text-xs text-text-secondary">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
              <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-white uppercase tracking-wider">Record Local Exit</h3><DemoDataBadge /></div>
              <button type="button" onClick={() => setActiveExitSymbol(null)} className="p-1 text-text-secondary hover:text-white rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-[#161B22]/40 border border-border-dark rounded-lg flex items-center justify-between text-[11px]">
                <div><span className="text-white font-bold block">{activeExitHolding.symbol}</span><span className="text-[10px] block">{activeExitHolding.company}</span></div>
                <div className="text-right"><span className="text-white block font-bold">Qty: {activeExitHolding.quantity}</span><span className="text-text-muted block">Avg Cost: ৳{activeExitHolding.averageCost.toFixed(1)}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Exit Price (৳)" value={exitPrice} onChange={setExitPrice} />
                <Input label="Quantity" value={exitQuantity} onChange={setExitQuantity} />
              </div>
              <label className="block text-[9px] text-text-secondary uppercase font-bold">Exit Reason</label>
              <textarea rows={3} required value={exitReason} onChange={(e) => setExitReason(e.target.value)} className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent" />
              <p className="text-[10px] text-text-secondary">This action only records a local journal entry. It does not place, route, or execute any order.</p>
            </div>
            <div className="p-4 border-t border-border-dark flex justify-end gap-2">
              <button type="button" onClick={() => setActiveExitSymbol(null)} className="px-3 py-1.5 rounded border border-border-dark text-text-secondary">Cancel</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-[#238636] text-white font-bold">Record Local Exit</button>
            </div>
          </form>
        </div>
      )}

      {activeNoteSymbol && activeNoteHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setActiveNoteSymbol(null)} />
          <form onSubmit={handleSaveNote} className="relative w-full max-w-md bg-[#0D1117] border border-border-dark rounded-xl shadow-2xl overflow-hidden font-mono text-xs text-text-secondary">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
              <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-white uppercase tracking-wider">Local Note</h3><DemoDataBadge /></div>
              <button type="button" onClick={() => setActiveNoteSymbol(null)} className="p-1 text-text-secondary hover:text-white rounded-md"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-white font-bold">{activeNoteHolding.symbol}</div>
              <textarea rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent" />
              <p className="text-[10px] text-text-secondary">Notes are local demo state only.</p>
            </div>
            <div className="p-4 border-t border-border-dark flex justify-end gap-2">
              <button type="button" onClick={() => setActiveNoteSymbol(null)} className="px-3 py-1.5 rounded border border-border-dark text-text-secondary">Cancel</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-[#238636] text-white font-bold">Save Note</button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}

function MetricCard({ label, value, note, tone = 'neutral' }: { label: string; value: string; note: string; tone?: 'neutral' | 'positive' | 'negative' | 'warning' }) {
  const toneClass = tone === 'positive' ? 'text-[#238636]' : tone === 'negative' ? 'text-[#DA3633]' : tone === 'warning' ? 'text-[#D29922]' : 'text-white';
  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">{label}</span>
      <div className={`mt-2 text-xl font-bold tracking-tight font-mono ${toneClass}`}>{value}</div>
      <div className="mt-1 text-[10px] font-mono text-text-muted">{note}</div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-[9px] text-text-secondary mb-1 uppercase font-bold">{label}</label>
      <input type="number" step="0.1" required value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent" />
    </div>
  );
}
