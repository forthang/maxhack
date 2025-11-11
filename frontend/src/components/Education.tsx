import React, { useState, useEffect } from 'react';

/**
 * Компонент курсов: показывает дорожные карты по специальностям. Пользователь
 * выбирает направление (например, программист), затем открываются курсы в
 * виде списка. При прохождении курса начисляются опыт (xp) и монеты (coins),
 * которые сохраняются в localStorage и отображаются в профиле. Это
 * упрощённая игровая механика для мотивации обучения.
 */

interface Course {
  title: string;
  xp: number;
  coins: number;
  completed?: boolean;
}

interface Track {
  name: string;
  courses: Course[];
}

const tracks: Track[] = [
  {
    name: 'Программист',
    courses: [
      { title: 'Основы JavaScript', xp: 50, coins: 10 },
      { title: 'Алгоритмы и структуры данных', xp: 70, coins: 15 },
      { title: 'Веб‑разработка', xp: 80, coins: 20 },
    ],
  },
  {
    name: 'Лингвист',
    courses: [
      { title: 'Фонетика и фонология', xp: 40, coins: 8 },
      { title: 'Синтаксис и морфология', xp: 60, coins: 12 },
      { title: 'Психолингвистика', xp: 50, coins: 10 },
    ],
  },
  {
    name: 'Слесарь',
    courses: [
      { title: 'Материаловедение', xp: 30, coins: 5 },
      { title: 'Инструменты и оборудование', xp: 45, coins: 8 },
      { title: 'Технологии обработки', xp: 55, coins: 10 },
    ],
  },
  {
    name: 'Искусственный интеллект',
    courses: [
      { title: 'Машинное обучение', xp: 80, coins: 20 },
      { title: 'Нейронные сети', xp: 90, coins: 25 },
      { title: 'Этичный ИИ', xp: 40, coins: 8 },
    ],
  },
];

import CourseGraph, { CourseNode } from './CourseGraph';

const Education: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);

  // Дорожные карты для каждого направления. В реальном приложении эти данные
  // могут поступать с сервера или редактироваться администраторами. Здесь
  // представлен пример для программистов и других специальностей.
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
        {
          id: 'phonetics',
          title: 'Фонетика',
          info: 'Звуковая сторона языка: артикуляция, акустика и восприятие.',
          xp: 40,
          coins: 8,
        },
        {
          id: 'syntax',
          title: 'Синтаксис',
          info: 'Законы построения предложений и словосочетаний.',
          xp: 50,
          coins: 10,
        },
      ],
    },
    'Слесарь': {
      id: 'locksmith-root',
      title: 'Слесарь',
      info: 'Получите практические навыки работы с металлом и инструментами.',
      xp: 0,
      coins: 0,
      children: [
        {
          id: 'materials',
          title: 'Материаловедение',
          info: 'Свойства и обработка материалов.',
          xp: 30,
          coins: 5,
        },
        {
          id: 'tools',
          title: 'Инструменты',
          info: 'Основные инструменты и методы их использования.',
          xp: 40,
          coins: 8,
        },
      ],
    },
    'Искусственный интеллект': {
      id: 'ai-root',
      title: 'Искусственный интеллект',
      info: 'Погрузитесь в машинное обучение, нейронные сети и этику ИИ.',
      xp: 0,
      coins: 0,
      children: [
        {
          id: 'ml',
          title: 'Машинное обучение',
          info: 'Основы машинного обучения и алгоритмы.',
          xp: 80,
          coins: 20,
        },
        {
          id: 'nn',
          title: 'Нейронные сети',
          info: 'Глубокие нейронные сети и современные архитектуры.',
          xp: 90,
          coins: 25,
        },
      ],
    },
  };

  // Загрузка прогресса из localStorage
  useEffect(() => {
    const storedXp = localStorage.getItem('userXp');
    const storedCoins = localStorage.getItem('userCoins');
    const storedCompleted = localStorage.getItem('completedCourses');
    if (storedXp) setXp(Number(storedXp));
    if (storedCoins) setCoins(Number(storedCoins));
    if (storedCompleted) setCompleted(JSON.parse(storedCompleted));
  }, []);

  // Сохранение прогресса
  useEffect(() => {
    try {
      localStorage.setItem('userXp', xp.toString());
      localStorage.setItem('userCoins', coins.toString());
      localStorage.setItem('completedCourses', JSON.stringify(completed));
    } catch {
      /* ignore */
    }
  }, [xp, coins, completed]);

  // Завершение курса: отмечаем как завершённый, начисляем награды и
  // синхронизируемся с бэкендом. Если сервер возвращает новые значения
  // XP/coins, используем их; иначе прибавляем локально. Используем
  // асинхронную функцию, чтобы дождаться ответа API.
  const handleComplete = async (node: CourseNode) => {
    if (completed[node.id]) return;
    setCompleted((prev) => ({ ...prev, [node.id]: true }));
    try {
      const resp = await fetch(
        `/api/profile/courses/${node.id}/complete?xp=${node.xp}&coins=${node.coins}`,
        { method: 'POST' },
      );
      if (resp.ok) {
        const data = await resp.json();
        // Update local XP/coins from response if available
        if (data.xp !== undefined) setXp(data.xp);
        if (data.coins !== undefined) setCoins(data.coins);
      } else {
        // Fallback: update locally if server call fails
        setXp((prev) => prev + node.xp);
        setCoins((prev) => prev + node.coins);
      }
    } catch {
      setXp((prev) => prev + node.xp);
      setCoins((prev) => prev + node.coins);
    }
    if (node.xp > 0 || node.coins > 0) {
      alert(
        `Поздравляем! Вы завершили «${node.title}» и получили ${node.xp} XP и ${node.coins} монет.`,
      );
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