import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/AppContext';
import EventCard from '../components/common/EventCard'; // Assuming EventCard is exported
import Spinner from '../components/common/Spinner'; // Assuming Spinner is exported
import { useNavigate } from 'react-router-dom';

interface Event {
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

const RecommendationsPage: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/recommendations/${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data: Event[] = await response.json();
        setRecommendations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Spinner />
        <p>Загрузка рекомендаций...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Рекомендованные события</h2>
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((event) => (
            <EventCard
              key={event.id}
              start={new Date(event.event_time)}
              end={new Date(new Date(event.event_time).getTime() + event.duration_hours * 60 * 60 * 1000)}
              title={event.title}
              description={event.description}
              auditorium={event.auditorium}
              signedUp={event.signed_up || false}
              onDetails={() => navigate(`/event/${event.id}`)}
              // For recommendations, we don't offer direct signup/unsubscribe here
              // The user can go to the event details page to do that.
            />
          ))
        ) : (
          <p className="text-center text-gray-500">Пока нет рекомендаций.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
