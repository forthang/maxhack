import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';
import ReviewForm from '../components/common/ReviewForm';
import ReviewList from '../components/common/ReviewList';
import { ReviewOut } from '../types/review';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const resp = await fetch(`/api/courses/${id}/reviews`);
      if (resp.ok) {
        setReviews(await resp.json());
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id && currentUser?.id) {
      try {
        const storedCompleted = localStorage.getItem(`completedCourses_${currentUser.id}`);
        const completed = storedCompleted ? JSON.parse(storedCompleted) : {};
        if (completed[id]) {
          setIsCompleted(true);
          setMessage('Этот курс уже пройден.');
        }
      } catch (e) {
        console.error("Failed to read from localStorage", e);
      }
      loadReviews();
    }
  }, [id, currentUser]);

  const completeCourse = async () => {
    if (!id || isCompleted || !currentUser?.id) return;
    setLoading(true);
    try {
      const payload = { user_id: currentUser.id, xp: 10, coins: 5 };
      const resp = await fetch(`/api/profile/courses/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        setMessage('Курс завершён! Награды начислены.');
        setIsCompleted(true);
        const storedCompleted = localStorage.getItem(`completedCourses_${currentUser.id}`);
        const completed = storedCompleted ? JSON.parse(storedCompleted) : {};
        completed[id] = true;
        localStorage.setItem(`completedCourses_${currentUser.id}`, JSON.stringify(completed));
      } else {
        setMessage('Не удалось завершить курс');
      }
    } catch {
      setMessage('Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-4">Курс: {id}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Это демонстрационная страница курса. В реальном приложении здесь будет
        подробное описание, учебные материалы и дополнительные ресурсы.
      </p>
      {!isCompleted && (
        <button
          onClick={completeCourse}
          disabled={loading || !currentUser}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Завершение...' : 'Завершить курс'}
        </button>
      )}
      {message && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{message}</p>}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Отзывы</h3>
        {reviewsLoading ? (
          <p>Загрузка отзывов...</p>
        ) : (
          <ReviewList reviews={reviews} />
        )}
        <div className="mt-6">
          {id && <ReviewForm entityId={id} entityType="course" onReviewSubmitted={loadReviews} />}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
