import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Link } from 'react-router-dom';
import { CourseNode } from './CourseGraph';

interface CustomCourseNodeProps {
  data: {
    label: string;
    course: CourseNode;
    done: boolean;
    onComplete: (node: CourseNode) => void;
  };
}

const CustomCourseNode: React.FC<CustomCourseNodeProps> = ({ data }) => {
  const { label, course, done, onComplete } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNodeClick = (e: React.MouseEvent) => {
    // Prevent click from propagating to the React Flow pane
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node from toggling expansion
    onComplete(course);
  };

  return (
    <div
      onClick={handleNodeClick}
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
        done ? 'bg-green-100 dark:bg-green-900 border-green-300' : 'bg-white dark:bg-gray-800 border-gray-300'
      } border-2`}
      style={{ width: 200 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="font-bold text-center text-gray-800 dark:text-gray-100">{label}</div>
      {isExpanded && (
        <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>{course.info}</p>
          <div className="flex flex-col space-y-2">
            <Link
              to={`/course/${course.id}`}
              onClick={(e) => e.stopPropagation()} // Prevent node click
              className="text-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              Подробнее
            </Link>
            <button
              onClick={handleButtonClick}
              disabled={done}
              className="w-full px-2 py-1 text-xs font-semibold text-white rounded-md bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {done ? 'Завершено' : 'Завершить'}
            </button>
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
};

export default CustomCourseNode;

