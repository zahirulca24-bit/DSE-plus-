import { Briefcase } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';

export default function Portfolio() {
  const { portfolioHoldings, portfolioSummary } = useMarket();
  const hasData = portfolioHoldings.length > 0;

  return (
    <PageContainer id="portfolio-route">
      <PageHeader
        title="Portfolio"
        description="Portfolio values are shown only from user-imported or connected holdings. No sample holdings are loaded."
        breadcrumbs={[{ label: 'Portfolio', path: '/portfolio' }]}
        action={<StatusBadge status={hasData ? 'positive' : 'warning'} label={hasData ? 'PORTFOLIO LOADED' : 'NOT IMPORTED'} />}
      />

      <div className="space-y-6">
        {!hasData ? (
          <div className="mx-auto my-12 flex max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
            <div className="mb-4 rounded-full border border-border-dark bg-[#161B22] p-3 text-text-secondary"><Briefcase className="h-6 w-6" /></div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">No portfolio data imported</h3>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-text-secondary">The demo portfolio has been disabled. Portfolio holdings will appear only after the portfolio import/storage workflow is connected.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Metric label="Portfolio Value" value={`৳${portfolioSummary.portfolioValue.toLocaleString()}`} />
              <Metric label="Total Cost" value={`৳${portfolioSummary.totalCost.toLocaleString()}`} />
              <Metric label="Unrealized P/L" value={`৳${portfolioSummary.unrealizedPL.toLocaleString()}`} />
              <Metric label="Holdings" value={portfolioHoldings.length.toString()} />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border-dark bg-[#0D1117]">
              <table className="w-full min-w-[760px] text-left font-mono text-xs">
                <thead className="bg-[#161B22] text-[10px] uppercase text-text-secondary"><tr><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Average Cost</th><th className="px-4 py-3">Last Price</th><th className="px-4 py-3">Market Value</th><th className="px-4 py-3">P/L</th></tr></thead>
                <tbody className="divide-y divide-border-dark/50">
                  {portfolioHoldings.map((holding) => (
                    <tr key={holding.id}><td className="px-4 py-3 font-bold text-white">{holding.symbol}</td><td className="px-4 py-3 text-white">{holding.quantity.toLocaleString()}</td><td className="px-4 py-3 text-white">৳{holding.averageCost.toFixed(2)}</td><td className="px-4 py-3 text-white">৳{holding.lastPrice.toFixed(2)}</td><td className="px-4 py-3 text-white">৳{holding.marketValue.toLocaleString()}</td><td className="px-4 py-3 text-white">৳{holding.unrealizedPL.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5"><div className="font-mono text-[10px] uppercase text-text-secondary">{label}</div><div className="mt-2 text-lg font-bold text-white">{value}</div></div>;
}
