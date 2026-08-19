import React, { useState, useEffect } from 'react';

export const ParentCertificatesModal = ({ isOpen, onClose }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCertificates();
    }
  }, [isOpen]);

  const fetchCertificates = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/parent/child-certificates');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.certificates)) {
        setCertificates(data.certificates);
      } else {
        setErrorMsg(data.message || 'Failed to load child certificates.');
      }
    } catch (err) {
      console.error('Fetch Child Certificates Error:', err);
      setErrorMsg('Network error. Unable to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-award" style={{ color: '#7e22ce' }}></i> Child Academic Certificates
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#7e22ce', marginBottom: '10px' }}></i>
            <p style={{ margin: 0 }}>Loading child certificates...</p>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && certificates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <i className="fa-solid fa-award" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }}></i>
            <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '16px', fontWeight: 700 }}>No Certificates Earned Yet</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Academic excellence & completion certificates earned by your linked children will be displayed here.
            </p>
          </div>
        )}

        {!loading && certificates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {certificates.map((cert) => {
              const issueDate = cert.issueDate
                ? new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Recent';

              return (
                <div key={cert._id} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      <i className="fa-solid fa-certificate"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f2a4a' }}>
                        {cert.title || 'Course Completion Certificate'}
                      </h4>
                      <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#475569' }}>
                        Awarded to: <strong>{cert.student ? cert.student.name : 'Child'}</strong> &bull; Educator: {cert.tutor ? cert.tutor.name : 'Verified Tutor'}
                      </p>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        Certificate ID: <code style={{ background: '#e9d5ff', padding: '2px 6px', borderRadius: '4px', color: '#6b21a8' }}>{cert.certificateId || cert._id}</code> &bull; Issued: {issueDate}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/api/certificates/${cert.certificateId || cert._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn dash-btn-primary"
                    style={{ background: '#7e22ce', fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap' }}
                  >
                    <i className="fa-solid fa-file-pdf"></i> View & Verify
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button type="button" onClick={onClose} className="dash-btn dash-btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
