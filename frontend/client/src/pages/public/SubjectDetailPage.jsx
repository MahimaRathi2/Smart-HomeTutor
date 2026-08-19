import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';

export const SubjectDetailPage = () => {
  const { subjectSlug } = useParams();
  const slug = (subjectSlug || '').toLowerCase();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectSlug]);

  const subjectMap = {
    mathematics: {
      title: 'Mathematics Tuition',
      tagline: 'Master Algebra, Calculus, Geometry, and Board Exam Problem Solving',
      icon: 'fa-calculator',
      description:
        'Comprehensive home and online tutoring for CBSE, ICSE, State, and IB Mathematics across all grades (Class 1 to 12 & Competitive Foundation).',
      topics: [
        'Algebra & Trigonometry',
        'Calculus & Derivatives',
        'Geometry & Mensuration',
        'Statistics & Probability',
        'Board Exam Special Preparation',
      ],
      grades: 'Class 1 to 12 & Competitive Coaching',
    },
    science: {
      title: 'Science & STEM Tuition',
      tagline: 'Explore Physics, Chemistry, Biology with Conceptual Clarity',
      icon: 'fa-flask-vial',
      description:
        'Hands-on, concept-driven learning for Physics, Chemistry, and Biology tailored for Board Exams (CBSE/ICSE) and Foundation Olympiads.',
      topics: [
        'Physics Mechanics & Electricity',
        'Organic & Inorganic Chemistry',
        'Cell Biology & Genetics',
        'Environmental Science & Lab Practical Guidance',
      ],
      grades: 'Class 6 to 12 Specializations',
    },
    languages: {
      title: 'Languages & Communication',
      tagline: 'English, Hindi, French, Sanskrit & Regional Language Excellence',
      icon: 'fa-language',
      description:
        'Interactive language tutoring focused on grammar, vocabulary, reading comprehension, essay writing, and verbal fluency.',
      topics: [
        'English Literature & Grammar',
        'Hindi Vyakaran & Sahitya',
        'French & Foreign Languages',
        'Sanskrit & Regional Languages',
      ],
      grades: 'All Grades & Spoken Language Training',
    },
    'test-prep': {
      title: 'Test Preparation & Entrance Exams',
      tagline: 'JEE, NEET, Olympiads, CUET & Board Exam Intensive Coaching',
      icon: 'fa-award',
      description:
        'Targeted competitive entrance exam strategy, mock test series, speed techniques, and time management coaching.',
      topics: [
        'JEE Main & Advanced Coaching',
        'NEET Medical Preparation',
        'CUET & University Entrances',
        'NTSE, Olympiads & Foundation Prep',
      ],
      grades: 'Class 8 to 12 & Dropper Batches',
    },
  };

  const subject = subjectMap[slug] || {
    title: (slug ? slug.toUpperCase() : 'SUBJECT') + ' Tuition',
    tagline: 'Personalized Home & Online Tutoring',
    icon: 'fa-book-open',
    description: `Expert home and online tutors for ${slug}.`,
    topics: ['Curriculum Coverage', 'Exam Preparation', 'Homework & Doubts'],
    grades: 'Class 1 to 12',
  };

  return (
    <div className="sb-page-root">
      <Header activePage="subjects" />

      {/* HERO */}
      <section className="sb-detail-hero">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="sb-detail-icon-circle">
            <i className={`fa-solid ${subject.icon || 'fa-book-open'}`}></i>
          </div>
          <span className="sb-detail-tag">SPECIALIZED SUBJECT TUITION</span>
          <h1 className="sb-detail-title">{subject.title}</h1>
          <p className="sb-detail-subtitle">{subject.tagline}</p>
        </div>
      </section>

      {/* CONTENT & ACTION PANEL */}
      <section className="container" style={{ padding: '60px 0 90px' }}>
        <div className="sb-detail-grid">
          {/* LEFT COLUMN: SUBJECT DETAILS */}
          <div>
            <div className="sb-detail-box">
              <h3>Overview & Approach</h3>
              <p>{subject.description}</p>
            </div>

            <div className="sb-detail-box">
              <h3>Key Curriculum Topics Covered</h3>
              <div className="sb-topics-grid">
                {subject.topics &&
                  subject.topics.map((topic, idx) => (
                    <div key={idx} className="sb-topic-badge-item">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>{topic}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION SIDEBAR */}
          <div>
            <div className="sb-sidebar-card">
              <h3>Find Tutors for {subject.title}</h3>
              <p>
                Browse verified home and online tutors specializing in {subject.title} for{' '}
                {subject.grades}.
              </p>

              <Link
                to={`/find?subject=${encodeURIComponent(slug)}`}
                className="sb-sidebar-btn primary"
              >
                <i className="fa-solid fa-magnifying-glass"></i> Browse {subject.title} Tutors
              </Link>

              <Link
                to="/contact"
                className="sb-sidebar-btn secondary"
              >
                <i className="fa-solid fa-paper-plane"></i> Submit Tutor Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
