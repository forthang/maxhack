import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

interface ClassData {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  auditorium?: string | null;
}

const ScheduleItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id || !currentUser) return;
      try {
        // This is inefficient, but matches the old design's logic.
        // A dedicated backend endpoint would be better.
        const resp = await fetch(`/api/schedule?user_id=${currentUser.id}`);
        if (resp.ok) {
          const data: any[] = await resp.json();
          const item = data.find((i: any) => i.id === Number(id));
          if (item) {
            setClassData(item);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser]);

  if (loading) {
    return <div className="p-4 pb-20">Загрузка...</div>;
  }
  
  if (!classData) {
    return <div className="p-4 pb-20">Занятие не найдено.</div>;
  }

  const start = new Date(classData.start_time);
  const end = new Date(classData.end_time);
  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-2">{classData.description}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong>Дата:</strong> {start.toLocaleDateString('ru-RU', { dateStyle: 'long' })}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong>Время:</strong> {start.toLocaleTimeString('ru-RU', { timeStyle: 'short' })} — {end.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
      </p>
      {classData.auditorium && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <strong>Аудитория:</strong> {classData.auditorium}
        </p>
      )}
    </div>
  );
};

export default ScheduleItemDetailsPage;