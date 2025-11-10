import React, { useEffect, useState } from 'react';
import { Panel, Flex, Typography, Container } from '@maxhub/max-ui';

interface EventItem {
  id: number;
  event_time: string;
  title: string;
  description: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/events');
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
    <Panel mode="secondary" className="events-panel">
      <Typography.Title style={{ padding: '8px 16px' }}>События</Typography.Title>
      {loading ? (
        <Typography.Text style={{ padding: '16px' }}>Загрузка...</Typography.Text>
      ) : (
        <Flex direction="column" gap={8} style={{ padding: '0 8px 80px 8px' }}>
          {events.map((e) => (
            <Container key={e.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
              <Typography.Subtitle>
                {new Date(e.event_time).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
              </Typography.Subtitle>
              <Typography.Text strong>{e.title}</Typography.Text>
              <Typography.Text>{e.description}</Typography.Text>
            </Container>
          ))}
        </Flex>
      )}
    </Panel>
  );
};

export default Events;