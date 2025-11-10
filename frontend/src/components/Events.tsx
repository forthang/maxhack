import React, { useEffect, useState } from 'react';

interface EventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/events');
      if (resp.ok) {
        const data = await resp.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">События</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="space-y-4 pb-20">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-100 dark:border-gray-700"
            >
              <p className="font-medium text-gray-700 dark:text-gray-200">
                {new Date(e.event_time).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-gray-300">{e.title}</p>
              <p className="mt-1 text-gray-700 dark:text-gray-400">{e.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;