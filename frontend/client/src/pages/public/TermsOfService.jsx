import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { TermsHero } from '../../components/terms/TermsHero';
import { TermsContent } from '../../components/terms/TermsContent';

export const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-of-service-page">
      <Header activePage="terms" />
      <main>
        <TermsHero />
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
};
