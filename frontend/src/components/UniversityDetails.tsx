import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface UniversityDetail {
  id: number;
  name: string;
  points: number;
  students: Array<{ id: number; name: string; xp: number; coins: number }>;
}

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Запрашиваем подробные сведения об университете, включая список студентов
        const resp = await fetch(`/api/universities/${id}/details`);
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
          {/* Форма для добавления студента */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Прикрепить студента по ID</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="ID пользователя"
                className="w-32 border border-gray-300 dark:border-gray-600 rounded-md p-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              />
              <button
                onClick={async () => {
                  setError(null);
                  setSuccess(null);
                  const uid = Number(studentIdInput);
                  if (!uid) {
                    setError('Введите корректный ID');
                    return;
                  }
                  try {
                    const resp = await fetch(`/api/universities/${id}/add_student?user_id=${uid}`, { method: 'POST' });
                    if (resp.ok) {
                      const data = await resp.json();
                      if (data.assigned) {
                        setSuccess('Студент успешно добавлен');
                        // Перезагружаем список студентов
                        const reload = await fetch(`/api/universities/${id}/details`);
                        if (reload.ok) {
                          const det = await reload.json();
                          setUniversity(det);
                        }
                      } else {
                        setError('Не удалось добавить студента. Возможно, он уже прикреплён к другому ВУЗу.');
                      }
                    } else {
                      setError('Ошибка запроса');
                    }
                  } catch {
                    setError('Сетевая ошибка');
                  }
                }}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm"
              >
                Добавить
              </button>
            </div>
            {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
            {success && <p className="text-green-600 dark:text-green-400 text-sm mt-1">{success}</p>}
          </div>
          {/* Таблица студентов */}
          <h3 className="text-xl font-medium mb-2">Студенты</h3>
          {university.students && university.students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">ID</th>
                    <th className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">Имя</th>
                    <th className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">XP</th>
                    <th className="px-3 py-2">Монеты</th>
                  </tr>
                </thead>
                <tbody>
                  {university.students.map((s) => (
                    <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-700 text-sm">{s.id}</td>
                      <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-700 text-sm">{s.name}</td>
                      <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-700 text-sm">{s.xp}</td>
                      <td className="px-3 py-1 text-sm">{s.coins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Пока нет студентов в этом вузе.</p>
          )}
        </>
      )}
    </div>
  );
};

export default UniversityDetails;