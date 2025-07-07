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
import { Box, Typography, Paper, Divider, IconButton, Tooltip } from '@mui/material'
import {
  Functions as OperatorIcon,
  Rule as RuleIcon,
  FilterList as ConstraintIcon,
  AccountBalance as DistributionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import '@xyflow/react/dist/style.css'

// Import node components and types
import {
  OperatorNode,
  RuleNode,
  ConstraintNode,
  DistributionNode,
  type ProgramNodeData
} from './components'

// Node types configuration

const nodeTypes: NodeTypes = {
  operator: OperatorNode,
  rule: RuleNode,
  constraint: ConstraintNode,
  distribution: DistributionNode,
}

// Palette items for drag and drop
const paletteItems = [
  {
    type: 'operator',
    label: 'Operator',
    icon: <OperatorIcon />,
    description: 'SUM, MAX, SHARE, AND, OR'
  },
  {
    type: 'rule',
    label: 'Reward Rule',
    icon: <RuleIcon />,
    description: 'Define reward logic'
  },
  {
    type: 'constraint',
    label: 'Constraint',
    icon: <ConstraintIcon />,
    description: 'Set conditions and filters'
  },
  {
    type: 'distribution',
    label: 'Distribution',
    icon: <DistributionIcon />,
    description: 'Configure point distribution'
  }
] as const

type NodeType = typeof paletteItems[number]['type']

function ProgramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
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
          ...(type === 'operator' && { operatorType: 'SUM' as const }),
          ...(type === 'constraint' && { parameter: 'tx_type' }),
          ...(type === 'distribution' && { distributionType: 'do_to_distribution' })
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const getNodeDataDisplay = (node: Node) => {
    const data = node.data as any
    switch (node.type) {
      case 'operator':
        return `Operator: ${data.operatorType || 'Not set'}`
      case 'constraint':
        return `Parameter: ${data.parameter || 'Not set'}`
      case 'distribution':
        return `Distribution: ${data.distributionType || 'Not set'}`
      default:
        return `Type: ${node.type}`
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left Sidebar - Palette */}
      <Paper
        elevation={2}
        sx={{
          width: 250,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Node Palette
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {paletteItems.map((item) => (
          <Paper
            key={item.type}
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              cursor: 'grab',
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
            draggable
            onDragStart={(event) => onDragStart(event, item.type)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {item.icon}
              <Typography variant="subtitle2" fontWeight="bold">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.description}
            </Typography>
          </Paper>
        ))}
      </Paper>

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
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>
      </Box>

      {/* Right Sidebar - Property Panel */}
      <Paper
        elevation={2}
        sx={{
          width: 300,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderLeft: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {selectedNode ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedNode.data.label}
              </Typography>
              <Tooltip title="Delete Node">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={deleteSelectedNode}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Node Type: {selectedNode.type}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {getNodeDataDisplay(selectedNode)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No node selected. Click on a node to view its properties.
          </Typography>
        )}
      </Paper>
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
