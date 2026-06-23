import React from 'react';
import { useParams } from 'react-router-dom';

const Classes: React.FC = () => {
  const { classId } = useParams<{ classId?: string }>();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display text-primary mb-4">
        {classId ? `${classId.toUpperCase()} Biology Hub` : 'Classes'}
      </h1>
      <p className="text-text-secondary">SSC, HSC, or Honours biology lessons placeholder.</p>
    </div>
  );
};

export default Classes;
