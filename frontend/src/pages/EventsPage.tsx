import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Type based on backend schema
interface Event {
  id: number;
  event_time: string;
  title: string;
  description: string;
  signup_count: number | null;
  signed_up: boolean | null;
}

const EventsPage: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?user_id=${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser]);

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка событий...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">События</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <Link to={`/event/${event.id}`} key={event.id} className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{event.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {format(new Date(event.event_time), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{event.description}</p>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Участников: {event.signup_count ?? 0}
                </span>
                {event.signed_up && (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                        Вы участвуете
                    </span>
                )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
