import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
          {entries.map((entry) => {
            // Определяем стили для первых трёх мест: пьедестал
            let bgColor = 'bg-white dark:bg-gray-800';
            let borderColor = 'border-gray-100 dark:border-gray-700';
            let rankStyle = 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200';
            if (entry.rank === 1) {
              bgColor = 'bg-yellow-200 dark:bg-yellow-700';
              borderColor = 'border-yellow-300 dark:border-yellow-600';
              rankStyle = 'bg-yellow-400 dark:bg-yellow-600 text-white';
            } else if (entry.rank === 2) {
              bgColor = 'bg-gray-200 dark:bg-gray-700';
              borderColor = 'border-gray-300 dark:border-gray-600';
              rankStyle = 'bg-gray-400 dark:bg-gray-500 text-white';
            } else if (entry.rank === 3) {
              bgColor = 'bg-orange-200 dark:bg-orange-700';
              borderColor = 'border-orange-300 dark:border-orange-600';
              rankStyle = 'bg-orange-400 dark:bg-orange-600 text-white';
            }
            return (
              <div
                key={entry.university.id}
                className={`${bgColor} shadow-sm rounded-lg p-4 border ${borderColor} flex items-center justify-between cursor-pointer hover:shadow-md transition`}
                onClick={() => navigate(`/university/${entry.university.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${rankStyle} text-sm font-semibold`}
                  >
                    {entry.rank}
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {entry.university.name}
                  </span>
                </div>
                <span className="text-gray-800 dark:text-gray-300">{entry.university.points} баллов</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;