import React, { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { Panel, Flex, Button, Typography, Icon } from '@maxhub/max-ui';

import Schedule from './components/Schedule';
import Events from './components/Events';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Education from './components/Education';

// Application component defining global layout and routes. Includes a simple
// dark/light theme toggle and bottom navigation. Each route renders a
// corresponding page component. The navigation is intentionally minimal
// because more detailed styling will be added later.

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className={darkMode ? 'dark' : 'light'} style={{ minHeight: '100vh' }}>
      <Panel mode="primary" className="app-panel" style={{ minHeight: '100vh' }}>
        <Flex direction="column" justify="space-between" style={{ minHeight: '100vh' }}>
          <div style={{ flexGrow: 1, paddingBottom: '60px' }}>
            <Routes>
              <Route path="/" element={<Schedule />} />
              <Route path="/education" element={<Education />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <nav
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', borderTop: '1px solid #e0e0e0', background: darkMode ? '#222' : '#fff' }}
          >
            <Flex justify="space-around" align="center" style={{ height: '100%' }}>
              <Link to="/">Расписание</Link>
              <Link to="/education">Обучение</Link>
              <Link to="/leaderboard">Лидеры</Link>
              <Link to="/events">События</Link>
              <Link to="/profile">Профиль</Link>
              <Button mode="tertiary" size="s" onClick={toggleTheme}>
                {darkMode ? 'Светлая' : 'Тёмная'}
              </Button>
            </Flex>
          </nav>
        </Flex>
      </Panel>
    </div>
  );
};

export default App;