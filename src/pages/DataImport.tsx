import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function DataImport() {
  return (
    <PageContainer id="data-import-route">
      <PageHeader
        title="Data Import"
        description="Upload custom CSV/Excel historical price data or import trading statements."
        breadcrumbs={[{ label: 'Data Import', path: '/data-import' }]}
        action={<StatusBadge status="accent" label="STANDALONE" />}
      />
      <EmptyState
        title="Data Import Module"
        description="This module will enable manual csv parsing for historical candles or portfolio statement ingestion. The backend processing files and data storage rules will be configured in Phase 2."
      />
    </PageContainer>
  );
}
