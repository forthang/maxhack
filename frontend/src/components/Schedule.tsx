import React, { useEffect, useState } from 'react';
import { Panel, Flex, Button, Typography, Container } from '@maxhub/max-ui';

interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  signup_count: number;
  signed_up: boolean;
}

// Schedule page fetches schedule items from the backend and allows the user
// to sign up for activities. Since authentication is not implemented the
// `user_id` is hardcoded to 1 for demo purposes. Replace this with a real
// identifier when invitation‑based login is added.

const Schedule: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const userId = 1;

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/schedule?user_id=${userId}`);
      if (resp.ok) {
        const data = await resp.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (item: ScheduleItem) => {
    try {
      const resp = await fetch(`/api/schedule/${item.id}/signup?user_id=${userId}`, {
        method: 'POST',
      });
      const data = await resp.json();
      if (data.created) {
        // Refresh schedule to update flag
        await loadSchedule();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel mode="secondary" className="schedule-panel">
      <Typography.Title style={{ padding: '8px 16px' }}>Расписание</Typography.Title>
      {loading ? (
        <Typography.Text style={{ padding: '16px' }}>Загрузка...</Typography.Text>
      ) : (
        <Flex direction="column" gap={8} style={{ padding: '0 8px 80px 8px' }}>
          {items.map((item) => (
            <Container key={item.id} className="schedule-item" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
              <Typography.Subtitle>
                {new Date(item.start_time).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                {' — '}
                {new Date(item.end_time).toLocaleString('ru-RU', { timeStyle: 'short' })}
              </Typography.Subtitle>
              <Typography.Text>{item.description}</Typography.Text>
              <Typography.Caption>Записалось: {item.signup_count}</Typography.Caption>
              {!item.signed_up && (
                <Button mode="primary" size="s" onClick={() => handleSignup(item)}>
                  Записаться
                </Button>
              )}
              {item.signed_up && <Typography.Caption style={{ color: 'green' }}>Вы записаны</Typography.Caption>}
            </Container>
          ))}
        </Flex>
      )}
    </Panel>
  );
};

export default Schedule;