import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Детальная страница курса. В текущей реализации не существует
 * централизованного API для информации о курсах, поэтому компонент
 * выводит лишь идентификатор курса. Кнопка завершения вызывает API
 * бэкенда для начисления наград, аналогично поведению в графе курсов.
 */
const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const completeCourse = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // По умолчанию начисляем 10 XP и 5 монет за курс, как в API профиля
      const resp = await fetch(`/api/profile/courses/${id}/complete?xp=10&coins=5`, { method: 'POST' });
      if (resp.ok) {
        setMessage('Курс завершён! Награды начислены.');
      } else {
        setMessage('Не удалось завершить курс');
      }
    } catch {
      setMessage('Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-4">Курс: {id}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Это демонстрационная страница курса. В реальном приложении здесь будет
        подробное описание, учебные материалы и дополнительные ресурсы.
      </p>
      <button
        onClick={completeCourse}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
      >
        {loading ? 'Завершение...' : 'Завершить курс'}
      </button>
      {message && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{message}</p>}
    </div>
  );
};

export default CourseDetails;