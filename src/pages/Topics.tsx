import React from 'react';
import { useParams } from 'react-router-dom';

const Topics: React.FC = () => {
  const { topicId } = useParams<{ topicId?: string }>();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display text-primary mb-4">
        {topicId ? `${topicId.charAt(0).toUpperCase() + topicId.slice(1)} Topic Hub` : 'Topics'}
      </h1>
      <p className="text-text-secondary">Genetics, cell biology, physiology, etc. placeholder.</p>
    </div>
  );
};

export default Topics;
