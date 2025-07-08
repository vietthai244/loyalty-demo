import { Box, Typography } from '@mui/material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'
import { CreateNodeButton } from './CreateNodeButton'
import { useNodeHandlers } from './context/NodeHandlersContext'

export interface OperatorNodeData {
  label: string
  operatorType?: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR'
  description?: string
  isActive?: boolean
}

interface OperatorNodeProps {
  data: {
    label: string
    operatorType: string
    isActive: boolean
  }
  selected?: boolean
  id?: string
}

const OperatorNode = ({ data, selected = false, id = '' }: OperatorNodeProps) => {
  const handlers = useNodeHandlers()
  
  const toolbarActions = createNodeToolbarActions(
    id,
    { 
      onDelete: handlers.onDelete, 
      onEdit: handlers.onEdit, 
      onToggleActive: handlers.onToggleActive 
    },
    { isActive: data.isActive }
  )

  return (
    <Box
      sx={{
        position: 'relative',
        padding: 2,
        border: '2px solid #1976d2',
        borderRadius: 2,
        backgroundColor: data.isActive ? '#e3f2fd' : '#f5f5f5',
        minWidth: 150,
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Handle type="target" position={Position.Left} id="left" />
      
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
        {data.label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {data.operatorType}
      </Typography>

      <NodeToolbar
        isVisible={selected}
        nodeId={id}
        actions={toolbarActions}
        position={Position.Top}
        offset={8}
      />

      <Handle type="source" position={Position.Right} id="right" />
      
      <CreateNodeButton
        variant="text"
        onOpenPalette={handlers.onOpenPalette}
        nodeId={id}
        handle="right"
      />
    </Box>
  )
}

export default OperatorNode 