import React, { useState } from 'react';
import { CreateScheduleModal } from '../../common/CreateScheduleModal';
import { tutorApi } from '../../../services/tutorApi';

export const TutorSessionsTab = ({ sessions = [], onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestCert = async (item) => {
    const studentId = item.student?._id || item.student;
    const courseName = item.subject || 'Tuition Course';

    if (!studentId) {
      alert('Unable to identify student ID for this session.');
      return;
    }

    if (!window.confirm(`Submit a completion certificate request to Admin for ${item.student?.name || 'Student'} (${courseName})?`)) return;

    try {
      const res = await tutorApi.requestCertificate({
        studentId,
        courseName,
        attendancePercentage: 100,
        completedClasses: 12,
        tutorRemarks: 'Course completed with distinction.',
      });

      if (res.success) {
        alert(res.message || 'Certificate request submitted for Admin approval!');
        if (onRefresh) onRefresh();
      } else {
        alert(res.message || 'Failed to submit certificate request.');
      }
    } catch (err) {
      console.error('Request cert error:', err);
      alert('Error submitting certificate request.');
    }
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-chalkboard-user" style={{ color: '#0f2a4a' }}></i> Teaching Sessions & Class Schedule
          </h3>
          <button
            type="button"
            className="dash-btn dash-btn-accent"
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <i className="fa-solid fa-calendar-plus" style={{ marginRight: '6px' }}></i> Schedule Class
          </button>
        </div>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject & Grade</th>
                <th>Schedule & Frequency</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    No student teaching sessions found. Click "Schedule Class" above to create one.
                  </td>
                </tr>
              ) : (
                sessions.map((item, idx) => {
                  const isOnline = !item.mode || item.mode.toLowerCase() === 'online';
                  return (
                    <tr key={item._id || idx}>
                      <td style={{ fontWeight: '700', color: '#0f2a4a' }}>
                        {item.student?.name || item.studentName || 'Student Enrolment'}
                      </td>
                      <td>{item.subject || 'Tuition'}</td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{item.startTime || item.time || 'Mon, Wed (05:00 PM)'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.frequency || 'Weekly'} ({item.days || 'Mon, Wed'})</div>
                      </td>
                      <td>
                        {isOnline ? (
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>
                            Online (WebRTC)
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>
                            Offline
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isOnline && (
                            <a href={`/video-call/${item._id}`} className="dash-btn dash-btn-primary" style={{ padding: '5px 10px', fontSize: '11.5px' }}>
                              <i className="fa-solid fa-video"></i> Start Class
                            </a>
                          )}
                          <button
                            type="button"
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '5px 10px', fontSize: '11.5px', borderColor: '#0284c7', color: '#0284c7' }}
                            onClick={() => handleRequestCert(item)}
                          >
                            <i className="fa-solid fa-award"></i> Request Cert
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
        userRole="tutor"
      />
    </div>
  );
};
