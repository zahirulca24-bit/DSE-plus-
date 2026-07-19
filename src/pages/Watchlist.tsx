import { Plus, Trash2 } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';

export default function Watchlist() {
  const {
    scannerCandidates,
    signalCandidates,
    watchlistSymbols,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
    scannerDataSource,
    signalDataSource,
    scanTimestamp,
  } = useMarket();

  const available = scannerCandidates.filter((item) => !watchlistSymbols.includes(item.symbol));
  const rows = watchlistSymbols.map((symbol) => ({
    symbol,
    candidate: scannerCandidates.find((item) => item.symbol === symbol) || signalCandidates.find((item) => item.symbol === symbol),
  }));
  const realDataReady = scannerDataSource !== 'none' || signalDataSource !== 'none';

  return (
    <PageContainer id="watchlist-route">
      <PageHeader
        title="Market Watchlist"
        description="Track symbols from verified backend scanner data. No demo symbols or simulated prices are preloaded."
        breadcrumbs={[{ label: 'Watchlist', path: '/watchlist' }]}
        action={<StatusBadge status={realDataReady ? 'positive' : 'warning'} label={realDataReady ? 'REAL DATA' : 'NO LIVE DATA'} />}
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-text-secondary">
              <div>Items: <span className="font-bold text-white">{watchlistSymbols.length}</span></div>
              <div className="mt-1">Last scanner update: <span className="text-white">{scanTimestamp}</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {available.slice(0, 8).map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => addToWatchlist(item.symbol)}
                  className="inline-flex items-center gap-1 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />{item.symbol}
                </button>
              ))}
              {watchlistSymbols.length > 0 && (
                <button type="button" onClick={clearWatchlist} className="rounded-md border border-[#DA3633]/30 px-3 py-2 text-xs font-mono font-bold text-[#DA3633]">Clear List</button>
              )}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
            <h3 className="text-sm font-bold text-white">No watchlist symbols</h3>
            <p className="mt-2 text-xs text-text-secondary">
              {realDataReady ? 'Add symbols from the latest backend scanner results.' : 'Connect the Drive-backed dataset and run the backend scanner first.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-dark bg-[#0D1117]">
            <table className="w-full min-w-[760px] text-left font-mono text-xs">
              <thead className="bg-[#161B22] text-[10px] uppercase text-text-secondary">
                <tr><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Setup</th><th className="px-4 py-3">Entry Status</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {rows.map(({ symbol, candidate }) => (
                  <tr key={symbol}>
                    <td className="px-4 py-3 font-bold text-white">{symbol}</td>
                    <td className="px-4 py-3 text-white">{candidate?.grade || '—'}</td>
                    <td className="px-4 py-3 text-white">{candidate?.price ? `৳${candidate.price.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{candidate?.setup || 'Awaiting scanner data'}</td>
                    <td className="px-4 py-3 text-text-secondary">{candidate?.entryStatus || '—'}</td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => removeFromWatchlist(symbol)} className="inline-flex items-center gap-1 text-[#DA3633]"><Trash2 className="h-3.5 w-3.5" />Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-lg border border-[#58A6FF]/20 bg-[#58A6FF]/5 p-4 text-xs text-[#58A6FF]">
          Watchlist membership is currently browser-local. Prices and scanner fields are shown only when supplied by the real backend data source.
        </div>
      </div>
    </PageContainer>
  );
}
