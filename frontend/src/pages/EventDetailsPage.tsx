import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../components/layout/App';
import ReviewForm from '../components/common/ReviewForm'; // Import ReviewForm
import ReviewList from '../components/common/ReviewList'; // Import ReviewList
import { ReviewOut } from '../types/review'; // Import ReviewOut type

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
  auditorium?: string | null;
  duration_hours?: number; // Add duration_hours
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
  const { currentUserId } = useContext(UserContext);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 2,
    materials: '',
    auditorium: '',
  });
  const [reviews, setReviews] = useState<ReviewOut[]>([]); // State for reviews
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Function to load reviews
  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const resp = await fetch(`/api/events/${id}/reviews`);
      if (resp.ok) {
        const data = await resp.json();
        setReviews(data);
      } else {
        console.error(`Failed to load reviews for event ${id}: ${resp.status}`);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };


  useEffect(() => {
    const loadEventAndReviews = async () => { // Combined loading function
      if (!id) return;
      const numericId = Number(id);
      setLoading(true);
      try {
        // Try to find in events first
        const evResp = await fetch(`/api/events?user_id=${currentUserId}`);
        if (evResp.ok) {
          const events = await evResp.json();
          const ev = events.find((e: any) => e.id === numericId);
          if (ev) {
            const start = new Date(ev.event_time);
            setEventData({
              id: ev.id,
              title: ev.title,
              description: ev.description,
              date: start.toISOString().split('T')[0], // Store as YYYY-MM-DD
              time: start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }), // Store as HH:mm
              type: 'event',
              materials: ev.materials ?? null,
              signup_count: ev.signup_count,
              signed_up: ev.signed_up,
              auditorium: ev.auditorium ?? null,
              duration_hours: ev.duration_hours, // Ensure duration_hours is available for editing
            });
            await loadReviews(); // Load reviews after event data is set
            return;
          }
        }
        // If event not found, try schedule (classes don't have reviews yet)
        const schResp = await fetch(`/api/schedule?user_id=${currentUserId}`);
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
            // No reviews for classes, so no loadReviews() call here
            return;
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadEventAndReviews();
  }, [id, currentUserId]);

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
      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Дата:</strong> {new Date(eventData.date).toLocaleDateString('ru-RU', { dateStyle: 'long' })}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Время:</strong> {eventData.time}</p>
      {eventData.auditorium && (
        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Аудитория:</strong> {eventData.auditorium}</p>
      )}
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
      {/* Actions for events: sign up/unsubscribe and edit */}
      {eventData.type === 'event' && eventData.id !== undefined && (
        <div className="mt-4 space-x-2">
          {/* Edit button */}
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            onClick={() => {
              setEditFields({
                title: eventData.title,
                description: eventData.description,
                date: eventData.date, // Already YYYY-MM-DD
                time: eventData.time, // Already HH:mm
                duration: eventData.duration_hours || 2, // Use existing duration if available
                materials: eventData.materials || '',
                auditorium: eventData.auditorium || '',
              });
              setEditMode(true);
            }}
          >
            Редактировать
          </button>
        </div>
      )}
      {editMode && eventData.id !== undefined && (
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2">Редактировать событие</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium">Название</label>
            <input
              type="text"
              value={editFields.title}
              onChange={(e) => setEditFields((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Описание</label>
            <textarea
              value={editFields.description}
              onChange={(e) => setEditFields((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Дата</label>
              <input
                type="date"
                value={editFields.date}
                onChange={(e) => setEditFields((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Время</label>
              <input
                type="time"
                value={editFields.time}
                onChange={(e) => setEditFields((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Длительность (часы)</label>
            <input
              type="number"
              value={editFields.duration}
              onChange={(e) => setEditFields((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min={1}
              max={24}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Аудитория</label>
            <input
              type="text"
              value={editFields.auditorium}
              onChange={(e) => setEditFields((prev) => ({ ...prev, auditorium: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Материалы</label>
            <input
              type="text"
              value={editFields.materials}
              onChange={(e) => setEditFields((prev) => ({ ...prev, materials: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={async () => {
                const eventDateTime = new Date(`${editFields.date}T${editFields.time}`);
                const payload: any = {
                  event_time: eventDateTime.toISOString(),
                  title: editFields.title,
                  description: editFields.description,
                  duration_hours: editFields.duration,
                };
                if (editFields.materials) payload.materials = editFields.materials;
                if (editFields.auditorium) payload.auditorium = editFields.auditorium;
                const resp = await fetch(`/api/events/${eventData.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (resp.ok) {
                  setEditMode(false);
                  setLoading(true);
                  setEventData(null); // Clear event data to force re-fetch
                  loadReviews(); // Re-fetch reviews as well
                  // navigate(0); // This reloads the whole page, consider a better way
                }
              }}
            >
              Сохранить
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              onClick={() => setEditMode(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {eventData.type === 'event' && eventData.id !== undefined && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Отзывы</h3>
          {reviewsLoading ? (
            <p>Загрузка отзывов...</p>
          ) : (
            <ReviewList reviews={reviews} />
          )}

          <div className="mt-6">
            <ReviewForm entityId={eventData.id} entityType="event" onReviewSubmitted={loadReviews} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;