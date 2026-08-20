import React, { useState, useEffect } from 'react';
import '../../styles/student-dashboard.css';
import { studentApi } from '../../services/studentApi';
import { StudentSidebar } from '../../components/student/StudentSidebar';
import { StudentHeaderBar } from '../../components/student/StudentHeaderBar';
import { OverviewTab } from '../../components/student/tabs/OverviewTab';
import { FindTutorsTab } from '../../components/student/tabs/FindTutorsTab';
import { ClassesTab } from '../../components/student/tabs/ClassesTab';
import { HomeworkTab } from '../../components/student/tabs/HomeworkTab';
import { ChatTab } from '../../components/student/tabs/ChatTab';
import { WalletTab } from '../../components/student/tabs/WalletTab';
import { BookDemoModal } from '../../components/student/modals/BookDemoModal';
import { ReviewModal } from '../../components/student/modals/ReviewModal';
import { CertificatesModal } from '../../components/student/modals/CertificatesModal';
import { RequestTutorModal } from '../../components/student/modals/RequestTutorModal';
import { AIRecommendationsModal } from '../../components/student/modals/AIRecommendationsModal';

import { NotificationsTab } from '../../components/common/NotificationsTab';

export const StudentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentUser, setStudentUser] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false);
  const [requestTutorModalOpen, setRequestTutorModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadNotifications(data.count || 0);
      }
    } catch (err) {
      console.error('Fetch unread notifications count error:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, tutorsRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getDashboardStats(),
        studentApi.getTutors(),
      ]);

      if (profileRes.success && profileRes.student) {
        setStudentUser(profileRes.student);
      }
      if (statsRes.success) {
        setStatsData(statsRes);
      }
      if (tutorsRes.success && tutorsRes.tutors) {
        setTutors(tutorsRes.tutors);
      }
      fetchUnreadCount();
    } catch (err) {
      console.error('Load Student Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenBookingModal = (tutor) => {
    setSelectedTutorForBooking(tutor);
    setBookModalOpen(true);
  };

  const handleStartVideoCall = () => {
    if (statsData && statsData.bookings) {
      const acceptedBooking = statsData.bookings.find((b) => b.status === 'Accepted');
      if (acceptedBooking) {
        window.location.href = `/video-call/${acceptedBooking._id}`;
        return;
      }
    }
    showToast('Video Call Notice: Requires an ACCEPTED tuition booking with your tutor.');
  };

  const handleWalletTopupSuccess = (newBalance, msg) => {
    if (statsData && statsData.stats) {
      setStatsData((prev) => ({
        ...prev,
        stats: { ...prev.stats, walletBalance: newBalance },
      }));
    }
    showToast(msg || 'Wallet topped up successfully!');
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <StudentSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        studentUser={studentUser}
        unreadCount={unreadNotifications}
        onOpenCertificates={() => setCertificatesModalOpen(true)}
      />

      {/* MAIN DASHBOARD CONTENT */}
      <main className="dashboard-main">
        <StudentHeaderBar
          onRequestTutor={() => setRequestTutorModalOpen(true)}
          onStartVideoCall={handleStartVideoCall}
          onTopupWallet={(amount) => {
            studentApi.topupWallet(amount).then((res) => {
              if (res.success) handleWalletTopupSuccess(res.walletBalance, res.message);
            });
          }}
        />

        {/* TOAST FEEDBACK DISPLAY */}
        {toastMessage && (
          <div style={{ maxWidth: '1200px', margin: '0 auto 16px auto', padding: '12px 20px', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '10px', color: '#0369a1', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-circle-info" style={{ color: '#0284c7', fontSize: '16px' }}></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB CONTENT PANES */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading Student Dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                stats={statsData ? statsData.stats : null}
                upcomingClasses={statsData ? statsData.upcomingClasses : []}
                referralCode={statsData ? statsData.referralCode : ''}
                referralEarnings={statsData ? statsData.referralEarnings : 0}
                referredCount={statsData ? (statsData.referredCount || (statsData.stats ? statsData.stats.referredCount : 0)) : 0}
                onOpenAIRecommendations={() => setAiModalOpen(true)}
                onOpenReviewModal={() => setReviewModalOpen(true)}
                onStartVideoCall={handleStartVideoCall}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab userRole="student" />
            )}

            {activeTab === 'search-tutors' && (
              <FindTutorsTab onBookTutor={handleOpenBookingModal} />
            )}

            {activeTab === 'schedule' && (
              <ClassesTab onStartVideoCall={handleStartVideoCall} />
            )}

            {activeTab === 'learning' && <HomeworkTab />}

            {activeTab === 'chat' && (
              <ChatTab studentUser={studentUser} onStartVideoCall={handleStartVideoCall} />
            )}

            {activeTab === 'payments' && (
              <WalletTab
                walletBalance={statsData && statsData.stats ? statsData.stats.walletBalance : 0}
                transactions={statsData ? statsData.transactions : []}
                onWalletTopupSuccess={handleWalletTopupSuccess}
              />
            )}
          </>
        )}
      </main>

      {/* DASHBOARD MODALS */}
      <BookDemoModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        tutor={selectedTutorForBooking}
        onSuccess={(msg) => {
          showToast(msg);
          loadAllData();
        }}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        tutors={statsData ? statsData.bookings.map((b) => b.tutorProfile).filter(Boolean) : []}
        onSuccess={(msg) => {
          showToast(msg);
          loadAllData();
        }}
      />

      <CertificatesModal
        isOpen={certificatesModalOpen}
        onClose={() => setCertificatesModalOpen(false)}
      />

      <RequestTutorModal
        isOpen={requestTutorModalOpen}
        onClose={() => setRequestTutorModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <AIRecommendationsModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        tutors={tutors}
        onBookTutor={handleOpenBookingModal}
      />
    </div>
  );
};
