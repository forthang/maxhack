import React, { useEffect, useState } from 'react';
import EventCard from './common/EventCard';
import { useNavigate } from 'react-router-dom';

interface EventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
  duration_hours: number;
  materials?: string | null;
  signup_count?: number;
  signed_up?: boolean;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Request events with user_id=1 so that signed_up and signup_count are returned
      const resp = await fetch('/api/events?user_id=1');
      if (resp.ok) {
        const data = await resp.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
                  onDetails={() => navigate(`/event/${e.id}`)}
                  onSignup={!e.signed_up
                    ? async () => {
                        const resp = await fetch(`/api/events/${e.id}/signup`, { method: 'POST' });
                        if (resp.ok) loadEvents();
                      }
                    : undefined}
                  onUnsubscribe={e.signed_up
                    ? async () => {
                        const resp = await fetch(`/api/events/${e.id}/unsubscribe`, { method: 'POST' });
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