import React, { useState, useEffect, useContext } from 'react';
import CourseGraph from '../components/CourseGraph';
import { UserContext } from '../context/AppContext';
import { courseTrees, CourseNode } from '../data/courses';

const Education: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Derive the 'completed' map from the user context instead of localStorage
  useEffect(() => {
    if (currentUser?.completed_courses) {
      const completedMap = currentUser.completed_courses.reduce((acc, course) => {
        acc[course.course_id] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setCompleted(completedMap);
    }
  }, [currentUser]);

  // This function now updates the global user state via context.
  const handleComplete = async (node: CourseNode) => {
    if (completed[node.id] || !currentUser) return;

    try {
      const payload = { user_id: currentUser.id, xp: node.xp, coins: node.coins };
      const resp = await fetch(
        `/api/profile/courses/${node.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (resp.ok) {
        const updatedProfile = await resp.json();
        // Set the updated profile in the global context
        setCurrentUser(updatedProfile);
        if (node.xp > 0 || node.coins > 0) {
          alert(
            `Поздравляем! Вы завершили «${node.title}» и получили ${node.xp} XP и ${node.coins} монет.`,
          );
        }
      } else {
        const error = await resp.json();
        alert(`Ошибка: ${error.detail || 'Не удалось завершить курс.'}`);
      }
    } catch {
      alert('Сетевая ошибка. Не удалось завершить курс.');
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Курсы</h2>
        <button onClick={() => setIsAdminMode(!isAdminMode)} className="text-sm text-gray-500 hover:text-blue-600">
          {isAdminMode ? 'Выйти из режима' : 'Режим'} админа
        </button>
      </div>

      {!selectedTrack ? (
        <div className="space-y-3">
          <p className="mb-2 text-gray-700 dark:text-gray-300">Выберите направление обучения:</p>
          {Object.keys(courseTrees).map((trackName) => (
            <button
              key={trackName}
              onClick={() => setSelectedTrack(trackName)}
              className="block w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all fade-in"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{trackName}</span>
            </button>
          ))}
          {isAdminMode && (
            <button
              onClick={() => alert('Функция создания курсов в разработке.')}
              className="block w-full text-center bg-green-100 dark:bg-green-900 border-2 border-dashed border-green-400 text-green-700 dark:text-green-300 rounded-lg px-4 py-3 hover:bg-green-200 transition-all"
            >
              + Создать новое направление
            </button>
          )}
        </div>
      ) : (
        <div className="fade-in">
          <button
            onClick={() => setSelectedTrack(null)}
            className="mb-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад к направлениям
          </button>
          {isAdminMode && (
             <button onClick={() => alert('Функция редактирования в разработке.')} className="ml-4 text-sm text-blue-500">Редактировать</button>
          )}
          <CourseGraph
            root={courseTrees[selectedTrack]}
            completed={completed}
            onComplete={handleComplete}
          />
        </div>
      )}
    </div>
  );
};

export default Education;