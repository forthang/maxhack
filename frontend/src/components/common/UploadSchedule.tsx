import React, { useState } from 'react';

/**
 * A placeholder form for uploading a schedule for a specific group.
 * In a real application, this would involve file parsing (e.g., Excel)
 * and more robust group selection.
 */
const UploadSchedule: React.FC<{ onUploaded: () => void }> = ({ onUploaded }) => {
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!groupId) {
      setMessage('Необходимо указать ID группы.');
      return;
    }
    setLoading(true);
    setMessage('');

    // Mock schedule data for demonstration purposes.
    // In a real scenario, this would come from a parsed Excel file.
    const mockScheduleItems = [
      {
        start_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        end_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        description: 'Загруженная лекция',
        auditorium: 'Онлайн',
      },
      {
        start_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        end_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        description: 'Загруженный семинар',
        auditorium: 'Онлайн',
      },
    ];

    try {
      const resp = await fetch(`/api/schedule/upload?group_id=${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockScheduleItems),
      });
      if (resp.ok) {
        setMessage('Расписание успешно загружено!');
        onUploaded(); // Callback to refresh the parent component's data
      } else {
        const err = await resp.json();
        setMessage(`Ошибка: ${err.detail || 'Не удалось загрузить расписание.'}`);
      }
    } catch (e) {
      setMessage('Сетевая ошибка.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm space-y-3 fade-in">
      <h3 className="text-lg font-medium mb-2">Загрузить расписание</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Это заглушка для загрузки расписания из Excel. Введите ID группы и нажмите "Загрузить", чтобы добавить моковые данные.
      </p>
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
      <button
        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default UploadSchedule;
