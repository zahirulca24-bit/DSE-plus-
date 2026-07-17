import { useMemo, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

type ImportCategory = {
  name: string;
  format: string;
  required: string[];
  optional?: string[];
  example: string;
};

const categories: ImportCategory[] = [
  { name: 'DSE OHLC Data', format: 'CSV', required: ['symbol', 'date/trade_date', 'open', 'high', 'low', 'close', 'volume'], optional: ['trade', 'value'], example: 'GP,2026-07-16,280,286,278,284,510000' },
  { name: 'Sector Master List', format: 'CSV', required: ['symbol', 'sector'], optional: ['company'], example: 'SQURPHARMA,Pharmaceuticals & Chemicals,Square Pharmaceuticals Ltd.' },
  { name: 'Watchlist', format: 'CSV', required: ['symbol'], optional: ['company', 'sector', 'note'], example: 'GP,Grameenphone Ltd.,Telecommunication,Review near support' },
  { name: 'Portfolio Holdings', format: 'CSV', required: ['symbol', 'quantity', 'average_cost'], optional: ['company', 'sector', 'note'], example: 'BATBC,100,410.50,BAT Bangladesh,Food & Allied' },
  { name: 'Trade Journal', format: 'CSV', required: ['date', 'symbol', 'side', 'entry', 'stop', 'status'], optional: ['exit', 'quantity', 'fees', 'notes', 'setup', 'grade'], example: '2026-07-16,GP,LONG,284,274,PLANNED' },
  { name: 'Backtest Dataset', format: 'CSV', required: ['symbol', 'date', 'open', 'high', 'low', 'close'], optional: ['volume', 'trade', 'value'], example: 'BRACBANK,2026-07-16,38,39,37,38.5,1900000' },
];

const requiredByCategory: Record<string, string[]> = {
  'DSE OHLC Data': ['symbol', 'open', 'high', 'low', 'close', 'volume'],
  'Sector Master List': ['symbol', 'sector'],
  Watchlist: ['symbol'],
  'Portfolio Holdings': ['symbol', 'quantity', 'average_cost'],
  'Trade Journal': ['date', 'symbol', 'side', 'entry', 'stop', 'status'],
  'Backtest Dataset': ['symbol', 'date', 'open', 'high', 'low', 'close'],
};

export default function DataImport() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [lastPreview, setLastPreview] = useState('Not loaded');

  const required = requiredByCategory[selectedCategory] || [];
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  const missingColumns = useMemo(() => {
    if (selectedCategory === 'DSE OHLC Data') {
      const dateOk = normalizedHeaders.includes('date') || normalizedHeaders.includes('trade_date');
      return required.filter((column) => !normalizedHeaders.includes(column)).concat(dateOk ? [] : ['date or trade_date']);
    }
    return required.filter((column) => !normalizedHeaders.includes(column));
  }, [normalizedHeaders, required, selectedCategory]);
  const extraColumns = headers.filter((header) => !required.includes(header.trim().toLowerCase()));

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed = lines.map((line) => line.split(',').map((cell) => cell.trim()));
    setHeaders(parsed[0] || []);
    setRows(parsed.slice(1, 21));
    setTotalRows(Math.max(parsed.length - 1, 0));
    setLastPreview(new Date().toLocaleString('en-GB'));
  };

  return (
    <PageContainer id="data-import-route">
      <PageHeader
        title="Data Import"
        description="Prepare DSE OHLC, sector, watchlist, portfolio, journal, and backtest files for future backend and Supabase integration."
        breadcrumbs={[{ label: 'Data Import', path: '/data-import' }]}
        action={<StatusBadge status="warning" label="LOCAL PREVIEW ONLY" />}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusCard label="Market Data" value="Not Connected" />
          <StatusCard label="Backend API" value="Not Connected" />
          <StatusCard label="Supabase" value="Not Connected" />
          <StatusCard label="Local Preview" value={fileName ? 'Available' : 'Waiting'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`text-left rounded-xl border p-4 transition-colors ${selectedCategory === category.name ? 'border-[#58A6FF] bg-[#58A6FF]/10' : 'border-border-dark bg-[#0D1117] hover:border-[#484F58]'}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white"><FileText className="w-4 h-4" />{category.name}</div>
              <p className="mt-2 text-[11px] text-text-secondary">Format: {category.format}</p>
              <p className="mt-1 text-[11px] text-text-secondary">Required: {category.required.join(', ')}</p>
              <p className="mt-2 rounded bg-[#161B22] p-2 font-mono text-[10px] text-text-secondary truncate">{category.example}</p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">CSV Local Preview</h3>
              <p className="text-xs text-text-secondary">Files are parsed in the browser only. Nothing is uploaded to a backend or database.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-xs font-mono font-bold text-white">
              <UploadCloud className="w-4 h-4" /> Select CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatusCard label="Selected Type" value={selectedCategory} />
            <StatusCard label="File" value={fileName || 'None'} />
            <StatusCard label="Rows Detected" value={totalRows} />
            <StatusCard label="Last Preview" value={lastPreview} />
          </div>

          <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4 text-xs">
            <h4 className="font-bold text-white mb-3">Validation Panel</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-text-secondary">
              <div>Detected headers: <span className="text-white">{headers.length ? headers.join(', ') : 'None'}</span></div>
              <div>Missing required columns: <span className={missingColumns.length ? 'text-[#DA3633]' : 'text-[#238636]'}>{headers.length ? (missingColumns.join(', ') || 'None') : 'Upload file first'}</span></div>
              <div>Extra columns: <span className="text-white">{headers.length ? (extraColumns.join(', ') || 'None') : 'Upload file first'}</span></div>
              <div>Duplicate symbol count: <span className="text-text-secondary">Placeholder until backend validation</span></div>
              <div>Date format warning: <span className="text-text-secondary">Placeholder until backend validation</span></div>
              <div>Numeric format warning: <span className="text-text-secondary">Placeholder until backend validation</span></div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border-dark">
            <table className="w-full min-w-[760px] text-left text-[11px] font-mono">
              <thead className="bg-[#161B22] text-text-secondary uppercase">
                <tr>{headers.map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>{headers.map((header, cellIndex) => <td key={`${header}-${cellIndex}`} className="px-3 py-3 text-white">{row[cellIndex] || ''}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {!headers.length && <div className="py-10 text-center text-xs text-text-secondary">Select a CSV to preview the first 20 rows locally.</div>}
          </div>
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-4 text-xs text-[#D29922]">
          Backend import, Supabase write, and verified market-data counts are not connected yet. Latest OHLC date, symbols count, and rows count remain unknown until backend integration.
        </div>
      </div>
    </PageContainer>
  );
}

function StatusCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-2 text-sm font-bold text-white break-words">{value}</div>
    </div>
  );
}
