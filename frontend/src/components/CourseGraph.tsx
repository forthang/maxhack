import React from 'react';
import FlowWrapper from './FlowWrapper';

// This interface is duplicated from EducationPage.tsx.
// In a real app, this would be in a shared types file.
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
  onComplete: (node: CourseNode) => void; // This prop is not used by the Flow components, but let's keep it for now.
}

const CourseGraph: React.FC<CourseGraphProps> = ({ root, completed }) => {
  // The onComplete logic is handled inside the CustomCourseNode, not passed here.
  // This component just sets up the React Flow provider and renderer.
  return (
    <div style={{ height: '600px' }} className="rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
      <FlowWrapper root={root} completed={completed} />
    </div>
  );
};

export default CourseGraph;
