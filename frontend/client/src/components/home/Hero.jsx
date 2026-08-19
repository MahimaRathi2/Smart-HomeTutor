import React, { useState } from 'react';

export const Hero = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [location, setLocation] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject.trim()) params.append('subject', subject.trim());
    if (grade) params.append('grade', grade);
    if (location.trim()) params.append('location', location.trim());

    window.location.href = `/find?${params.toString()}`;
  };

  return (
    <section className="hero">
      <div className="container hero-container">
        {/* Left Text & Search */}
        <div className="hero-text">
          <h1>
            Unlock Your Potential with <span>Expert Home Tutors</span>
          </h1>

          <p>
            Personalized education designed for your child's success. Connect with verified tutors near you and achieve academic excellence.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="search-box">
            <div className="search-item search-item-subject">
              <label htmlFor="homeSubject">Subject</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-graduation-cap input-icon"></i>
                <input
                  type="text"
                  id="homeSubject"
                  placeholder="e.g., Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="search-item search-item-grade">
              <label htmlFor="homeGrade">Grade</label>
              <div className="input-with-icon">
                <select
                  id="homeGrade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="">Select Grade</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </div>

            <div className="search-item search-item-location">
              <label htmlFor="homeLocation">Location</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-location-dot input-icon"></i>
                <input
                  type="text"
                  id="homeLocation"
                  placeholder="City or Pincode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="search-btn" aria-label="Search Tutors">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Verified Tutor Avatar Badge */}
          <div className="verified">
            <div className="avatars">
              <img src="https://i.pravatar.cc/50?img=1" alt="Tutor 1" />
              <img src="https://i.pravatar.cc/50?img=2" alt="Tutor 2" />
              <img src="https://i.pravatar.cc/50?img=3" alt="Tutor 3" />
            </div>
            <p>
              <strong>500+</strong> Verified Tutors
            </p>
          </div>
        </div>

        {/* Right Hero Image */}
        <div className="hero-image">
          <img src="/images/hero.jpg" alt="Home Tutor" />
        </div>
      </div>
    </section>
  );
};
