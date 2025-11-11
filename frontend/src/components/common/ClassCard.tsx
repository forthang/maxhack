import React from 'react';

/**
 * Generic card component for displaying a schedule class. Shows time range,
 * title, description and a status indicator if the user has signed up.
 */
interface ClassCardProps {
  start: Date;
  end: Date;
  title: string;
  description: string;
  signedUp?: boolean;
  signupCount?: number;
  onSignup?: () => void;
  onClick?: () => void;
  auditorium?: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ start, end, title, description, signedUp, signupCount, onSignup, onClick, auditorium }) => {
  return (
    <div
      className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <p className="font-medium text-gray-700 dark:text-gray-200">
        {start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
        {' — '}
        {end.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
      </p>
      <p className="mt-1 font-semibold text-gray-800 dark:text-gray-300">{title}</p>
      <p className="mt-1 text-gray-700 dark:text-gray-400">{description}</p>
      {auditorium && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Аудитория: {auditorium}</p>
      )}
      <div className="flex justify-between items-center mt-2">
        {signupCount !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{signupCount} записей</span>
        )}
        {onSignup && (
          signedUp ? (
            <span className="text-green-600 dark:text-green-400 text-sm">Записаны</span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignup();
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Записаться
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ClassCard;