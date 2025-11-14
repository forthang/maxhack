import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/AppContext';
import { User } from '../types/user';

interface University {
  id: number;
  name: string;
}

const LeaderboardPage: React.FC = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/university');
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data: University[] = await response.json();
        setUniversities(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleJoinUniversity = async (universityId: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/university/${universityId}/add_student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-User': JSON.stringify((window as any).WebApp.initDataUnsafe?.user || { id: 999 }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join university');
      }
      
      const updatedUser: User = await response.json();
      
      // Update the user in the global context
      setCurrentUser(updatedUser);
      
      alert('Successfully joined university!');

    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading universities...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Choose Your University</h1>
      <div className="space-y-4">
        {universities.map((uni) => (
          <div key={uni.id} className="p-4 rounded-lg bg-white shadow flex justify-between items-center">
            <h2 className="font-bold">{uni.name}</h2>
            <button
              onClick={() => handleJoinUniversity(uni.id)}
              disabled={currentUser?.university_id === uni.id}
              className="bg-brand text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              {currentUser?.university_id === uni.id ? 'Joined' : 'Join'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
