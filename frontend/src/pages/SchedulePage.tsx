import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Common reusable UI components
import ClassCard from '../components/common/ClassCard';
import EventCard from '../components/common/EventCard';
import CreateEventForm from '../components/common/CreateEventForm';
import Spinner from '../components/common/Spinner';

// Types
interface BackendScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  auditorium: string | null;
  group_id: number | null;
}

interface BackendEventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
  duration_hours: number;
  auditorium: string | null;
  signup_count: number | null;
  signed_up: boolean | null;
}

interface UnifiedItem {
  id: number; // Unique ID for React key
  start: Date;
  end: Date;
  title: string;
  description: string;
  type: 'class' | 'event';
  signup_count?: number | null;
  signed_up?: boolean | null;
  sourceId: number; // Original ID from the backend
  auditorium?: string | null;
}

const SchedulePage: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [view, setView] = useState<'schedule' | 'events' | 'my-events'>('schedule');

  const loadData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [scheduleResp, eventsResp] = await Promise.all([
        fetch(`/api/schedule?user_id=${currentUser.id}`),
        fetch(`/api/events?user_id=${currentUser.id}`),
      ]);
      
      const unified: UnifiedItem[] = [];

      if (scheduleResp.ok) {
        const scheduleData: BackendScheduleItem[] = await scheduleResp.json();
        scheduleData.forEach((item) => {
          unified.push({
            id: item.id,
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            title: item.description,
            description: item.description,
            type: 'class',
            sourceId: item.id,
            auditorium: item.auditorium,
            signed_up: false, 
          });
        });
      }

      if (eventsResp.ok) {
        const eventsData: BackendEventItem[] = await eventsResp.json();
        eventsData.forEach((ev) => {
          const start = new Date(ev.event_time);
          const duration = ev.duration_hours ?? 2;
          const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
          unified.push({
            id: ev.id + 10000,
            start,
            end,
            title: ev.title,
            description: ev.description,
            type: 'event',
            signup_count: ev.signup_count,
            signed_up: ev.signed_up,
            sourceId: ev.id,
            auditorium: ev.auditorium,
          });
        });
      }
      setItems(unified);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleEventCreated = async () => {
    setShowCreateForm(false);
    await loadData();
  };

  const handleEventSignup = async (item: UnifiedItem) => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/events/${item.sourceId}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      if (resp.ok) await loadData();
    } catch (e) { console.error(e); }
  };

  const handleEventUnsubscribe = async (item: UnifiedItem) => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/events/${item.sourceId}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      if (resp.ok) await loadData();
    } catch (e) { console.error(e); }
  };

  // Grid rendering logic
  const GRID_START_HOUR = 7;
  const GRID_END_HOUR = 23; // Display up to 22:xx
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDayOfWeek + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const itemsForGrid = items
    .map((item) => {
      const start = item.start;
      const end = item.end;
      const diffStart = start.getTime() - weekStart.getTime();
      const dayIndex = Math.floor(diffStart / (24 * 60 * 60 * 1000));
      
      const startHour = start.getHours() + start.getMinutes() / 60;
      const endHour = end.getHours() + end.getMinutes() / 60;

      if (dayIndex < 0 || dayIndex > 6 || endHour < GRID_START_HOUR || startHour > GRID_END_HOUR) {
        return null;
      }
      
      const top = (startHour - GRID_START_HOUR) * 60; // 60px per hour
      const height = (endHour - startHour) * 60;

      return { ...item, dayIndex, top, height };
    })
    .filter(Boolean) as Array<UnifiedItem & { dayIndex: number; top: number; height: number }>;

  const formatDay = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', weekday: 'short' });
  };

  // Render logic
  if (!currentUser || !currentUser.group_id) {
    return (
        <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Расписание пусто</h2>
            <p className="text-gray-600 dark:text-gray-400">Присоединитесь к группе, чтобы увидеть расписание.</p>
        </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Расписание</h2>
        {view === 'schedule' && (
          <div className="flex space-x-2">
            <button onClick={() => setWeekOffset((p) => p - 1)} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">&lt;</button>
            <button onClick={() => setWeekOffset((p) => p + 1)} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">&gt;</button>
          </div>
        )}
        {view === 'my-events' && (
          <button onClick={() => setShowCreateForm((p) => !p)} className="px-4 py-1 rounded bg-blue-600 text-white text-sm">{showCreateForm ? 'Отмена' : 'Создать событие'}</button>
        )}
      </div>
      
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button onClick={() => setView('schedule')} className={`mr-4 pb-2 whitespace-nowrap border-b-2 transition-colors ${view === 'schedule' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-brand/80'}`}>Сетка</button>
        <button onClick={() => setView('events')} className={`mr-4 pb-2 whitespace-nowrap border-b-2 transition-colors ${view === 'events' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-brand/80'}`}>События</button>
        <button onClick={() => setView('my-events')} className={`mr-4 pb-2 whitespace-nowrap border-b-2 transition-colors ${view === 'my-events' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-brand/80'}`}>Мои события</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {view === 'schedule' && (
            <div className="relative overflow-x-auto rounded-lg shadow-inner bg-white dark:bg-gray-900">
              <div className="min-w-[900px] relative">
                <div className="grid text-sm" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', gridTemplateRows: `40px repeat(${GRID_END_HOUR - GRID_START_HOUR}, 60px)` }}>
                  <div className="sticky top-0 z-20 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
                  {days.map((day, idx) => <div key={idx} className="sticky top-0 z-20 text-center p-2 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200">{formatDay(day)}</div>)}
                  {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }).map((_, i) => {
                    const hour = GRID_START_HOUR + i;
                    return (
                      <React.Fragment key={hour}>
                        <div className="text-right pr-2 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{String(hour).padStart(2, '0')}:00</div>
                        {Array.from({ length: 7 }).map((__, col) => <div key={`${hour}-${col}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>)}
                      </React.Fragment>
                    )
                  })}
                </div>
                <div className="absolute top-[40px] left-[80px] right-0 bottom-0">
                  {itemsForGrid.map((item) => (
                    <div
                      key={item.id}
                      className="fade-in absolute z-10 rounded-md p-2 text-xs font-medium flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      style={{
                        left: `calc((100% / 7) * ${item.dayIndex})`,
                        top: `${item.top}px`,
                        width: 'calc(100% / 7)',
                        height: `${item.height}px`,
                        backgroundColor: item.type === 'event' ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                        color: 'white',
                      }}
                      onClick={() => navigate(item.type === 'event' ? `/event/${item.sourceId}`: `/schedule/${item.sourceId}`)}
                    >
                      <div className="font-semibold truncate">{item.title}</div>
                      {item.auditorium && <div className="text-[10px] opacity-70 truncate">{item.auditorium}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {view === 'events' && (
            <div className="space-y-4">
              {items.filter(i => i.type === 'event').sort((a, b) => a.start.getTime() - b.start.getTime()).map(item => (
                <EventCard
                  key={item.id}
                  {...item}
                  onDetails={() => navigate(`/event/${item.sourceId}`)}
                  onSignup={() => handleEventSignup(item)}
                  onUnsubscribe={() => handleEventUnsubscribe(item)}
                />
              ))}
            </div>
          )}
          {view === 'my-events' && (
            <div className="space-y-4">
              {showCreateForm && <CreateEventForm onCreated={handleEventCreated} />}
              {items.filter(i => i.signed_up).map(item => (
                <EventCard
                  key={item.id}
                  {...item}
                  onDetails={() => navigate(`/event/${item.sourceId}`)}
                  onUnsubscribe={() => handleEventUnsubscribe(item)}
                />
              ))}
              {items.filter(i => i.signed_up).length === 0 && <p className="text-gray-500">Вы не записаны ни на одно событие.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchedulePage;
