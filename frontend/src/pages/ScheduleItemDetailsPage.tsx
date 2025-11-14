import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScheduleItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-4">Детали занятия {id}</h2>
      <p>Эта страница находится в разработке.</p>
    </div>
  );
};

export default ScheduleItemDetailsPage;
