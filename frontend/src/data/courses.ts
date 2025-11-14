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
    title: 'Программист',
    info: 'Постройте свою карьеру программиста, проходя курсы от алгоритмов до фреймворков.',
    xp: 0,
    coins: 0,
    children: [
      {
        id: 'algorithms',
        title: 'Алгоритмы',
        info: 'Изучите базовые алгоритмы и структуры данных для эффективного решения задач.',
        xp: 50,
        coins: 10,
        children: [
          {
            id: 'datastructures',
            title: 'Структуры данных',
            info: 'Списки, стеки, очереди, деревья и графы – основные инструменты для программиста.',
            xp: 50,
            coins: 10,
          },
        ],
      },
      {
        id: 'languages',
        title: 'Языки программирования',
        info: 'Выберите язык и освоите его особенности.',
        xp: 0,
        coins: 0,
        children: [
          {
            id: 'js',
            title: 'JavaScript',
            info: 'Изучите синтаксис JavaScript и основы работы с DOM.',
            xp: 40,
            coins: 8,
            children: [
              {
                id: 'js-bootcamp-1',
                title: 'JS Bootcamp I',
                info: 'Практический курс по основам JavaScript.',
                xp: 60,
                coins: 12,
              },
              {
                id: 'js-bootcamp-2',
                title: 'JS Bootcamp II',
                info: 'Продвинутые темы: асинхронность, тестирование, фронтенд‑фреймворки.',
                xp: 70,
                coins: 15,
              },
            ],
          },
          {
            id: 'python',
            title: 'Python',
            info: 'Изучите язык Python и его применение в анализе данных и веб‑разработке.',
            xp: 40,
            coins: 8,
            children: [
              {
                id: 'python-bootcamp',
                title: 'Python Bootcamp',
                info: 'Базовые и продвинутые возможности Python, включая библиотеки.',
                xp: 70,
                coins: 15,
              },
            ],
          },
        ],
      },
    ],
  },
  'Лингвист': {
    id: 'ling-root',
    title: 'Лингвист',
    info: 'Освойте языковедение, грамматику и современную лингвистику.',
    xp: 0,
    coins: 0,
    children: [
      { id: 'phonetics', title: 'Фонетика', info: 'Звуковая сторона языка.', xp: 40, coins: 8 },
      { id: 'syntax', title: 'Синтаксис', info: 'Законы построения предложений.', xp: 50, coins: 10 },
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
