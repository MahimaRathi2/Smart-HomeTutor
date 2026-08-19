import React from 'react';

export const PrivacyHero = () => {
  return (
    <section className="hero" style={{ background: 'var(--primary)', color: '#ffffff', padding: '60px 20px 70px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <span className="tag" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block' }}>
          PRIVACY & DATA PROTECTION
        </span>
        <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff', marginTop: '14px', textTransform: 'uppercase' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--primary-light)', fontSize: '16px', marginTop: '10px' }}>
          Effective Date: August 13, 2026. Learn how Smart HomeTutor protects your personal information, session data, and location details.
        </p>
      </div>
    </section>
  );
};
