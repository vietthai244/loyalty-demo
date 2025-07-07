import { Box, Typography, Paper } from '@mui/material'
import { Functions as OperatorIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'

export interface OperatorNodeData {
  label: string
  operatorType?: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR'
  description?: string
  isActive?: boolean
}

interface OperatorNodeProps {
  data: OperatorNodeData
  selected: boolean
  id: string
  onDelete?: (nodeId: string) => void
  onEdit?: (nodeId: string) => void
  onToggleActive?: (nodeId: string) => void
}

const OperatorNode = ({ data, selected, id, onDelete, onEdit, onToggleActive }: OperatorNodeProps) => {
  const toolbarActions = createNodeToolbarActions(
    id,
    { onDelete, onEdit, onToggleActive },
    data
  )

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        nodeId={id}
        actions={toolbarActions}
        position={Position.Top}
        offset={8}
      />

      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          p: 2,
          minWidth: 120,
          border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: data.isActive === false ? '#f5f5f5' : '#e3f2fd',
          cursor: 'pointer',
          opacity: data.isActive === false ? 0.6 : 1,
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
    </>
  )
}

export default OperatorNode 