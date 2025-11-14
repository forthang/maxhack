import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EventCardProps {
  start: Date;
  end: Date;
  title: string;
  description: string;
  auditorium?: string | null;
  signedUp: boolean;
  isTogglingSignup?: boolean;
  onDetails: () => void;
  onUnsubscribe?: () => void;
  onSignup?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  start,
  end,
  title,
  description,
  auditorium,
  signedUp,
  isTogglingSignup,
  onDetails,
  onUnsubscribe,
  onSignup,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {format(start, 'd MMMM yyyy, HH:mm', { locale: ru })} - {format(end, 'HH:mm', { locale: ru })}
      </p>
      {auditorium && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Аудитория: {auditorium}</p>}
      <p className="text-gray-700 dark:text-gray-300 text-sm flex-grow mb-4">{description}</p>

      <div className="mt-4 flex justify-end space-x-2">
        {signedUp ? (
          onUnsubscribe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsubscribe();
              }}
              disabled={isTogglingSignup}
              className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400"
            >
              {isTogglingSignup ? 'Загрузка...' : 'Отписаться'}
            </button>
          )
        ) : (
          onSignup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignup();
              }}
              disabled={isTogglingSignup}
              className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400"
            >
              {isTogglingSignup ? 'Загрузка...' : 'Участвовать'}
            </button>
          )
        )}
        <button
          onClick={onDetails}
          className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};

export default EventCard;
