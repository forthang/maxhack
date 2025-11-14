import React from 'react';
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   useNodesState,
//   useEdgesState,
//   useReactFlow,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';
// import CustomCourseNode from './CustomCourseNode';

import { CourseNode } from './CourseGraph'; // Import CourseNode interface

interface FlowRendererProps {
  root: CourseNode;
  completed: { [key: string]: boolean };
}

// const nodeTypes = { customCourse: CustomCourseNode };

const FlowRenderer: React.FC<FlowRendererProps> = ({ root, completed }) => {
  // Temporarily remove all hooks to isolate the error
  // const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // const { fitView } = useReactFlow();

  // const computePositions = (
  //   node: CourseNode,
  //   depth: number,
  //   leafIndex: number,
  //   positions: Array<{ id: string; x: number; y: number; course: CourseNode }>,
  //   edgesArr: any[],
  // ): { leafCount: number; nextLeafIndex: number } => {
  //   const vSpacing = 160;
  //   const hSpacing = 200;
  //   if (!node.children || node.children.length === 0) {
  //     const x = leafIndex * hSpacing;
  //     const y = depth * vSpacing;
  //     positions.push({ id: node.id, x, y, course: node });
  //     return { leafCount: 1, nextLeafIndex: leafIndex + 1 };
  //   }
  //   let startIndex = leafIndex;
  //   let childXs: number[] = [];
  //   let totalLeaves = 0;
  //   node.children.forEach((child) => {
  //     edgesArr.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id });
  //     const res = computePositions(child, depth + 1, startIndex, positions, edgesArr);
  //     const childPos = positions.find((p) => p.id === child.id);
  //     if (childPos) {
  //       childXs.push(childPos.x);
  //     }
  //     startIndex = res.nextLeafIndex;
  //     totalLeaves += res.leafCount;
  //   });
  //   let x: number;
  //   if (childXs.length === 1) {
  //     x = childXs[0];
  //   } else {
  //     const minX = Math.min(...childXs);
  //     const maxX = Math.max(...childXs);
  //     x = (minX + maxX) / 2;
  //   }
  //   const y = depth * vSpacing;
  //   positions.push({ id: node.id, x, y, course: node });
  //   return { leafCount: totalLeaves, nextLeafIndex: startIndex };
  // };

  // useEffect(() => {
  //   const positions: Array<{ id: string; x: number; y: number; course: CourseNode }> = [];
  //   const edgesArr: any[] = [];
  //   computePositions(root, 0, 0, positions, edgesArr);
  //   const minX = positions.length > 0 ? Math.min(...positions.map((p) => p.x)) : 0;
  //   const rfNodes = positions.map((pos) => {
  //     const course = pos.course;
  //     const done = completed[course.id];
  //     return {
  //       id: pos.id,
  //       type: 'customCourse',
  //       data: {
  //         label: course.title,
  //         course,
  //         done,
  //       },
  //       position: { x: pos.x - minX, y: pos.y },
  //       draggable: false,
  //     };
  //   });
  //   setNodes(rfNodes);
  //   setEdges(edgesArr);

  //   requestAnimationFrame(() => {
  //     fitView();
  //   });
  // }, [root, completed, fitView]);

  return (
    <div>
      <p>FlowRenderer is rendering (simplified version)</p>
      <p>Root: {root.title}</p>
    </div>
  );
};

export default FlowRenderer;