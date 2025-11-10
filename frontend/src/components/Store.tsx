import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Store: React.FC = () => {
  const [coins, setCoins] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCoins = localStorage.getItem('userCoins');
    if (storedCoins) setCoins(Number(storedCoins));
  }, []);

  const handleBuy = (item: Item) => {
    if (coins < item.cost) {
      alert('Недостаточно монет для покупки.');
      return;
    }
    const newBalance = coins - item.cost;
    setCoins(newBalance);
    try {
      localStorage.setItem('userCoins', newBalance.toString());
    } catch {
      /* ignore */
    }
    alert(`Вы приобрели «${item.name}»!`);
  };

  return (
    <div className="p-4 pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
        ← Назад
      </button>
      <h2 className="text-2xl font-semibold mb-4">Магазин</h2>
      <p className="mb-4 text-gray-800 dark:text-gray-300">Ваш баланс: {coins} монет</p>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex items-center justify-between"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 dark:text-gray-300">{item.cost} монет</span>
              <button
                onClick={() => handleBuy(item)}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Купить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;