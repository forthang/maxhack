import React, { useContext } from 'react';
import { useInitialUserLoad } from '../../hooks/useMaxApp';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { AppModals } from './AppModals';
import { UserContext } from '../../context/AppContext';

const AppContent: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const isApplicant = currentUser ? !currentUser.group_id : false;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex flex-col font-sans">
      <AppRoutes isApplicant={isApplicant} />
      <AppModals />
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser: initialUser, isLoading, error } = useInitialUserLoad();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">Загрузка приложения...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 text-center">Ошибка: {error}</div>;
  }

  return (
    <AppProviders initialUser={initialUser}>
      <AppContent />
    </AppProviders>
  );
};

export default App;



