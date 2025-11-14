import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

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
  description: string | null;
  specializations: Specialization[];
}
interface StudentLeaderboardEntry {
  user_id: number;
  first_name: string;
  last_name: string;
  xp: number;
  university_id: number;
  rank: number;
}

const getMedal = (rank: number) => {
  if (rank === 1) return <span className="text-xl" role="img" aria-label="Gold Medal">🥇</span>;
  if (rank === 2) return <span className="text-xl" role="img" aria-label="Silver Medal">🥈</span>;
  if (rank === 3) return <span className="text-xl" role="img" aria-label="Bronze Medal">🥉</span>;
  return <span className="text-base font-bold text-gray-500 dark:text-gray-400">{rank}.</span>;
};

const UniversityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [university, setUniversity] = useState<UniversityDetails | null>(null);
  const [studentLeaderboard, setStudentLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'groups' | 'leaderboard'>('info');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/universities/${id}/details`);
        if (!res.ok) throw new Error('Failed to fetch university details');
        setUniversity(await res.json());
      } catch (err: any) {
        setError(err.message);
      }
    };

    const fetchStudentLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard/students');
        if (!res.ok) throw new Error('Failed to fetch student leaderboard');
        const allStudents: StudentLeaderboardEntry[] = await res.json();
        const uniStudents = allStudents.filter(s => s.university_id === Number(id));
        setStudentLeaderboard(uniStudents);
      } catch (err: any) {
        // Do not set a page-level error for this, as it's a secondary feature
        console.error("Could not load student leaderboard:", err);
      }
    };

    setIsLoading(true);
    Promise.all([fetchDetails(), fetchStudentLeaderboard()]).finally(() => setIsLoading(false));
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
      if (!response.ok) throw new Error('Failed to join group');
      const updatedProfile = await response.json();
      setCurrentUser(updatedProfile);
      alert('Вы успешно присоединились к группе!');
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Загрузка...</div>;
  if (error && !university) return <div className="p-4 text-center text-red-500">Ошибка: {error}</div>;
  if (!university) return <div className="p-4 text-center">Университет не найден.</div>;

  const allGroups = university.specializations.flatMap(s => s.courses.flatMap(c => c.groups));

  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад к списку
      </button>
      <div className="flex items-center mb-2">
        <div>
            <h2 className="text-2xl font-semibold">{university.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">Очки: {university.points}</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-4">
        <button onClick={() => setActiveTab('info')} className={`py-2 px-3 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}>
          Инфо
        </button>
        <button onClick={() => setActiveTab('groups')} className={`py-2 px-3 text-sm font-medium ${activeTab === 'groups' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}>
          Группы
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={`py-2 px-3 text-sm font-medium ${activeTab === 'leaderboard' ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'}`}>
          Студенты
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="fade-in space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Об университете</h3>
            <p className="text-gray-700 dark:text-gray-300">{university.description || 'Описание отсутствует.'}</p>
          </div>
          
          {currentUser && !currentUser.group_id && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Присоединиться к группе</h3>
              <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 mb-3">
                <option value="">Выберите вашу группу</option>
                {allGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
              <button onClick={handleJoinGroup} disabled={!selectedGroupId || isJoining} className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark disabled:bg-gray-400">
                {isJoining ? 'Присоединение...' : 'Присоединиться'}
              </button>
            </div>
          )}

          {currentUser?.university_id === university.id && currentUser.group_id && (
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg">
                Вы уже состоите в группе этого университета.
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-4 fade-in">
          {university.specializations.map(spec => (
            <div key={spec.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
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
      )}

      {activeTab === 'leaderboard' && (
        <div className="fade-in space-y-3">
          <h3 className="text-xl font-semibold mb-2">Рейтинг студентов</h3>
          {studentLeaderboard.length > 0 ? (
            studentLeaderboard.map((student, index) => (
              <div key={student.user_id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 text-center">{getMedal(index + 1)}</div>
                  <span className="font-medium ml-3">{student.first_name} {student.last_name}</span>
                </div>
                <span className="font-semibold text-brand">{student.xp} XP</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Рейтинг студентов пуст.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversityDetailsPage;
