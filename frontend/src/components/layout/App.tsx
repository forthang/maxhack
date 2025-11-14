import React, { useState, useCallback } from 'react';
import { useInitialUserLoad } from '../../hooks/useMaxApp';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { AppModals } from './AppModals';
import { User } from '../../types/user';

const App: React.FC = () => {
  const { currentUser: initialUser, isLoading, error } = useInitialUserLoad();
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  const handleUserUpdate = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">Загрузка...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 text-center">Ошибка: {error}</div>;
  }

  const isApplicant = !currentUser?.group_id;

  return (
    <AppProviders initialUser={initialUser} onUserUpdate={handleUserUpdate}>
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans">
        <AppRoutes isApplicant={isApplicant} />
        <AppModals isApplicant={isApplicant} />
      </div>
    </AppProviders>
  );
};

export default App;
