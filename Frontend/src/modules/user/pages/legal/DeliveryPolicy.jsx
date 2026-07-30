import { Truck } from 'lucide-react';
import LegalDocument from './LegalDocument';
import { RELATED, deliverySections } from './legalContent';

const DeliveryPolicy = () => (
  <LegalDocument
    title="Delivery Policy"
    subtitle="How AMM Sports Arena delivers digital booking confirmations and facility access after online payment."
    Icon={Truck}
    sections={deliverySections}
    relatedLinks={RELATED.filter((l) => l.path !== '/delivery-policy')}
  />
);

export default DeliveryPolicy;
