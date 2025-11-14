import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowRenderer from './FlowRenderer';
import { CourseNode } from './CourseGraph';

interface FlowWrapperProps {
  root: CourseNode;
  completed: { [key: string]: boolean };
}

const FlowWrapper: React.FC<FlowWrapperProps> = ({ root, completed }) => {
  return (
    <ReactFlowProvider>
      <FlowRenderer
        root={root}
        completed={completed}
      />
    </ReactFlowProvider>
  );
};

export default FlowWrapper;
