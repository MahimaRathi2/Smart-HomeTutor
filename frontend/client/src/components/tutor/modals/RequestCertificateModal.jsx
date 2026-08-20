import React, { useState, useEffect } from 'react';
import { tutorApi } from '../../../services/tutorApi';

export const RequestCertificateModal = ({ isOpen, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [courseName, setCourseName] = useState('Class 10th Mathematics');
  const [attendancePercentage, setAttendancePercentage] = useState(100);
  const [completedClasses, setCompletedClasses] = useState(12);
  const [tutorRemarks, setTutorRemarks] = useState('Student completed course curriculum with distinction.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      loadTutorStudents();
    }
  }, [isOpen]);

  const loadTutorStudents = async () => {
    try {
      const res = await fetch('/api/tutor/booking-requests');
      const data = await res.json();
      if (data.success && data.requests) {
        const studentMap = new Map();
        data.requests.forEach((r) => {
          if (r.student && r.student._id) {
            studentMap.set(r.student._id.toString(), {
              id: r.student._id.toString(),
              name: r.student.name || r.student.email,
              subject: r.tutorProfile?.subjects?.[0] || 'Tuition Course',
            });
          }
        });
        const list = Array.from(studentMap.values());
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id);
          if (list[0].subject) setCourseName(list[0].subject);
        }
      }
    } catch (err) {
      console.error('Load tutor students error:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Please select a student for the certificate request.');
      return;
    }

    if (!courseName.trim()) {
      setErrorMsg('Please enter a course or subject name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await tutorApi.requestCertificate({
        studentId: selectedStudentId,
        courseName: courseName.trim(),
        attendancePercentage: Number(attendancePercentage) || 100,
        completedClasses: Number(completedClasses) || 12,
        tutorRemarks: tutorRemarks.trim() || 'Course completed successfully.',
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Certificate request submitted to Admin for approval!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.message || 'Failed to submit certificate request.');
      }
    } catch (err) {
      console.error('Submit cert request error:', err);
      setErrorMsg('An error occurred while submitting certificate request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tr-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="tr-modal-card" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer' }}
        >
          &times;
        </button>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-award" style={{ color: '#0284c7' }}></i> Request Certificate from Admin
        </h3>
        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px' }}>
          Submit a student course completion record for Admin approval and verified PDF certificate issuance.
        </p>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '12.5px', marginBottom: '14px', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '12.5px', marginBottom: '14px', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Select Student</label>
            {students.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc', color: '#0f2a4a' }}
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Student User ID"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required
              />
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Course / Subject Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Class 10th Mathematics & Science Mastery"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={attendancePercentage}
                onChange={(e) => setAttendancePercentage(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Completed Classes</label>
              <input
                type="number"
                min="1"
                value={completedClasses}
                onChange={(e) => setCompletedClasses(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tutor Remarks for Admin</label>
            <textarea
              rows="2"
              value={tutorRemarks}
              onChange={(e) => setTutorRemarks(e.target.value)}
              placeholder="Add notes for Admin review..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="dash-btn dash-btn-outline"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="dash-btn dash-btn-primary"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Submit Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
