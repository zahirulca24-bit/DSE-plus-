import { BookOpen } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';

export default function Journal() {
  const { journalEntries } = useMarket();
  const hasEntries = journalEntries.length > 0;

  return (
    <PageContainer id="journal-route">
      <PageHeader
        title="Trade Journal"
        description="Journal entries are shown only from user-created or connected portfolio/trade workflows. No sample journal is loaded."
        breadcrumbs={[{ label: 'Journal', path: '/journal' }]}
        action={<StatusBadge status={hasEntries ? 'positive' : 'warning'} label={hasEntries ? 'ENTRIES AVAILABLE' : 'EMPTY'} />}
      />

      {!hasEntries ? (
        <div className="mx-auto my-12 flex max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
          <div className="mb-4 rounded-full border border-border-dark bg-[#161B22] p-3 text-text-secondary"><BookOpen className="h-6 w-6" /></div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">No journal entries</h3>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-text-secondary">Demo journal records are disabled. Entries will appear only from actual user records or connected app workflows.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-dark bg-[#0D1117]">
          <table className="w-full min-w-[900px] text-left font-mono text-xs">
            <thead className="bg-[#161B22] text-[10px] uppercase text-text-secondary"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Side</th><th className="px-4 py-3">Setup</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Entry</th><th className="px-4 py-3">Exit</th><th className="px-4 py-3">P/L</th></tr></thead>
            <tbody className="divide-y divide-border-dark/50">
              {journalEntries.map((entry) => (
                <tr key={entry.id}><td className="px-4 py-3 text-text-secondary">{entry.tradeDate}</td><td className="px-4 py-3 font-bold text-white">{entry.symbol}</td><td className="px-4 py-3 text-white">{entry.side}</td><td className="px-4 py-3 text-text-secondary">{entry.setup}</td><td className="px-4 py-3 text-white">{entry.grade}</td><td className="px-4 py-3 text-white">{entry.status}</td><td className="px-4 py-3 text-white">৳{entry.entryPrice.toFixed(2)}</td><td className="px-4 py-3 text-white">{entry.exitPrice !== undefined ? `৳${entry.exitPrice.toFixed(2)}` : '—'}</td><td className="px-4 py-3 text-white">{entry.realizedPL !== undefined ? `৳${entry.realizedPL.toFixed(2)}` : '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
