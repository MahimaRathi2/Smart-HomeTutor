import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';

export const BlogDetailsPage = () => {
  const { idOrSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/content/blogs/${idOrSlug}`);
        const data = await response.json();

        if (data.success && data.blog) {
          setBlog(data.blog);
        } else {
          setError(data.message || 'Blog article not found.');
        }
      } catch (err) {
        console.error('Error loading blog details:', err);
        setError('Server error while loading article details.');
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchBlogDetail();
    }
  }, [idOrSlug]);

  // Inject SEO & Meta Tags into document <head>
  useEffect(() => {
    if (!blog) return;

    const prevTitle = document.title;
    document.title = blog.metaTitle || blog.title || 'Smart HomeTutor Blog';

    const setMetaTag = (attrName, attrValue, contentVal) => {
      if (!contentVal) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    setMetaTag('name', 'description', blog.metaDescription || blog.excerpt || '');
    setMetaTag('name', 'keywords', blog.metaKeywords || '');
    setMetaTag('property', 'og:title', blog.ogTitle || blog.title || '');
    setMetaTag('property', 'og:description', blog.ogDescription || blog.excerpt || '');
    setMetaTag('property', 'og:image', blog.ogImage || blog.coverImage || '');

    if (blog.canonicalUrl) {
      let canonEl = document.querySelector('link[rel="canonical"]');
      if (!canonEl) {
        canonEl = document.createElement('link');
        canonEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonEl);
      }
      canonEl.setAttribute('href', blog.canonicalUrl);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [blog]);

  const defaultCover = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';

  const formattedDate = blog?.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="blog-details-root">
      <Header activePage="home" />

      <main className="blog-details-main">
        <div className="container">
          <nav className="blog-breadcrumbs">
            <Link to="/"><i className="fa-solid fa-house"></i> Home</Link>
            <span className="separator">/</span>
            <span className="current">Blog Article</span>
          </nav>

          {loading ? (
            <div className="blog-details-loader">
              <i className="fa-solid fa-spinner fa-spin loader-icon"></i>
              <p>Loading full article from database...</p>
            </div>
          ) : error || !blog ? (
            <div className="blog-details-error">
              <i className="fa-solid fa-circle-exclamation error-icon"></i>
              <h2>Article Not Found</h2>
              <p>{error || 'The blog post you are looking for does not exist or was unpublished.'}</p>
              <Link to="/" className="dash-btn dash-btn-primary back-btn">
                <i className="fa-solid fa-arrow-left"></i> Return to Home Page
              </Link>
            </div>
          ) : (
            <article className="blog-article-full">
              <header className="blog-article-header">
                <span className="blog-details-category-pill">
                  {blog.category || 'Learning Resources'}
                </span>

                <h1 className="blog-article-title">{blog.title}</h1>

                <div className="blog-article-meta-row">
                  <div className="meta-item">
                    <i className="fa-solid fa-circle-user"></i>
                    <span>By <strong>{blog.author || 'Smart HomeTutor Academic Team'}</strong></span>
                  </div>
                  <div className="meta-divider">•</div>
                  <div className="meta-item">
                    <i className="fa-regular fa-calendar-check"></i>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="meta-divider">•</div>
                  <div className="meta-item">
                    <i className="fa-regular fa-clock"></i>
                    <span>{blog.readTime || '5 min read'}</span>
                  </div>
                  {typeof blog.views === 'number' && (
                    <>
                      <div className="meta-divider">•</div>
                      <div className="meta-item">
                        <i className="fa-regular fa-eye"></i>
                        <span>{blog.views} Reads</span>
                      </div>
                    </>
                  )}
                </div>
              </header>

              <div className="blog-cover-container">
                <img
                  src={blog.coverImage && blog.coverImage.trim() !== '' ? blog.coverImage : defaultCover}
                  alt={blog.title}
                  className="blog-cover-img"
                  onError={(e) => {
                    e.target.src = defaultCover;
                  }}
                />
              </div>

              {blog.excerpt && (
                <div className="blog-excerpt-callout">
                  <i className="fa-solid fa-quote-left quote-icon"></i>
                  <p>{blog.excerpt}</p>
                </div>
              )}

              <div className="blog-content-body">
                {blog.content && (blog.content.trim().startsWith('<') || blog.content.includes('</')) ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  blog.content.split('\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    return <p key={idx}>{trimmed}</p>;
                  })
                )}
              </div>

              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="blog-tags-row">
                  <span className="tags-label"><i className="fa-solid fa-tags"></i> Related Topics:</span>
                  <div className="tags-list">
                    {blog.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="blog-tag-badge">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <footer className="blog-article-footer">
                <Link to="/" className="dash-btn dash-btn-outline">
                  <i className="fa-solid fa-arrow-left"></i> Back to All Blogs & Home
                </Link>
              </footer>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
