import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function Alerts() {
  return (
    <PageContainer id="alerts-route">
      <PageHeader
        title="Price Alerts"
        description="Set automated notifications for threshold crosses, breakouts, and unusual volume movements."
        breadcrumbs={[{ label: 'Alerts', path: '/alerts' }]}
        action={<StatusBadge status="warning" label="OFFLINE" />}
      />
      <EmptyState
        title="Price & Event Alerts Module"
        description="The alert scheduler will allow configuring SMS, email, and web-push notifications for Dhaka Stock Exchange tickers. Real-time background check engines will be set up in Phase 2."
      />
    </PageContainer>
  );
}
