import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext, UserContext } from '../context/AppContext';
import StorePage from './StorePage';

// This wrapper is now a standalone component and won't be recreated on every render.
const StorePageWrapper: React.FC = () => {
  return <StorePage inline />;
};

const Profile: React.FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useContext(UserContext);

  const [profileTab, setProfileTab] = useState<'overview' | 'store' | 'settings'>('overview');

  // Display name logic
  const displayName = currentUser?.first_name || currentUser?.username || 'Пользователь';
  const avatarUrl = currentUser?.photo_url || `https://api.dicebear.com/6.x/bottts/svg?seed=${displayName}`;

  // Mock data for now, can be replaced with real data if added to user model
  const [achievements, setAchievements] = useState<string>('Победитель хакатона');
  const [progress, setProgress] = useState<number>(60);

  // The API call is no longer needed here, as the user object is provided by the context
  useEffect(() => {
    // The user object is now passed via context from useMaxApp hook
  }, [currentUser]);

  if (!currentUser) {
    return <div>Загрузка профиля...</div>;
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-semibold mb-4">Профиль</h2>
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
      {profileTab === 'overview' && (
        <div className="space-y-4 fade-in">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={avatarUrl}
                alt="Аватар"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{displayName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievements}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>ВУЗ: {currentUser.university?.name ?? 'Не привязан'}</p>
              <p>Группа: {currentUser.group?.name ?? 'Нет группы'}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-300">Прогресс обучения: {progress}%</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mt-1 overflow-hidden">
                <div
                  className="h-2 bg-green-500 dark:bg-green-400"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">Опыт</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">{currentUser.xp}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">Монеты</p>
                <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">{currentUser.coins}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {profileTab === 'store' && (
        <div className="fade-in">
          <div className="pb-20">
            <StorePageWrapper />
          </div>
        </div>
      )}
      {profileTab === 'settings' && (
        <div className="space-y-4 fade-in">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Настройки темы</h3>
            <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
              Текущий режим: {darkMode ? 'тёмная' : 'светлая'}.
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
