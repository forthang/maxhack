import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- Interfaces for the new nested structure ---
interface Student {
  id: number;
  first_name: string | null;
  last_name: string | null;
  xp: number;
  coins: number;
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

interface UniversityDetail {
  id: number;
  name: string;
  points: number;
  specializations: Specialization[];
}

// --- Collapsible Item Component ---
const Collapsible: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
      >
        <span className="font-medium">{title}</span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
        {isOpen && (
          <div
            className="p-3 pl-6 bg-white dark:bg-gray-800 overflow-hidden"
          >
            {children}
          </div>
        )}
    </div>
  );
};

const UniversityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'structure' | 'leaderboard'>('structure');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const resp = await fetch(`/api/universities/${id}/details`);
        if (resp.ok) {
          setUniversity(await resp.json());
        } else {
          setUniversity(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);

  const renderStructure = () => {
    if (!university) return null;
    return (
      <div
        className="space-y-1"
      >
          {university.specializations.map(spec => (
            <div key={spec.id}>
              <Collapsible title={`Направление: ${spec.name}`}>
                {spec.courses.map(course => (
                  <Collapsible key={course.id} title={`Курс: ${course.year}`}>
                    {course.groups.map(group => (
                      <Collapsible key={group.id} title={`Группа: ${group.name}`}>
                        <ul className="space-y-2 text-sm">
                            {group.students.map(student => (
                              <li key={student.id} className="flex justify-between items-center p-1">
                                <span>{student.first_name} {student.last_name}</span>
                                <span className="text-gray-500 dark:text-gray-400">{student.xp} XP</span>
                              </li>
                            ))}
                        </ul>
                      </Collapsible>
                    ))}
                  </Collapsible>
                ))}
              </Collapsible>
            </div>
          ))}
      </div>
    );
  };

  const renderLeaderboard = () => {
    if (!university) return null;
    const allStudents = university.specializations.flatMap(s => s.courses.flatMap(c => c.groups.flatMap(g => g.students)));
    const sortedStudents = allStudents.sort((a, b) => b.xp - a.xp);

    return (
      <div
        className="space-y-2"
      >
          {sortedStudents.map((student, index) => (
            <div
              key={student.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold">
                  {index + 1}
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-200">{student.first_name} {student.last_name}</p>
              </div>
              <span className="text-gray-800 dark:text-gray-300 font-semibold">{student.xp} XP</span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="p-4 pb-20 fade-in">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      {university && (
        <>
          <h2 className="text-2xl font-semibold mb-2">{university.name}</h2>
          <p className="text-lg mb-4">Баллы: {university.points}</p>
        </>
      )}

      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setView('structure')}
          className={`mr-4 pb-2 whitespace-nowrap border-b-2 ${
            view === 'structure' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          Структура
        </button>
        <button
          onClick={() => setView('leaderboard')}
          className={`pb-2 whitespace-nowrap border-b-2 ${
            view === 'leaderboard' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          Лидерборд
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        view === 'structure' ? renderStructure() : renderLeaderboard()
      )}
    </div>
  );
};

export default UniversityDetails;
