import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/AppContext';

// Define the types based on the backend schemas
interface University {
  id: number;
  name: string;
  points: number;
}

interface LeaderboardEntry {
  university: University;
  rank: number;
}

const LeaderboardPage: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка таблицы лидеров...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Таблица лидеров</h2>
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <Link
            to={`/university/${entry.university.id}`}
            key={entry.university.id}
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-500 dark:text-gray-400 w-8">{entry.rank}.</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.university.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Очки</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{entry.university.points}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
