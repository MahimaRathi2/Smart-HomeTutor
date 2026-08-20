import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../services/studentApi';

export const ClassesTab = ({ onStartVideoCall }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getClassSchedule().then((res) => {
      if (res.success && Array.isArray(res.schedules)) {
        setSchedule(res.schedules);
      } else {
        setSchedule([]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
             Regular Class Schedule
          </h3>
          <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0284c7', fontWeight: '700', padding: '3px 10px', borderRadius: '12px' }}>
            {schedule.length} Enrolled Classes
          </span>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Subject & Tutor</th>
                <th>Frequency / Days</th>
                <th>Timing & Date</th>
                <th>Class Mode & Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ color: '#0284c7', marginRight: '8px' }}></i> Loading class schedule...
                  </td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                    <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '28px', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}></i>
                    No scheduled regular classes found. Book a tutor or contact your instructor to add class sessions.
                  </td>
                </tr>
              ) : (
                schedule.map((item) => {
                  const isOnline = !item.mode || item.mode.toLowerCase() === 'online';
                  const isCompleted = item.status === 'Completed' || item.status === 'Cancelled';
                  const formattedDate = new Date(item.date || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={item._id}>
                      <td>
                        <strong style={{ color: '#0f2a4a', fontSize: '14.5px' }}>{item.subject || 'Tuition Class'}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>
                          Educator: {item.tutor ? (item.tutor.name || 'Verified Tutor') : 'Verified Tutor'}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                        <div>{item.frequency || 'Weekly'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.days || 'Mon, Wed'}</div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#334155' }}>
                        <div style={{ fontWeight: '700' }}>{item.startTime || item.time || '05:00 PM'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{formattedDate}</div>
                      </td>
                      <td>
                        {isCompleted ? (
                          <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                            {item.status}
                          </span>
                        ) : isOnline ? (
                          <button
                            type="button"
                            className="dash-btn dash-btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', gap: '6px' }}
                            onClick={() => {
                              window.location.href = `/video-call/${item._id}`;
                            }}
                          >
                            <i className="fa-solid fa-video"></i> Join Class
                          </button>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-house-user"></i> Offline Class
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
