import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { ContactMap } from '../../components/contact/ContactMap';
import { ContactDetails } from '../../components/contact/ContactDetails';
import { ContactForm } from '../../components/contact/ContactForm';
import { OtherBranches } from '../../components/contact/OtherBranches';
import { ContactFAQ } from '../../components/contact/ContactFAQ';

export const Contact = () => {
  useEffect(() => {
    // Scroll reveal animation for contact page components
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ct-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.ct-reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="ct-page-root">
      <Header activePage="contact" />

      {/* HERO BANNER */}
      <section className="ct-hero-section ct-reveal-on-scroll">
        <div className="container">
          <span className="ct-hero-badge">HELP & SUPPORT CENTER</span>
          <h1 className="ct-hero-title">Contact Us</h1>
          <p className="ct-hero-subtitle">
            We are here to help you find the perfect home or online tutor. Whether you are a student, parent, or educator, feel free to reach out to us anytime.
          </p>
        </div>
      </section>

      {/* MAIN TWO-COLUMN SECTION */}
      <main className="ct-main-content">
        <div className="container">
          <div className="ct-two-col-grid ct-reveal-on-scroll">
            {/* LEFT COLUMN: ONE COMBINED DETAILS + MAP CARD */}
            <div className="ct-left-combined-card">
              <ContactDetails />
              <div className="ct-card-divider"></div>
              <ContactMap />
            </div>

            {/* RIGHT COLUMN: CONTACT FORM */}
            <div className="ct-right-col">
              <ContactForm />
            </div>
          </div>

          {/* OTHER BRANCHES SECTION */}
          <OtherBranches />

          {/* INTERACTIVE FAQ ACCORDION SECTION */}
          <ContactFAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
};
