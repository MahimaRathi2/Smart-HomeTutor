import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/content/blogs');
        const data = await response.json();
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.error('Error fetching blogs for home page:', err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const defaultCover = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="latest-blogs-section" id="blogs">
      <div className="container">
        <div className="section-title">
          <span className="section-tag">EDUCATIONAL INSIGHTS</span>
          <h2>Latest Blogs & Study Resources</h2>
          <p>
            Explore expert academic advice, exam preparation strategies, and learning guides crafted by top educators.
          </p>
        </div>

        {loading ? (
          <div className="blog-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="blog-card blog-card-skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-content">
                  <div className="skeleton-badge"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-footer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="blog-empty-state">
            <i className="fa-solid fa-newspaper empty-icon"></i>
            <h3>No Published Blogs Available Yet</h3>
            <p>Our academic team is currently writing new articles. Please check back soon!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.slice(0, 6).map((blog) => {
              const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const coverSrc = blog.coverImage && blog.coverImage.trim() !== '' ? blog.coverImage : defaultCover;
              const blogTarget = `/blog/${blog.slug || blog._id}`;

              return (
                <article key={blog._id} className="blog-card">
                  <Link to={blogTarget} className="blog-card-image-wrapper">
                    <img
                      src={coverSrc}
                      alt={blog.title}
                      className="blog-card-img"
                      onError={(e) => {
                        e.target.src = defaultCover;
                      }}
                    />
                    <span className="blog-category-badge">{blog.category || 'Learning Resources'}</span>
                  </Link>

                  <div className="blog-card-body">
                    <div className="blog-card-meta-top">
                      <span><i className="fa-regular fa-calendar"></i> {formattedDate}</span>
                      <span><i className="fa-regular fa-clock"></i> {blog.readTime || '5 min read'}</span>
                    </div>

                    <h3 className="blog-card-title">
                      <Link to={blogTarget}>{blog.title}</Link>
                    </h3>

                    <p className="blog-card-excerpt">
                      {blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : '')}
                    </p>

                    <div className="blog-card-footer">
                      <div className="blog-author-info">
                        <i className="fa-solid fa-user-pen author-icon"></i>
                        <span>{blog.author || 'Academic Team'}</span>
                      </div>

                      <Link to={blogTarget} className="blog-read-more">
                        Read Article <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
