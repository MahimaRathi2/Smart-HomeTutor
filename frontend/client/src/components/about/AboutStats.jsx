import React from 'react';

export const AboutStats = () => {
  return (
    <section className="container" style={{ marginTop: '-36px', position: 'relative', zIndex: 10 }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px 32px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', textAlign: 'center' }}>
        <div>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>10,000+</h3>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Verified Tutors</p>
        </div>
        <div>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>25,000+</h3>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Happy Students</p>
        </div>
        <div>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>98.4%</h3>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Grade Improvement</p>
        </div>
        <div>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>100%</h3>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Verified & Safe</p>
        </div>
      </div>
    </section>
  );
};
