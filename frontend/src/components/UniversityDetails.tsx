import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface University {
  id: number;
  name: string;
  points: number;
}

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const resp = await fetch(`/api/universities/${id}`);
        if (resp.ok) {
          const data = await resp.json();
          setUniversity(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="p-4 pb-20 fade-in">
      {loading || !university ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">{university.name}</h2>
          <p className="text-lg mb-2">Баллы: {university.points}</p>
          <p className="text-gray-700 dark:text-gray-300">
            Здесь могла бы быть дополнительная информация об университете, такая как история,
            список факультетов или ссылки на официальный сайт.
          </p>
        </>
      )}
    </div>
  );
};

export default UniversityDetails;