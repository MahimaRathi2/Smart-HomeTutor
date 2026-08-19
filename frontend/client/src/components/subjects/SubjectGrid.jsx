import React from 'react';
import { SubjectCard } from './SubjectCard';

export const SubjectGrid = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="sb-empty-state">
        <i className="fa-solid fa-magnifying-glass-minus"></i>
        <h3>No subjects or classes found</h3>
        <p>Try searching for another subject like "Physics", "Mathematics", or "Class 10".</p>
      </div>
    );
  }

  return (
    <div className="sb-subject-grid">
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
};
