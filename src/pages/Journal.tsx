import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Activity,
  AlertTriangle,
  Info,
  Sliders,
  Award,
  Heart,
  Tag,
  Calendar,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useMarket } from '../store/marketStore';
import PageContainer from '../components/PageContainer';
import { JournalEntry, JournalStatus } from '../types/journal';
import { GradeBadge, DemoDataBadge, SideBadge } from '../components/ScannerAndSignalsComponents';

export default function Journal() {
  const {
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    clearJournal,
    loadDemoJournal
  } = useMarket();

  // Tab filter
  const [activeTab, setActiveTab] = useState<JournalStatus | 'ALL'>('ALL');

  // Modal / Slide-out control
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Form states for NEW entry
  const [symbol, setSymbol] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [status, setStatus] = useState<JournalStatus>('PLANNED');
  const [setup, setSetup] = useState('Bullish Flag Breakout');
  const [grade, setGrade] = useState<'A+' | 'A' | 'B+' | 'REJECT'>('A+');
  const [score, setScore] = useState('90');
  const [quantity, setQuantity] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');
  const [ruleFollowed, setRuleFollowed] = useState(true);
  const [emotionalState, setEmotionalState] = useState('Calm & Confident');
  const [entryReason, setEntryReason] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Mistake Checklist states
  const [mistakes, setMistakes] = useState<Record<string, boolean>>({
    'FOMO': false,
    'Early Exit': false,
    'Ignored Stop': false,
    'Weak Volume': false,
    'Overtraded': false,
    'Chased Price': false
  });

  // Exit position forms (inside detail drawer)
  const [exitPrice, setExitPrice] = useState('');
  const [exitReason, setExitReason] = useState('');

  // Find selected entry
  const selectedEntry = journalEntries.find((e) => e.id === selectedEntryId);

  // Computed metrics
  const closedTrades = journalEntries.filter((e) => e.status === 'CLOSED');
  const winTrades = closedTrades.filter((e) => e.realizedPL && e.realizedPL > 0);
  const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;

  const totalNetPL = closedTrades.reduce((sum, e) => sum + (e.realizedPL || 0), 0);
  const totalFees = closedTrades.reduce((sum, e) => sum + (e.fees || 0), 0);
  const netProfitAfterFees = totalNetPL - totalFees;

  const avgRMultiple = closedTrades.length > 0
    ? closedTrades.reduce((sum, e) => sum + (e.rMultiple || 0), 0) / closedTrades.length
    : 0;

  // Filtered entries
  const filteredEntries = journalEntries.filter((e) => {
    if (activeTab === 'ALL') return true;
    return e.status === activeTab;
  });

  const handleAddNewTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseInt(quantity, 10);
    const parsedEntry = parseFloat(entryPrice);
    const parsedStop = parseFloat(stopLoss);
    const parsedTarget1 = parseFloat(target1);
    const parsedTarget2 = parseFloat(target2);
    const parsedScore = parseInt(score, 10);

    if (isNaN(parsedQty) || parsedQty <= 0) return alert('Invalid Quantity');
    if (isNaN(parsedEntry) || parsedEntry <= 0) return alert('Invalid Entry Price');
    if (isNaN(parsedStop) || parsedStop <= 0) return alert('Invalid Stop Loss');
    if (isNaN(parsedTarget1) || parsedTarget1 <= 0) return alert('Invalid Target 1');

    const plannedRisk = parsedQty * Math.abs(parsedEntry - parsedStop);
    const expectedRR = Math.abs(parsedEntry - parsedStop) > 0 
      ? (parsedTarget1 - parsedEntry) / Math.abs(parsedEntry - parsedStop)
      : 1;

    const activeMistakesList = Object.entries(mistakes)
      .filter(([_, checked]) => checked)
      .map(([name]) => name);

    const tagsList = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    addJournalEntry({
      symbol: symbol.toUpperCase(),
      company: company || 'DSE Listed Company',
      sector: sector || 'Unspecified Sector',
      tradeDate: new Date().toISOString().split('T')[0],
      side,
      status,
      setup,
      grade,
      score: parsedScore || 90,
      quantity: parsedQty,
      entryPrice: parsedEntry,
      stopLoss: parsedStop,
      target1: parsedTarget1,
      target2: parsedTarget2 || parsedTarget1 * 1.1,
      plannedRisk,
      expectedRR: parseFloat(expectedRR.toFixed(2)),
      ruleFollowed,
      mistakeTags: activeMistakesList,
      emotionalState,
      entryReason,
      exitReason: '',
      whatWentWell: '',
      whatWentWrong: '',
      notes,
      tags: tagsList,
      fees: status === 'CLOSED' ? 150 : 0,
      exitPrice: status === 'CLOSED' ? parsedTarget1 : undefined,
      exitDate: status === 'CLOSED' ? new Date().toISOString().split('T')[0] : undefined,
      realizedPL: status === 'CLOSED' ? (side === 'LONG' ? (parsedTarget1 - parsedEntry) * parsedQty : (parsedEntry - parsedTarget1) * parsedQty) - 150 : undefined,
      rMultiple: status === 'CLOSED' ? parseFloat((((side === 'LONG' ? (parsedTarget1 - parsedEntry) * parsedQty : (parsedEntry - parsedTarget1) * parsedQty) - 150) / plannedRisk).toFixed(2)) : undefined
    });

    // Reset Form
    setSymbol('');
    setCompany('');
    setSector('');
    setQuantity('');
    setEntryPrice('');
    setStopLoss('');
    setTarget1('');
    setTarget2('');
    setEntryReason('');
    setNotes('');
    setTagsInput('');
    setMistakes({
      'FOMO': false,
      'Early Exit': false,
      'Ignored Stop': false,
      'Weak Volume': false,
      'Overtraded': false,
      'Chased Price': false
    });

    setIsNewEntryOpen(false);
  };

  const handleRecordExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    const price = parseFloat(exitPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid exit price.');
      return;
    }

    const priceDiff = selectedEntry.side === 'LONG'
      ? price - selectedEntry.entryPrice
      : selectedEntry.entryPrice - price;

    const rawPL = selectedEntry.quantity * priceDiff;
    const fees = 150; // default simulation fee
    const realizedPL = rawPL - fees;
    const rMultiple = selectedEntry.plannedRisk > 0 ? realizedPL / selectedEntry.plannedRisk : 0;

    updateJournalEntry(selectedEntry.id, {
      status: 'CLOSED',
      exitPrice: price,
      exitDate: new Date().toISOString().split('T')[0],
      fees,
      realizedPL,
      rMultiple: parseFloat(rMultiple.toFixed(2)),
      exitReason: exitReason || 'Position exit recorded from Journal drawer.'
    });

    setExitPrice('');
    setExitReason('');
  };

  // Analytics helper maps
  const setupPerformance: Record<string, { totalPL: number; count: number; wins: number }> = {};
  const gradePerformance: Record<string, { totalPL: number; count: number }> = {};
  const mistakeCounts: Record<string, number> = {};

  journalEntries.forEach((entry) => {
    // Setup analysis
    if (!setupPerformance[entry.setup]) {
      setupPerformance[entry.setup] = { totalPL: 0, count: 0, wins: 0 };
    }
    setupPerformance[entry.setup].count += 1;
    if (entry.status === 'CLOSED' && entry.realizedPL !== undefined) {
      setupPerformance[entry.setup].totalPL += entry.realizedPL;
      if (entry.realizedPL > 0) {
        setupPerformance[entry.setup].wins += 1;
      }
    }

    // Grade analysis
    if (!gradePerformance[entry.grade]) {
      gradePerformance[entry.grade] = { totalPL: 0, count: 0 };
    }
    gradePerformance[entry.grade].count += 1;
    if (entry.status === 'CLOSED' && entry.realizedPL !== undefined) {
      gradePerformance[entry.grade].totalPL += entry.realizedPL;
    }

    // Mistake count analyzer
    entry.mistakeTags.forEach((mistake) => {
      mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
    });
  });

  return (
    <PageContainer id="journal-route">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-sans tracking-tight">Trade Journal</h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Record, review, and evaluate completed or planned trades to optimize setup hit-rates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewEntryOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2EA043] text-white border border-[#238636] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
              NEW JOURNAL ENTRY
            </button>

            {journalEntries.length > 0 ? (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your demo journal logs?')) {
                    clearJournal();
                  }
                }}
                className="px-3.5 py-1.5 rounded-md bg-transparent hover:bg-[#DA3633]/10 text-[#DA3633] border border-border-dark hover:border-[#DA3633]/30 text-xs font-mono font-semibold transition-all cursor-pointer focus:outline-none"
              >
                CLEAR LOGS
              </button>
            ) : (
              <button
                onClick={loadDemoJournal}
                className="px-3.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#21262D] border border-border-dark text-xs font-mono font-bold text-white cursor-pointer focus:outline-none"
              >
                LOAD DEMO JOURNAL
              </button>
            )}
          </div>
        </div>

        {/* 1. Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
              Logged Trades
            </span>
            <div className="mt-2 text-xl font-bold text-white font-mono">{journalEntries.length} Total</div>
            <div className="mt-1 text-[10px] font-mono text-text-muted">
              Planned plans: {journalEntries.filter((e) => e.status === 'PLANNED').length} | Open positions: {journalEntries.filter((e) => e.status === 'OPEN').length}
            </div>
          </div>

          <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
              Win Hit-Rate (Closed)
            </span>
            <div className="mt-2 text-xl font-bold text-white font-mono">{winRate.toFixed(1)}%</div>
            <div className="mt-1 text-[10px] font-mono text-text-muted">
              {winTrades.length} Winners out of {closedTrades.length} trades
            </div>
          </div>

          <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
              Net Realized P/L
            </span>
            <div className={`mt-2 text-xl font-bold font-mono ${netProfitAfterFees >= 0 ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
              ৳{netProfitAfterFees.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] font-mono text-text-muted">
              Broker Commissions paid: ৳{totalFees.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
              Average R-Multiple
            </span>
            <div className={`mt-2 text-xl font-bold font-mono ${avgRMultiple >= 1.5 ? 'text-[#238636]' : avgRMultiple > 0 ? 'text-[#D29922]' : 'text-white'}`}>
              {avgRMultiple.toFixed(2)} R
            </div>
            <div className="mt-1 text-[10px] font-mono text-text-muted">
              Reflects reward gathered per unit of risk
            </div>
          </div>
        </div>

        {/* Status filtering tabs */}
        <div className="flex border-b border-border-dark bg-[#0D1117] font-mono text-xs select-none p-1 rounded-lg">
          {(['ALL', 'PLANNED', 'OPEN', 'CLOSED', 'CANCELLED'] as const).map((tab) => {
            const count = tab === 'ALL' ? journalEntries.length : journalEntries.filter((e) => e.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 px-3 rounded text-center font-bold tracking-wider transition-all focus:outline-none cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#161B22] text-white shadow-sm'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* 2. Interactive Journal Logs Table */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/30 max-w-2xl mx-auto my-6">
            <div className="p-3 bg-[#161B22] rounded-full text-text-secondary mb-3 border border-border-dark">
              <BookOpen className="w-6 h-6 opacity-85 text-[#8B949E]" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-1">No Journal Logs</h4>
            <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed font-sans">
              No journal entries fit the '{activeTab}' status tab. Log a new trade plan or load demo logs to review metrics.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-dark bg-[#0D1117] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Trading journal records table">
                <thead>
                  <tr className="bg-[#161B22]/50 text-[10px] uppercase border-b border-border-dark select-none">
                    <th className="py-3 px-3 text-text-secondary font-semibold">Symbol</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Date</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Side</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Status</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Entry</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Exit</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Qty</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-right">Realized P/L</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">R-Multiple</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Setup Name</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Grade</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Rules Followed</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/40">
                  {filteredEntries.map((entry) => {
                    const plUp = entry.realizedPL !== undefined && entry.realizedPL >= 0;
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntryId(entry.id)}
                        className="hover:bg-[#161B22]/60 transition-colors cursor-pointer group"
                      >
                        {/* Symbol */}
                        <td className="py-3 px-3 font-bold text-white uppercase group-hover:text-[#58A6FF] transition-colors">
                          {entry.symbol}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-text-secondary">{entry.tradeDate}</td>

                        {/* Side */}
                        <td className="py-3 px-3">
                          <SideBadge side={entry.side} />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                              entry.status === 'CLOSED'
                                ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20'
                                : entry.status === 'OPEN'
                                ? 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20'
                                : entry.status === 'PLANNED'
                                ? 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20'
                                : 'bg-text-secondary/10 text-text-secondary border-text-secondary/20'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>

                        {/* Entry Price */}
                        <td className="py-3 px-3 text-white font-semibold">৳{entry.entryPrice.toFixed(2)}</td>

                        {/* Exit Price */}
                        <td className="py-3 px-3 text-white">
                          {entry.exitPrice ? `৳${entry.exitPrice.toFixed(2)}` : '—'}
                        </td>

                        {/* Qty */}
                        <td className="py-3 px-3 text-text-secondary">{entry.quantity}</td>

                        {/* Realized P/L */}
                        <td className={`py-3 px-3 text-right font-bold ${entry.status === 'CLOSED' ? (plUp ? 'text-[#238636]' : 'text-[#DA3633]') : 'text-text-muted'}`}>
                          {entry.status === 'CLOSED' && entry.realizedPL !== undefined ? (
                            <span>
                              {plUp ? '+' : ''}৳{entry.realizedPL.toLocaleString()}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* R-Multiple */}
                        <td className={`py-3 px-3 text-center font-bold ${entry.status === 'CLOSED' ? (plUp ? 'text-[#238636]' : 'text-[#DA3633]') : 'text-text-muted'}`}>
                          {entry.status === 'CLOSED' && entry.rMultiple !== undefined ? (
                            <span>{entry.rMultiple > 0 ? '+' : ''}{entry.rMultiple}R</span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Setup Name */}
                        <td className="py-3 px-3 text-text-secondary truncate max-w-[120px]">{entry.setup}</td>

                        {/* Grade */}
                        <td className="py-3 px-3 text-center">
                          <GradeBadge grade={entry.grade} />
                        </td>

                        {/* Conformance rules */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                              entry.ruleFollowed
                                ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20'
                                : 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20'
                            }`}
                          >
                            {entry.ruleFollowed ? 'CONFORMED' : 'VIOLATED'}
                          </span>
                        </td>

                        {/* Delete action */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (confirm(`Delete journal entry for ${entry.symbol}?`)) {
                                deleteJournalEntry(entry.id);
                              }
                            }}
                            className="p-1.5 rounded text-text-secondary hover:text-[#DA3633] hover:bg-[#DA3633]/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer focus:outline-none focus:opacity-100"
                            title={`Delete log item`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Deep Performance Analytics Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
          {/* Performance by Setup Card */}
          <div className="rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#58A6FF]" />
              Setup Strike Hit-Rates
            </h3>
            <p className="text-[10px] text-text-secondary font-sans">
              Evaluates profitability and volume across recurring technical setups.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {Object.entries(setupPerformance).map(([setupName, data]) => {
                const isProfitable = data.totalPL >= 0;
                return (
                  <div key={setupName} className="p-2 bg-[#161B22]/40 rounded-md border border-border-dark flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <div className="text-white font-bold">{setupName}</div>
                      <div className="text-[9px] text-text-secondary">{data.count} trades logged</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${isProfitable ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                        {isProfitable ? '+' : ''}৳{data.totalPL.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-text-secondary">
                        Win Rate: {data.count > 0 ? ((data.wins / data.count) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(setupPerformance).length === 0 && (
                <div className="text-center py-6 text-xs text-text-secondary">No setup metrics.</div>
              )}
            </div>
          </div>

          {/* Performance by Grade Card */}
          <div className="rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#58A6FF]" />
              Grading Metrics alignment
            </h3>
            <p className="text-[10px] text-text-secondary font-sans">
              Matches realized P/L to technical checklist grades (A+, A, B+, REJECT).
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {Object.entries(gradePerformance).map(([gradeName, data]) => {
                const isProfitable = data.totalPL >= 0;
                return (
                  <div key={gradeName} className="p-2 bg-[#161B22]/40 rounded-md border border-border-dark flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <GradeBadge grade={gradeName as any} />
                      <span className="text-text-secondary">{data.count} entries</span>
                    </div>
                    <div className={`font-black ${isProfitable ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                      {isProfitable ? '+' : ''}৳{data.totalPL.toLocaleString()}
                    </div>
                  </div>
                );
              })}
              {Object.keys(gradePerformance).length === 0 && (
                <div className="text-center py-6 text-xs text-text-secondary">No grading metrics.</div>
              )}
            </div>
          </div>

          {/* Mistake Frequency Card */}
          <div className="rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#DA3633]" />
              Mistake & Leak Frequency
            </h3>
            <p className="text-[10px] text-text-secondary font-sans">
              Identifies behavioral leakage causes leading to trade friction.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {Object.entries(mistakeCounts).map(([tagName, count]) => {
                return (
                  <div key={tagName} className="p-2 bg-[#161B22]/40 rounded-md border border-border-dark flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D29922]" />
                      {tagName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/25 font-black text-[10px]">
                      {count} times
                    </span>
                  </div>
                );
              })}
              {Object.keys(mistakeCounts).length === 0 && (
                <div className="text-center py-6 text-xs text-text-secondary flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#238636]" />
                  <span>No behavioral leaks registered!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SLIDE-OUT PANEL: NEW TRADE JOURNAL ENTRY ==================== */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setIsNewEntryOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#0D1117] border-l border-border-dark h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  New Journal Trade Record
                </h3>
                <DemoDataBadge />
              </div>
              <button
                type="button"
                onClick={() => setIsNewEntryOpen(false)}
                className="p-1 text-text-secondary hover:text-white rounded-md focus:outline-none"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleAddNewTrade} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono text-text-secondary">
              {/* Asset specifics */}
              <div className="bg-[#161B22]/20 border border-border-dark p-3.5 rounded-lg space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-white tracking-wider border-b border-border-dark/60 pb-1">
                  1. Instrument Identity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] mb-1">Stock Symbol *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BATBC"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] mb-1">Company name</label>
                    <input
                      type="text"
                      placeholder="e.g. British American Tobacco"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] mb-1">Sector Class</label>
                    <input
                      type="text"
                      placeholder="e.g. Food & Allied"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] mb-1">Direction</label>
                      <select
                        value={side}
                        onChange={(e) => setSide(e.target.value as any)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1 text-white focus:outline-none"
                      >
                        <option value="LONG">LONG</option>
                        <option value="SHORT">SHORT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1 text-white focus:outline-none"
                      >
                        <option value="PLANNED">PLANNED</option>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizing & pricing */}
              <div className="bg-[#161B22]/20 border border-border-dark p-3.5 rounded-lg space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-white tracking-wider border-b border-border-dark/60 pb-1">
                  2. Sizing & Levels (DSE ৳)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] mb-1">Position Shares Qty *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] mb-1">Entry Price (৳) *</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      placeholder="e.g. 425.00"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] mb-1">Stop Loss Support *</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      placeholder="e.g. 408.00"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-[#DA3633] focus:outline-none font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[9px] mb-1">Target 1 *</label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        placeholder="T1 Price"
                        value={target1}
                        onChange={(e) => setTarget1(e.target.value)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-1.5 py-1.5 text-[#238636] focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] mb-1">Target 2</label>
                      <input
                        type="number"
                        step="0.05"
                        placeholder="T2 Price"
                        value={target2}
                        onChange={(e) => setTarget2(e.target.value)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-1.5 py-1.5 text-[#238636] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules & Behavioral Qualitative metrics */}
              <div className="bg-[#161B22]/20 border border-border-dark p-3.5 rounded-lg space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-white tracking-wider border-b border-border-dark/60 pb-1">
                  3. Setup Classification & Psychology
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] mb-1">Setup Rule Name</label>
                    <select
                      value={setup}
                      onChange={(e) => setSetup(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-white focus:outline-none"
                    >
                      <option value="Bullish Flag Breakout">Bullish Flag Breakout</option>
                      <option value="Ascending Triangle Compression">Ascending Triangle Compression</option>
                      <option value="Support Bounce & Higher Low">Support Bounce & Higher Low</option>
                      <option value="Mean Reversion Stretch">Mean Reversion Stretch</option>
                      <option value="Golden Cross EMA Shift">Golden Cross EMA Shift</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[9px] mb-1">Grade</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value as any)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-1.5 py-1 text-white focus:outline-none"
                      >
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="REJECT">REJECT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] mb-1">Score</label>
                      <input
                        type="number"
                        placeholder="95"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-1.5 py-1 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between py-1 border-b border-border-dark/40">
                    <span className="text-[10px] text-white">Followed Rules Protocol?</span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ruleFollowed}
                        onChange={(e) => setRuleFollowed(e.target.checked)}
                        className="rounded text-[#238636] bg-[#161B22] border-border-dark"
                      />
                      <span className={ruleFollowed ? 'text-[#238636] font-bold' : 'text-[#DA3633] font-bold'}>
                        {ruleFollowed ? 'YES (CONFORMED)' : 'NO (VIOLATION)'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[9px] mb-1">Emotional State</label>
                    <select
                      value={emotionalState}
                      onChange={(e) => setEmotionalState(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-white focus:outline-none"
                    >
                      <option value="Calm & Confident">Calm & Confident</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Excited & Greedy">Excited & Greedy</option>
                      <option value="Fearful / Hesitant">Fearful / Hesitant</option>
                      <option value="Frustrated">Frustrated</option>
                      <option value="Neutral">Neutral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] mb-1">Comma-separated Tags</label>
                    <input
                      type="text"
                      placeholder="Breakout, Winner"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Behavioral mistakes list */}
                <div className="pt-2">
                  <span className="block text-[9px] text-text-muted mb-1.5 uppercase font-bold">Check registered behavioral leaks:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {Object.keys(mistakes).map((mKey) => (
                      <label key={mKey} className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={mistakes[mKey]}
                          onChange={(e) => setMistakes((prev) => ({ ...prev, [mKey]: e.target.checked }))}
                          className="rounded text-[#DA3633] bg-[#161B22] border-border-dark"
                        />
                        <span>{mKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text reasons */}
              <div>
                <label className="block text-[9px] uppercase font-bold text-text-secondary mb-1">Qualitative Entry Reason</label>
                <textarea
                  rows={2}
                  placeholder="Technical justification, indicator confirmations, horizontal anchor levels..."
                  value={entryReason}
                  onChange={(e) => setEntryReason(e.target.value)}
                  className="w-full bg-[#161B22] border border-border-dark rounded p-2 text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-text-secondary mb-1">Notes / Reminders</label>
                <textarea
                  rows={2}
                  placeholder="Written technical levels, post-analysis reflections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#161B22] border border-border-dark rounded p-2 text-white font-sans"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 bg-[#161B22]/30 border-t border-border-dark flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsNewEntryOpen(false)}
                className="px-4 py-2 border border-border-dark rounded-md text-[10px] font-bold text-text-secondary hover:text-white"
              >
                DISCARD
              </button>
              <button
                type="button"
                onClick={handleAddNewTrade}
                className="px-5 py-2 rounded-md bg-[#238636] hover:bg-[#2EA043] border border-[#238636] text-[10px] font-bold text-white uppercase"
              >
                ADD JOURNAL TRADE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DETAIL / RETROSPECTIVE DRAWER ==================== */}
      {selectedEntryId && selectedEntry && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setSelectedEntryId(null)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-[#0D1117] border-l border-border-dark flex flex-col shadow-2xl relative">
              
              {/* Header */}
              <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-white uppercase">{selectedEntry.symbol}</span>
                    <GradeBadge grade={selectedEntry.grade} />
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#161B22] border border-border-dark text-white uppercase">
                      {selectedEntry.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-secondary truncate mt-0.5">{selectedEntry.company} • {selectedEntry.sector}</div>
                </div>
                <button
                  onClick={() => setSelectedEntryId(null)}
                  className="p-1 rounded-md text-text-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable specs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs font-mono text-text-secondary">
                {/* 1. Sizing specs table */}
                <div className="bg-[#161B22]/20 border border-border-dark p-3.5 rounded-lg space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-white tracking-wider border-b border-border-dark/60 pb-1">
                    Trade Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="flex justify-between border-b border-border-dark/10 pb-1 col-span-2">
                      <span>Setup Pattern:</span>
                      <span className="text-white font-bold">{selectedEntry.setup}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Bias side:</span>
                      <SideBadge side={selectedEntry.side} />
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Shares Quantity:</span>
                      <span className="text-white font-bold">{selectedEntry.quantity}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Entry Target:</span>
                      <span className="text-white font-semibold">৳{selectedEntry.entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Stop Loss level:</span>
                      <span className="text-[#DA3633] font-bold">৳{selectedEntry.stopLoss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1 col-span-2">
                      <span>Target Levels:</span>
                      <span className="text-[#238636] font-bold">৳{selectedEntry.target1.toFixed(2)} / ৳{selectedEntry.target2.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Planned Capital Risk:</span>
                      <span className="text-[#DA3633] font-bold">৳{selectedEntry.plannedRisk.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/10 pb-1">
                      <span>Expected R/R:</span>
                      <span className="text-[#58A6FF] font-black">{selectedEntry.expectedRR}x</span>
                    </div>
                  </div>
                </div>

                {/* Realized result for CLOSED */}
                {selectedEntry.status === 'CLOSED' && (
                  <div className="bg-[#238636]/5 border border-[#238636]/25 p-3.5 rounded-lg space-y-1.5">
                    <h4 className="text-[10px] uppercase font-bold text-[#238636] tracking-wider border-b border-[#238636]/15 pb-1">
                      Realized Trade Outcome
                    </h4>
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Sale Exit Price:</span>
                        <span className="text-white font-black">৳{selectedEntry.exitPrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brokerage Fees:</span>
                        <span className="text-text-muted">৳{selectedEntry.fees}</span>
                      </div>
                      <div className="flex justify-between col-span-2 pt-1 border-t border-border-dark/40 font-bold">
                        <span>Net P/L:</span>
                        <span className={selectedEntry.realizedPL && selectedEntry.realizedPL >= 0 ? 'text-[#238636]' : 'text-[#DA3633]'}>
                          ৳{selectedEntry.realizedPL?.toLocaleString()} ({selectedEntry.rMultiple}R Multiple)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Behavioral assessment */}
                <div className="bg-[#161B22]/10 border border-border-dark p-3.5 rounded-lg space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-white tracking-wider border-b border-border-dark/60 pb-1">
                    Qualitative Checklist
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Rule Conformance:</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded text-[10px] border ${
                          selectedEntry.ruleFollowed
                            ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20'
                            : 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20'
                        }`}
                      >
                        {selectedEntry.ruleFollowed ? 'rules followed' : 'violation recorded'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span>Psychological State:</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#DA3633]" />
                        {selectedEntry.emotionalState}
                      </span>
                    </div>

                    {selectedEntry.mistakeTags.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-border-dark/20">
                        <span className="text-[10px] text-text-muted block font-bold">Friction & Leaks Registered:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.mistakeTags.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-[#DA3633]/10 border border-[#DA3633]/20 text-[#DA3633] text-[9px] uppercase font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#238636] font-bold pt-1 border-t border-border-dark/20">
                        ✓ No trade execution mistakes recorded. Pure mechanical discipline.
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualitative texts */}
                <div className="space-y-3 pt-2">
                  {selectedEntry.entryReason && (
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Reason for Entering Position</div>
                      <div className="p-3 bg-[#161B22]/30 border border-border-dark rounded-md text-white font-sans text-xs leading-relaxed">
                        {selectedEntry.entryReason}
                      </div>
                    </div>
                  )}

                  {selectedEntry.notes && (
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Written Notes & Reminders</div>
                      <div className="p-3 bg-[#161B22]/30 border border-border-dark rounded-md text-white font-sans text-xs leading-relaxed">
                        {selectedEntry.notes}
                      </div>
                    </div>
                  )}

                  {selectedEntry.exitReason && (
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Position Exit Reason</div>
                      <div className="p-3 bg-[#161B22]/30 border border-border-dark rounded-md text-white font-sans text-xs leading-relaxed">
                        {selectedEntry.exitReason}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Record Exit Panel (Only if status is OPEN) */}
                {selectedEntry.status === 'OPEN' && (
                  <form onSubmit={handleRecordExit} className="bg-[#161B22]/40 border border-border-dark p-4 rounded-lg space-y-3">
                    <h4 className="text-[10px] uppercase font-black text-white tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#DA3633]" />
                      Record Sale & Exit position
                    </h4>

                    <div>
                      <label className="block text-[9px] mb-1">Exit Price (৳) *</label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        placeholder={`e.g. ${selectedEntry.entryPrice}`}
                        className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] mb-1">Exit Reason (Qualitative)</label>
                      <textarea
                        rows={2}
                        placeholder="Price hit target. Support floor broken. Trend changed, exited position..."
                        value={exitReason}
                        onChange={(e) => setExitReason(e.target.value)}
                        className="w-full bg-[#161B22] border border-border-dark rounded p-2 text-white font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded bg-[#DA3633] text-white hover:bg-[#B32421] font-bold text-[10px] uppercase tracking-wider"
                    >
                      EXECUTE JOURNAL position exit
                    </button>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#161B22]/20 border-t border-border-dark text-[9px] font-mono text-text-secondary text-right">
                Logged ID: {selectedEntry.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
