import React from 'react';

export const AboutPillars = () => {
  const pillars = [
    {
      icon: 'fa-user-shield',
      title: '100% Verified Tutors',
      description: 'Every tutor undergoes strict identity verification, academic document audits, and safety checks before conducting classes.',
    },
    {
      icon: 'fa-bullseye',
      title: 'Tailored Learning Plans',
      description: 'Customized teaching methods tailored to each student’s speed, learning style, and specific board curriculum (CBSE, ICSE, IB, State).',
    },
    {
      icon: 'fa-chart-line',
      title: 'Real-Time Progress Tracking',
      description: 'Parents and students can monitor attendance, test performance, and teacher notes in real-time through dedicated dashboards.',
    },
  ];

  return (
    <section className="container" style={{ padding: '70px 0' }}>
      <div className="section-title" style={{ textAlign: 'center' }}>
        <span className="section-tag" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '12px' }}>
          OUR CORE PILLARS
        </span>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginTop: '8px' }}>
          Why Families Trust Smart HomeTutor
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px', maxWidth: '650px', marginInline: 'auto' }}>
          We are dedicated to building a safe, transparent, and high-impact educational ecosystem.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', marginTop: '48px' }}>
        {pillars.map((pillar, idx) => (
          <div key={idx} style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 28px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              <i className={`fa-solid ${pillar.icon}`}></i>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px' }}>{pillar.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
