import React from 'react';

export const AboutHero = () => {
  return (
    <section className="hero" style={{ background: 'var(--primary)', color: '#ffffff', padding: '70px 20px 80px', textAlign: 'center', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="tag" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}>
          ABOUT SMART HOMETUTOR
        </span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#ffffff', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          Empowering Students & Inspiring Tutors
        </h1>
        <p style={{ color: 'var(--primary-light)', fontSize: '17px', lineHeight: 1.8, marginTop: '14px' }}>
          Smart HomeTutor is India’s premier tuition platform connecting verified, background-checked expert home and online tutors with students for personalized, result-driven learning.
        </p>
      </div>
    </section>
  );
};
