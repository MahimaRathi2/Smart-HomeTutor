import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../services/studentApi';

export const ClassesTab = ({ onStartVideoCall }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getClassSchedule().then((res) => {
      const list = (res.schedules && res.schedules.length > 0) ? res.schedules : (res.acceptedBookings || []);
      if (res.success && (res.schedules || res.acceptedBookings)) {
        setSchedule(list);
      } else {
        setSchedule([]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-calendar-days"></i> Regular Class Schedule</h3>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Subject & Tutor</th>
                <th>Frequency / Days</th>
                <th>Timing & Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading class schedule...
                  </td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    No scheduled regular classes found. Book a tutor demo session to start your learning schedule.
                  </td>
                </tr>
              ) : (
                schedule.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.subject || 'Tuition Class'}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Educator: {item.tutor ? item.tutor.name || 'Tutor' : 'Tutor'}
                      </div>
                    </td>
                    <td>{item.frequency || 'Weekly'}</td>
                    <td>{item.time || '05:00 PM'} ({new Date(item.date || Date.now()).toLocaleDateString()})</td>
                    <td>
                      <button className="dash-btn dash-btn-primary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={onStartVideoCall}>
                        <i className="fa-solid fa-video"></i> Join Class
                      </button>
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
