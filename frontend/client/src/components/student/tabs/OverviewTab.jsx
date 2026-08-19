import React, { useState } from 'react';
import { AnnouncementsList } from '../../common/AnnouncementsList';

export const OverviewTab = ({
  stats,
  upcomingClasses,
  referralCode,
  referralEarnings,
  onOpenAIRecommendations,
  onOpenReviewModal,
  onStartVideoCall,
}) => {
  const [copied, setCopied] = useState(false);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statItems = [
    { label: 'Upcoming Lessons', value: stats ? stats.upcomingClassesCount || 0 : 0, sub: 'Active bookings', icon: 'fa-calendar-check', bg: '#e0f2fe', color: '#0284c7' },
    { label: 'Learning Hours', value: stats ? `${stats.completedClassesCount || 0} hrs` : '0 hrs', sub: 'Active learning log', icon: 'fa-user-clock', bg: '#dcfce7', color: '#15803d' },
    { label: 'Active Tutors', value: stats ? `${stats.activeTutorsCount || 0} Tutors` : '0 Tutors', sub: 'Verified instructors', icon: 'fa-graduation-cap', bg: '#fef3c7', color: '#b45309' },
    { label: 'Attendance Rate', value: stats ? `${stats.attendancePercentage || 100}%` : '100%', sub: 'Overall attendance', icon: 'fa-chart-line', bg: '#f3e8ff', color: '#6b21a8' },
  ];

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      {/* STATS GRID */}
      <div className="stats-grid">
        {statItems.map((st, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-info">
              <span className="stat-label">{st.label}</span>
              <div className="stat-value">{st.value}</div>
              <span className="stat-sub"><i className={`fa-solid ${st.icon}`}></i> {st.sub}</span>
            </div>
            <div className="stat-icon" style={{ background: st.bg, color: st.color }}>
              <i className={`fa-solid ${st.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* CONTENT GRID */}
      <div className="dash-content-grid">
        <div>
          {/* PLATFORM ANNOUNCEMENTS & NOTIFICATIONS */}
          <div className="dash-card" style={{ marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
            <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f2a4a', fontWeight: '800' }}>
                <i className="fa-solid fa-bullhorn" style={{ color: '#d97706', marginRight: '8px' }}></i> Platform Announcements & System Notices
              </h3>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                Live Updates
              </span>
            </div>

            <AnnouncementsList role="student" />
          </div>

          {/* UPCOMING CLASSES */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><i className="fa-solid fa-video"></i> Upcoming Live Classes</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingClasses && upcomingClasses.length > 0 ? (
                upcomingClasses.map((cls) => (
                  <div key={cls._id} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#0f2a4a' }}>{cls.subject || 'Live Class Session'}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Educator: {cls.tutor ? cls.tutor.name || 'Tutor' : 'Tutor'} &bull; {cls.time || 'Scheduled Time'}
                      </p>
                    </div>
                    <button className="dash-btn dash-btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={onStartVideoCall}>
                      <i className="fa-solid fa-video"></i> Join Class
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlignment: 'center', color: '#64748b', fontSize: '14px' }}>
                  No upcoming live classes scheduled today. Book a tutor to schedule your first session!
                </div>
              )}
            </div>
          </div>

          {/* SYLLABUS TRACKING */}
          <div className="dash-card" style={{ marginTop: '16px' }}>
            <div className="dash-card-header">
              <h3><i className="fa-solid fa-bars-progress"></i> Learning Syllabus Completion Progress</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  <span>Overall Curriculum Mastery</span>
                  <span>{stats ? stats.progressPercentage || 0 : 0}%</span>
                </div>
                <div style={{ height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats ? stats.progressPercentage || 0 : 0}%`, background: 'linear-gradient(90deg, #0284c7, #10b981)', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* AI TUTOR MATCHING */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3><i className="fa-solid fa-robot" style={{ color: '#0284c7' }}></i> AI Tutor Recommender</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Our AI algorithm matched top verified tutors based on your learning goals.
            </p>
            <button className="dash-btn dash-btn-accent" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpenAIRecommendations}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> View AI Recommendations
            </button>
          </div>

          {/* REVIEWS CARD */}
          <div className="dash-card" style={{ marginTop: '16px' }}>
            <div className="dash-card-header">
              <h3><i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Submit Tutor Review</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Have you completed a class recently? Share your feedback to help fellow students.
            </p>
            <button className="dash-btn dash-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpenReviewModal}>
              <i className="fa-solid fa-comment-medical"></i> Rate & Review Tutor
            </button>
          </div>

          {/* REFERRAL PROGRAM CARD */}
          <div className="dash-card" style={{ marginTop: '16px' }}>
            <div className="dash-card-header">
              <h3><i className="fa-solid fa-gift" style={{ color: '#10b981' }}></i> Referral Program & Rewards</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Share your referral code with friends. Earn <strong>₹100</strong> in your wallet when they sign up! They get <strong>₹50</strong> welcome bonus.
            </p>

            <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', border: '1px solid #cbd5e1' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Your Referral Code</span>
                <strong style={{ fontSize: '18px', color: '#0284c7', letterSpacing: '1px' }}>{referralCode || 'SMART100'}</strong>
              </div>
              <button type="button" className="dash-btn dash-btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={copyReferralCode}>
                <i className="fa-solid fa-copy"></i> {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: '#e0f2fe', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, display: 'block' }}>Total Earnings</span>
                <strong style={{ fontSize: '16px', color: '#0284c7' }}>₹{referralEarnings || 0}.00</strong>
              </div>
              <div style={{ flex: 1, background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, display: 'block' }}>Friends Referred</span>
                <strong style={{ fontSize: '16px', color: '#16a34a' }}>0 Friends</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
