import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

/**
 * Магазин позволяет пользователю обменивать накопленные монеты на виртуальные
 * товары. Покупка уменьшает баланс монет и выводит сообщение об успешной
 * покупке. В будущем здесь можно расширить ассортимент и добавить
 * интеграцию с внешними сервисами.
 */
interface Item {
  name: string;
  cost: number;
}

const items: Item[] = [
  { name: 'Фирменная футболка', cost: 100 },
  { name: 'Стикеры', cost: 50 },
  { name: 'Кружка', cost: 80 },
  { name: 'Блокнот', cost: 30 },
];

interface StoreProps {
  inline?: boolean;
}

const Store: React.FC<StoreProps> = ({ inline = false }) => {
  const { currentUserId } = useContext(UserContext);
  const [coins, setCoins] = useState<number>(0);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/profile/${currentUserId}`);
      if (resp.ok) {
        const data = await resp.json();
        setCoins(data.coins ?? 0);
        setPurchased((data.purchases || []).map((p: any) => p.item_id));
      }
    } catch (e) {
      console.error("Failed to load profile for store", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUserId]);

  const handleBuy = async (item: Item) => {
    if (coins < item.cost) {
      alert('Недостаточно монет для покупки.');
      return;
    }

    try {
      const resp = await fetch('/api/profile/store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, item_id: item.name, cost: item.cost }),
      });

      if (resp.ok) {
        const updatedProfile = await resp.json();
        setCoins(updatedProfile.coins);
        setPurchased((updatedProfile.purchases || []).map((p: any) => p.item_id));
        alert(`Вы приобрели «${item.name}»!`);
      } else {
        const err = await resp.json();
        alert(`Ошибка покупки: ${err.detail || 'Не удалось совершить покупку.'}`);
      }
    } catch (e) {
      alert('Сетевая ошибка.');
    }
  };

  if (loading) {
    return <div className={inline ? '' : 'p-4 pb-20'}><p>Загрузка магазина...</p></div>;
  }

  return (
    <div className={inline ? '' : 'p-4 pb-20'}>
      {!inline && (
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
          ← Назад
        </button>
      )}
      <h2 className="text-2xl font-semibold mb-4">Магазин</h2>
      <p className="mb-4 text-gray-800 dark:text-gray-300">Ваш баланс: {coins} монет</p>
      {purchased.length > 0 && (
        <p className="mb-4 text-gray-800 dark:text-gray-300 text-sm">
          Купленные товары: {purchased.join(', ')}
        </p>
      )}
      <div
        className="space-y-4"
      >
          {items.map((item) => (
            <div
              key={item.name}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {/* Добавим простую иконку товара */}
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.3 5M17 13l1.3 5M6 21h12"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 dark:text-gray-300">{item.cost} монет</span>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={purchased.includes(item.name)}
                  className={`text-white px-3 py-1 rounded-md text-sm ${
                    purchased.includes(item.name)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                  }`}
                >
                  {purchased.includes(item.name) ? 'Куплено' : 'Купить'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
export default Store;
