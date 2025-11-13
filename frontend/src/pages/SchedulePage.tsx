import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/common/EventCard';
import CreateEventForm from '../components/common/CreateEventForm';
import UploadSchedule from '../components/common/UploadSchedule';
import { UserContext } from '../context/AppContext';
import CreateClassForm from '../components/common/CreateClassForm';

interface UnifiedItem {
  id: number;
  start: Date;
  end: Date;
  title: string;
  description: string;
  type: 'class' | 'event';
  signup_count?: number;
  signed_up?: boolean;
  sourceId: number;
  auditorium?: string;
}

const Schedule: React.FC = () => {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showCreateClassForm, setShowCreateClassForm] = useState<boolean>(false);
  const [view, setView] = useState<'schedule' | 'events' | 'my-events'>('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const loadData = async () => {
    if (!currentUser?.id || !currentUser.group_id) return; // Don't load if no user or group

    setLoading(true);
    try {
      const [scheduleResp, eventsResp] = await Promise.all([
        fetch(`/api/schedule?user_id=${currentUser.id}`),
        fetch(`/api/events?user_id=${currentUser.id}`),
      ]);
      let unified: UnifiedItem[] = [];
      if (scheduleResp.ok) {
        const scheduleData: any[] = await scheduleResp.json();
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
          });
        });
      }
      if (eventsResp.ok) {
        const eventsData: any[] = await eventsResp.json();
        eventsData.forEach((ev) => {
          const start = new Date(ev.event_time);
          const duration = ev.duration_hours ?? 2;
          const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
          unified.push({
            id: ev.id + 100000,
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

      const now = new Date();
      unified = unified.filter(item => item.end > now);
      setItems(unified);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser]);

  const handleEventCreated = async () => {
    setShowCreateForm(false);
    await loadData();
  };
  
  const handleScheduleUploaded = async () => {
    setShowUploadForm(false);
    await loadData();
  }

  const handleClassCreated = async () => {
    setShowCreateClassForm(false);
    await loadData();
  }

  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek + weekOffset * 7);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const formatDay = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const renderScheduleGrid = () => {
    if (!currentUser?.group_id) {
      return (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">У вас пока нет расписания.</p>
          <p className="text-md text-gray-500 dark:text-gray-500">Присоединитесь к группе на странице 'Лидеры', чтобы увидеть свое расписание.</p>
        </div>
      )
    }

    const itemsForGrid = items
      .filter(item => {
        const isClass = item.type === 'class';
        const isSignedUpEvent = item.type === 'event' && item.signed_up;
        const isInWeek = item.start >= weekStart && item.start < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return (isClass || isSignedUpEvent) && isInWeek;
      })
      .map((item) => {
        const dayIndex = (item.start.getDay() + 6) % 7;
        const scheduleVisibleStartHour = 7;
        let itemVisibleStart = new Date(item.start);
        if (itemVisibleStart.getHours() < scheduleVisibleStartHour) {
          itemVisibleStart.setHours(scheduleVisibleStartHour, 0, 0, 0);
        }
        let visibleSpan = (item.end.getTime() - itemVisibleStart.getTime()) / (60 * 60 * 1000);
        if (visibleSpan < 0) visibleSpan = 0;
        const topPosition = 40 + (itemVisibleStart.getHours() - scheduleVisibleStartHour) * 60 + itemVisibleStart.getMinutes();
        const heightPosition = visibleSpan * 60;
        return { ...item, dayIndex, topPosition, heightPosition };
      });

    return (
      <div className="relative overflow-x-auto rounded-lg shadow-inner">
        <div className="min-w-[900px] relative">
          <div
            className="grid text-sm"
            style={{ gridTemplateColumns: '80px repeat(7, 1fr)', gridTemplateRows: `40px repeat(18, 60px)` }}
          >
            <div className="sticky left-0 z-20 bg-white dark:bg-gray-900 h-10 flex items-center justify-center border-b border-r border-gray-200 dark:border-gray-700"></div>
            {days.map((day, idx) => (
              <div key={idx} className="sticky top-0 z-10 bg-white dark:bg-gray-900 h-10 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{formatDay(day)}</span>
              </div>
            ))}
            {Array.from({ length: 18 }).map((_, hourOffset) => {
              const hour = (7 + hourOffset) % 24;
              return (
                <React.Fragment key={hour}>
                  <div className="sticky left-0 z-10 bg-white dark:bg-gray-900 h-[60px] flex items-start justify-center pt-2 border-r border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{hour}:00</span>
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIdx) => (
                    <div key={dayIdx} className="h-[60px] border-b border-gray-100 dark:border-gray-800"></div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
          <div className="absolute inset-0">
            {itemsForGrid.map((item) => (
              <div
                key={item.id}
                className="fade-in z-10 rounded-md p-2 text-xs font-medium flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                style={{
                  position: 'absolute',
                  left: `calc(80px + (100% - 80px) * ${item.dayIndex} / 7)`,
                  top: `${item.topPosition}px`,
                  width: 'calc((100% - 80px) / 7)',
                  height: `${item.heightPosition}px`,
                  backgroundColor: item.type === 'event' ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                  color: 'white',
                }}
                onClick={() => navigate(item.type === 'event' ? `/event/${item.sourceId}` : `/schedule/${item.sourceId}`)}
              >
                <div className="flex-1">
                  <div className="font-semibold truncate">{item.title}</div>
                  {item.auditorium && <div className="text-[10px] opacity-70 truncate">{item.auditorium}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEventsList = () => {
    const filteredEvents = items.filter(item => 
      item.type === 'event' && 
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-4 pb-20">
        <input
          type="text"
          placeholder="Поиск по событиям..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
          {filteredEvents.map(item => (
            <div key={item.id}>
              <EventCard
                start={item.start}
                end={item.end}
                title={item.title}
                description={item.description}
                auditorium={item.auditorium}
                onDetails={() => navigate(`/event/${item.sourceId}`)}
                signedUp={item.signed_up}
                onSignup={!item.signed_up && currentUser?.id
                    ? async () => {
                        const resp = await fetch(`/api/events/${item.sourceId}/signup`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: currentUser.id }),
                        });
                        if (resp.ok) await loadData();
                      }
                    : undefined}
                onUnsubscribe={item.signed_up && currentUser?.id
                    ? async () => {
                        const resp = await fetch(`/api/events/${item.sourceId}/unsubscribe`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: currentUser.id }),
                        });
                        if (resp.ok) await loadData();
                      }
                    : undefined}
              />
            </div>
          ))}
      </div>
    );
  }

  const renderMyEvents = () => (
    <div className="space-y-4 pb-20">
      <div className="flex space-x-2">
        <button onClick={() => { setShowCreateForm(p => !p); setShowUploadForm(false); setShowCreateClassForm(false); }} className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">
          {showCreateForm ? 'Отмена' : 'Создать событие'}
        </button>
        <button onClick={() => { setShowUploadForm(p => !p); setShowCreateForm(false); setShowCreateClassForm(false); }} className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm">
          {showUploadForm ? 'Отмена' : 'Загрузить (Excel)'}
        </button>
        <button onClick={() => { setShowCreateClassForm(p => !p); setShowCreateForm(false); setShowUploadForm(false); }} className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm">
          {showCreateClassForm ? 'Отмена' : 'Добавить пару'}
        </button>
      </div>
      {showCreateForm && <CreateEventForm onCreated={handleEventCreated} />}
      {showUploadForm && <UploadSchedule onUploaded={handleScheduleUploaded} />}
      {showCreateClassForm && <CreateClassForm onCreated={handleClassCreated} />}
      
      <h3 className="text-xl font-semibold pt-4">Мои события</h3>
          {items.filter(item => item.type === 'event' && item.signed_up).length > 0 ? items.filter(item => item.type === 'event' && item.signed_up).map(item => (
            <div key={item.id}>
            <EventCard
              {...item}
              onDetails={() => navigate(`/event/${item.sourceId}`)}
              onUnsubscribe={currentUser?.id ? async () => {
                const resp = await fetch(`/api/events/${item.sourceId}/unsubscribe`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user_id: currentUser.id }),
                });
                if (resp.ok) await loadData();
              } : undefined}
            />
            </div>
          )) : <p className="text-gray-500">Вы не записаны на события.</p>}
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Расписание</h2>
        {view === 'schedule' && (
          <div className="flex space-x-2">
            <button onClick={() => setWeekOffset(p => p - 1)} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">&lt;</button>
            <button onClick={() => setWeekOffset(p => p + 1)} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">&gt;</button>
          </div>
        )}
      </div>
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { key: 'schedule', label: 'Расписание' },
          { key: 'events', label: 'События' },
          { key: 'my-events', label: 'Мои записи' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as any)}
            className={`mr-4 pb-2 whitespace-nowrap border-b-2 ${view === tab.key ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? <p>Загрузка...</p> : 
       view === 'schedule' ? renderScheduleGrid() :
       view === 'events' ? renderEventsList() :
       renderMyEvents()}
    </div>
  );
};

export default Schedule;
