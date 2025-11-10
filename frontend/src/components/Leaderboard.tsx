import React, { useEffect, useState } from 'react';
import { Panel, Flex, Typography, Container } from '@maxhub/max-ui';

interface LeaderboardEntry {
  university: {
    id: number;
    name: string;
    points: number;
  };
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/leaderboard');
      if (resp.ok) {
        const data = await resp.json();
        setEntries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <Panel mode="secondary" className="leaderboard-panel">
      <Typography.Title style={{ padding: '8px 16px' }}>Лидеры вузов</Typography.Title>
      {loading ? (
        <Typography.Text style={{ padding: '16px' }}>Загрузка...</Typography.Text>
      ) : (
        <Flex direction="column" gap={8} style={{ padding: '0 8px 80px 8px' }}>
          {entries.map((entry) => (
            <Container key={entry.university.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
              <Flex justify="space-between" align="center">
                <Typography.Title level={5}>
                  {entry.rank}. {entry.university.name}
                </Typography.Title>
                <Typography.Text>{entry.university.points} баллов</Typography.Text>
              </Flex>
            </Container>
          ))}
        </Flex>
      )}
    </Panel>
  );
};

export default Leaderboard;