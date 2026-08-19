import React from 'react';

export const TermsHero = () => {
  return (
    <section className="hero" style={{ background: 'var(--primary)', color: '#ffffff', padding: '60px 20px 70px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <span className="tag" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}>
          PLATFORM USER AGREEMENT
        </span>
        <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff', marginTop: '14px', textTransform: 'uppercase' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--primary-light)', fontSize: '16px', marginTop: '10px' }}>
          Effective Date: August 13, 2026. Please read the rules governing tutoring sessions, payments, and platform usage.
        </p>
      </div>
    </section>
  );
};
