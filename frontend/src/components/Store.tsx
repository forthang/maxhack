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

interface StoreProps {
  inline?: boolean;
}

const Store: React.FC<StoreProps> = ({ inline = false }) => {
  const [coins, setCoins] = useState<number>(0);
  const [purchased, setPurchased] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCoins = localStorage.getItem('userCoins');
    if (storedCoins) setCoins(Number(storedCoins));
    const storedPurchased = localStorage.getItem('purchasedItems');
    if (storedPurchased) setPurchased(JSON.parse(storedPurchased));
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
      // Добавляем товар в список купленных
      const updatedPurchased = [...purchased, item.name];
      setPurchased(updatedPurchased);
      localStorage.setItem('purchasedItems', JSON.stringify(updatedPurchased));
    } catch {
      /* ignore */
    }
    alert(`Вы приобрели «${item.name}»!`);
  };

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
      <div className="space-y-4">
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