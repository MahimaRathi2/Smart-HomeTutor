import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { TutorProfileHeader } from '../../components/tutor/TutorProfileHeader';
import { TutorAbout } from '../../components/tutor/TutorAbout';
import { TutorReviews } from '../../components/tutor/TutorReviews';
import { TutorBookingModal } from '../../components/tutor/TutorBookingModal';

export const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (id) {
      fetchTutorDetails(id);
    }
  }, [id]);

  const fetchTutorDetails = async (tutorId) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/tutor/details/${tutorId}`);
      const data = await res.json();

      if (res.ok && data.success && data.tutor) {
        setTutor(data.tutor);
        setReviews(data.reviews || []);
      } else {
        setErrorMsg(data.message || 'Tutor Profile Not Found.');
      }
    } catch (err) {
      console.error('Fetch Tutor Details Error:', err);
      setErrorMsg('Network error. Unable to load tutor profile.');
    } finally {
      setLoading(false);
    }
  };

  const tutorName = tutor ? (tutor.fullName || (tutor.user ? tutor.user.name : 'Tutor Profile')) : 'Tutor Profile';

  return (
    <div className="tutor-profile-page" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activePage="tutors" />

      <main style={{ flex: 1, padding: '40px 0 60px 0' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* BREADCRUMB / BACK LINK */}
          <div style={{ marginBottom: '20px' }}>
            <Link to="/find" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-left"></i> Back to All Tutors
            </Link>
          </div>

          {loading && (
            <div className="dash-card" style={{ textStyle: 'center', textAlign: 'center', padding: '60px 20px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary, #213547)', marginBottom: '14px' }}></i>
              <h3 style={{ margin: 0, color: 'var(--primary, #213547)', fontSize: '18px' }}>Loading Educator Profile...</h3>
            </div>
          )}

          {errorMsg && !loading && (
            <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fa-solid fa-user-slash" style={{ fontSize: '42px', color: '#cbd5e1', marginBottom: '14px' }}></i>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary, #213547)', fontSize: '20px', fontWeight: 800 }}>Tutor Profile Not Found</h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>{errorMsg}</p>
              <button type="button" onClick={() => navigate('/find')} className="dash-btn dash-btn-primary">
                Browse Active Home Tutors
              </button>
            </div>
          )}

          {!loading && !errorMsg && tutor && (
            <div className="dash-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              
              {/* TOP HEADER */}
              <TutorProfileHeader tutor={tutor} />

              {/* DETAILS & ABOUT */}
              <TutorAbout tutor={tutor} onBookClick={() => setIsBookingModalOpen(true)} />

              {/* REVIEWS */}
              <TutorReviews reviews={reviews} />

            </div>
          )}

        </div>
      </main>

      {/* BOOKING MODAL */}
      <TutorBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tutorId={id}
        tutorName={tutorName}
      />

      <Footer />
    </div>
  );
};
