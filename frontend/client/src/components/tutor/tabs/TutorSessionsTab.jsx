import React from 'react';

export const TutorSessionsTab = ({ sessions = [] }) => {
  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-chalkboard-user"></i> Teaching Sessions & Attendance Tracker</h3>
        </div>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject & Grade</th>
                <th>Schedule</th>
                <th>Attendance Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    No accepted student teaching sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td style={{ fontWeight: '700', color: '#0f2a4a' }}>
                      {item.student?.name || item.studentName || 'Student Enrolment'}
                    </td>
                    <td>{item.subject || 'Tuition'} ({item.grade || item.class || 'All Grades'})</td>
                    <td>{item.schedule || item.time || 'Mon, Wed, Fri (6:00 PM)'}</td>
                    <td>
                      <span className={`status-pill ${item.attendanceStatus === 'Present' || item.status === 'Accepted' ? 'status-confirmed' : 'status-pending'}`}>
                        {item.attendanceStatus || 'Active Session'}
                      </span>
                    </td>
                    <td>
                      <a href={`/video-call/${item._id}`} className="dash-btn dash-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <i className="fa-solid fa-video"></i> Start Class
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
