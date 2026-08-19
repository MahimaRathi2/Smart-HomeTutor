import React, { useRef } from 'react';

export const Testimonials = () => {
  const trackRef = useRef(null);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Parent',
      text: '"Smart HomeTutor helped my daughter find the right tutor within days. Her confidence and performance have improved so much."',
      img: '/images/parent1.jpg',
      fallbackColor: 'D97706',
      fallbackBg: 'FEF3C7',
    },
    {
      name: 'Aarav Mehta',
      role: 'Student',
      text: '"The tutor matching process was simple, and the classes are well structured. I finally enjoy studying Mathematics."',
      img: '/images/parent2.jpg',
      fallbackColor: '213547',
      fallbackBg: 'E8EEF5',
    },
    {
      name: 'Dr. Sunita Rao',
      role: 'School Coordinator',
      text: '"As an educator, I highly recommend Smart HomeTutor. Their verified tutors are thoroughly background-checked, punctual, and skilled."',
      img: '/images/Rosy.jpg',
      fallbackColor: 'D97706',
      fallbackBg: 'FEF3C7',
    },
    {
      name: 'Rajesh Varma',
      role: 'Parent',
      text: '"We needed an urgent JEE Advanced tutor for our son. The platform connected us with an IITian tutor who made complex concepts intuitive."',
      img: '/images/tutor2.jpg',
      fallbackColor: '213547',
      fallbackBg: 'E8EEF5',
    },
    {
      name: 'Ananya Gupta',
      role: 'Student',
      text: '"My English tutor helped me speak fluently and improve my creative writing skills. The 1-on-1 personalized attention made all the difference."',
      img: '/images/female.jpeg',
      fallbackColor: 'D97706',
      fallbackBg: 'FEF3C7',
    },
    {
      name: 'Vikramaditya Sen',
      role: 'Teacher',
      text: '"Teaching through Smart HomeTutor has been a smooth and rewarding experience. The platform handles scheduling and communication effortlessly."',
      img: '/images/tutor3.jpeg',
      fallbackColor: '213547',
      fallbackBg: 'E8EEF5',
    },
  ];

  // Duplicated array for seamless infinite marquee loop
  const allCards = [...testimonials, ...testimonials];

  const shiftTrack = (direction) => {
    if (!trackRef.current) return;
    const style = window.getComputedStyle(trackRef.current);
    const matrix = new WebKitCSSMatrix(style.transform);
    const amount = direction === 'left' ? 380 : -380;
    trackRef.current.style.animationPlayState = 'paused';
    trackRef.current.style.transform = `translateX(${matrix.m41 + amount}px)`;
    setTimeout(() => {
      if (trackRef.current) {
        trackRef.current.style.animationPlayState = 'running';
      }
    }, 2500);
  };

  return (
    <section className="trusted-section" id="reviews">
      <div className="container">
        <div className="trusted-header">
          <span className="section-tag">TESTIMONIALS</span>
          <h2 className="trusted-title">Trusted by Families and Schools Everywhere</h2>
          <p className="trusted-subtitle">Hear from students, parents, and educators who trust Smart HomeTutor.</p>
        </div>
      </div>

      <div className="testimonial-marquee-wrapper">
        <div className="testimonial-marquee-track" ref={trackRef} id="testimonialMarqueeTrack">
          {allCards.map((item, idx) => (
            <div key={idx} className="testimonial-marquee-card">
              <div className="card-header-row">
                <div className="stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <i className="fa-solid fa-quote-right quote-mark"></i>
              </div>

              <p className="card-review-text">{item.text}</p>

              <div className="card-profile-row">
                <img
                  src={item.img}
                  alt={item.name}
                  className="card-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${item.fallbackBg}&color=${item.fallbackColor}`;
                  }}
                />
                <div className="card-profile-info">
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="marquee-controls">
        <button
          type="button"
          className="marquee-ctrl-btn"
          onClick={() => shiftTrack('left')}
          aria-label="Previous Testimonial"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button
          type="button"
          className="marquee-ctrl-btn"
          onClick={() => shiftTrack('right')}
          aria-label="Next Testimonial"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  );
};
