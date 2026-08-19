import React from 'react';

export const LinkedChildren = ({ children = [], onOpenAddChildModal, loading }) => {
  return (
    <div className="dash-card" style={{ marginBottom: '20px' }}>
      <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>
          <i className="fa-solid fa-children" style={{ color: '#7e22ce' }}></i> Linked Child Profiles
        </h3>
        <button
          className="dash-btn dash-btn-primary"
          style={{ background: '#7e22ce', fontSize: '12px', padding: '5px 14px' }}
          onClick={onOpenAddChildModal}
        >
          <i className="fa-solid fa-user-plus"></i> Add Child Profile
        </button>
      </div>

      <div id="parentChildrenListContainer">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: '#7e22ce' }}></i> Loading linked children...
          </div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
            <i className="fa-solid fa-child" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '8px' }}></i>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>No Child Profiles Linked Yet</h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b' }}>
              Link your child's student account to monitor session progress, attendance, and grades.
            </p>
            <button
              className="dash-btn dash-btn-primary"
              style={{ background: '#7e22ce', fontSize: '12px', padding: '6px 16px', display: 'inline-flex' }}
              onClick={onOpenAddChildModal}
            >
              <i className="fa-solid fa-user-plus"></i> Link First Child Profile
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '10px' }}>
            {children.map((c) => {
              const childName = c.name || (c.student ? c.student.name : 'Child Student');
              const childEmail = c.email || (c.student ? c.student.email : 'N/A');
              const subjects = Array.isArray(c.subjectsNeeded) ? c.subjectsNeeded.join(', ') : c.subjectsNeeded || 'General Academic';

              return (
                <div
                  key={c._id}
                  style={{
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#7e22ce',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {childName.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f2a4a' }}>{childName}</h4>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7e22ce' }}>
                        {c.grade || 'Student'} &bull; {c.school || 'Verified Student'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    <div><i className="fa-solid fa-envelope" style={{ color: '#7e22ce', marginRight: '6px' }}></i> {childEmail}</div>
                    {subjects && <div style={{ marginTop: '2px' }}><i className="fa-solid fa-book" style={{ color: '#7e22ce', marginRight: '6px' }}></i> {subjects}</div>}
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
