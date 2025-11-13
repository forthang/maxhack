import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UniversityEntry {
  university: {
    id: number;
    name: string;
    points: number;
  };
  rank: number;
}

interface StudentEntry {
  user: {
    id: number;
    name: string;
    xp: number;
    group: {
      name: string;
    }
  };
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [uniEntries, setUniEntries] = useState<UniversityEntry[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'universities' | 'students'>('universities');
  const navigate = useNavigate();

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const [uniResp, studentResp] = await Promise.all([
        fetch('/api/leaderboard'),
        fetch('/api/leaderboard/students')
      ]);
      if (uniResp.ok) {
        setUniEntries(await uniResp.json());
      }
      if (studentResp.ok) {
        setStudentEntries(await studentResp.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const renderUniversityLeaderboard = () => (
    <div
      className="space-y-4 pb-20"
    >
        {uniEntries.map((entry) => {
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
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${rankStyle} text-sm font-semibold`}>
                  {entry.rank}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">{entry.university.name}</span>
              </div>
              <span className="text-gray-800 dark:text-gray-300">{entry.university.points} баллов</span>
            </div>
          );
        })}
    </div>
  );

  const renderStudentLeaderboard = () => (
    <div
      className="space-y-2 pb-20"
    >
        {studentEntries.map((entry) => (
          <div
            key={entry.user.id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold">
                {entry.rank}
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">{entry.user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{entry.user.group?.name || 'Нет группы'}</p>
              </div>
            </div>
            <span className="text-gray-800 dark:text-gray-300 font-semibold">{entry.user.xp} XP</span>
          </div>
        ))}
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Лидерборд</h2>
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setView('universities')}
          className={`mr-4 pb-2 whitespace-nowrap border-b-2 ${
            view === 'universities' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          ВУЗы
        </button>
        <button
          onClick={() => setView('students')}
          className={`pb-2 whitespace-nowrap border-b-2 ${
            view === 'students' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          Студенты
        </button>
      </div>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        view === 'universities' ? renderUniversityLeaderboard() : renderStudentLeaderboard()
      )}
    </div>
  );
};

export default Leaderboard;