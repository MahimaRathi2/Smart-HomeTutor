import React, { useState } from 'react';
import { AdminBlogEditor } from '../blogs/AdminBlogEditor';

export const AdminBlogsTab = ({ blogs = [], onRefresh, onTogglePublish, onDeleteBlog }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);

  const handleOpenCreate = () => {
    setBlogToEdit(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (blog) => {
    setBlogToEdit(blog);
    setIsEditing(true);
  };

  const handleEditorBack = () => {
    setIsEditing(false);
    setBlogToEdit(null);
  };

  const handleEditorSuccess = () => {
    setIsEditing(false);
    setBlogToEdit(null);
    if (onRefresh) onRefresh();
  };

  // If in editor mode, display full-screen AdminBlogEditor
  if (isEditing) {
    return (
      <AdminBlogEditor
        blogToEdit={blogToEdit}
        onBack={handleEditorBack}
        onSuccess={handleEditorSuccess}
      />
    );
  }

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-newspaper" style={{ color: '#0284c7' }}></i> Blog Articles Management
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Create, edit, publish/unpublish, or delete dynamic articles displayed on the public website.
            </p>
          </div>
          <button
            className="dash-btn dash-btn-primary"
            onClick={handleOpenCreate}
            style={{ background: '#0f2a4a', fontWeight: '700', padding: '8px 16px', borderRadius: '8px' }}
          >
            <i className="fa-solid fa-plus-circle" style={{ marginRight: '6px' }}></i> Create New Blog
          </button>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Slug</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No blog articles found in database. Click "Create New Blog" to write one.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => {
                  const isPublished = blog.published !== false && blog.status !== 'draft';
                  return (
                    <tr key={blog._id}>
                      <td>
                        <img
                          src={blog.coverImage || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800'}
                          alt={blog.title}
                          style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{blog.title}</div>
                        <small style={{ color: '#64748b' }}>/blog/{blog.slug || blog._id}</small>
                      </td>
                      <td><span className="role-badge badge-student">{blog.category || 'General'}</span></td>
                      <td style={{ fontSize: '13px', color: '#475569' }}>{blog.author || 'Team'}</td>
                      <td>
                        <span className={`status-pill ${isPublished ? 'status-approved' : 'status-pending'}`}>
                          {isPublished ? 'published' : 'draft'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#0284c7' }}
                            onClick={() => handleOpenEdit(blog)}
                            title="Edit Article"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#dc2626' }}
                            onClick={() => onDeleteBlog && onDeleteBlog(blog._id)}
                            title="Delete Article"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
