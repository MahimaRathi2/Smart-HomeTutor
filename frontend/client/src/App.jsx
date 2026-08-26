import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/public/HomePage';
import { About } from './pages/public/About';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { TermsOfService } from './pages/public/TermsOfService';
import { BlogDetailsPage } from './pages/public/BlogDetailsPage';
import { FindTutorsPage } from './pages/public/FindTutorsPage';
import { Contact } from './pages/public/Contact';
import { SubjectsPage } from './pages/public/SubjectsPage';
import { SubjectDetailPage } from './pages/public/SubjectDetailPage';
import { BecomeTutorPage } from './pages/public/BecomeTutorPage';
import { TutorProfile } from './pages/public/TutorProfile';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyOtp } from './pages/auth/VerifyOtp';
import { VideoCall } from './pages/video/VideoCall';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { TutorDashboardPage } from './pages/tutor/TutorDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ParentDashboard } from './pages/dashboards/ParentDashboard';
import { BroadcastAnnouncementListener } from './components/common/BroadcastAnnouncementListener';
import { SocketCallListener } from './components/home/SocketCallListener';
import { CustomPopup } from './components/common/CustomPopup';

export const App = () => {
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleWheel = (e) => {
      // Intercept only when horizontal scroll delta is dominant over vertical scroll delta
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        let target = e.target;
        let isInternalScroll = false;

        // Check if the horizontal gesture is inside a horizontally scrollable container
        while (target && target !== document.body && target !== document.documentElement) {
          const style = window.getComputedStyle(target);
          const overflowX = style.getPropertyValue('overflow-x');
          if ((overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth) {
            const canScrollLeft = e.deltaX < 0 && target.scrollLeft > 0;
            const canScrollRight = e.deltaX > 0 && target.scrollLeft + target.clientWidth < target.scrollWidth;
            if (canScrollLeft || canScrollRight) {
              isInternalScroll = true;
              break;
            }
          }
          target = target.parentElement;
        }

        // Prevent browser back/forward history navigation if not scrolling an internal container
        if (!isInternalScroll) {
          e.preventDefault();
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX;
        const diffY = currentY - touchStartY;

        // Intercept only if horizontal gesture is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
          let target = e.target;
          let isInternalScroll = false;

          // Check if touch gesture is inside a mobile scroll container or table
          while (target && target !== document.body && target !== document.documentElement) {
            const style = window.getComputedStyle(target);
            const overflowX = style.getPropertyValue('overflow-x');
            const hasMobileClass = target.classList.contains('mobile-scroll-container') || target.classList.contains('dash-table-wrapper');
            if (hasMobileClass || ((overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth)) {
              isInternalScroll = true;
              break;
            }
            target = target.parentElement;
          }

          if (!isInternalScroll && !('ontouchstart' in window)) {
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <CustomPopup />
        <BroadcastAnnouncementListener />
        <SocketCallListener />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/find" element={<FindTutorsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectSlug" element={<SubjectDetailPage />} />
          <Route path="/tutor" element={<BecomeTutorPage />} />
          <Route path="/tutor/:id" element={<TutorProfile />} />
          <Route path="/become-a-tutor" element={<BecomeTutorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/video-call/:bookingId" element={<VideoCall />} />
          <Route path="/dashboard/student" element={<StudentDashboardPage />} />
          <Route path="/student-dashboard" element={<StudentDashboardPage />} />
          <Route path="/dashboard/tutor" element={<TutorDashboardPage />} />
          <Route path="/tutor-dashboard" element={<TutorDashboardPage />} />
          <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/blog/:idOrSlug" element={<BlogDetailsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
