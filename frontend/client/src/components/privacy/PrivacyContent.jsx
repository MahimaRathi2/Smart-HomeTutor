import React from 'react';

export const PrivacyContent = () => {
  return (
    <section className="container" style={{ padding: '60px 0 90px' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            1. Information We Collect
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Smart HomeTutor collects personal details necessary to connect students with home and online tutors. This includes your name, email address, phone number, location (GPS or pincode for tutor proximity matching), educational grade, subject requirements, and user role.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            2. How We Use Your Data
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Your information is used strictly to:
          </p>
          <ul style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, paddingLeft: '20px', marginTop: '8px' }}>
            <li>Facilitate personalized tutor search and home tuition matching within your area.</li>
            <li>Process secure payment transactions for class bookings via Razorpay.</li>
            <li>Deliver real-time WebSockets and Web Push notifications for scheduled classes and live video sessions.</li>
            <li>Maintain platform security and verify tutor identity documents.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            3. Data Security & Encryption
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            We employ industry-standard security protocols including HTTPS TLS encryption, bcrypt password hashing, and encrypted JWT authentication tokens. We do not sell or rent your personal information to third-party advertisers.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            4. Location & Cookie Policy
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Location permissions are requested only when searching for nearby home tutors or calculating GPS distances. Essential cookies are used to maintain your authenticated login session securely across page visits.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
            5. Contact Us Regarding Privacy
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            For questions or data deletion requests, please contact our Privacy Compliance team at{' '}
            <a href="mailto:privacy@smarthometutor.com" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              privacy@smarthometutor.com
            </a>{' '}
            or visit our{' '}
            <a href="/contact" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Contact Page
            </a>.
          </p>
        </div>

      </div>
    </section>
  );
};
