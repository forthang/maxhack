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
    <div className="fade-in bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 flex space-x-4 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-neutral-800 dark:text-neutral-100">{title}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{description}</p>
        <div className="text-xs text-neutral-500 mt-2 space-y-1">
          <p>
            {start.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
            {' — '}
            {end.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
          </p>
          {auditorium && (
            <p>Аудитория: {auditorium}</p>
          )}
        </div>
        <div className="mt-3 flex space-x-2 items-center">
          {onDetails && (
            <button
              onClick={onDetails}
              className="text-brand dark:text-brand-light text-sm font-medium hover:underline"
            >
              Подробнее
            </button>
          )}
          {!signedUp && onSignup && (
            <button
              onClick={async () => {
                await onSignup?.();
              }}
              className="bg-brand hover:bg-brand-dark text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
            >
              Записаться
            </button>
          )}
          {signedUp && onUnsubscribe && (
            <button
              onClick={async () => {
                await onUnsubscribe?.();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
            >
              Отписаться
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;