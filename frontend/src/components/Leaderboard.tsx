import React, { useEffect, useState } from 'react';

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
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Лидеры вузов</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="space-y-4 pb-20">
          {entries.map((entry) => (
            <div
              key={entry.university.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 text-sm font-semibold">
                  {entry.rank}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {entry.university.name}
                </span>
              </div>
              <span className="text-gray-800 dark:text-gray-300">{entry.university.points} баллов</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;