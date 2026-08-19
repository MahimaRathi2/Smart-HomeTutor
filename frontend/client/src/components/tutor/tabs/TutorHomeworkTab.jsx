import React, { useState } from 'react';

export const TutorHomeworkTab = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setMessage({ text: 'File size must be 50MB or less.', type: 'error' });
        e.target.value = '';
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !className || !file) {
      setMessage({ text: 'Please fill all required fields and select a file.', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('class', className);
    formData.append('note', file);

    try {
      const res = await fetch('/api/tutor/upload-note', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: '✅ Assignment / Study Notes uploaded and shared with students successfully!', type: 'success' });
        setTitle('');
        setSubject('');
        setClassName('');
        setFile(null);
      } else {
        setMessage({ text: data.message || 'Upload failed.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Server error uploading note. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>
            <i className="fa-solid fa-file-arrow-up"></i> Homework Upload & Study Notes Library
          </h3>
        </div>

        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            padding: '24px',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            background: '#f8fafc',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '36px', color: '#0f2a4a', marginBottom: '12px' }}></i>
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f2a4a', margin: '0 0 6px 0' }}>
              Upload Assignment or Study Notes PDF
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
              Upload PDF, DOCX or ZIP files (Max 50 MB)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Chapter 3 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Class / Grade *</label>
                <input
                  type="text"
                  placeholder="e.g. Class 12 CBSE"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={handleFileChange}
                style={{ padding: '8px', fontSize: '13px' }}
                required
              />
            </div>

            <button type="submit" className="dash-btn dash-btn-primary" disabled={uploading}>
              {uploading ? <><i className="fa-solid fa-spinner fa-spin"></i> Uploading Note...</> : 'Upload & Share with Students'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
