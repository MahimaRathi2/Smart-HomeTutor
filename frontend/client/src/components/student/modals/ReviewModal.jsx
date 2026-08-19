import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../services/studentApi';

export const ReviewModal = ({ isOpen, onClose, tutors, onSuccess }) => {
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tutors && tutors.length > 0 && !selectedTutorId) {
      setSelectedTutorId(tutors[0]._id);
    }
  }, [tutors, selectedTutorId]);

  useEffect(() => {
    if (selectedTutorId && isOpen) {
      studentApi.getReviewForTutor(selectedTutorId).then((res) => {
        if (res.success && res.review) {
          setRating(res.review.rating || 5);
          setComment(res.review.comment || '');
        } else {
          setRating(5);
          setComment('');
        }
      }).catch(() => {});
    }
  }, [selectedTutorId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTutorId) {
      setError('Please select a tutor to review.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const resData = await studentApi.addReview({
        tutorProfileId: selectedTutorId,
        rating,
        comment,
      });

      if (resData.success) {
        setLoading(false);
        if (onSuccess) onSuccess(resData.message);
        onClose();
      } else {
        setLoading(false);
        setError(resData.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Network error submitting review.');
    }
  };

  return (
    <div className="tr-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="tr-modal-card" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer' }}
        >
          &times;
        </button>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Rate & Review Tutor
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
          Share your feedback for tutors with whom you have completed tuition sessions.
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select Educator</label>
            <select
              className="tr-select"
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              required
            >
              {tutors && tutors.length > 0 ? (
                tutors.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.user ? t.user.name || 'Tutor' : 'Tutor'} ({t.qualification || 'Educator'})
                  </option>
                ))
              ) : (
                <option value="">No accepted tutors found</option>
              )}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Star Rating</label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-star ${star <= rating ? 'fa-solid' : 'fa-regular'}`}
                  style={{ color: '#f59e0b' }}
                  onClick={() => setRating(star)}
                ></i>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Review Comment</label>
            <textarea
              className="tr-textarea"
              rows="4"
              placeholder="Describe your learning experience, teaching punctuality, and concept explanations..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="dash-btn dash-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dash-btn dash-btn-primary" disabled={loading}>
              {loading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</span> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
