import { RefreshCw } from 'lucide-react';
import LegalDocument from './LegalDocument';
import { RELATED, refundSections } from './legalContent';

const RefundPolicy = () => (
  <LegalDocument
    title="Cancellation & Refund Policy"
    subtitle="Cancellation, refund and return rules for bookings, enrollments, memberships and wallet payments."
    Icon={RefreshCw}
    sections={refundSections}
    relatedLinks={RELATED.filter((l) => l.path !== '/refund-policy')}
  />
);

export default RefundPolicy;
