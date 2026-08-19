import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { AboutHero } from '../../components/about/AboutHero';
import { AboutStats } from '../../components/about/AboutStats';
import { AboutPillars } from '../../components/about/AboutPillars';
import { AboutCTA } from '../../components/about/AboutCTA';

export const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <Header activePage="about" />
      <main>
        <AboutHero />
        <AboutStats />
        <AboutPillars />
        <AboutCTA />
      </main>
      <Footer />
    </div>
  );
};
