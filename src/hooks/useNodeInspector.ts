'use client';

import { useState } from 'react';
import { SUPPLY_CHAIN_NODES } from '@/data/mockData';
import { SupplyChainNode } from '@/types';

export function useNodeInspector() {
  const [activeNodeId, setActiveNodeId] = useState<SupplyChainNode['id']>('trader');
  const [isHighlighted, setIsHighlighted] = useState(false);

  const activeNode = SUPPLY_CHAIN_NODES.find((n) => n.id === activeNodeId) ?? SUPPLY_CHAIN_NODES[1];

  const selectNode = (nodeId: SupplyChainNode['id']) => {
    setActiveNodeId(nodeId);
    setIsHighlighted(true);
    setTimeout(() => {
      setIsHighlighted(false);
    }, 600);
  };

  return {
    activeNodeId,
    activeNode,
    isHighlighted,
    selectNode,
  };
}
