import React, { useState } from 'react';
import { TutorApplicationDetailModal } from '../modals/TutorApplicationDetailModal';

export const AdminTutorVerificationsTab = ({ verifications = [], onVerifyDoc }) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Filter items
  const filteredItems = verifications.filter((item) => {
    const status = item.registrationStatus || item.verificationStatus || 'Pending';
    
    // Status Filter
    if (selectedStatusTab === 'pending' && status !== 'Pending') return false;
    if (selectedStatusTab === 'approved' && status !== 'Approved') return false;
    if (selectedStatusTab === 'rejected' && status !== 'Rejected') return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (item.fullName || item.user?.name || '').toLowerCase();
      const email = (item.email || item.user?.email || '').toLowerCase();
      const phone = (item.mobile || item.phone || item.user?.phone || '').toLowerCase();
      const city = (item.city || '').toLowerCase();
      const subjects = Array.isArray(item.subjects) ? item.subjects.join(' ').toLowerCase() : (item.subjects || '').toLowerCase();

      return name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q) || subjects.includes(q);
    }

    return true;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved':
        return <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '16px', fontWeight: 700, fontSize: '11.5px' }}><i className="fa-solid fa-circle-check"></i> Approved</span>;
      case 'Rejected':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '3px 10px', borderRadius: '16px', fontWeight: 700, fontSize: '11.5px' }}><i className="fa-solid fa-circle-xmark"></i> Rejected</span>;
      default:
        return <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '3px 10px', borderRadius: '16px', fontWeight: 700, fontSize: '11.5px' }}><i className="fa-solid fa-clock"></i> Pending Review</span>;
    }
  };

  const handleApprove = async (id) => {
    if (onVerifyDoc) await onVerifyDoc(id, 'Approved');
    setSelectedApplication(null);
  };

  const handleReject = async (id) => {
    if (onVerifyDoc) await onVerifyDoc(id, 'Rejected');
    setSelectedApplication(null);
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-user-check" style={{ color: '#0284c7' }}></i> Tutor Applications & Governance Approval
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Review comprehensive 5-step tutor application profiles, verify documents, and manage approval decisions.
            </p>
          </div>

          {/* SEARCH INPUT */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }}></i>
            <input
              type="text"
              placeholder="Search applicant name, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* STATUS FILTER TABS */}
        <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'pending', label: 'Pending Review', icon: 'fa-clock' },
            { key: 'approved', label: 'Approved Tutors', icon: 'fa-circle-check' },
            { key: 'rejected', label: 'Rejected Applications', icon: 'fa-circle-xmark' },
            { key: 'all', label: 'All Applications', icon: 'fa-layer-group' },
          ].map((tab) => {
            const count = verifications.filter((item) => {
              const status = item.registrationStatus || item.verificationStatus || 'Pending';
              if (tab.key === 'pending') return status === 'Pending';
              if (tab.key === 'approved') return status === 'Approved';
              if (tab.key === 'rejected') return status === 'Rejected';
              return true;
            }).length;

            const isActive = selectedStatusTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatusTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  background: isActive ? '#e0f2fe' : '#ffffff',
                  color: isActive ? '#0369a1' : '#475569',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* APPLICATION CARDS LIST */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '50px 20px', fontSize: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '10px', display: 'block' }}></i>
            No tutor applications found matching the selected filter ({selectedStatusTab}).
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredItems.map((item) => {
              const name = item.fullName || item.user?.name || 'Tutor Applicant';
              const email = item.email || item.user?.email || 'N/A';
              const phone = item.mobile || item.phone || item.user?.phone || 'N/A';
              const status = item.registrationStatus || item.verificationStatus || 'Pending';
              const subjectsStr = Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subjects || 'General');

              return (
                <div
                  key={item._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {item.profileImage ? (
                        <img
                          src={item.profileImage}
                          alt={name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            color: '#ffffff',
                            fontWeight: '800',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{name}</h4>
                          {getStatusBadge(status)}
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                          <i className="fa-solid fa-envelope" style={{ color: '#0284c7' }}></i> {email} &bull; <i className="fa-solid fa-phone" style={{ color: '#0284c7' }}></i> {phone} &bull; <i className="fa-solid fa-location-dot" style={{ color: '#0284c7' }}></i> {item.city || 'N/A'}, {item.state || ''}
                        </p>
                        <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0 0 0', fontWeight: '600' }}>
                          Subjects: <span style={{ color: '#0284c7' }}>{subjectsStr}</span> &bull; Mode: <span>{item.mode || item.teachingMode || 'Both'}</span> &bull; Exp: <span>{item.totalExperience || item.experience || '0'} Yrs</span>
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedApplication(item)}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(2,132,199,0.2)',
                        }}
                      >
                        <i className="fa-solid fa-eye"></i> View Full Application
                      </button>

                      {status !== 'Approved' && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="fa-solid fa-check"></i> Approve
                        </button>
                      )}

                      {status !== 'Rejected' && (
                        <button
                          onClick={() => handleReject(item._id)}
                          style={{
                            background: '#ffffff',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="fa-solid fa-xmark"></i> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL APPLICATION DETAIL MODAL */}
      {selectedApplication && (
        <TutorApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
