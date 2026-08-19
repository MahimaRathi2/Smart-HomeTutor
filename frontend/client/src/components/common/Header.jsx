import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ activePage = 'home' }) => {
  const { isAuth, userRole, userName } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  let roleTitle = 'Student Panel';
  let roleIcon = 'fa-user-graduate';
  if (userRole === 'tutor') {
    roleTitle = 'Tutor Panel';
    roleIcon = 'fa-chalkboard-user';
  } else if (userRole === 'parent') {
    roleTitle = 'Parent Panel';
    roleIcon = 'fa-users';
  } else if (userRole === 'admin') {
    roleTitle = 'Admin Panel';
    roleIcon = 'fa-user-shield';
  }

  let cleanName = userName || 'User';
  if (cleanName.includes('@')) {
    cleanName = cleanName.split('@')[0];
  }
  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return (
    <header className="react-header">
      <div className="container navbar">
        <div className="logo">
          <a href="/" className="brand-logo-link">
            <img src="/images/logo.png" alt="Smart HomeTutor Logo" className="site-logo-img" />
            <div className="brand-text-stack">
              <span className="brand-smart">Smart</span>
              <span className="brand-hometutor">HomeTutor</span>
            </div>
          </a>
        </div>

        <button
          type="button"
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        <div className={`nav-menu-wrapper ${mobileMenuOpen ? 'active' : ''}`}>
          <nav>
            <ul>
              <li>
                <a href="/" className={activePage === 'home' ? 'active' : ''} onClick={closeMobileMenu}>
                  Home
                </a>
              </li>
              <li>
                <a href="/find" className={activePage === 'find' ? 'active' : ''} onClick={closeMobileMenu}>
                  Find Tutors
                </a>
              </li>
              <li>
                <a href="/subjects" className={activePage === 'subjects' ? 'active' : ''} onClick={closeMobileMenu}>
                  Subjects
                </a>
              </li>
              <li>
                <a href="/tutor" className={activePage === 'tutor' ? 'active' : ''} onClick={closeMobileMenu}>
                  Become a Tutor
                </a>
              </li>
              <li>
                <a href="/contact" className={activePage === 'contact' ? 'active' : ''} onClick={closeMobileMenu}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="buttons">
            {isAuth && userRole ? (
              <>
                <a
                  href={`/dashboard/${userRole}`}
                  className="signup"
                  style={{ fontSize: '13px', textTransform: 'none', fontWeight: 700 }}
                  title={`${cleanName} (${roleTitle})`}
                  onClick={closeMobileMenu}
                >
                  <i className={`fa-solid ${roleIcon}`}></i> {cleanName} ({roleTitle})
                </a>
                <a
                  href="/logout"
                  className="login"
                  style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                  onClick={closeMobileMenu}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </a>
              </>
            ) : (
              <>
                <a href="/signup" className="signup" onClick={closeMobileMenu}>
                  Join Now
                </a>
                <a href="/login" className="login" onClick={closeMobileMenu}>
                  Log in
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
