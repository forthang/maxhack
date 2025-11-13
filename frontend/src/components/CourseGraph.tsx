import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowRenderer from './FlowRenderer';

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

const CourseGraph: React.FC<CourseGraphProps> = ({ root, completed, onComplete }) => {
  return (
    <div className="w-full h-[600px] overflow-x-auto">
      <ReactFlowProvider>
        <FlowRenderer
          root={root}
          completed={completed}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default CourseGraph;
