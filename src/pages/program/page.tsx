import { useState, useCallback, useRef } from 'react'
import { 
  ReactFlow, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background, 
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react'
import type { Node, Edge, Connection, NodeTypes } from '@xyflow/react'
import { Box } from '@mui/material'
import '@xyflow/react/dist/style.css'

// Import node components and types
import {
  OperatorNode,
  RuleNode,
  ConstraintNode,
  DistributionNode,
  type ProgramNodeData,
  CreateNodeButton,
  NodePalette,
  NodePropertyPanel,
  type NodeType,
  type PanelMode
} from './components'

// Node types configuration with handlers
const createNodeTypes = (handlers: {
  onDelete: (nodeId: string) => void
  onEdit: (nodeId: string) => void
  onToggleActive: (nodeId: string) => void
}): NodeTypes => ({
  operator: (props: any) => <OperatorNode {...props} {...handlers} />,
  rule: (props: any) => <RuleNode {...props} {...handlers} />,
  constraint: (props: any) => <ConstraintNode {...props} {...handlers} />,
  distribution: (props: any) => <DistributionNode {...props} {...handlers} />,
})

function ProgramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  
  // NodePropertyPanel state
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>('creation')
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect = useCallback(
    (params: Connection) => {
      // Basic connection validation
      const sourceNode = nodes.find(node => node.id === params.source)
      const targetNode = nodes.find(node => node.id === params.target)
      
      // Prevent self-connections
      if (params.source === params.target) return
      
      // Add more validation rules here as needed
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, nodes]
  )

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: type.charAt(0).toUpperCase() + type.slice(1),
          isActive: true,
          ...(type === 'operator' && { operatorType: 'SUM' as const }),
          ...(type === 'constraint' && { parameter: 'tx_type' }),
          ...(type === 'distribution' && { distributionType: 'do_to_distribution' })
        },
      }

      setNodes((nds) => [...nds, newNode])
      
      // Open panel in creation mode for the new node
      setEditingNode(newNode)
      setPanelMode('creation')
      setIsPanelVisible(true)
    },
    [setNodes]
  )

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
      setIsPanelVisible(false)
    }
  }, [selectedNode, setNodes, setEdges])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
    if (editingNode?.id === nodeId) {
      setEditingNode(null)
      setIsPanelVisible(false)
    }
  }, [setNodes, setEdges, selectedNode, editingNode])

  const editNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setEditingNode(node)
      setPanelMode('edit')
      setIsPanelVisible(true)
    }
  }, [nodes])

  const toggleNodeActive = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                isActive: !(node.data as any).isActive,
              },
            }
          : node
      )
    )
  }, [setNodes])

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const addNodeToCanvas = useCallback((nodeType: NodeType) => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!reactFlowBounds) return

    // Calculate center position of the canvas
    const position = {
      x: reactFlowBounds.width / 2 - 100, // Offset by half node width
      y: reactFlowBounds.height / 2 - 50,  // Offset by half node height
    }

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        isActive: true,
        ...(nodeType === 'operator' && { operatorType: 'SUM' as const }),
        ...(nodeType === 'constraint' && { parameter: 'tx_type' }),
        ...(nodeType === 'distribution' && { distributionType: 'do_to_distribution' })
      },
    }

    setNodes((nds) => [...nds, newNode])
    setIsPaletteOpen(false) // Close the palette after adding node
    
    // Open panel in creation mode for the new node
    setEditingNode(newNode)
    setPanelMode('creation')
    setIsPanelVisible(true)
  }, [setNodes])

  const handleSaveNode = useCallback((nodeData: any) => {
    if (editingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...nodeData,
                },
              }
            : node
        )
      )
      
      // Update selectedNode if it's the same as editingNode
      if (selectedNode?.id === editingNode.id) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            ...nodeData,
          },
        })
      }
    }
  }, [editingNode, setNodes, selectedNode])

  const handleClosePanel = useCallback(() => {
    setIsPanelVisible(false)
    setEditingNode(null)
  }, [])

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Main Canvas */}
      <Box sx={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={createNodeTypes({ onDelete: deleteNode, onEdit: editNode, onToggleActive: toggleNodeActive })}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>

        {/* Centered Add Button - Only show when no nodes exist */}
        {nodes.length === 0 && (
          <CreateNodeButton onOpenPalette={() => setIsPaletteOpen(true)} />
        )}
      </Box>

      {/* Node Palette */}
      <NodePalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onDragStart={onDragStart}
        onNodeClick={addNodeToCanvas}
      />

      {/* Node Property Panel Modal */}
      <NodePropertyPanel
        isVisible={isPanelVisible}
        mode={panelMode}
        selectedNode={editingNode}
        onClose={handleClosePanel}
        onDeleteNode={deleteSelectedNode}
        onSaveNode={handleSaveNode}
      />
    </Box>
  )
}

function Program() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <ProgramCanvas />
      </ReactFlowProvider>
    </div>
  )
}

export default Program
