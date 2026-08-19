import React from 'react';
import { Link } from 'react-router-dom';

export const SubjectCard = ({ subject }) => {
  const { icon, title, badge, topics, link } = subject;

  return (
    <div className="sb-card">
      <div className="sb-card-accent-bar"></div>
      <div className="sb-card-header">
        <div className="sb-subject-icon-box">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="sb-subject-title-area">
          <h3>{title}</h3>
          <span className="sb-subject-badge">{badge}</span>
        </div>
      </div>
      <ul className="sb-topic-list">
        {topics.map((topic, idx) => {
          const topicName = typeof topic === 'string' ? topic : topic.name;

          return (
            <li key={idx}>
              <i className="fa-solid fa-angle-right sb-topic-arrow"></i> {topicName}
            </li>
          );
        })}
      </ul>
      <div className="sb-card-footer-action">
        <Link to={link} className="sb-explore-subject-btn">
          Explore <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};
