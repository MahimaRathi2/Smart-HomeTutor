import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Hero } from '../../components/home/Hero';
import { HowItWorks } from '../../components/home/HowItWorks';
import { FeaturedTutors } from '../../components/home/FeaturedTutors';
import { Testimonials } from '../../components/home/Testimonials';
import { LatestBlogs } from '../../components/home/LatestBlogs';
import { FAQ } from '../../components/home/FAQ';
import { SocketCallListener } from '../../components/home/SocketCallListener';
import { ContactDetails } from '../../components/contact/ContactDetails';
import { ContactMap } from '../../components/contact/ContactMap';
import { ContactForm } from '../../components/contact/ContactForm';

export const HomePage = () => {
  useEffect(() => {
    // Intersection Observer for scroll reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    elementsToReveal.forEach((el) => observer.observe(el));

    return () => {
      elementsToReveal.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="home-page-root">
      <Header activePage="home" />

      <main>
        <Hero />

        <div className="reveal-on-scroll">
          <HowItWorks />
        </div>

        <div className="reveal-on-scroll">
          <FeaturedTutors />
        </div>

        <div className="reveal-on-scroll">
          <Testimonials />
        </div>

        <div className="reveal-on-scroll">
          <LatestBlogs />
        </div>

        {/* CONTACT DETAILS & FORM SECTION BEFORE FAQ */}
        <div className="reveal-on-scroll">
          <section className="ct-main-content" style={{ padding: '60px 0 20px 0' }}>
            <div className="container">
              <div className="section-title" style={{ marginBottom: '40px' }}>
                <span className="section-tag">CONTACT</span>
                <h2>Want to get in touch?</h2>
                <p>Your questions matter to us. Reach out and let's find the right solution for you. </p>
              </div>
              <div className="ct-two-col-grid">
                <div className="ct-left-combined-card">
                  <ContactDetails />
                  <div className="ct-card-divider"></div>
                  <ContactMap />
                </div>
                <div className="ct-right-col">
                  <ContactForm />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="reveal-on-scroll">
          <FAQ />
        </div>
      </main>

      <Footer />
      <SocketCallListener />
    </div>
  );
};
