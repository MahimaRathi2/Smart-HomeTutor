import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AdminBlogModal = ({ isOpen, onClose, blogToEdit = null, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Learning Resources');
  const [author, setAuthor] = useState('Smart HomeTutor Academic Team');
  const [tags, setTags] = useState(['Education', 'Tutoring']);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title || '');
      setExcerpt(blogToEdit.excerpt || '');
      setCoverImage(blogToEdit.coverImage || '');
      setCategory(blogToEdit.category || 'Learning Resources');
      setAuthor(blogToEdit.author || 'Smart HomeTutor Academic Team');
      setTags(Array.isArray(blogToEdit.tags) ? blogToEdit.tags : []);
      setContent(blogToEdit.content || '');
      setReadTime(blogToEdit.readTime || '5 min read');
      setStatus(blogToEdit.status || 'published');
    } else {
      setTitle('');
      setExcerpt('');
      setCoverImage('');
      setCategory('Learning Resources');
      setAuthor('Smart HomeTutor Academic Team');
      setTags(['Education', 'Tutoring']);
      setContent('');
      setReadTime('5 min read');
      setStatus('published');
    }
  }, [blogToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const res = await adminApi.uploadBlogCover(formData);
      if (res.success && res.imageUrl) {
        setCoverImage(res.imageUrl);
      } else {
        alert(res.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Cover upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (submitStatus) => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError('Please fill in Title, Excerpt, and Content.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title,
      excerpt,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
      category,
      author,
      tags,
      content,
      readTime,
      status: submitStatus || status
    };

    try {
      let res;
      if (blogToEdit && blogToEdit._id) {
        res = await adminApi.updateBlog(blogToEdit._id, payload);
      } else {
        res = await adminApi.createBlog(payload);
      }

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to save blog post.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error saving blog post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1250,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '820px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#1e293b', color: '#ffffff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: '700' }}>
            <i className="fa-solid fa-pen-to-square" style={{ color: '#38bdf8', marginRight: '8px' }}></i>
            {blogToEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
          <button onClick={onClose} style={{ color: '#94a3b8', fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(status); }} style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Title *</label>
            <input
              type="text"
              placeholder="e.g. 10 Essential Tips for Board Exam Preparation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Excerpt *</label>
            <textarea
              rows="3"
              placeholder="Write a short summary or preview of the blog post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Cover Image</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Image URL or upload file below"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <label className="dash-btn dash-btn-primary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <i className="fa-solid fa-upload"></i> {uploadingCover ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileUpload} disabled={uploadingCover} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Learning Resources">Learning Resources</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Study Tips">Study Tips</option>
                <option value="Parenting & Mentorship">Parenting & Mentorship</option>
                <option value="Career & Higher Education">Career & Higher Education</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Author *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Tags</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {tags.map((tag) => (
                <span key={tag} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add tag (e.g. React, Exams)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button type="button" className="dash-btn dash-btn-outline" onClick={handleAddTag}>+ Add Tag</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Content (HTML / Text) *</label>
            <textarea
              rows="8"
              placeholder="Write blog post content (supports HTML tags)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '13px' }}
              required
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="dash-btn dash-btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="button" className="dash-btn dash-btn-outline" onClick={() => handleSubmit('draft')} disabled={saving}>
              <i className="fa-solid fa-bookmark"></i> Save Draft
            </button>
            <button type="button" className="dash-btn dash-btn-primary" onClick={() => handleSubmit('published')} disabled={saving}>
              <i className="fa-solid fa-paper-plane"></i> Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
