import React, { useEffect, useState } from 'react';

// This should match the ScheduleItemOut schema from the backend
interface ScheduleItem {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  type: 'class' | 'event';
}

const SchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // This re-uses the auth logic from the initial load hook
        // In a real app, you'd use a global fetch wrapper or context
        let telegramUser = null;
        const isMaxApp = typeof window !== 'undefined' && (window as any).WebApp && (window as any).WebApp.initData;

        if (isMaxApp) {
          telegramUser = (window as any).WebApp.initDataUnsafe?.user;
        } else {
          telegramUser = { id: 999 }; // Mock user for local dev
        }

        const response = await fetch('/api/schedule', {
          headers: {
            'Content-Type': 'application/json',
            'X-Telegram-User': JSON.stringify(telegramUser),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data: ScheduleItem[] = await response.json();
        setSchedule(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return <div className="p-4">Loading schedule...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
      {schedule.length === 0 ? (
        <p>Your schedule is empty.</p>
      ) : (
        <div className="space-y-4">
          {schedule.map((item) => (
            <div key={`${item.type}-${item.id}`} className={`p-4 rounded-lg ${item.type === 'class' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <h2 className="font-bold">{item.title}</h2>
              <p>{item.start_time} - {item.end_time}</p>
              {item.location && <p className="text-sm text-gray-600">{item.location}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
