import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';

/**
 * Профиль пользователя. В текущей версии аутентификация отсутствует, поэтому
 * отображается один условный пользователь. Пользователь может изменить имя,
 * достижения и прогресс обучения локально, а также переключить тёмную и
 * светлую тему интерфейса. Все изменения сохраняются только в состоянии
 * компонента и не отправляются на сервер.
 */
const Profile: React.FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  // Локальное состояние профиля. Эти значения могут быть изменены
  // пользователем и не синхронизируются с сервером.
  const [name, setName] = useState<string>('Иван Иванов');
  const [achievements, setAchievements] = useState<string>('Победитель хакатона');
  const [progress, setProgress] = useState<number>(60);

  // Опыт и монеты загружаем из localStorage
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    const storedXp = localStorage.getItem('userXp');
    const storedCoins = localStorage.getItem('userCoins');
    if (storedXp) setXp(Number(storedXp));
    if (storedCoins) setCoins(Number(storedCoins));
  }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Профиль</h2>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Имя</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Достижения</label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Прогресс обучения (%): {progress}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mt-1 overflow-hidden">
              <div
                className="h-2 bg-green-500 dark:bg-green-400 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-md transition-colors"
            onClick={() => alert('Изменения сохранены локально')}
          >
            Сохранить
          </button>
        </div>
        {/* Опыт и монеты */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Достижения и валюта</h3>
          <p className="text-gray-800 dark:text-gray-300">Опыт: {xp} XP</p>
          <p className="text-gray-800 dark:text-gray-300">Монеты: {coins}</p>
          <Link
            to="/store"
            className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Магазин
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Настройки темы</h3>
          <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
            Переключите режим отображения. Текущий режим: {darkMode ? 'тёмная' : 'светлая'}.
          </p>
          <button
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
            onClick={toggleTheme}
          >
            Переключить тему
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;