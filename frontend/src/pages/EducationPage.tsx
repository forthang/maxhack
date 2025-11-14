import React, { useState, useEffect, useContext } from 'react';
import CourseGraph, { CourseNode } from '../components/CourseGraph';
import { UserContext } from '../context/AppContext';

const Education: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const { currentUser, setCurrentUser } = useContext(UserContext);

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

  // The hardcoded course trees remain for demonstration purposes.
  const courseTrees: { [key: string]: CourseNode } = {
    'Программист': {
      id: 'prog-root',
      title: 'Программист',
      info: 'Постройте свою карьеру программиста, проходя курсы от алгоритмов до фреймворков.',
      xp: 0,
      coins: 0,
      children: [
        {
          id: 'algorithms',
          title: 'Алгоритмы',
          info: 'Изучите базовые алгоритмы и структуры данных для эффективного решения задач.',
          xp: 50,
          coins: 10,
          children: [
            {
              id: 'datastructures',
              title: 'Структуры данных',
              info: 'Списки, стеки, очереди, деревья и графы – основные инструменты для программиста.',
              xp: 50,
              coins: 10,
            },
          ],
        },
        {
          id: 'languages',
          title: 'Языки программирования',
          info: 'Выберите язык и освоите его особенности.',
          xp: 0,
          coins: 0,
          children: [
            {
              id: 'js',
              title: 'JavaScript',
              info: 'Изучите синтаксис JavaScript и основы работы с DOM.',
              xp: 40,
              coins: 8,
              children: [
                {
                  id: 'js-bootcamp-1',
                  title: 'JS Bootcamp I',
                  info: 'Практический курс по основам JavaScript.',
                  xp: 60,
                  coins: 12,
                },
                {
                  id: 'js-bootcamp-2',
                  title: 'JS Bootcamp II',
                  info: 'Продвинутые темы: асинхронность, тестирование, фронтенд‑фреймворки.',
                  xp: 70,
                  coins: 15,
                },
              ],
            },
            {
              id: 'python',
              title: 'Python',
              info: 'Изучите язык Python и его применение в анализе данных и веб‑разработке.',
              xp: 40,
              coins: 8,
              children: [
                {
                  id: 'python-bootcamp',
                  title: 'Python Bootcamp',
                  info: 'Базовые и продвинутые возможности Python, включая библиотеки.',
                  xp: 70,
                  coins: 15,
                },
              ],
            },
          ],
        },
      ],
    },
    'Лингвист': {
      id: 'ling-root',
      title: 'Лингвист',
      info: 'Освойте языковедение, грамматику и современную лингвистику.',
      xp: 0,
      coins: 0,
      children: [
        { id: 'phonetics', title: 'Фонетика', info: 'Звуковая сторона языка.', xp: 40, coins: 8 },
        { id: 'syntax', title: 'Синтаксис', info: 'Законы построения предложений.', xp: 50, coins: 10 },
      ],
    },
  };

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
      <h2 className="text-2xl font-semibold mb-4">Курсы</h2>
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
        </div>
      ) : (
        <div className="fade-in">
          <button
            onClick={() => setSelectedTrack(null)}
            className="mb-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад к направлениям
          </button>
          {/* <CourseGraph
            root={courseTrees[selectedTrack]}
            completed={completed}
            onComplete={handleComplete}
          /> */}
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">Граф курсов временно отключен для отладки.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;