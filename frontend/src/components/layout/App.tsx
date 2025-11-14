import React from 'react';
import { useInitialUserLoad } from '../../hooks/useMaxApp';
import { User } from '../../types/user';

const App: React.FC = () => {
  const { currentUser, isLoading, error } = useInitialUserLoad();

  // --- Loading and Error States ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">Загрузка приложения...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 text-center">Ошибка: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
      App has loaded the user. No error yet.
      <pre style={{ fontSize: '0.8rem', textAlign: 'left', background: '#eee', padding: '1rem', marginTop: '1rem' }}>
        {JSON.stringify(currentUser, null, 2)}
      </pre>
    </div>
  );
};

export default App;

