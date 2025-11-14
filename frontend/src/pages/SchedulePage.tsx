import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Define the type based on the backend schema
interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  description: string;
  auditorium: string | null;
  group_id: number | null;
}

const SchedulePage: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/schedule?user_id=${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data: ScheduleItem[] = await response.json();
        setSchedule(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [currentUser]);

  const groupedSchedule = schedule.reduce((acc, item) => {
    const date = format(new Date(item.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const sortedDates = Object.keys(groupedSchedule).sort();

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка расписания...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  }

  if (!currentUser || !currentUser.group_id) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Расписание пусто</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Вы еще не присоединены к учебной группе.
        </p>
        <Link to="/leaderboard" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Выбрать свой ВУЗ и группу
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Расписание</h2>
      {sortedDates.length === 0 && !isLoading && (
        <p className="text-center text-gray-500">Для вашей группы нет расписания.</p>
      )}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-2 capitalize text-gray-800 dark:text-gray-200">
              {format(new Date(date), 'd MMMM, EEEE', { locale: ru })}
            </h3>
            <div className="space-y-3">
              {groupedSchedule[date].map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(item.start_time), 'HH:mm')} - {format(new Date(item.end_time), 'HH:mm')}
                      </p>
                    </div>
                    {item.auditorium && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Аудитория</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{item.auditorium}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
