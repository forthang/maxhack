import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AppContext';

export const AppModals: React.FC = () => {
  
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showDebugModal, setShowDebugModal] = useState(false);

  const isApplicant = currentUser && !currentUser.group_id;
  const isMaxApp = typeof window !== 'undefined' && typeof (window as any).WebApp !== 'undefined';

  return (
    <>
      {/* Debugging Modal */}
      {isMaxApp && currentUser && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDebugModal(true)}
            className="bg-blue-500 text-white p-2 rounded-full shadow-lg"
          >
            Debug
          </button>
        </div>
      )}

      {showDebugModal && isMaxApp && currentUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-left max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4">MAX User Data (Debug)</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
            <button
              onClick={() => setShowDebugModal(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Applicant Modal */}
      {isApplicant && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Добро пожаловать!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Сейчас вы вошли как абитуриент. Чтобы получить доступ к расписанию и другим функциям, вам нужно выбрать свой ВУЗ и группу.
            </p>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Выбрать ВУЗ
            </button>
          </div>
        </div>
      )}
    </>
  );
};
