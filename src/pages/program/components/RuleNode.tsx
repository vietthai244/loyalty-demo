import { Box, Typography } from '@mui/material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'
import { CreateNodeButton } from './CreateNodeButton'

export interface RuleNodeData {
  label: string
  ruleType?: 'CONDITION' | 'THRESHOLD' | 'TIME_BASED'
  description?: string
  isActive?: boolean
}

interface RuleNodeProps {
  data: {
    label: string
    ruleType: string
    isActive: boolean
    onEdit: () => void
    onDelete: () => void
    onToggleActive: () => void
    onOpenPalette: (nodeId?: string, handle?: 'top' | 'bottom') => void
  }
  selected?: boolean
  id?: string
}

const RuleNode = ({ data, selected = false, id = '' }: RuleNodeProps) => {
  const toolbarActions = createNodeToolbarActions(
    id,
    { 
      onDelete: data.onDelete, 
      onEdit: data.onEdit, 
      onToggleActive: data.onToggleActive 
    },
    { isActive: data.isActive }
  )

  return (
    <Box
      sx={{
        position: 'relative',
        padding: 2,
        border: '2px solid #ff9800',
        borderRadius: 2,
        backgroundColor: data.isActive ? '#fff3e0' : '#f5f5f5',
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
      <Handle type="target" position={Position.Top} />
      
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', mb: 1 }}>
        {data.label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {data.ruleType}
      </Typography>

      <NodeToolbar
        isVisible={selected}
        nodeId={id}
        actions={toolbarActions}
        position={Position.Top}
        offset={8}
      />

      <Handle type="source" position={Position.Bottom} />
      
      <CreateNodeButton
        variant="text"
        onOpenPalette={data.onOpenPalette}
        nodeId={data.label}
        handle="bottom"
      />
    </Box>
  )
}

export default RuleNode 