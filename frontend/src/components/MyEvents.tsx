import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Общая структура элемента в разделе «Мои события». Объединяет учебные
 * занятия (расписание) и внеучебные мероприятия. Для занятий возвращается
 * id расписания, дата и описание; для событий — id события, время начала,
 * продолжительность, название и описание.
 */
interface MyItem {
  id: number;
  type: 'class' | 'event';
  start: Date;
  end: Date;
  title: string;
  description: string;
  sourceId: number;
  signedUp: boolean;
}

/**
 * Компонент «Мои события» загружает как занятия, так и внеучебные
 * мероприятия для текущего пользователя (ID=1) и отображает те,
 * на которые он подписался или которые он создал. Пользователь может
 * отписаться от события прямо из этого списка. Для занятий отписка не
 * реализована, поэтому они отображаются без кнопок.
 */
const MyEvents: React.FC = () => {
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadMy = async () => {
    setLoading(true);
    try {
      const [scheduleResp, eventsResp] = await Promise.all([
        fetch('/api/schedule?user_id=1'),
        fetch('/api/events?user_id=1'),
      ]);
      const list: MyItem[] = [];
      if (scheduleResp.ok) {
        const data = await scheduleResp.json();
        data.forEach((it: any) => {
          if (it.signed_up) {
            list.push({
              id: it.id + 10000,
              type: 'class',
              start: new Date(it.start_time),
              end: new Date(it.end_time),
              title: it.description,
              description: it.description,
              sourceId: it.id,
              signedUp: true,
            });
          }
        });
      }
      if (eventsResp.ok) {
        const evData = await eventsResp.json();
        evData.forEach((ev: any) => {
          // include events the user signed up for or created (creator_id is not tracked, so rely on signed_up)
          if (ev.signed_up) {
            const start = new Date(ev.event_time);
            const duration = ev.duration_hours ?? 2;
            const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
            list.push({
              id: ev.id,
              type: 'event',
              start,
              end,
              title: ev.title,
              description: ev.description,
              sourceId: ev.id,
              signedUp: true,
            });
          }
        });
      }
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMy();
  }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Мои события</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Вы ещё не подписались ни на одно занятие или мероприятие.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <p className="font-medium text-gray-700 dark:text-gray-200">
                {item.start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                {' — '}
                {item.end.toLocaleString('ru-RU', { timeStyle: 'short' })}
              </p>
              <p className="mt-1 text-gray-800 dark:text-gray-300 truncate">
                {item.title}
              </p>
              <div className="mt-2 flex justify-between items-center">
                {item.type === 'event' ? (
                  <>
                    <button
                      onClick={() => navigate(`/event/${item.sourceId}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Подробнее
                    </button>
                    <button
                      onClick={async () => {
                        const resp = await fetch(`/api/events/${item.sourceId}/unsubscribe`, { method: 'POST' });
                        if (resp.ok) loadMy();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Отписаться
                    </button>
                  </>
                ) : (
                  <span className="text-green-600 dark:text-green-400 text-sm">Записаны</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;