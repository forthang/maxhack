import React from 'react';

/**
 * Generic card component for displaying an extracurricular event. Shows time,
 * title and description with optional actions such as opening details and
 * unsubscribing. It does not handle sign‑up; for that, use the Events
 * component.
 */
interface EventCardProps {
  start: Date;
  end: Date;
  title: string;
  description: string;
  /**
   * Callback to open the detailed view of the event. Optional.
   */
  onDetails?: () => void;
  /**
   * Callback invoked when the user subscribes to an event. If provided
   * and signedUp is false, a “Записаться” button will be shown.
   */
  onSignup?: (() => Promise<void>) | (() => void);
  /**
   * Callback invoked when the user unsubscribes from an event. If provided
   * and signedUp is true, an “Отписаться” button will be shown.
   */
  onUnsubscribe?: (() => Promise<void>) | (() => void);
  /**
   * Whether the current user is signed up for this event. Controls which
   * button is displayed. Defaults to false.
   */
  signedUp?: boolean;
  /**
   * Indicates that the event was created by the current user. Reserved
   * for future use.
   */
  isCreated?: boolean;
  /**
   * Optional location or auditorium for the event. If provided, it will
   * be displayed beneath the description.
   */
  auditorium?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  start,
  end,
  title,
  description,
  auditorium,
  onDetails,
  onSignup,
  onUnsubscribe,
  signedUp,
}) => {
  return (
    <div className="fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <p className="font-medium text-gray-700 dark:text-gray-200">
        {start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
        {' — '}
        {end.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
      </p>
      <p className="mt-1 font-semibold text-gray-800 dark:text-gray-300">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      {auditorium && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Аудитория: {auditorium}</p>
      )}
      <div className="mt-2 flex space-x-2 items-center">
        {onDetails && (
          <button
            onClick={onDetails}
            className="text-blue-600 dark:text-blue-400 text-sm underline"
          >
            Подробнее
          </button>
        )}
        {/* Показываем кнопку записи или отписки в зависимости от signedUp */}
        {!signedUp && onSignup && (
          <button
            onClick={async () => {
              await onSignup?.();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            Записаться
          </button>
        )}
        {signedUp && onUnsubscribe && (
          <button
            onClick={async () => {
              await onUnsubscribe?.();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
          >
            Отписаться
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;