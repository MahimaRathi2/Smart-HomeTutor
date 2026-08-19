import React, { useState, useEffect } from 'react';
import '../../styles/tutor-dashboard.css';
import { tutorApi } from '../../services/tutorApi';
import { TutorSidebar } from '../../components/tutor/TutorSidebar';
import { TutorHeaderBar } from '../../components/tutor/TutorHeaderBar';
import { TutorOverviewTab } from '../../components/tutor/tabs/TutorOverviewTab';
import { TutorSessionsTab } from '../../components/tutor/tabs/TutorSessionsTab';
import { TutorRequestsTab } from '../../components/tutor/tabs/TutorRequestsTab';
import { TutorHomeworkTab } from '../../components/tutor/tabs/TutorHomeworkTab';
import { TutorChatTab } from '../../components/tutor/tabs/TutorChatTab';
import { TutorRatesTab } from '../../components/tutor/tabs/TutorRatesTab';
import { PayoutModal } from '../../components/tutor/modals/PayoutModal';

import { NotificationsTab } from '../../components/common/NotificationsTab';

export const TutorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tutorUser, setTutorUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadNotifications(data.count || 0);
      }
    } catch (err) {
      console.error('Fetch tutor unread count error:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      fetchUnreadNotifications();
      // 1. Load Profile
      const profRes = await tutorApi.getTutorProfile();
      if (profRes.success && profRes.tutorProfile) {
        setTutorProfile(profRes.tutorProfile);
        if (profRes.tutorProfile.user) {
          setTutorUser(profRes.tutorProfile.user);
        }
      }

      // 2. Load Stats
      const statsRes = await tutorApi.getDashboardStats();
      if (statsRes.success) {
        setStats(statsRes.stats || statsRes);
        if (statsRes.todaySchedule) setSchedule(statsRes.todaySchedule);
        if (statsRes.payoutRequests) setPayoutHistory(statsRes.payoutRequests);
        if (statsRes.reviews) setReviews(statsRes.reviews);
      }

      // 3. Load Booking Requests
      const reqRes = await tutorApi.getBookingRequests();
      if (reqRes.success && reqRes.requests) {
        const pending = reqRes.requests.filter((r) => r.status === 'Pending');
        setPendingRequests(pending);

        // If schedule was empty, construct from accepted requests
        const accepted = reqRes.requests.filter((r) => r.status === 'Accepted');
        if (accepted.length > 0) {
          setSchedule((prev) => (prev.length > 0 ? prev : accepted));
        }
      }
    } catch (err) {
      console.error('Error loading tutor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await tutorApi.acceptBookingRequest(requestId);
      if (res.success) {
        setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
        loadDashboardData();
      } else {
        alert(res.message || 'Failed to accept request.');
      }
    } catch (err) {
      console.error('Accept Request Error:', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await tutorApi.rejectBookingRequest(requestId);
      if (res.success) {
        setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
        loadDashboardData();
      } else {
        alert(res.message || 'Failed to decline request.');
      }
    } catch (err) {
      console.error('Reject Request Error:', err);
    }
  };

  const tutorDisplayName = tutorProfile?.fullName || tutorUser?.name || 'Dr. Educator';
  const tutorEmail = tutorUser?.email || 'tutor@hometutor.com';
  const currentUserId = tutorUser?._id || tutorProfile?.user?._id || tutorProfile?.user || '';

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <TutorSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        tutorName={tutorDisplayName}
        tutorEmail={tutorEmail}
        unreadCount={0}
        unreadNotificationsCount={unreadNotifications}
      />

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        <TutorHeaderBar onRequestPayout={() => setIsPayoutModalOpen(true)} />

        {/* TABS NAVIGATION */}
        <div className="dash-tabs">
          <button
            className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fa-solid fa-chart-pie"></i> Overview
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fa-solid fa-bell"></i> Notifications
            {unreadNotifications > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' }}>
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <i className="fa-solid fa-chalkboard-user"></i> Sessions
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <i className="fa-solid fa-envelope-open-text"></i> Requests
            {pendingRequests.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <i className="fa-solid fa-comments"></i> Student Chat
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <i className="fa-solid fa-file-arrow-up"></i> Homework
          </button>
          <button
            className={`dash-tab-btn ${activeTab === 'rates-availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('rates-availability')}
          >
            <i className="fa-solid fa-sliders"></i> Rates & Slots
          </button>
        </div>

        {/* TAB CONTENT RENDERING */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#0f2a4a', marginBottom: '12px' }}></i>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>Loading Educator Control Panel...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <TutorOverviewTab
                stats={stats}
                schedule={schedule}
                pendingRequests={pendingRequests}
                payoutHistory={payoutHistory}
                reviews={reviews}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onRequestPayout={() => setIsPayoutModalOpen(true)}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab userRole="tutor" />
            )}

            {activeTab === 'sessions' && (
              <TutorSessionsTab sessions={schedule} />
            )}

            {activeTab === 'requests' && (
              <TutorRequestsTab
                requests={pendingRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            )}

            {activeTab === 'assignments' && (
              <TutorHomeworkTab />
            )}

            {activeTab === 'chat' && (
              <TutorChatTab
                currentUserId={currentUserId}
                currentUserName={tutorDisplayName}
              />
            )}

            {activeTab === 'rates-availability' && (
              <TutorRatesTab />
            )}
          </>
        )}
      </main>

      {/* PAYOUT REQUEST MODAL */}
      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalance={stats?.netEarnings || 0}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
