import { Box, Typography } from '@mui/material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'
import { CreateNodeButton } from './CreateNodeButton'
import { useNodeHandlers } from '../ProgramCanvas'

export interface ConstraintNodeData {
  label: string
  constraintType?: 'LIMIT' | 'EXCLUSION' | 'REQUIREMENT'
  description?: string
  isActive?: boolean
}

interface ConstraintNodeProps {
  data: {
    label: string
    constraintType: string
    isActive: boolean
  }
  selected?: boolean
  id?: string
}

const ConstraintNode = ({ data, selected = false, id = '' }: ConstraintNodeProps) => {
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
        border: '2px solid #f44336',
        borderRadius: 2,
        backgroundColor: data.isActive ? '#ffebee' : '#f5f5f5',
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
      
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', mb: 1 }}>
        {data.label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {data.constraintType}
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
        nodeId={data.label}
        handle="right"
      />
    </Box>
  )
}

export default ConstraintNode 