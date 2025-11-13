import React, { useState } from 'react';

/**
 * A form component for manually adding a new class (ScheduleItem) for a group.
 */
interface CreateClassFormProps {
  onCreated: () => Promise<void> | void;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({ onCreated }) => {
  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [auditorium, setAuditorium] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    if (!groupId || !description || !startDate || !startTime || !endDate || !endTime) {
      setMessage('Пожалуйста, заполните все поля.');
      return;
    }
    setLoading(true);
    setMessage('');

    const scheduleItem = {
      start_time: `${startDate}T${startTime}`,
      end_time: `${endDate}T${endTime}`,
      description: description,
      auditorium: auditorium || null,
    };

    try {
      const resp = await fetch(`/api/schedule/upload?group_id=${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([scheduleItem]), // The endpoint expects a list
      });
      if (resp.ok) {
        setMessage('Занятие успешно добавлено!');
        // Clear form
        setGroupId('');
        setDescription('');
        setAuditorium('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        await onCreated();
      } else {
        const err = await resp.json();
        setMessage(`Ошибка: ${err.detail || 'Не удалось добавить занятие.'}`);
      }
    } catch (e) {
      setMessage('Сетевая ошибка.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm space-y-3 fade-in">
      <h3 className="text-lg font-medium mb-2">Добавить занятие вручную</h3>
      {message && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{message}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">ID Группы</label>
        <input
          type="number"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="например, 1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Лекция: Математический анализ"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Аудитория</label>
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          value={auditorium}
          onChange={(e) => setAuditorium(e.target.value)}
          placeholder="А-315"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Дата начала</label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Время начала</label>
          <input
            type="time"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Дата окончания</label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Время окончания</label>
          <input
            type="time"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <button
        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? 'Добавление...' : 'Добавить занятие'}
      </button>
    </div>
  );
};

export default CreateClassForm;
