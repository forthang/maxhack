import React from 'react';
import { ReviewOut } from '../../types/review';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ReviewListProps {
  reviews: ReviewOut[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">Пока нет отзывов.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mr-2">{review.user_name || 'Аноним'}</div>
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {review.created_at}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
