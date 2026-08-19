import React from 'react';

export const AdminTutorVerificationsTab = ({ verifications = [], onVerifyDoc }) => {
  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-id-card"></i> Tutor Background Verification Queue</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Review identity documents, educational diplomas, and teaching certifications before granting verified tutor status.
        </p>

        {verifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '14px' }}>
           All tutor background verification applications have been reviewed!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {verifications.map((item) => {
              const name = item.fullName || item.user?.name || 'Tutor Applicant';
              const email = item.email || item.user?.email || 'N/A';
              const phone = item.mobile || item.phone || item.user?.phone || 'N/A';

              return (
                <div key={item._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f2a4a' }}>{name}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                        Email: {email} &bull; Mobile: {phone} &bull; City: {item.city || 'N/A'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="dash-btn dash-btn-primary"
                        style={{ background: '#16a34a', padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => onVerifyDoc(item._id, 'Approved')}
                      >
                        <i className="fa-solid fa-check"></i> Approve Verification
                      </button>
                      <button
                        className="dash-btn dash-btn-outline"
                        style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => onVerifyDoc(item._id, 'Rejected')}
                      >
                        <i className="fa-solid fa-xmark"></i> Reject Application
                      </button>
                    </div>
                  </div>

                  {/* DOCUMENTS GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                    {item.profilePhotoUrl && (
                      <a href={item.profilePhotoUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-image"></i> Profile Photo
                      </a>
                    )}
                    {item.qualificationDocUrl && (
                      <a href={item.qualificationDocUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-file-pdf"></i> Degree Certificate
                      </a>
                    )}
                    {item.idProofDocUrl && (
                      <a href={item.idProofDocUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-id-badge"></i> Govt ID Proof
                      </a>
                    )}
                    {item.experienceDocUrl && (
                      <a href={item.experienceDocUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-briefcase"></i> Experience Doc
                      </a>
                    )}
                    {item.resumeDocUrl && (
                      <a href={item.resumeDocUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-file-lines"></i> Resume / CV
                      </a>
                    )}
                    {item.addressProofDocUrl && (
                      <a href={item.addressProofDocUrl} target="_blank" rel="noreferrer" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}>
                        <i className="fa-solid fa-house"></i> Address Proof
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
