import React, { useEffect, useState, useCallback } from 'react';
// Импортируем ReactFlow из пакета @xyflow/react. Это лёгкая версия
// библиотеки React Flow, которая позволяет строить графы. Мы будем
// использовать только отображение узлов и связей без встроенных
// библиотек Overflow UI.
import {
  ReactFlow,
  Background,
  Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/**
 * Тип узла дорожной карты. Каждый узел имеет уникальный идентификатор, название,
 * описание, награду и опциональных детей. Этот интерфейс используется для
 * построения графа курсов через библиотеку React Flow.
 */
export interface CourseNode {
  id: string;
  title: string;
  info: string;
  xp: number;
  coins: number;
  children?: CourseNode[];
}

interface CourseGraphProps {
  root: CourseNode;
  completed: { [key: string]: boolean };
  onComplete: (node: CourseNode) => void;
}


/**
 * CourseGraph строит интерактивный граф курсов на основе React Flow. Позиции
 * узлов вычисляются по алгоритму tidy tree: листья располагаются на
 * одинаковом расстоянии, а родительские узлы — по центру между детьми.
 * При клике на узел отображается панель с подробной информацией и кнопкой
 * «пройти», если курс ещё не завершён.
 */
const CourseGraph: React.FC<CourseGraphProps> = ({ root, completed, onComplete }) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selected, setSelected] = useState<CourseNode | null>(null);

  /**
   * Простая раскладка узлов для React Flow. Каждому узлу присваиваются
   * координаты на основе глубины (основная ось X) и текущего счётчика
   * (ось Y). Это гарантирует, что все узлы будут видимыми. Уровни
   * располагаются по горизонтали, а последовательность – по вертикали.
   */
  const flattenLayout = (
    node: CourseNode,
    depth: number,
    state: { yCounter: number },
    nodesArr: any[],
    edgesArr: any[],
  ): void => {
    const x = depth * 200;
    const y = state.yCounter * 120;
    state.yCounter += 1;
    const rfNode = {
      id: node.id,
      data: { label: node.title, course: node },
      position: { x, y },
    };
    nodesArr.push(rfNode);
    if (node.children) {
      node.children.forEach((child) => {
        edgesArr.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
        flattenLayout(child, depth + 1, state, nodesArr, edgesArr);
      });
    }
  };

  useEffect(() => {
    const nodesArr: any[] = [];
    const edgesArr: any[] = [];
    const state = { yCounter: 0 };
    // Построить простую раскладку: глубина определяет X, порядок – Y
    flattenLayout(root, 0, state, nodesArr, edgesArr);
    // Применяем стили для завершённых и незавершённых курсов
    const styled = nodesArr.map((n) => {
      const course = n.data.course as CourseNode;
      const done = completed[course.id];
      return {
        ...n,
        data: { ...n.data, done },
        style: {
          borderRadius: '8px',
          padding: '6px 10px',
          color: '#fff',
          backgroundColor: done ? '#16a34a' : '#2563eb',
          border: '1px solid rgba(0,0,0,0.1)',
          fontSize: '12px',
        },
        draggable: false,
      };
    });
    setNodes(styled);
    setEdges(edgesArr);
  }, [root, completed]);

  /**
   * Обработчик клика на узел: отмечает выбранный узел и начисляет награды,
   * если курс ещё не завершён.
   */
  const onNodeClick = (_: any, node: any) => {
    const course = node.data.course as CourseNode;
    setSelected(course);
    if (!completed[course.id]) {
      onComplete(course);
    }
  };

  return (
    // Увеличиваем высоту контейнера до 600px, чтобы граф не выходил за пределы
    // видимой области. React Flow сам масштабирует узлы через fitView.
    <div className="w-full h-[600px] overflow-x-auto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={false}
        panOnScroll
        zoomOnScroll
        className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner"
      >
        <Background gap={16} color="#e5e7eb" variant="dots" />
        <Controls position="bottom-right" />
      </ReactFlow>
      {selected && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md fade-in max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">{selected.title}</h3>
          <p className="mb-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{selected.info}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Награда: {selected.xp} XP, {selected.coins} монет
          </p>
          <div className="mt-2 flex space-x-3">
            {/* Кнопка завершения видна только если курс не завершён */}
            {!completed[selected.id] && (
              <button
                onClick={() => onComplete(selected)}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Пройти курс
              </button>
            )}
            {/* Переход к отдельной странице с содержимым урока */}
            <a
              href={`/course/${selected.id}`}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Открыть
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseGraph;