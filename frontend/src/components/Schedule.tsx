import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Types representing schedule items (учебные занятия) и события (внеучебные мероприятия).
 * В API расписания присутствуют начало, конец, описание и информация о записи.
 * В API событий присутствуют только время, название и описание. Чтобы унифицировать
 * представление этих сущностей в календарной сетке, мы приводим каждую запись к
 * интерфейсу UnifiedItem. Для событий продолжительность фиксируем на два часа.
 */
interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  signup_count: number;
  signed_up: boolean;
}

interface EventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
}

interface UnifiedItem {
  id: number;
  start: Date;
  end: Date;
  title: string;
  description: string;
  type: 'class' | 'event';
  signup_count?: number;
  signed_up?: boolean;
  // Исходный идентификатор из API. Для событий это id события,
  // для расписания — id занятия. Используется для навигации на страницу подробностей.
  sourceId: number;
}

/**
 * Schedule component отображает недельное расписание в формате сетки: по горизонтали дни
 * текущей недели, по вертикали – часы. События и занятия совмещены в едином
 * представлении и выделяются цветами. Пользователь может записаться на занятие, если оно
 * ещё не выбрано. Все анимации и стили реализованы через утилиты Tailwind и небольшую
 * кастомную CSS‑анимацию fade-in.
 */
const Schedule: React.FC = () => {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Смещение относительно текущей недели. 0 = текущая, -1 = предыдущая, 1 = следующая.
  const [weekOffset, setWeekOffset] = useState<number>(0);
  // Флаг отображения формы создания события
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  // Поля новой записи события
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [newEventDuration, setNewEventDuration] = useState<number>(2);
  const [newEventMaterials, setNewEventMaterials] = useState<string>('');

  // Текущий режим отображения: 'schedule' (сеткой), 'events' (список всех
  // мероприятий), 'my-events' (записанные занятия). По умолчанию — schedule.
  const [view, setView] = useState<'schedule' | 'events' | 'my-events'>('schedule');

  // Идентификаторы расписаний, на которые пользователь подписался. Храним
  // локально в localStorage, чтобы сохранить состояние между сессиями.
  const [signedUpIds, setSignedUpIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('signedUpIds');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Идентификаторы событий, созданных текущим пользователем
  const [createdEventIds, setCreatedEventIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('createdEventIds');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const navigate = useNavigate();

  /**
   * Загрузить данные расписания и событий с бэкенда, а затем привести их к
   * унифицированному виду. Для событий устанавливаем продолжительность равной
   * двум часам.
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleResp, eventsResp] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/events'),
      ]);
      const unified: UnifiedItem[] = [];
      if (scheduleResp.ok) {
        const scheduleData: ScheduleItem[] = await scheduleResp.json();
        scheduleData.forEach((item) => {
        unified.push({
            id: item.id,
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            title: item.description,
            description: item.description,
            type: 'class',
            signup_count: item.signup_count,
            // Определяем подписку локально: бэкенд всегда возвращает false
            signed_up: signedUpIds.includes(item.id),
            sourceId: item.id,
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
            id: ev.id + 10000,
            start,
            end,
            title: ev.title,
            description: ev.description,
            type: 'event',
            sourceId: ev.id,
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

  /**
   * Подписка на занятие. Мы отправляем запрос на backend по известному ID расписания.
   * После успешной записи обновляем данные расписания. Для событий запись не
   * поддерживается.
   */
  const handleSignup = async (item: UnifiedItem) => {
    if (item.type !== 'class') return;
    try {
      const resp = await fetch(`/api/schedule/${item.id}/signup`, {
        method: 'POST',
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.created) {
          // Добавляем ID расписания в локальный список подписок
          if (!signedUpIds.includes(item.id)) {
            const updated = [...signedUpIds, item.id];
            setSignedUpIds(updated);
            try {
              localStorage.setItem('signedUpIds', JSON.stringify(updated));
            } catch {
              /* ignore errors writing to localStorage */
            }
          }
          await loadData();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Вычисляем понедельник текущей недели для базового среза расписания. При этом
   * учитываем локаль: в JavaScript getDay() возвращает 0 для воскресенья, поэтому
   * смещаем индекс, чтобы понедельник был 0.
   */
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = понедельник
  // Вычисляем начало недели с учётом смещения weekOffset
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDayOfWeek + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  // Список дней недели: семь последовательно следующих дат начиная с понедельника
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  /**
   * Приводим все элементы к позиции в сетке. Выбираем только те, что попадают
   * в текущую неделю. Если элемент выходит за пределы недели, он отбрасывается.
   */
  const itemsForGrid = items
    .map((item) => {
      const start = item.start;
      const end = item.end;
      // Проверяем, что событие начинается в пределах недели
      const diffStart = start.getTime() - weekStart.getTime();
      const dayIndex = Math.floor(diffStart / (24 * 60 * 60 * 1000));
      if (dayIndex < 0 || dayIndex > 6) return null;
      const startHour = start.getHours();
      // Количество целых часов, минимум 1
      let span = Math.ceil((end.getTime() - start.getTime()) / (60 * 60 * 1000));
      if (span < 1) span = 1;
      // Ограничиваем, чтобы не выходить за сетку
      if (startHour + span > 24) span = 24 - startHour;
      return {
        ...item,
        dayIndex,
        startHour,
        span,
      };
    })
    .filter(Boolean) as Array<UnifiedItem & { dayIndex: number; startHour: number; span: number }>;

  /**
   * Форматирование заголовка дня. Используем локаль ru-RU и сокращенные названия
   * месяцев и дней недели. Например: «10 Nov, Mon».
   */
  const formatDay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      weekday: 'short',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Расписание</h2>
        {/* Кнопки для навигации по неделям отображаются только в режиме сетки */}
        {view === 'schedule' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Предыдущая неделя"
            >
              &lt;
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Следующая неделя"
            >
              &gt;
            </button>
          </div>
        )}
        {/* Кнопка создания события доступна только в режиме "Мои события" */}
        {view === 'my-events' && (
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm transition-colors"
          >
            {showCreateForm ? 'Отмена' : 'Создать событие'}
          </button>
        )}
      </div>
      {/* Вкладки для переключения между сеткой, всеми событиями и записанными */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { key: 'schedule', label: 'Schedule' },
          { key: 'events', label: 'Events' },
          { key: 'my-events', label: 'My events' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setView(tab.key as 'schedule' | 'events' | 'my-events');
              // Закрываем форму создания события при переключении вкладок
              setShowCreateForm(false);
            }}
            className={`mr-4 pb-2 whitespace-nowrap border-b-2 ${
              view === tab.key ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Содержимое вкладок */}
      {loading ? (
        <p>Загрузка...</p>
      ) : view === 'schedule' ? (
        // Сетка расписания
        <div className="relative overflow-x-auto rounded-lg shadow-inner">
          {/* Обёртка делает ширину адаптивной: календарь не будет сжиматься меньше 900px */}
          <div className="min-w-[900px] relative">
            <div
              className="grid text-sm"
              style={{
                gridTemplateColumns: '80px repeat(7, 1fr)',
                gridTemplateRows: `40px repeat(24, 60px)`,
              }}
            >
              {/* Пустая верхняя левая ячейка */}
              <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
              {/* Заголовки дней */}
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap"
                >
                  {formatDay(day)}
                </div>
              ))}
              {/* Временные строки и пустые ячейки */}
              {Array.from({ length: 24 }).map((_, hour) => (
                <React.Fragment key={hour}>
                  <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 text-right pr-2 text-gray-600 dark:text-gray-400">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {Array.from({ length: 7 }).map((__, col) => (
                    <div
                      key={`${hour}-${col}`}
                      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    ></div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            {/* Контейнер поверх сетки для отображения элементов */}
            <div className="absolute inset-0">
              {itemsForGrid.map((item) => (
                <div
                  key={item.id}
                  className={`fade-in z-10 rounded-md p-2 text-xs font-medium flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
                  style={{
                    position: 'absolute',
                    left: `calc(80px + (100% - 80px) * ${item.dayIndex} / 7)`,
                    top: `${40 + item.startHour * 60}px`,
                    width: 'calc((100% - 80px) / 7)',
                    height: `${item.span * 60}px`,
                    backgroundColor: item.type === 'event' ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                  }}
                  onClick={() => {
                    // Для событий переходим на страницу события. Для занятий
                    // пока подробная страница не реализована, поэтому
                    // клики игнорируем.
                    if (item.type === 'event') {
                      navigate(`/event/${item.sourceId}`);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className="text-xs opacity-80 truncate">{item.description}</div>
                  </div>
                  {item.type === 'class' && (
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="opacity-80">{item.signup_count} записей</span>
                      {item.signed_up ? (
                        <span className="text-green-200">✓</span>
                      ) : (
                        <span
                          className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          Записаться
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : view === 'events' ? (
        // Вкладка "Events" – список всех занятий с возможностью подписки
        <div className="space-y-4">
          {items
            .filter((item) => item.type === 'class')
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .map((item) => (
              <div
                key={item.id}
                className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      {item.start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                      {' — '}
                      {item.end.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
                    </p>
                    <p className="mt-1 font-semibold text-gray-800 dark:text-gray-300">{item.title}</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-400">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {signedUpIds.includes(item.id) ? (
                      <span className="text-green-600 dark:text-green-400 text-sm">Записаны</span>
                    ) : (
                      <button
                        onClick={() => handleSignup(item as any)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Записаться
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/event/${item.sourceId}`)}
                      className="text-blue-600 dark:text-blue-400 text-sm underline"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        // Мои события: занятия, на которые подписался пользователь
        <div className="space-y-4">
          {showCreateForm && (
            <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm space-y-3 fade-in">
              <h3 className="text-lg font-medium mb-2">Новое событие</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Дата и время</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Длительность (часы)</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={newEventDuration}
                  onChange={(e) => setNewEventDuration(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                ></textarea>
              </div>
          <div>
            <label className="block text-sm font-medium mb-1">Материалы (ссылка)</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={newEventMaterials}
              onChange={(e) => setNewEventMaterials(e.target.value)}
            />
          </div>
              <button
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                onClick={async () => {
                  if (!newEventDate || !newEventTitle) return;
                  try {
                    const resp = await fetch('/api/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Передаём дату и время без преобразования в UTC, чтобы
                        // сохранить локальное время пользователя. Бэкенд
                        // интерпретирует эту строку как локальное время при
                        // сохранении.
                        event_time: newEventDate,
                        title: newEventTitle,
                        description: newEventDesc,
                        duration_hours: newEventDuration,
                        materials: newEventMaterials || null,
                      }),
                    });
                    if (resp.ok) {
                      const created = await resp.json();
                      // Сохраняем ID созданного события, чтобы отображать его в "My events"
                      if (created && created.id !== undefined) {
                        const updated = [...createdEventIds, created.id];
                        setCreatedEventIds(updated);
                        try {
                          localStorage.setItem('createdEventIds', JSON.stringify(updated));
                        } catch {
                          /* ignore */
                        }
                      }
                      setNewEventTitle('');
                      setNewEventDesc('');
                      setNewEventMaterials('');
                      setNewEventDate('');
                      setNewEventDuration(2);
                      setShowCreateForm(false);
                      await loadData();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Создать
              </button>
            </div>
          )}
          {items
            .filter(
              (item) =>
                (item.type === 'class' && signedUpIds.includes(item.id)) ||
                (item.type === 'event' && createdEventIds.includes(item.sourceId))
            )
            .map((item) => (
              <div
                key={item.id}
                className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm cursor-pointer"
                onClick={() => {
                  if (item.type === 'event') {
                    navigate(`/event/${item.sourceId}`);
                  }
                }}
              >
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  {item.start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                  {' — '}
                  {item.end.toLocaleString('ru-RU', { timeStyle: 'short' })}
                </p>
                <p className="mt-1 text-gray-800 dark:text-gray-300">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                {item.type === 'event' && <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 underline">Подробнее</p>}
              </div>
            ))}
          {items.filter(
            (item) =>
              (item.type === 'class' && signedUpIds.includes(item.id)) ||
              (item.type === 'event' && createdEventIds.includes(item.sourceId))
          ).length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">Вы ещё не подписались и не создали ни одного события.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedule;