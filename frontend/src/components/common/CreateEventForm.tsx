import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/AppContext';

interface CreateEventFormProps {
  onCreated: (eventId: number) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onCreated }) => {
  const { currentUser } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [durationHours, setDurationHours] = useState(2); // Default to 2 hours
  const [auditorium, setAuditorium] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !eventTime || !currentUser) {
      setError('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          event_time: new Date(eventTime).toISOString(),
          duration_hours: durationHours,
          auditorium: auditorium || null, // Send null if empty
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      const newEvent = await response.json();
      onCreated(newEvent.id);
      // Reset form
      setTitle('');
      setDescription('');
      setEventTime('');
      setDurationHours(2);
      setAuditorium('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold">Создать новое событие</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Название</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Дата и время</label>
        <input
          type="datetime-local"
          id="eventTime"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Длительность (часы)</label>
        <input
          type="number"
          id="durationHours"
          value={durationHours}
          onChange={(e) => setDurationHours(parseInt(e.target.value))}
          min="1"
          max="12"
          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="auditorium" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Аудитория/Место</label>
        <input
          type="text"
          id="auditorium"
          value={auditorium}
          onChange={(e) => setAuditorium(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Создание...' : 'Создать'}
      </button>
    </form>
  );
};

export default CreateEventForm;
