import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../services/studentApi';

export const CertificatesModal = ({ isOpen, onClose }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      studentApi.getCertificates().then((res) => {
        if (res.success && res.certificates) {
          setCertificates(res.certificates);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="tr-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="tr-modal-card" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '28px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer' }}
        >
          &times;
        </button>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-award" style={{ color: '#0284c7' }}></i> Download Course Certificates
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Official learning completion certificates issued by your tutors.
        </p>

        {loading ? (
          <div style={{ padding: '30px', textAlignment: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <i className="fa-solid fa-certificate" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No Certificates Issued Yet</p>
            <small style={{ color: '#94a3b8' }}>Complete your course modules to earn official certificates from your tutors.</small>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {certificates.map((cert) => (
              <div key={cert._id} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#0f2a4a' }}>{cert.courseName || cert.title || 'Course Certificate'}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Tutor: {cert.tutor ? cert.tutor.name || 'Educator' : 'Smart HomeTutor'} &bull; Issued {new Date(cert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/api/student/certificates/download/${cert._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-btn dash-btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}
                >
                  <i className="fa-solid fa-download"></i> PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
