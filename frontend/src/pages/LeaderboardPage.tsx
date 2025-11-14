import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/AppContext';

// Define the types based on the backend schemas
interface University {
  id: number;
  name: string;
  points: number;
  image_url: string | null;
}

interface LeaderboardEntry {
// ... (rest of the file is the same until the render part)
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-500 dark:text-gray-400 w-8">{entry.rank}.</span>
                <img src={entry.university.image_url || `https://api.dicebear.com/6.x/initials/svg?seed=${entry.university.name}`} alt={entry.university.name} className="w-10 h-10 rounded-full mr-4 object-contain"/>
                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.university.name}</span>
              </div>
              <div className="text-right">
// ... (rest of the file is the same)                <p className="text-sm text-gray-600 dark:text-gray-400">Очки</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{entry.university.points}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
