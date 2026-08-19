import React, { useState, useEffect } from 'react';
import { studentApi } from '../../../services/studentApi';

export const HomeworkTab = () => {
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    studentApi.getStudyMaterials().then((res) => {
      if (res.success) {
        setMaterials(res.materials || []);
        setNotes(res.notes || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setMsg('File size must be 25MB or less.');
      return;
    }

    setUploading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploading(false);
        setMsg('Homework file submitted to tutor successfully!');
        setFile(null);
      } else {
        setUploading(false);
        setMsg(data.message || 'Homework upload failed.');
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
      setMsg('Homework submission failed.');
    }
  };

  const allNotes = [...notes, ...materials];

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-file-arrow-up"></i> Homework Submissions & Learning Materials</h3>
        </div>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: msg.includes('successfully') ? '#dcfce7' : '#fef2f2', color: msg.includes('successfully') ? '#15803d' : '#991b1b', marginBottom: '16px', fontSize: '13px' }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleHomeworkSubmit}>
          <div className="quiz-widget-card" style={{ maxWidth: '520px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#0f2a4a' }}>
              <i className="fa-solid fa-file-pdf" style={{ color: '#15803d' }}></i> Upload Completed Homework
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>PDF / Image / DOCX format &bull; Max 25 MB</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ marginBottom: '12px', fontSize: '13px', display: 'block' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit" className="dash-btn dash-btn-outline" disabled={uploading || !file}>
              {uploading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</span> : 'Submit File'}
            </button>
          </div>
        </form>

        {/* STUDY NOTES LIBRARY SECTION */}
        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
          <div className="dash-card-header" style={{ marginBottom: '16px' }}>
            <h3><i className="fa-solid fa-book-bookmark" style={{ color: '#0284c7' }}></i> Study Notes Library</h3>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Loading study notes...
            </div>
          ) : allNotes.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '10px', display: 'block' }}></i>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No Study Materials Uploaded Yet</p>
              <small style={{ color: '#94a3b8' }}>Study materials uploaded by your active tutors will appear here.</small>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allNotes.map((item) => (
                <div key={item._id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f2a4a' }}>{item.title || item.fileName || 'Study Material'}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
                      Shared by: {item.tutor ? item.tutor.name || 'Tutor' : 'Tutor'}
                    </p>
                  </div>
                  <a
                    href={item.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn dash-btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <i className="fa-solid fa-download"></i> Download Material
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
