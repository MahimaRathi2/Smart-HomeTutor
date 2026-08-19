import React, { useState } from 'react';

export const ContactFAQ = () => {
  const [openId, setOpenId] = useState(null);

  const leftFaqs = [
    {
      id: 'c1',
      question: 'How can I contact Smart HomeTutor?',
      answer:
        'You can contact us through the enquiry form on this page using your name, contact number, email, enquiry type, and message.',
    },
    {
      id: 'c2',
      question: 'How long does it take to receive a response?',
      answer:
        'Our support team will review your enquiry and respond using the contact details provided in the form.',
    },
    {
      id: 'c3',
      question: 'Can I ask for help finding a tutor?',
      answer:
        'Yes. You can submit a tutor-related enquiry or use the Find Tutors section to search for suitable tutors.',
    },
    {
      id: 'c4',
      question: 'Can I contact Smart HomeTutor about an existing booking?',
      answer:
        'Yes. Include your booking details and issue in the enquiry message so the support team can assist you.',
    },
    {
      id: 'c5',
      question: 'How can i update my tutor/student profile?',
      answer:
        'You can  update your profile details from your account or contact our support team for assistance.',
    },
  ];

  const rightFaqs = [
    {
      id: 'c6',
      question: 'Can I contact support about payment or wallet issues?',
      answer:
        'Yes. Mention the relevant payment, wallet, or transaction details in your enquiry so the issue can be reviewed.',
    },
    {
      id: 'c7',
      question: 'Can tutors contact Smart HomeTutor for support?',
      answer:
        'Yes. Tutors can use the Contact Page to submit enquiries related to tutoring, bookings, profiles, payments, or platform support.',
    },
    {
      id: 'c8',
      question: 'Can I report a problem with the website?',
      answer:
        'Yes. Describe the issue clearly in the Enquiry Details field and provide your contact information.',
    },
    {
      id: 'c9',
      question: 'What information should I include in my enquiry?',
      answer:
        'Include relevant details such as your name, contact information, enquiry type, and a clear description of your issue or request.',
    },
    {
      id: 'c10',
      question: 'Is my contact information kept secure?',
      answer:
        'We take reasonable measures to protect the information you provide through our platform.',
    },
  ];

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="ct-faq-section ct-reveal-on-scroll">
      <div className="ct-faq-container">
        <div className="ct-faq-heading">
          <span>FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to the most common questions about Smart HomeTutor.</p>
        </div>

        <div className="ct-faq-grid">
          {/* Left Column */}
          <div className="ct-faq-column">
            {leftFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className={`ct-faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="ct-faq-question"
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="ct-faq-icon">▾</span>
                  </button>
                  <div className="ct-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="ct-faq-column">
            {rightFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className={`ct-faq-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="ct-faq-question"
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="ct-faq-icon">▾</span>
                  </button>
                  <div className="ct-faq-answer">
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

