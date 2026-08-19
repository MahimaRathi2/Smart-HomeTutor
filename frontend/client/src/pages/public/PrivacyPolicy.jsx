import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { PrivacyHero } from '../../components/privacy/PrivacyHero';
import { PrivacyContent } from '../../components/privacy/PrivacyContent';

export const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-page">
      <Header activePage="privacy" />
      <main>
        <PrivacyHero />
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
};
