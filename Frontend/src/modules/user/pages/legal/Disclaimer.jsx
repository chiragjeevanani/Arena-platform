import { AlertTriangle } from 'lucide-react';
import LegalDocument from './LegalDocument';
import { RELATED, disclaimerSections } from './legalContent';

const Disclaimer = () => (
  <LegalDocument
    title="Disclaimer"
    subtitle="Important notices regarding facility use, payments, availability and liability on ammarena.com."
    Icon={AlertTriangle}
    sections={disclaimerSections}
    relatedLinks={RELATED.filter((l) => l.path !== '/disclaimer')}
  />
);

export default Disclaimer;
