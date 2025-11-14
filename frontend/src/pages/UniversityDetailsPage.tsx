import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AppContext';

// Define types based on backend schemas
interface Student {
  id: number;
  first_name: string | null;
  last_name: string | null;
}
interface Group {
  id: number;
  name: string;
  students: Student[];
}
interface Course {
  id: number;
  year: number;
  groups: Group[];
}
interface Specialization {
  id: number;
  name: string;
  courses: Course[];
}
interface UniversityDetails {
  id: number;
  name: string;
  points: number;
  specializations: Specialization[];
}

const UniversityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [university, setUniversity] = useState<UniversityDetails | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/universities/${id}/details`);
        if (!response.ok) {
          throw new Error('Failed to fetch university details');
        }
        const data: UniversityDetails = await response.json();
        setUniversity(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleJoinGroup = async () => {
    if (!selectedGroupId || !currentUser) return;
    setIsJoining(true);
    try {
      const response = await fetch('/api/profile/join-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, group_id: parseInt(selectedGroupId, 10) }),
      });
      if (!response.ok) {
        throw new Error('Failed to join group');
      }
      const updatedProfile = await response.json();
      setCurrentUser(updatedProfile);
      alert('Вы успешно присоединились к группе!');
      navigate('/profile'); // Navigate to profile to see the change
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Загрузка...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  if (!university) return <div className="p-4 text-center">Университет не найден.</div>;

  const allGroups = university.specializations.flatMap(s => s.courses.flatMap(c => c.groups));

  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад к списку
      </button>
      <h2 className="text-2xl font-semibold mb-2">{university.name}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Очки: {university.points}</p>

      {currentUser && !currentUser.group_id && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3">Присоединиться к группе</h3>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 mb-3"
          >
            <option value="">Выберите вашу группу</option>
            {allGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <button
            onClick={handleJoinGroup}
            disabled={!selectedGroupId || isJoining}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isJoining ? 'Присоединение...' : 'Присоединиться'}
          </button>
        </div>
      )}

      {currentUser && currentUser.university_id === university.id && currentUser.group_id && (
         <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
            Вы состоите в группе этого университета.
         </div>
      )}

      <div className="space-y-4">
        {university.specializations.map(spec => (
          <div key={spec.id}>
            <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">{spec.name}</h4>
            {spec.courses.map(course => (
              <div key={course.id} className="pl-4 mt-2">
                <h5 className="text-lg font-normal text-gray-700 dark:text-gray-300">Курс {course.year}</h5>
                {course.groups.map(group => (
                  <div key={group.id} className="pl-4 mt-1">
                    <p className="text-md text-gray-600 dark:text-gray-400">{group.name} ({group.students.length} студентов)</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversityDetailsPage;
