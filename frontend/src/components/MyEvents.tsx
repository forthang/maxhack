import React, { useEffect, useState } from 'react';

interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  signup_count: number;
  signed_up: boolean;
}

/**
 * Компонент «Мои события» отображает список учебных занятий, на которые
 * пользователь записался. Поскольку полноценной аутентификации нет,
 * «signed_up» определяется на бэкенде как ложное, но для демонстрации можно
 * записаться на занятие в расписании, и эта страница отобразит его.
 */
const MyEvents: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyEvents = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/schedule');
      if (resp.ok) {
        const data: ScheduleItem[] = await resp.json();
        // Отфильтровать по признаку signed_up
        const signed = data.filter((i) => i.signed_up);
        setItems(signed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Мои события</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Нет записанных занятий.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <p className="font-medium text-gray-700 dark:text-gray-200">
                {new Date(item.start_time).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                {' — '}
                {new Date(item.end_time).toLocaleString('ru-RU', { timeStyle: 'short' })}
              </p>
              <p className="mt-1 text-gray-800 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;