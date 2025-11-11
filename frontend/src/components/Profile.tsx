import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import Store from './Store';

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
  const [purchased, setPurchased] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);

  // Университет пользователя
  const [universityName, setUniversityName] = useState<string | null>(null);

  // Подвкладка профиля: overview, store, settings
  const [profileTab, setProfileTab] = useState<'overview' | 'store' | 'settings'>('overview');

  useEffect(() => {
    // Загрузить данные профиля из бэкенда. Это включает xp, coins,
    // завершённые курсы, купленные предметы и информацию об университете.
    const loadProfile = async () => {
      try {
        const resp = await fetch('/api/profile');
        if (resp.ok) {
          const data = await resp.json();
          setXp(data.xp ?? 0);
          setCoins(data.coins ?? 0);
          setUniversityName(data.university ? data.university.name : null);
          // completed_courses is a list; we only store count
          setCompletedCount((data.completed_courses || []).length);
          setPurchased((data.purchases || []).map((p: any) => p.item_id));
        }
      } catch {
        // fallback to localStorage if API unavailable
        const storedXp = localStorage.getItem('userXp');
        const storedCoins = localStorage.getItem('userCoins');
        const storedPurchased = localStorage.getItem('purchasedItems');
        const storedCompleted = localStorage.getItem('completedCourses');
        if (storedXp) setXp(Number(storedXp));
        if (storedCoins) setCoins(Number(storedCoins));
        if (storedPurchased) setPurchased(JSON.parse(storedPurchased));
        if (storedCompleted) {
          try {
            const parsed = JSON.parse(storedCompleted);
            setCompletedCount(Object.keys(parsed).length);
          } catch {
            setCompletedCount(0);
          }
        }
      }
    };
    loadProfile();
  }, []);

  // Вспомогательный компонент для отображения магазина в рамках профиля. Передаёт
  // свойство inline, чтобы скрыть кнопку «Назад». Можно выделить в отдельный
  // файл, но здесь достаточно локального объявления.
  const StoreWrapper: React.FC = () => {
    return <Store inline />;
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Профиль</h2>
      {/* Навигация по вкладкам профиля */}
      <div className="flex space-x-2 mb-4">
        {[
          { key: 'overview', label: 'Обзор' },
          { key: 'store', label: 'Магазин' },
          { key: 'settings', label: 'Настройки' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setProfileTab(tab.key as any)}
            className={`flex-1 py-2 rounded-md text-center text-sm font-medium transition-colors ${
              profileTab === tab.key
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Содержимое вкладок */}
      {profileTab === 'overview' && (
        <div className="space-y-4 fade-in">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src="https://api.dicebear.com/6.x/bottts/svg?seed=student"
                alt="Аватар"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievements}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-300">Прогресс обучения: {progress}%</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mt-1 overflow-hidden">
                <div
                  className="h-2 bg-green-500 dark:bg-green-400 transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">Опыт</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">{xp}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">Монеты</p>
                <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">{coins}</p>
              </div>
            </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ВУЗ: {universityName ? universityName : 'не привязан'}
            </p>
          </div>
            {purchased.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Купленные товары</h4>
                <ul className="list-disc list-inside text-gray-800 dark:text-gray-300 text-sm space-y-1">
                  {purchased.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {completedCount > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Завершённые курсы</h4>
                <p className="text-gray-800 dark:text-gray-300 text-sm">{completedCount} курс(ов)</p>
              </div>
            )}
          </div>
        </div>
      )}
      {profileTab === 'store' && (
        <div className="fade-in">
          {/* Используем Store компонент напрямую */}
          <div className="mb-4">
            <button
              onClick={() => setProfileTab('overview')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Назад к профилю
            </button>
          </div>
          <div className="pb-20">
            {/* Вставляем магазин как компонент */}
            <StoreWrapper />
          </div>
        </div>
      )}
      {profileTab === 'settings' && (
        <div className="space-y-4 fade-in">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Настройки профиля</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Имя</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Достижения</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
              />
            </div>
            <div className="mb-4">
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
      )}
    </div>
  );
};

export default Profile;