import React from 'react';
import { StarIcon, MapPinIcon, MonitorIcon, CircleCheckIcon, CircleXmarkIcon } from '../common/ReactIcons';

export const TutorProfileHeader = ({ tutor = {} }) => {
  const tutorName = tutor.fullName || (tutor.user ? tutor.user.name : 'Verified Educator');
  const rating = tutor.rating || 5.0;
  const totalReviews = tutor.totalReviews || 0;
  const isAvailable = tutor.available !== false;

  return (
    <div className="tutor-hero-header">
      <div className="tutor-hero-left">
        <div className="tutor-avatar-circle">
          {tutorName.substring(0, 1).toUpperCase()}
        </div>
        <div className="tutor-hero-details">
          <h1 className="tutor-profile-title">{tutorName}</h1>
          <div className="tutor-hero-tags">
            <span className="tutor-tag-rating">
              <StarIcon size={14} color="#f59e0b" fill="#f59e0b" />
              {rating} Rating ({totalReviews} Reviews)
            </span>
            <span className="tutor-tag-pill">
              <MapPinIcon size={14} color="#ef4444" />
              {tutor.location || tutor.city || 'Verified Location'}
            </span>
            <span className="tutor-tag-pill">
              <MonitorIcon size={14} color="#0284c7" />
              {tutor.mode || 'Online & Home Tuition'}
            </span>
          </div>
        </div>
      </div>

      <div className="tutor-hero-right">
        <div className="tutor-fee-card">
          <span className="tutor-fee-amount">₹{tutor.fee || 0}</span>
          <span className="tutor-fee-label">/ hr</span>
        </div>
        <span className={`tutor-status-badge ${isAvailable ? 'available' : 'busy'}`}>
          {isAvailable ? <CircleCheckIcon size={14} color="#166534" /> : <CircleXmarkIcon size={14} color="#991b1b" />}
          {isAvailable ? 'Available for Sessions' : 'Busy'}
        </span>
      </div>
    </div>
  );
};
