import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<CourseNode | null>(null);

  /**
   * Рекурсивный алгоритм построения позиций узлов. Возвращает массив узлов и
   * устанавливает координаты через замыкание xCounter. Каждый уровень
   * располагается по оси Y на одинаковом расстоянии.
   */
  const buildLayout = (
    node: CourseNode,
    depth: number,
    xCounter: { value: number },
    nodesArr: Node[],
    edgesArr: Edge[],
  ): { node: Node; width: number } => {
    // Если лист, присваиваем текущий x и увеличиваем счётчик
    let x: number;
    let width: number;
    if (!node.children || node.children.length === 0) {
      x = xCounter.value;
      width = 1;
      xCounter.value += 1;
    } else {
      const childResults: { node: Node; width: number }[] = [];
      node.children.forEach((child) => {
        const res = buildLayout(child, depth + 1, xCounter, nodesArr, edgesArr);
        childResults.push(res);
      });
      const firstX = childResults[0].node.position.x;
      const lastX = childResults[childResults.length - 1].node.position.x;
      x = (firstX + lastX) / 2;
      width = childResults.reduce((acc, cur) => acc + cur.width, 0);
    }
    const posX = x * 200;
    const posY = depth * 180;
    const rfNode: Node = {
      id: node.id,
      data: { label: node.title, course: node },
      position: { x: posX, y: posY },
      type: 'default',
    };
    nodesArr.push(rfNode);
    if (node.children) {
      node.children.forEach((child) => {
        edgesArr.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
      });
    }
    return { node: rfNode, width };
  };

  useEffect(() => {
    const counter = { value: 0 };
    const nodesArr: Node[] = [];
    const edgesArr: Edge[] = [];
    buildLayout(root, 0, counter, nodesArr, edgesArr);
    const styled = nodesArr.map((n) => {
      const course = n.data.course as CourseNode;
      return {
        ...n,
        draggable: false,
        data: { ...n.data, done: completed[course.id] },
        style: {
          borderRadius: '8px',
          padding: '6px 10px',
          color: '#fff',
          backgroundColor: completed[course.id] ? '#16a34a' : '#2563eb',
          border: '1px solid rgba(0,0,0,0.1)',
          fontSize: '12px',
        },
      } as Node;
    });
    setNodes(styled);
    setEdges(edgesArr);
  }, [root, completed]);

  /**
   * Обработчик клика на узел: отмечает выбранный узел и начисляет награды,
   * если курс ещё не завершён.
   */
  const onNodeClick = (_: any, node: Node) => {
    const course = node.data.course as CourseNode;
    setSelected(course);
    if (!completed[course.id]) {
      onComplete(course);
    }
  };

  return (
    <div className="w-full h-[500px] overflow-x-auto">
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