import { Box, Typography, Paper } from '@mui/material'
import { AccountBalance as DistributionIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'

export interface DistributionNodeData {
  label: string
  distributionType?: string
  pointMappingType?: 'VALUE_MULTIPLIER' | 'FIXED_RATIO'
  multiplier?: number
  baseValueField?: string
  description?: string
  isActive?: boolean
}

interface DistributionNodeProps {
  data: DistributionNodeData
  selected: boolean
  id: string
  onDelete?: (nodeId: string) => void
  onEdit?: (nodeId: string) => void
  onToggleActive?: (nodeId: string) => void
}

const DistributionNode = ({ data, selected, id, onDelete, onEdit, onToggleActive }: DistributionNodeProps) => {
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
          border: selected ? '2px solid #9c27b0' : '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: data.isActive === false ? '#f5f5f5' : '#f3e5f5',
          cursor: 'pointer',
          opacity: data.isActive === false ? 0.6 : 1,
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
    </>
  )
}

export default DistributionNode 