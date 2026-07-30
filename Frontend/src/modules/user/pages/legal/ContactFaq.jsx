import { Headphones } from 'lucide-react';
import LegalDocument from './LegalDocument';
import { RELATED, contactFaqSections } from './legalContent';

const ContactFaq = () => (
  <LegalDocument
    title="Contact & FAQs"
    subtitle="Customer service contacts and frequently asked questions for AMM Sports Arena."
    Icon={Headphones}
    sections={contactFaqSections}
    relatedLinks={RELATED.filter((l) => l.path !== '/contact')}
  />
);

export default ContactFaq;
