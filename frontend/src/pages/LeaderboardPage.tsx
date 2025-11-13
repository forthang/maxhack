import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

// --- Type definitions for university structure ---
interface Student {
  id: number;
  first_name: string;
  last_name: string;
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
interface UniversityDetailOut {
  id: number;
  name: string;
  specializations: Specialization[];
}

// --- Type definitions for leaderboards ---
interface UniversityEntry {
  university: {
    id: number;
    name:string;
    points: number;
  };
  rank: number;
}

interface StudentEntry {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    xp: number;
    group: {
      name: string;
    } | null
  };
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [uniEntries, setUniEntries] = useState<UniversityEntry[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentEntry[]>([]);
  const [universities, setUniversities] = useState<UniversityDetailOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'universities' | 'students'>('universities');
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  // --- State for group selection ---
  const [selectedUni, setSelectedUni] = useState<string>('');
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  const showJoinGroup = currentUser && !currentUser.group_id;

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchPromises = [
        fetch('/api/leaderboard'),
        fetch('/api/leaderboard/students'),
      ];
      if (showJoinGroup) {
        fetchPromises.push(fetch('/api/universities/'));
      }
      
      const [uniResp, studentResp, allUniResp] = await Promise.all(fetchPromises);

      if (uniResp.ok) setUniEntries(await uniResp.json());
      if (studentResp.ok) setStudentEntries(await studentResp.json());
      if (allUniResp && allUniResp.ok) setUniversities(await allUniResp.json());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleJoinGroup = async () => {
    if (!currentUser || !selectedGroup) return;
    setIsJoining(true);
    try {
      const response = await fetch('/api/profile/join-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, group_id: parseInt(selectedGroup, 10) }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser); // Update context, this will hide the join UI
        navigate('/schedule'); // Navigate to schedule to see the result
      } else {
        console.error("Failed to join group");
        // TODO: Show an error message to the user
      }
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const renderJoinGroup = () => {
    const uniOptions = universities.find(u => u.id === parseInt(selectedUni, 10));
    const specOptions = uniOptions?.specializations.find(s => s.id === parseInt(selectedSpec, 10));
    const courseOptions = specOptions?.courses.find(c => c.id === parseInt(selectedCourse, 10));

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Присоединиться к группе</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Выберите свой ВУЗ, направление, курс и группу, чтобы получить доступ к расписанию и другим функциям.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select value={selectedUni} onChange={e => { setSelectedUni(e.target.value); setSelectedSpec(''); setSelectedCourse(''); setSelectedGroup(''); }} className="form-select">
            <option value="">Выберите ВУЗ</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={selectedSpec} onChange={e => { setSelectedSpec(e.target.value); setSelectedCourse(''); setSelectedGroup(''); }} disabled={!selectedUni} className="form-select">
            <option value="">Направление</option>
            {uniOptions?.specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedGroup(''); }} disabled={!selectedSpec} className="form-select">
            <option value="">Курс</option>
            {specOptions?.courses.map(c => <option key={c.id} value={c.id}>{c.year}-й курс</option>)}
          </select>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} disabled={!selectedCourse} className="form-select">
            <option value="">Группа</option>
            {courseOptions?.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <button onClick={handleJoinGroup} disabled={!selectedGroup || isJoining} className="btn-primary w-full mt-4">
          {isJoining ? 'Присоединяемся...' : 'Присоединиться'}
        </button>
      </div>
    );
  };

  const renderUniversityLeaderboard = () => (
    <div className="space-y-4 pb-20">
        {uniEntries.map((entry) => (
            <div
              key={entry.university.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/university/${entry.university.id}`)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-semibold">
                  {entry.rank}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">{entry.university.name}</span>
              </div>
              <span className="text-gray-800 dark:text-gray-300">{entry.university.points} баллов</span>
            </div>
          ))}
    </div>
  );

  const renderStudentLeaderboard = () => (
    <div className="space-y-2 pb-20">
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
                <p className="font-medium text-gray-700 dark:text-gray-200">{entry.user.first_name} {entry.user.last_name}</p>
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
      
      {showJoinGroup && renderJoinGroup()}

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