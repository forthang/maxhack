// This interface is for a single node in the course graph.
export interface CourseNode {
  id: string;
  title: string;
  info: string;
  xp: number;
  coins: number;
  children?: CourseNode[];
}

// Hardcoded course data. In a real application, this would likely come from an API.
export const courseTrees: { [key: string]: CourseNode } = {
  'Программист': {
    id: 'prog-root',
    title: 'Трек "Веб-разработчик"',
    info: 'Станьте востребованным веб-разработчиком. Вы изучите основы создания сайтов, научитесь работать с фронтенд- и бэкенд-фреймворками и создадите свои первые проекты.',
    xp: 0,
    coins: 0,
    children: [
      {
        id: 'html-css',
        title: 'HTML и CSS',
        info: 'Фундамент веба. Научитесь создавать структуру и стилизовать веб-страницы, чтобы они выглядели профессионально и адаптивно.',
        xp: 30,
        coins: 5,
        children: [
          {
            id: 'flexbox-grid',
            title: 'Flexbox и Grid',
            info: 'Освойте современные техники верстки для создания сложных и отзывчивых макетов.',
            xp: 40,
            coins: 8,
          },
        ],
      },
      {
        id: 'js',
        title: 'JavaScript',
        info: 'Изучите главный язык фронтенда. Вы научитесь делать страницы интерактивными, работать с событиями и асинхронными запросами.',
        xp: 50,
        coins: 10,
        children: [
          {
            id: 'react',
            title: 'React',
            info: 'Погрузитесь в самый популярный фреймворк для создания пользовательских интерфейсов. Компоненты, хуки и управление состоянием.',
            xp: 80,
            coins: 15,
          },
          {
            id: 'nodejs',
            title: 'Node.js',
            info: 'Используйте JavaScript на сервере. Научитесь создавать быстрые и масштабируемые API для своих приложений.',
            xp: 70,
            coins: 12,
          },
        ],
      },
    ],
  },
  'Data Scientist': {
    id: 'ds-root',
    title: 'Трек "Data Scientist"',
    info: 'Войдите в мир анализа данных. Вы научитесь работать с большими данными, строить модели машинного обучения и визуализировать результаты.',
    xp: 0,
    coins: 0,
    children: [
      {
        id: 'python-basics',
        title: 'Основы Python',
        info: 'Изучите синтаксис и основные библиотеки Python (NumPy, Pandas), необходимые для анализа данных.',
        xp: 50,
        coins: 10,
      },
      {
        id: 'ml-basics',
        title: 'Машинное обучение',
        info: 'Познакомьтесь с основными алгоритмами машинного обучения: регрессия, классификация, кластеризация.',
        xp: 90,
        coins: 20,
        children: [
          {
            id: 'scikit-learn',
            title: 'Библиотека Scikit-learn',
            info: 'Практическое применение моделей машинного обучения с использованием популярной библиотеки.',
            xp: 60,
            coins: 12,
          },
          {
            id: 'neural-networks',
            title: 'Нейронные сети',
            info: 'Основы глубокого обучения. Создайте и обучите свою первую нейронную сеть с помощью Keras или PyTorch.',
            xp: 100,
            coins: 25,
          },
        ],
      },
    ],
  },
  'Лингвист': {
    id: 'ling-root',
    title: 'Трек "Современный лингвист"',
    info: 'Погрузитесь в науку о языке. Вы изучите, как языки устроены, как они меняются и как их можно анализировать с помощью современных технологий.',
    xp: 0,
    coins: 0,
    children: [
      { id: 'phonetics', title: 'Фонетика и фонология', info: 'Изучите звуковую систему языка, от артикуляции до восприятия.', xp: 40, coins: 8 },
      { id: 'morphology', title: 'Морфология', info: 'Разберитесь, как строятся слова и какие значения несут их части.', xp: 45, coins: 9 },
      { id: 'syntax', title: 'Синтаксис', info: 'Научитесь анализировать структуру предложений и понимать связи между словами.', xp: 50, coins: 10 },
      {
        id: 'computational-linguistics',
        title: 'Компьютерная лингвистика',
        info: 'Откройте для себя, как компьютеры обрабатывают и понимают человеческий язык. Основы NLP.',
        xp: 80,
        coins: 18,
      },
    ],
  },
};

// Helper function to find a course node by its ID in any of the trees
export function findCourseById(id: string): CourseNode | null {
  for (const trackName in courseTrees) {
    const queue: CourseNode[] = [courseTrees[trackName]];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node?.id === id) {
        return node;
      }
      if (node?.children) {
        queue.push(...node.children);
      }
    }
  }
  return null;
}
