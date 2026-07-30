import { Shield } from 'lucide-react';
import LegalDocument from './LegalDocument';
import { RELATED, privacySections } from './legalContent';

/** Public Privacy Policy page (Bank Muscat checklist URL: /privacy). */
const PublicPrivacy = () => (
  <LegalDocument
    title="Privacy Policy"
    subtitle="How we collect, use and protect your personal data when you use AMM Sports Arena."
    Icon={Shield}
    sections={privacySections}
    relatedLinks={RELATED.filter((l) => l.path !== '/privacy')}
  />
);

export default PublicPrivacy;
