import { useState, useCallback, useRef } from 'react'
import { 
  ReactFlow, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background, 
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position
} from '@xyflow/react'
import type { Node, Edge, Connection, NodeTypes } from '@xyflow/react'
import { Box, Typography, Paper, Divider, IconButton, Tooltip } from '@mui/material'
import {
  Add as AddIcon,
  Functions as OperatorIcon,
  Rule as RuleIcon,
  FilterList as ConstraintIcon,
  AccountBalance as DistributionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import '@xyflow/react/dist/style.css'

// Custom Node Types
const OperatorNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <Paper
    elevation={selected ? 8 : 2}
    sx={{
      p: 2,
      minWidth: 120,
      border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
      borderRadius: 2,
      backgroundColor: '#e3f2fd',
      cursor: 'pointer',
    }}
  >
    <Handle type="target" position={Position.Top} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <OperatorIcon color="primary" fontSize="small" />
      <Typography variant="subtitle2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      {data.operatorType || 'Operator'}
    </Typography>
    <Handle type="source" position={Position.Bottom} />
  </Paper>
)

const RuleNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <Paper
    elevation={selected ? 8 : 2}
    sx={{
      p: 2,
      minWidth: 120,
      border: selected ? '2px solid #2e7d32' : '1px solid #e0e0e0',
      borderRadius: 2,
      backgroundColor: '#e8f5e8',
      cursor: 'pointer',
    }}
  >
    <Handle type="target" position={Position.Top} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <RuleIcon color="success" fontSize="small" />
      <Typography variant="subtitle2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      Reward Rule
    </Typography>
    <Handle type="source" position={Position.Bottom} />
  </Paper>
)

const ConstraintNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <Paper
    elevation={selected ? 8 : 2}
    sx={{
      p: 2,
      minWidth: 120,
      border: selected ? '2px solid #ed6c02' : '1px solid #e0e0e0',
      borderRadius: 2,
      backgroundColor: '#fff3e0',
      cursor: 'pointer',
    }}
  >
    <Handle type="target" position={Position.Top} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <ConstraintIcon color="warning" fontSize="small" />
      <Typography variant="subtitle2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      {data.parameter || 'Constraint'}
    </Typography>
    <Handle type="source" position={Position.Bottom} />
  </Paper>
)

const DistributionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <Paper
    elevation={selected ? 8 : 2}
    sx={{
      p: 2,
      minWidth: 120,
      border: selected ? '2px solid #9c27b0' : '1px solid #e0e0e0',
      borderRadius: 2,
      backgroundColor: '#f3e5f5',
      cursor: 'pointer',
    }}
  >
    <Handle type="target" position={Position.Top} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <DistributionIcon color="secondary" fontSize="small" />
      <Typography variant="subtitle2" fontWeight="bold">
        {data.label}
      </Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      {data.distributionType || 'Distribution'}
    </Typography>
    <Handle type="source" position={Position.Bottom} />
  </Paper>
)

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
]

function ProgramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project } = useReactFlow()

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

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: type.charAt(0).toUpperCase() + type.slice(1),
          operatorType: type === 'operator' ? 'SUM' : undefined,
          parameter: type === 'constraint' ? 'tx_type' : undefined,
          distributionType: type === 'distribution' ? 'do_to_distribution' : undefined
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [project, setNodes]
  )

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
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
            
            {selectedNode.type === 'operator' && (
              <Typography variant="body2" color="text.secondary">
                Operator: {selectedNode.data.operatorType}
              </Typography>
            )}
            
            {selectedNode.type === 'constraint' && (
              <Typography variant="body2" color="text.secondary">
                Parameter: {selectedNode.data.parameter}
              </Typography>
            )}
            
            {selectedNode.type === 'distribution' && (
              <Typography variant="body2" color="text.secondary">
                Distribution: {selectedNode.data.distributionType}
              </Typography>
            )}
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
