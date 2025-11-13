import React, { useState, useContext } from 'react';
import { UserContext } from '../layout/App';

interface ReviewFormProps {
  entityId: string | number; // event_id or course_id
  entityType: 'event' | 'course';
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ entityId, entityType, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUserId } = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setError("User not logged in.");
      return;
    }
    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: any = {
      user_id: currentUserId,
      rating: rating,
      comment: comment,
    };

    if (entityType === 'course') {
      payload.course_id = entityId;
    } else if (entityType === 'event') {
      payload.event_id = entityId;
    }

    try {
      const url = entityType === 'event' ? `/api/events/${entityId}/reviews` : `/api/courses/${entityId}/reviews`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        setRating(0);
        setComment('');
        onReviewSubmitted();
      } else {
        const errorData = await resp.json();
        setError(errorData.detail || "Failed to submit review.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Оставить отзыв</h3>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Оценка:</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Комментарий (необязательно):</label>
        <textarea
          id="comment"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  );
};

export default ReviewForm;
