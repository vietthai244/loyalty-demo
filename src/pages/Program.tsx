import { useState, useCallback } from 'react'
import { ReactFlow, addEdge, useNodesState, useEdgesState, Controls, Background, MiniMap } from '@xyflow/react'
import type { Node, Edge, Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End' },
    position: { x: 250, y: 225 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

function Program() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default Program
