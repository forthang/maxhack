import React, { useState } from 'react';

/**
 * A form component used to create new extracurricular events. Encapsulates
 * state handling for event date/time, duration, title, description and
 * materials. On successful creation it invokes the provided callback.
 */
interface CreateEventFormProps {
  onCreated: (id: number) => Promise<void> | void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onCreated }) => {
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDuration, setNewEventDuration] = useState(2);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventMaterials, setNewEventMaterials] = useState('');

  const handleCreate = async () => {
    if (!newEventDate || !newEventTitle) return;
    const resp = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_time: newEventDate,
        title: newEventTitle,
        description: newEventDesc,
        duration_hours: newEventDuration,
        materials: newEventMaterials || null,
      }),
    });
    if (resp.ok) {
      const created = await resp.json();
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventMaterials('');
      setNewEventDate('');
      setNewEventDuration(2);
      if (created && created.id !== undefined) {
        await onCreated(created.id);
      }
    }
  };

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm space-y-3 fade-in">
      <h3 className="text-lg font-medium mb-2">Новое событие</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Дата и время</label>
        <input
          type="datetime-local"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Длительность (часы)</label>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={newEventDuration}
          onChange={(e) => setNewEventDuration(Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Название</label>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={newEventDesc}
          onChange={(e) => setNewEventDesc(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Материалы (ссылка)</label>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={newEventMaterials}
          onChange={(e) => setNewEventMaterials(e.target.value)}
        />
      </div>
      <button
        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        onClick={handleCreate}
      >
        Создать
      </button>
    </div>
  );
};

export default CreateEventForm;