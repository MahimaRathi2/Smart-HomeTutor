import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AdminBlogEditor = ({ blogToEdit = null, onBack, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Learning Resources');
  const [author, setAuthor] = useState('Smart HomeTutor Academic Team');
  const [tags, setTags] = useState(['Education', 'Tutoring']);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState('published');

  // SEO & Meta Fields State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  // UI & Responsive States
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo'
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Track window width for dynamic responsive layout
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const editorRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title || '');
      setSlug(blogToEdit.slug || '');
      setExcerpt(blogToEdit.excerpt || '');
      setCoverImage(blogToEdit.coverImage || '');
      setCategory(blogToEdit.category || 'Learning Resources');
      setAuthor(blogToEdit.author || 'Smart HomeTutor Academic Team');
      setTags(Array.isArray(blogToEdit.tags) ? blogToEdit.tags : []);
      setContent(blogToEdit.content || '');
      setReadTime(blogToEdit.readTime || '5 min read');
      setStatus(blogToEdit.published !== false ? 'published' : 'draft');

      setMetaTitle(blogToEdit.metaTitle || blogToEdit.title || '');
      setMetaDescription(blogToEdit.metaDescription || blogToEdit.excerpt || '');
      setMetaKeywords(blogToEdit.metaKeywords || '');
      setCanonicalUrl(blogToEdit.canonicalUrl || '');
      setOgTitle(blogToEdit.ogTitle || blogToEdit.title || '');
      setOgDescription(blogToEdit.ogDescription || blogToEdit.excerpt || '');
      setOgImage(blogToEdit.ogImage || blogToEdit.coverImage || '');
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setCoverImage('');
      setCategory('Learning Resources');
      setAuthor('Smart HomeTutor Academic Team');
      setTags(['Education', 'Tutoring']);
      setContent('');
      setReadTime('5 min read');
      setStatus('published');

      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
      setCanonicalUrl('');
      setOgTitle('');
      setOgDescription('');
      setOgImage('');
    }
  }, [blogToEdit]);

  // Sync contentEditable with content state when editor mounts or changes
  useEffect(() => {
    if (editorRef.current && !showHtmlSource) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '<p><br></p>';
      }
    }
  }, [showHtmlSource]);

  // Dynamic Word Count & Estimated Read Time Calculation
  const handleEditorInput = () => {
    if (editorRef.current) {
      const htmlText = editorRef.current.innerHTML;
      setContent(htmlText);

      // Dynamically estimate read time based on word count
      const plainText = editorRef.current.innerText || '';
      const words = plainText.trim().split(/\s+/).filter(Boolean).length;
      if (words > 0) {
        const minutes = Math.max(1, Math.ceil(words / 200));
        setReadTime(`${minutes} min read`);
      }
    }
  };

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!blogToEdit && (!slug || slug === title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Rich Text Editor Commands via document.execCommand
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const handleInsertTable = () => {
    const rowsInput = prompt('Enter number of rows:', '3');
    if (rowsInput === null) return;
    const colsInput = prompt('Enter number of columns:', '3');
    if (colsInput === null) return;

    const rows = Math.max(1, parseInt(rowsInput, 10) || 3);
    const cols = Math.max(1, parseInt(colsInput, 10) || 3);

    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #cbd5e1;">';
    tableHtml += '<thead><tr style="background-color: #f1f5f9;">';
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 10px; font-weight: 700; text-align: left;">Header ${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 1; r <= rows; r++) {
      tableHtml += '<tr>';
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px 10px;">Row ${r} Cell ${c}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    execCmd('insertHTML', tableHtml);
  };

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
      if (res.success && res.url) {
        setCoverImage(res.url);
        if (!ogImage) setOgImage(res.url);
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

  const handleSubmit = async (targetStatus) => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError('Please fill in Title, Excerpt, and Blog Content.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    const isPublished = targetStatus === 'published';

    const payload = {
      title,
      slug,
      excerpt,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
      category,
      author,
      tags,
      content,
      readTime,
      published: isPublished,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords,
      canonicalUrl,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || excerpt,
      ogImage: ogImage || coverImage,
    };

    try {
      let res;
      if (blogToEdit && blogToEdit._id) {
        res = await adminApi.updateBlog(blogToEdit._id, payload);
      } else {
        res = await adminApi.createBlog(payload);
      }

      if (res.success) {
        setSuccessMessage(`Article ${isPublished ? 'published' : 'saved as draft'} successfully!`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onBack();
        }, 1200);
      } else {
        setError(res.message || 'Failed to save blog article.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error saving blog article.');
    } finally {
      setSaving(false);
    }
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: isMobile ? '12px' : '24px' }}>
      {/* TOP HEADER / BAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: isMobile ? '14px 16px' : '16px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(15, 42, 74, 0.04)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="dash-btn dash-btn-outline"
            onClick={onBack}
            style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '700' }}
          >
            <i className="fa-solid fa-arrow-left"></i> {isMobile ? 'Back' : 'Back to Articles'}
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '800', color: '#0f2a4a' }}>
              <i className="fa-solid fa-feather" style={{ color: '#0284c7', marginRight: '8px' }}></i>
              {blogToEdit ? 'Edit Blog Article' : 'Create New Blog Article'}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b', display: isMobile ? 'none' : 'inline' }}>
              {blogToEdit ? `Editing: ${blogToEdit.title}` : 'Blog Management & Publishing'}
            </span>
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          {/* TAB SWITCHER */}
          <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'content' ? '#ffffff' : 'transparent',
                color: activeTab === 'content' ? '#0f2a4a' : '#64748b',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeTab === 'content' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <i className="fa-solid fa-file-pen" style={{ marginRight: '6px' }}></i> Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'seo' ? '#ffffff' : 'transparent',
                color: activeTab === 'seo' ? '#0f2a4a' : '#64748b',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: activeTab === 'seo' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '6px' }}></i> SEO
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="dash-btn dash-btn-outline"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700' }}
            >
              <i className="fa-solid fa-bookmark"></i> Draft
            </button>
            <button
              type="button"
              className="dash-btn dash-btn-primary"
              onClick={() => handleSubmit('published')}
              disabled={saving}
              style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', background: '#0f2a4a' }}
            >
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i></> : <><i className="fa-solid fa-paper-plane"></i> Publish</>}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR / SUCCESS ALERTS */}
      {error && (
        <div style={{ padding: '12px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#991b1b', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> {error}
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '12px 18px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '12px', color: '#065f46', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {successMessage}
        </div>
      )}

      {/* TAB 1: CONTENT & EDITOR */}
      {activeTab === 'content' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : 'minmax(0, 1fr) 340px',
          gap: '24px'
        }}>
          {/* MAIN COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* CARD: TITLE, SLUG & EXCERPT */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f2a4a', marginBottom: '6px' }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 Essential Tips for Board Exam Preparation"
                  value={title}
                  onChange={handleTitleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  URL Slug
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '10px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                  <span style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b', background: '#e2e8f0', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    /blog/
                  </span>
                  <input
                    type="text"
                    placeholder="custom-article-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f2a4a', marginBottom: '6px' }}>
                  Short Excerpt / Summary *
                </label>
                <textarea
                  rows="3"
                  placeholder="Write a concise overview or key takeaway summary of the blog article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.5' }}
                ></textarea>
              </div>
            </div>

            {/* CARD: RICH TEXT EDITOR */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '800', color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-pen-nib" style={{ color: '#0284c7' }}></i> Blog Content (Rich Text Format) *
                </label>

                <button
                  type="button"
                  onClick={() => setShowHtmlSource(!showHtmlSource)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                >
                  <i className="fa-solid fa-code"></i> {showHtmlSource ? 'Visual Editor' : 'Edit HTML Source'}
                </button>
              </div>

              {/* RICH TEXT FORMATTING TOOLBAR (RESPONSIVE WRAPPED FLEX) */}
              {!showHtmlSource && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px 10px 0 0',
                  padding: '8px 10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {/* TEXT STYLES */}
                  <button type="button" title="Bold (Ctrl+B)" onClick={() => execCmd('bold')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
                  <button type="button" title="Italic (Ctrl+I)" onClick={() => execCmd('italic')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                  <button type="button" title="Underline (Ctrl+U)" onClick={() => execCmd('underline')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', textDecoration: 'underline', cursor: 'pointer' }}>U</button>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>

                  {/* HEADINGS SELECTOR */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) execCmd('formatBlock', e.target.value);
                    }}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                  >
                    <option value="<p>">Paragraph</option>
                    <option value="<h1>">Heading 1 (H1)</option>
                    <option value="<h2>">Heading 2 (H2)</option>
                    <option value="<h3>">Heading 3 (H3)</option>
                    <option value="<h4>">Heading 4 (H4)</option>
                  </select>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>

                  {/* LISTS */}
                  <button type="button" title="Bulleted List" onClick={() => execCmd('insertUnorderedList')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-list-ul"></i></button>
                  <button type="button" title="Numbered List" onClick={() => execCmd('insertOrderedList')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-list-ol"></i></button>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>

                  {/* ALIGNMENT */}
                  <button type="button" title="Align Left" onClick={() => execCmd('justifyLeft')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-align-left"></i></button>
                  <button type="button" title="Align Center" onClick={() => execCmd('justifyCenter')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-align-center"></i></button>
                  <button type="button" title="Align Right" onClick={() => execCmd('justifyRight')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-align-right"></i></button>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>

                  {/* ELEMENTS */}
                  <button
                    type="button"
                    title="Insert Link"
                    onClick={() => {
                      const url = prompt('Enter link URL (e.g. https://example.com):');
                      if (url) execCmd('createLink', url);
                    }}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-link"></i>
                  </button>
                  <button type="button" title="Blockquote" onClick={() => execCmd('formatBlock', 'blockquote')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-quote-right"></i></button>
                  <button type="button" title="Code Block" onClick={() => execCmd('formatBlock', 'pre')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-code"></i></button>
                  <button type="button" title="Insert Table" onClick={handleInsertTable} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-table"></i></button>

                  <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>

                  {/* UNDO / REDO */}
                  <button type="button" title="Undo" onClick={() => execCmd('undo')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-rotate-left"></i></button>
                  <button type="button" title="Redo" onClick={() => execCmd('redo')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}><i className="fa-solid fa-rotate-right"></i></button>
                </div>
              )}

              {/* EDITOR CANVAS / SOURCE DISPLAY */}
              {showHtmlSource ? (
                <textarea
                  rows="14"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '0 0 10px 10px',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    background: '#0f172a',
                    color: '#f8fafc'
                  }}
                ></textarea>
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  style={{
                    minHeight: '320px',
                    padding: '18px',
                    border: '1px solid #cbd5e1',
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    background: '#ffffff',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                ></div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: SETTINGS & PUBLISHING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* COVER IMAGE BOX */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f2a4a' }}>
                Cover Image
              </h4>

              {coverImage && (
                <div style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                  <img src={coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <input
                type="text"
                placeholder="Image URL..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '10px' }}
              />

              <label className="dash-btn dash-btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '6px', width: '100%', cursor: 'pointer', fontSize: '12px' }}>
                <i className="fa-solid fa-upload"></i> {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileUpload} disabled={uploadingCover} />
              </label>
            </div>

            {/* TAXONOMY & METADATA */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="Learning Resources">Learning Resources</option>
                  <option value="Exam Preparation">Exam Preparation</option>
                  <option value="Study Tips">Study Tips</option>
                  <option value="Parenting & Mentorship">Parenting & Mentorship</option>
                  <option value="Career & Higher Education">Career & Higher Education</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Author Name *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Estimated Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* TAGS */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Tags</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer' }}>&times;</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <button type="button" className="dash-btn dash-btn-outline" onClick={handleAddTag} style={{ padding: '4px 8px', fontSize: '11px' }}>+ Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & META TAGS */}
      {activeTab === 'seo' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : 'minmax(0, 1fr) 360px',
          gap: '24px'
        }}>
          {/* SEO INPUTS */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ color: '#0284c7' }}></i> SEO & Open Graph Meta Tags
            </h3>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f2a4a' }}>Meta Title</label>
                <small style={{ color: (metaTitle || title).length > 60 ? '#dc2626' : '#64748b', fontWeight: '700' }}>
                  {(metaTitle || title).length} / 60 chars
                </small>
              </div>
              <input
                type="text"
                placeholder="Title to display on Google Search results..."
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f2a4a' }}>Meta Description</label>
                <small style={{ color: (metaDescription || excerpt).length > 160 ? '#dc2626' : '#64748b', fontWeight: '700' }}>
                  {(metaDescription || excerpt).length} / 160 chars
                </small>
              </div>
              <textarea
                rows="3"
                placeholder="Description snippet to display on Google Search results..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              ></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Meta Keywords</label>
              <input
                type="text"
                placeholder="Comma separated (e.g. tutoring, board exams, math tuition, CBSE)"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Canonical URL</label>
              <input
                type="url"
                placeholder="https://smarthometutor.com/blog/article-slug"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-share-nodes" style={{ color: '#2563eb' }}></i> Social Share (Open Graph) Meta Tags
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>OG Title</label>
                  <input
                    type="text"
                    placeholder="Title for Facebook / LinkedIn / Twitter cards..."
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>OG Description</label>
                  <textarea
                    rows="2"
                    placeholder="Description snippet for social share cards..."
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  ></textarea>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>OG Image URL</label>
                  <input
                    type="text"
                    placeholder="Image URL for social share preview..."
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEWS (DYNAMIC REAL-TIME SYNC) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* GOOGLE SEARCH PREVIEW */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fa-brands fa-google" style={{ color: '#ea4335', marginRight: '6px' }}></i> Google Search Preview
              </h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#202124', marginBottom: '2px', wordBreak: 'break-all' }}>
                  https://smarthometutor.com › blog › {slug || 'article-slug'}
                </div>
                <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', wordBreak: 'break-word' }}>
                  {metaTitle || title || 'Article Meta Title Goes Here'}
                </div>
                <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {metaDescription || excerpt || 'Short description snippet that will appear in search engine results for this blog post.'}
                </div>
              </div>
            </div>

            {/* SOCIAL CARD PREVIEW */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-share-nodes" style={{ color: '#2563eb', marginRight: '6px' }}></i>  Social Share Preview Card
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
                <div style={{ height: '160px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <img
                    src={ogImage || coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'}
                    alt="Social Card Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'; }}
                  />
                </div>
                <div style={{ padding: '14px' }}>
                  <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '10px', fontWeight: '700' }}>smarthometutor.com</small>
                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px', color: '#0f2a4a', fontWeight: '700', wordBreak: 'break-word' }}>
                    {ogTitle || title || 'Social Share Title'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {ogDescription || excerpt || 'Social share description snippet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
