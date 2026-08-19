import React from 'react';

export const TermsContent = () => {
  return (
    <section className="container" style={{ padding: '60px 0 90px' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            1. Acceptable Platform Use
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Smart HomeTutor connects students, parents, and qualified tutors. Users must provide accurate profile details during signup and maintain respectful professional conduct during all online and home tuition sessions.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            2. Tutor Responsibilities & Document Verification
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Tutors registered on Smart HomeTutor warrant that all academic degrees, certificates, and ID proofs submitted are genuine. Tutors agree to adhere to agreed schedules and maintain high teaching standards.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            3. Bookings, Payments & Refund Rules
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            All class bookings and demo payments are securely processed through Razorpay. Wallet credits and refunds are managed in accordance with our transparent cancellation terms outlined during booking confirmation.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            4. Code of Conduct & Safety
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Harassment, inappropriate behavior, or circumvention of platform safety controls will result in immediate account suspension and referral to authorities where applicable.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            5. Contact & Support
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            If you have questions regarding these terms, contact legal support at{' '}
            <a href="mailto:legal@smarthometutor.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              legal@smarthometutor.com
            </a>.
          </p>
        </div>

      </div>
    </section>
  );
};
