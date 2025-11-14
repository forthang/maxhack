import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ClassCardProps {
  start: Date;
  end: Date;
  title: string;
  description: string;
  auditorium?: string | null;
  signedUp: boolean;
  signupCount?: number;
  onClick?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  start,
  end,
  title,
  description,
  auditorium,
  signedUp,
  signupCount,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(start, 'HH:mm', { locale: ru })} - {format(end, 'HH:mm', { locale: ru })}
          </p>
          {auditorium && <p className="text-sm text-gray-500 dark:text-gray-400">Аудитория: {auditorium}</p>}
        </div>
        <div className="text-right">
          {signedUp && (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">Вы записаны</span>
          )}
          {signupCount !== undefined && <p className="text-xs text-gray-400 mt-1">{signupCount} записей</p>}
        </div>
      </div>
      <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
};

export default ClassCard;
