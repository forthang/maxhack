import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';
import { findCourseById, CourseNode } from '../data/courses';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Type for a single review from the backend
interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user_name: string | null;
}

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const [course, setCourse] = useState<CourseNode | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the new review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/courses/${id}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data: Review[] = await response.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (id) {
      const foundCourse = findCourseById(id);
      setCourse(foundCourse);
      fetchReviews();
    }
    setIsLoading(false);
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id) {
      alert('You must be logged in to submit a review.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          course_id: id,
          rating: newRating,
          comment: newComment,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      // Reset form and refetch reviews
      setNewComment('');
      setNewRating(5);
      await fetchReviews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Загрузка...</div>;
  if (!course) return <div className="p-4 text-center text-red-500">Курс не найден.</div>;

  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{course.info}</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Опыт за завершение</p>
          <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">{course.xp} XP</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Монет за завершение</p>
          <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">{course.coins}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Отзывы</h3>
        {/* Submit Review Form */}
        {currentUser && (
          <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <h4 className="font-semibold mb-2">Оставить свой отзыв</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Оценка</label>
              <select value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                <option value={5}>5 - Отлично</option>
                <option value={4}>4 - Хорошо</option>
                <option value={3}>3 - Удовлетворительно</option>
                <option value={2}>2 - Плохо</option>
                <option value={1}>1 - Ужасно</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Комментарий</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="Ваши впечатления о курсе..."
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
              {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        )}
        {/* Existing Reviews */}
        <div className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{review.user_name || 'Аноним'}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-400">{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {format(new Date(review.created_at), 'd MMMM yyyy', { locale: ru })}
                </p>
                <p className="text-gray-800 dark:text-gray-200">{review.comment}</p>
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

export default CourseDetailsPage;