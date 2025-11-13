import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CourseNode } from './CourseGraph';
import { useNavigate } from 'react-router-dom';

interface CustomCourseNodeProps {
  data: {
    label: string;
    course: CourseNode;
    done: boolean;
  };
}

const CustomCourseNode: React.FC<CustomCourseNodeProps> = ({ data }) => {
  const navigate = useNavigate();
  const { label, course, done } = data;

  const onNodeClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div
      className={`relative rounded-lg shadow-md p-3 cursor-pointer border-2 ${
        done ? 'bg-green-500 border-green-600' : 'bg-blue-500 border-blue-600'
      } text-white text-center`}
      onClick={onNodeClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-sm">{label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomCourseNode;