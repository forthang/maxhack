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

const Education: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);

  // Загружаем прогресс из localStorage
  useEffect(() => {
    const storedXp = localStorage.getItem('userXp');
    const storedCoins = localStorage.getItem('userCoins');
    const storedCompleted = localStorage.getItem('completedCourses');
    if (storedXp) setXp(Number(storedXp));
    if (storedCoins) setCoins(Number(storedCoins));
    if (storedCompleted) setCompleted(JSON.parse(storedCompleted));
  }, []);

  // Сохраняем прогресс при изменениях
  useEffect(() => {
    try {
      localStorage.setItem('userXp', xp.toString());
      localStorage.setItem('userCoins', coins.toString());
      localStorage.setItem('completedCourses', JSON.stringify(completed));
    } catch {
      /* ignore */
    }
  }, [xp, coins, completed]);

  const handleComplete = (trackName: string, course: Course) => {
    const key = `${trackName}-${course.title}`;
    if (completed[key]) return;
    setCompleted((prev) => ({ ...prev, [key]: true }));
    setXp((prev) => prev + course.xp);
    setCoins((prev) => prev + course.coins);
    alert(`Курс «${course.title}» завершён! Вы получили ${course.xp} XP и ${course.coins} монет.`);
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Курсы</h2>
      {!selectedTrack ? (
        <div className="space-y-3">
          <p className="mb-2 text-gray-700 dark:text-gray-300">Выберите направление обучения:</p>
          {tracks.map((track) => (
            <button
              key={track.name}
              onClick={() => setSelectedTrack(track)}
              className="block w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all fade-in"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{track.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 fade-in">
          <button
            onClick={() => setSelectedTrack(null)}
            className="mb-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Назад к направлениям
          </button>
          <h3 className="text-xl font-semibold mb-2">{selectedTrack.name}</h3>
          {selectedTrack.courses.map((course) => {
            const key = `${selectedTrack.name}-${course.title}`;
            const done = completed[key];
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Награда: {course.xp} XP, {course.coins} монет
                  </p>
                </div>
                {done ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">Завершено</span>
                ) : (
                  <button
                    onClick={() => handleComplete(selectedTrack.name, course)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Завершить
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Education;