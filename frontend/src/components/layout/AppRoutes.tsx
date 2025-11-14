import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import PageWrapper from './PageWrapper';

// Import Pages
import SchedulePage from '../../pages/SchedulePage';
import EventsPage from '../../pages/EventsPage';
import LeaderboardPage from '../../pages/LeaderboardPage';
import EducationPage from '../../pages/EducationPage';
import ProfilePage from '../../pages/ProfilePage';
import StorePage from '../../pages/StorePage';
import EventDetailsPage from '../../pages/EventDetailsPage';
import ScheduleItemDetailsPage from '../../pages/ScheduleItemDetailsPage';
import UniversityDetailsPage from '../../pages/UniversityDetailsPage';
import CourseDetailsPage from '../../pages/CourseDetailsPage';
import RecommendationsPage from '../../pages/RecommendationsPage';

// NavLink is a standalone component related to routing.
const NavLink: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className="flex flex-col items-center justify-center w-1/4 h-full text-sm transition-colors group">
      <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-brand/20 text-brand' : 'text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'}`}>
        {icon}
      </div>
      <span className={`mt-1 text-xs font-medium ${isActive ? 'text-brand' : 'text-neutral-500'}`}>{label}</span>
    </Link>
  );
};

export const AppRoutes: React.FC<{ isUIBlocked: boolean }> = ({ isUIBlocked }) => {

  return (
    <>
      <main className={`flex-grow pb-24 ${isUIBlocked ? 'blur-sm' : ''}`}>
        <Routes>
          <Route path="/" element={<PageWrapper><SchedulePage /></PageWrapper>} />
          <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
          <Route path="/education" element={<PageWrapper><EducationPage /></PageWrapper>} />
          <Route path="/leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/event/:id" element={<PageWrapper><EventDetailsPage /></PageWrapper>} />
          <Route path="/schedule/:id" element={<PageWrapper><ScheduleItemDetailsPage /></PageWrapper>} />
          <Route path="/university/:id" element={<PageWrapper><UniversityDetailsPage /></PageWrapper>} />
          <Route path="/course/:id" element={<PageWrapper><CourseDetailsPage /></PageWrapper>} />
          <Route path="/store" element={<PageWrapper><StorePage /></PageWrapper>} />
          <Route path="/recommendations" element={<PageWrapper><RecommendationsPage /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around shadow-t-2xl ${isUIBlocked ? 'blur-sm' : ''}`}>
        <NavLink to="/" label="Расписание" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <NavLink to="/recommendations" label="Рекомендации" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <NavLink to="/leaderboard" label="Лидеры" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <NavLink to="/profile" label="Профиль" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
      </nav>
    </>
  );
};
