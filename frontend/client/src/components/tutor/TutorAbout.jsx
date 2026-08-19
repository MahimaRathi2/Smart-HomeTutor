import React from 'react';

export const TutorAbout = ({ tutor = {}, onBookClick }) => {
  const lat = tutor.coordinates && tutor.coordinates.lat ? tutor.coordinates.lat : 28.6139;
  const lng = tutor.coordinates && tutor.coordinates.lng ? tutor.coordinates.lng : 77.2090;
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const subjectsStr = Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects || 'General';
  const classesStr = Array.isArray(tutor.classes) ? tutor.classes.join(', ') : tutor.classes || 'All Grades';

  return (
    <div>
      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Qualification:</strong> {tutor.qualification || tutor.highestQualification || 'N/A'}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Experience:</strong> {tutor.experience || tutor.totalExperience || 0} Years
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Subjects:</strong> {subjectsStr}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Classes:</strong> {classesStr}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Location / City:</strong> {tutor.location || tutor.city || 'N/A'}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Service Radius:</strong> {tutor.serviceAreaRadius || 10} km
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Home Visits:</strong> {tutor.homeVisitsEnabled ? 'Available for Home Tuition & Online' : 'Online Only'}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Teaching Mode:</strong> {tutor.mode || 'Online / Offline'}
      </p>

      <p style={{ margin: '8px 0', fontSize: '15px', color: '#1e293b' }}>
        <strong>Fee:</strong> ₹{tutor.fee || 0}/hr
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#d97706', margin: '12px 0' }}>
        <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
        <span>{tutor.rating || 5.0} Rating</span>
        <span style={{ color: '#64748b', fontWeight: 600, fontSize: '13px' }}>
          ({tutor.totalReviews || 0} Reviews)
        </span>
      </div>

      <div style={{ margin: '16px 0' }}>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-btn dash-btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', textDecoration: 'none', color: 'var(--primary, #213547)' }}
        >
          <i className="fa-solid fa-map-location-dot"></i> View Location on Google Maps
        </a>
      </div>

      <p style={{ marginTop: '20px', marginBottom: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--primary, #213547)' }}>
        About:
      </p>
      <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
        {tutor.about || 'No detailed biography provided.'}
      </p>

      <button
        type="button"
        id="bookTutorBtn"
        className="dash-btn dash-btn-primary"
        style={{ marginTop: '20px', fontSize: '14px', padding: '10px 24px' }}
        onClick={onBookClick}
      >
        <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i> Book Demo Class
      </button>
    </div>
  );
};
