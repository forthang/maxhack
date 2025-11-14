import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AppModalsProps {
  isApplicant: boolean;
}

export const AppModals: React.FC<AppModalsProps> = ({ isApplicant }) => {
  const navigate = useNavigate();

  if (!isApplicant) {
    return null;
  }

  return (
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
  );
};
