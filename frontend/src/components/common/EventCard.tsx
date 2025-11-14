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
  onDetails,
  onUnsubscribe,
  onSignup,
}) => {
  return (
    <div
      onClick={onDetails}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {format(start, 'd MMMM yyyy, HH:mm', { locale: ru })}
      </p>
      {auditorium && <p className="text-sm text-gray-500 dark:text-gray-400">Место: {auditorium}</p>}
      <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{description}</p>
      <div className="mt-4 flex justify-end space-x-2">
        {signedUp ? (
          onUnsubscribe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsubscribe();
              }}
              className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Отписаться
            </button>
          )
        ) : (
          onSignup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignup();
              }}
              className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Участвовать
            </button>
          )
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails();
          }}
          className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};

export default EventCard;
