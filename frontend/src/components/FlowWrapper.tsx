import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowRenderer from './FlowRenderer';
import { CourseNode } from './CourseGraph';

interface FlowWrapperProps {
  root: CourseNode;
  completed: { [key: string]: boolean };
  onComplete: (node: CourseNode) => void;
}

const FlowWrapper: React.FC<FlowWrapperProps> = ({ root, completed, onComplete }) => {
  return (
    <ReactFlowProvider>
      <FlowRenderer
        root={root}
        completed={completed}
        onComplete={onComplete}
      />
    </ReactFlowProvider>
  );
};

export default FlowWrapper;
