import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Types
interface BackendEventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
  duration_hours: number;
  materials: string | null;
  auditorium: string | null;
  signup_count: number | null;
  signed_up: boolean | null;
}

interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user_name: string | null;
}

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const [event, setEvent] = useState<BackendEventItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isTogglingSignup, setIsTogglingSignup] = useState(false);

  const fetchEventDetails = async () => {
    if (!currentUser || !id) return;
    try {
      // We need to get a single event. The backend doesn't have a /events/{id} endpoint.
      // We fetch all events and find the one we need. This is inefficient.
      const response = await fetch(`/api/events?user_id=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch event details');
      const events: BackendEventItem[] = await response.json();
      const currentEvent = events.find(e => e.id === Number(id));
      if (currentEvent) {
        setEvent(currentEvent);
        setEditData({ title: currentEvent.title, description: currentEvent.description });
      } else {
        throw new Error('Event not found');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/events/${id}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      setReviews(await response.json());
    } catch (err: any) {
      console.error("Review fetch error:", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchEventDetails(), fetchReviews()]).finally(() => setIsLoading(false));
  }, [id, currentUser]);

  const handleSignupToggle = async () => {
    if (!currentUser || !event) return;
    
    // Optimistic UI update
    const originalEvent = { ...event };
    const newSignedUp = !event.signed_up;
    const newSignupCount = event.signed_up ? (event.signup_count ?? 1) - 1 : (event.signup_count ?? 0) + 1;

    setEvent({
      ...event,
      signed_up: newSignedUp,
      signup_count: newSignupCount,
    });

    setIsTogglingSignup(true);
    const endpoint = originalEvent.signed_up ? 'unsubscribe' : 'signup';
    try {
      const response = await fetch(`/api/events/${event.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      if (!response.ok) {
        // Revert on failure
        setEvent(originalEvent);
        throw new Error('Operation failed');
      }
      // Optional: refetch in the background to ensure data consistency
      // await fetchEventDetails(); 
    } catch (err: any) {
      setError(err.message);
      // Revert on failure
      setEvent(originalEvent);
      alert('Не удалось выполнить действие.');
    } finally {
      setIsTogglingSignup(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    try {
        const response = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
        });
        if (!response.ok) throw new Error('Failed to update event');
        await fetchEventDetails();
        setIsEditing(false);
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id) return;
    setIsSubmittingReview(true);
    try {
      await fetch(`/api/events/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, event_id: Number(id), rating: newRating, comment: newComment }),
      });
      setNewComment('');
      setNewRating(5);
      await fetchReviews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Загрузка...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  if (!event) return <div className="p-4 text-center">Событие не найдено.</div>;

  return (
    <div className="p-4 pb-20 space-y-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-semibold">Редактировать событие</h3>
            <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={4} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            <div className="flex space-x-2">
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Сохранить</button>
                <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300">Отмена</button>
            </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {format(new Date(event.event_time), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>
            {event.materials && <p className="text-sm">Материалы: <a href={event.materials} className="text-blue-500 hover:underline">{event.materials}</a></p>}
            {event.auditorium && <p className="text-sm">Место: {event.auditorium}</p>}
            <p className="text-sm">Участников: {event.signup_count ?? 0}</p>
            <div className="mt-4 flex space-x-2">
                <button onClick={handleSignupToggle} disabled={isTogglingSignup} className={`w-full py-2 rounded-md text-white transition-colors disabled:bg-gray-400 ${event.signed_up ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {isTogglingSignup ? 'Загрузка...' : (event.signed_up ? 'Отменить участие' : 'Участвовать')}
                </button>
                <button onClick={() => setIsEditing(true)} className="w-full py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">
                    Редактировать
                </button>
            </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Отзывы о событии</h3>
        {currentUser && (
          <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <h4 className="font-semibold mb-2">Оставить свой отзыв</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium">Оценка</label>
              <select value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                <option value={5}>5 - Отлично</option>
                <option value={4}>4 - Хорошо</option>
                <option value={3}>3 - Удовлетворительно</option>
                <option value={2}>2 - Плохо</option>
                <option value={1}>1 - Ужасно</option>
              </select>
            </div>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700" placeholder="Ваши впечатления..."/>
            <button type="submit" disabled={isSubmittingReview} className="w-full mt-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
              {isSubmittingReview ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{review.user_name || 'Аноним'}</p>
                  <div className="flex items-center text-yellow-500">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-2">{format(new Date(review.created_at), 'd MMMM yyyy', { locale: ru })}</p>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Отзывов пока нет.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;