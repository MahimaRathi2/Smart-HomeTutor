import React, { useState } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const leftFaqs = [
    {
      id: 'l1',
      question: 'What is Smart HomeTutor?',
      answer: 'A platform connecting students with qualified, background-verified home and online tutors for personalized learning.',
    },
    {
      id: 'l2',
      question: 'How can I find a tutor?',
      answer: 'Search by class, subject, location, and specific learning requirements using our intuitive search filter.',
    },
    {
      id: 'l3',
      question: 'Which classes are available?',
      answer: 'Tuition support is available for Classes 1 to 12 as well as competitive examination foundation courses.',
    },
    {
      id: 'l4',
      question: 'Which subjects do you cover?',
      answer: 'All major school subjects including Mathematics, Physics, Chemistry, Biology, English, Hindi, and Entrance Test Prep.',
    },
    {
      id: 'l5',
      question: 'Can I choose my tutor?',
      answer: 'Yes, you can browse verified tutor profiles, review ratings, compare fees, and choose the tutor that best fits your needs.',
    },
  ];

  const rightFaqs = [
    {
      id: 'r1',
      question: 'Can I become a tutor?',
      answer: 'Yes, qualified teachers and subject experts can register as tutors on our platform and start accepting tuition requests.',
    },
    {
      id: 'r2',
      question: 'Are online classes available?',
      answer: 'Yes, both 1-on-1 interactive online tutoring and in-person home tutoring options are available.',
    },
    {
      id: 'r3',
      question: 'Can parents find tutors here?',
      answer: 'Yes, parents can search, evaluate, and directly book trial sessions for their children through dedicated parent features.',
    },
    {
      id: 'r4',
      question: 'How can I become a tutor?',
      answer: 'Click on “Become a Tutor”, register your details, and complete your tutor profile.',
    },
    {
      id: 'r5',
      question: 'How do I get started?',
      answer: 'Simply sign up for a free account, search for tutors matching your requirements, and book a free trial session!',
    },
  ];

  const toggleFaq = (id) => {
    setOpenIndex((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-heading">
          <span>FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to the most common questions about Smart HomeTutor.</p>
        </div>

        <div className="faq-grid">
          {/* Left Column */}
          <div className="faq-column">
            {leftFaqs.map((faq) => {
              const isOpen = openIndex === faq.id;
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question"
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">▾</span>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="faq-column">
            {rightFaqs.map((faq) => {
              const isOpen = openIndex === faq.id;
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question"
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">▾</span>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
