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
   * Tidy tree layout.

   * Calculates x/y positions for each course node so that the tree is
   * centered and symmetrical. Leaves are spaced evenly horizontally.
   * Returns a list of node positions and total number of leaves in the
   * current subtree. Positions are relative; they will be shifted later so
   * that the minimum x coordinate is zero.
   */
  const computePositions = (
    node: CourseNode,
    depth: number,
    leafIndex: number,
    positions: Array<{ id: string; x: number; y: number; course: CourseNode }>,
    edgesArr: any[],
  ): { leafCount: number; nextLeafIndex: number } => {
    // If no children, this is a leaf: assign x based on current leaf index
    const vSpacing = 160; // vertical distance between levels
    const hSpacing = 200; // horizontal spacing unit
    if (!node.children || node.children.length === 0) {
      const x = leafIndex * hSpacing;
      const y = depth * vSpacing;
      positions.push({ id: node.id, x, y, course: node });
      return { leafCount: 1, nextLeafIndex: leafIndex + 1 };
    }
    // Internal node: layout children first
    let startIndex = leafIndex;
    let childXs: number[] = [];
    let totalLeaves = 0;
    node.children.forEach((child) => {
      edgesArr.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
      const res = computePositions(child, depth + 1, startIndex, positions, edgesArr);
      // Find x of child root (the first entry for that child)
      // It will be added to positions; find position with id=child.id
      const childPos = positions.find((p) => p.id === child.id);
      if (childPos) {
        childXs.push(childPos.x);
      }
      startIndex = res.nextLeafIndex;
      totalLeaves += res.leafCount;
    });
    // Compute x coordinate as midpoint of child x positions
    let x: number;
    if (childXs.length === 1) {
      x = childXs[0];
    } else {
      const minX = Math.min(...childXs);
      const maxX = Math.max(...childXs);
      x = (minX + maxX) / 2;
    }
    const y = depth * vSpacing;
    positions.push({ id: node.id, x, y, course: node });
    return { leafCount: totalLeaves, nextLeafIndex: startIndex };
  };

  useEffect(() => {
    const positions: Array<{ id: string; x: number; y: number; course: CourseNode }> = [];
    const edgesArr: any[] = [];
    // Compute tidy tree layout. The helper returns leaf counts but we ignore the result.
    computePositions(root, 0, 0, positions, edgesArr);
    // Shift all x positions so that the minimum x is zero. This keeps the
    // tree within the viewport and centered to the left.
    const minX = positions.length > 0 ? Math.min(...positions.map((p) => p.x)) : 0;
    // Build ReactFlow nodes with styling based on completion status. We
    // include a slight scaling on hover via CSS transition for interactivity.
    const rfNodes = positions.map((pos) => {
      const course = pos.course;
      const done = completed[course.id];
      return {
        id: pos.id,
        data: { label: course.title, course, done },
        position: { x: pos.x - minX, y: pos.y },
        style: {
          borderRadius: '8px',
          padding: '4px 8px',
          color: '#fff',
          backgroundColor: done ? '#16a34a' : '#2563eb',
          border: '1px solid rgba(0,0,0,0.1)',
          fontSize: '12px',
          transition: 'transform 0.2s ease',
        },
        className: 'hover:scale-105',
        draggable: false,
      };
    });
    setNodes(rfNodes);
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