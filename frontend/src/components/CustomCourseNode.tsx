import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomCourseNode = ({ data }: any) => {
  const { label, done } = data;

  return (
    <div
      style={{
        background: done ? '#a7f3d0' : 'white',
        border: '1px solid #cbd5e1',
        borderRadius: '0.5rem',
        padding: '1rem',
        width: 150,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomCourseNode;
