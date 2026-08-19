import React from 'react';

export const TutorTestimonials = () => {
  const testimonials = [
    {
      name: 'Dr. Ananya Sharma',
      role: 'Mathematics Tutor',
      review:
        '"Teaching on Smart HomeTutor has allowed me to reach motivated students across the city while maintaining full flexibility over my schedule."',
      avatar: '/images/female.jpeg',
      fallback: 'https://ui-avatars.com/api/?name=Ananya+Sharma&background=FEF3C7&color=D97706',
    },
    {
      name: 'Rahul Mehta',
      role: 'Science Tutor',
      review:
        '"The platform handles student matching and trial sessions effortlessly. I can focus entirely on delivering quality tuition."',
      avatar: '/images/tutor3.jpeg',
      fallback: 'https://ui-avatars.com/api/?name=Rahul+Mehta&background=E8EEF5&color=213547',
    },
    {
      name: 'Rosy',
      role: 'English Tutor',
      review:
        '"Connecting with serious learners who value 1-on-1 personalized guidance has helped me build a thriving tutoring practice."',
      avatar: '/images/Rosy.jpg',
      fallback: 'https://ui-avatars.com/api/?name=Rosy&background=FEF3C7&color=D97706',
    },
    {
      name: 'Vikram Singh',
      role: 'Physics Tutor',
      review:
        '"Transparent payouts, verified student requests, and seamless scheduling make Smart HomeTutor the best platform for educators."',
      avatar: '/images/tutor2.jpg',
      fallback: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=E8EEF5&color=213547',
    },
    {
      name: 'Neha Verma',
      role: 'Chemistry Tutor',
      review:
        '"I love the flexibility of offering both online and in-person home tuitions. The steady stream of inquiries keeps my calendar full."',
      avatar: '/images/female.jpeg',
      fallback: 'https://ui-avatars.com/api/?name=Neha+Verma&background=FEF3C7&color=D97706',
    },
  ];

  // Duplicate list for infinite smooth marquee
  const doubleList = [...testimonials, ...testimonials];

  return (
    <section className="tr-testimonials-section">
      <div className="container text-center">
        <div className="tr-section-title">
          <h2>What Our Educator Community Says</h2>
          <p>Hear from passionate tutors who are growing their careers with Smart HomeTutor.</p>
        </div>
      </div>

      <div className="tr-testimonials-wrapper">
        <div className="tr-testimonials-track">
          {doubleList.map((item, idx) => (
            <div key={idx} className="tr-testimonial-card">
              <div className="tr-card-header-row">
                <div className="tr-stars">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <i className="fa-solid fa-quote-right tr-quote-mark"></i>
              </div>
              <p className="tr-card-review-text">{item.review}</p>
              <div className="tr-card-profile-row">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="tr-card-avatar"
                  onError={(e) => {
                    e.target.src = item.fallback;
                  }}
                />
                <div className="tr-card-profile-info">
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
