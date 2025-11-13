import React, { useEffect, useState, useContext } from 'react';
import EventCard from '../components/common/EventCard';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

interface EventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
  duration_hours: number;
  materials?: string | null;
  signup_count?: number;
  signed_up?: boolean;
  auditorium?: string | null;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/events?user_id=${currentUser?.id}`);
      if (resp.ok) {
        let data: EventItem[] = await resp.json();

        // Filter out expired events
        const now = new Date();
        data = data.filter(e => {
          const start = new Date(e.event_time);
          const duration = e.duration_hours ?? 2;
          const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
          return end > now;
        });

        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadEvents();
    }
  }, [currentUser]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">События</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="space-y-4 pb-20">
          {events.map((e) => {
            // compute start and end times
            const start = new Date(e.event_time);
            const duration = e.duration_hours ?? 2;
            const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
            return (
              <div key={e.id} className="space-y-2">
                <EventCard
                  start={start}
                  end={end}
                  title={e.title}
                  description={e.description}
                auditorium={e.auditorium ?? undefined}
                  onDetails={() => navigate(`/event/${e.id}`)}
                  onSignup={!e.signed_up
                    ? async () => {
                        const resp = await fetch(`/api/events/${e.id}/signup`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: currentUserId }),
                        });
                        if (resp.ok) loadEvents();
                      }
                    : undefined}
                  onUnsubscribe={e.signed_up
                    ? async () => {
                        const resp = await fetch(`/api/events/${e.id}/unsubscribe`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: currentUserId }),
                        });
                        if (resp.ok) loadEvents();
                      }
                    : undefined}
                  signedUp={e.signed_up ?? false}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;