import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function Settings() {
  return (
    <PageContainer id="settings-route">
      <PageHeader
        title="Terminal Settings"
        description="Configure display settings, default trading parameters, and subscription tiers."
        breadcrumbs={[{ label: 'Settings', path: '/settings' }]}
        action={<StatusBadge status="accent" label="STANDALONE" />}
      />
      <EmptyState
        title="Settings & Configurations Module"
        description="The Settings panel will house broker API credentials, charting preferences, and account management tools. Standard data persistence will be wired up in Phase 2."
      />
    </PageContainer>
  );
}
