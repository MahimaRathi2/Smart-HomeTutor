import React, { useEffect } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { TutorApplicationForm } from '../../components/tutor/TutorApplicationForm';
import { TutorTestimonials } from '../../components/tutor/TutorTestimonials';

export const BecomeTutorPage = () => {
  useEffect(() => {
    // Scroll reveal observer for tutor page
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('tr-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.tr-reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const stats = [
    { icon: 'fa-user-graduate', num: '20K+', label: 'Students' },
    { icon: 'fa-chalkboard-user', num: '5000+', label: 'Expert Tutors' },
    { icon: 'fa-book-open', num: '100+', label: 'Subjects' },
    { icon: 'fa-star', num: '4.9', label: 'Average Rating' },
  ];

  const benefits = [
    {
      icon: 'fa-wallet',
      title: 'Competitive Earnings',
      desc: 'Set your own fees and earn based on your experience and expertise.',
    },
    {
      icon: 'fa-clock',
      title: 'Flexible Schedule',
      desc: "Teach whenever you're available without fixed working hours.",
    },
    {
      icon: 'fa-laptop',
      title: 'Online & Offline',
      desc: 'Conduct classes online or meet students in person.',
    },
    {
      icon: 'fa-user-check',
      title: 'Verified Students',
      desc: 'Connect only with genuine student inquiries.',
    },
    {
      icon: 'fa-headset',
      title: 'Dedicated Support',
      desc: 'Our support team is always available to assist you.',
    },
    {
      icon: 'fa-chart-line',
      title: 'Career Growth',
      desc: 'Build your profile, gain reviews, and grow your tutoring career.',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: 'fa-file-circle-check',
      title: 'Apply Online',
      desc: 'Fill out the application form with your personal and teaching details.',
    },
    {
      num: '02',
      icon: 'fa-user-check',
      title: 'Profile Verification',
      desc: 'Our team reviews your qualifications and teaching experience.',
    },
    {
      num: '03',
      icon: 'fa-comments',
      title: 'Demo Session',
      desc: 'Attend a short interaction or demo class if required.',
    },
    {
      num: '04',
      icon: 'fa-graduation-cap',
      title: 'Start Teaching',
      desc: 'Receive student requests and begin teaching immediately.',
    },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ top:0 , behavior: 'smooth' });
    }
  };

  return (
    <div className="tr-page-root">
      <Header activePage="tutor" />

      {/* HERO SECTION */}
      <section className="tr-hero tr-reveal-on-scroll">
        <div className="container tr-hero-container">
          <div className="tr-hero-text">
            <span className="tr-badge">Join India's Trusted Tutor Community</span>
            <h1>
              Inspire Students.<br />
              Teach with Confidence.
            </h1>
            <p>
              Join Smart HomeTutor and connect with thousands of students looking for expert tutors.
              Teach online or offline while earning on your own schedule.
            </p>
            <div className="tr-hero-buttons">
              <button
                type="button"
                className="tr-primary-btn"
                onClick={() => scrollToSection('application')}
              >
                Apply Now
              </button>
              <button
                type="button"
                className="tr-secondary-btn"
                onClick={() => scrollToSection('benefits')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="tr-stats tr-reveal-on-scroll">
        <div className="container">
          <div className="tr-stats-grid">
            {stats.map((st, idx) => (
              <div key={idx} className="tr-stat-card">
                <i className={`fa-solid ${st.icon}`}></i>
                <h2>{st.num}</h2>
                <p>{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TEACH WITH US SECTION */}
      <section id="benefits" className="tr-benefits tr-reveal-on-scroll">
        <div className="container">
          <div className="tr-section-title text-center">
            <h2>Why Teach With Smart HomeTutor?</h2>
            <p>
              We help passionate educators grow their careers while making quality education accessible to every student.
            </p>
          </div>

          <div className="tr-benefit-grid">
            {benefits.map((b, idx) => (
              <div key={idx} className="tr-benefit-card">
                <i className={`fa-solid ${b.icon}`}></i>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS STEPS SECTION */}
      <section className="tr-process tr-reveal-on-scroll">
        <div className="container">
          <div className="tr-section-title text-center">
            <h2>Become a Tutor in 4 Easy Steps</h2>
            <p>Our onboarding process is quick, simple and completely free.</p>
          </div>

          <div className="tr-process-grid">
            {steps.map((s, idx) => (
              <div key={idx} className="tr-step-card">
                <div className="tr-step-number">{s.num}</div>
                <i className={`fa-solid ${s.icon}`}></i>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM SECTION */}
      <section id="application" className="tr-application tr-reveal-on-scroll">
        <div className="container">
          <div className="tr-section-title text-center">
            <h2>Teacher Registration Portal</h2>
            <p>Complete the 5-step registration form below to join our network of verified home & online tutors.</p>
          </div>

          <TutorApplicationForm />
        </div>
      </section>

      {/* EDUCATOR TESTIMONIALS MARQUEE */}
      <div className="tr-reveal-on-scroll">
        <TutorTestimonials />
      </div>

      <Footer />
    </div>
  );
};
