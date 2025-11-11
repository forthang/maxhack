import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface EventData {
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'class' | 'event';
  materials?: string | null;
  signup_count?: number;
  signed_up?: boolean;
  id?: number;
}

/**
 * Страница подробной информации об ивенте или занятии. Определяет тип
 * сущности по диапазону идентификатора: ID >= 10000 считается событием,
 * иначе — элементом расписания. Загружает данные с бэкенда и выводит
 * базовую информацию, изображение и ссылку на дополнительные материалы.
 */
const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const numericId = Number(id);
      try {
        // Try to find in events first
        const evResp = await fetch('/api/events?user_id=1');
        if (evResp.ok) {
          const events = await evResp.json();
          const ev = events.find((e: any) => e.id === numericId);
          if (ev) {
            const start = new Date(ev.event_time);
            setEventData({
              id: ev.id,
              title: ev.title,
              description: ev.description,
              date: start.toLocaleDateString('ru-RU', { dateStyle: 'long' }),
              time: start.toLocaleTimeString('ru-RU', { timeStyle: 'short' }),
              type: 'event',
              materials: ev.materials ?? null,
              signup_count: ev.signup_count,
              signed_up: ev.signed_up,
            });
            return;
          }
        }
        // If not found, try schedule
        const schResp = await fetch('/api/schedule');
        if (schResp.ok) {
          const items = await schResp.json();
          const item = items.find((i: any) => i.id === numericId);
          if (item) {
            const start = new Date(item.start_time);
            setEventData({
              title: item.description,
              description: item.description,
              date: start.toLocaleDateString('ru-RU', { dateStyle: 'long' }),
              time: `${start.toLocaleTimeString('ru-RU', { timeStyle: 'short' })} — ${new Date(item.end_time).toLocaleTimeString('ru-RU', { timeStyle: 'short' })}`,
              type: 'class',
            });
            return;
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !eventData) {
    return (
      <div className="p-4 pb-20">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-4">{eventData.title}</h2>
      <img
        src={`https://source.unsplash.com/random/800x400?event,education,${eventData.type}`}
        alt="Изображение события"
        className="mb-4 rounded-lg shadow-md max-w-full"
      />
      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Дата:</strong> {eventData.date}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-4"><strong>Время:</strong> {eventData.time}</p>
      <p className="text-gray-800 dark:text-gray-200 mb-6">{eventData.description}</p>
      {eventData.materials && (
        <a
          href={eventData.materials}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Дополнительные материалы
        </a>
      )}
      {/* Кнопки записи/отписки для событий */}
      {eventData.type === 'event' && eventData.id !== undefined && (
        <div className="mt-4">
          {!eventData.signed_up ? (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={async () => {
                const resp = await fetch(`/api/events/${eventData.id}/signup`, { method: 'POST' });
                if (resp.ok) {
                  // reload event data to update sign up state
                  setLoading(true);
                  setEventData(null);
                  navigate(0);
                }
              }}
            >
              Записаться
            </button>
          ) : (
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={async () => {
                const resp = await fetch(`/api/events/${eventData.id}/unsubscribe`, { method: 'POST' });
                if (resp.ok) {
                  setLoading(true);
                  setEventData(null);
                  navigate(0);
                }
              }}
            >
              Отписаться
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetails;