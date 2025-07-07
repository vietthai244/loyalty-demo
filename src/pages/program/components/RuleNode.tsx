import { Box, Typography, Paper } from '@mui/material'
import { Rule as RuleIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'
import { NodeToolbar, createNodeToolbarActions } from './NodeToolbar'

export interface RuleNodeData {
  label: string
  description?: string
  isActive?: boolean
}

interface RuleNodeProps {
  data: RuleNodeData
  selected: boolean
  id: string
  onDelete?: (nodeId: string) => void
  onEdit?: (nodeId: string) => void
  onToggleActive?: (nodeId: string) => void
}

const RuleNode = ({ data, selected, id, onDelete, onEdit, onToggleActive }: RuleNodeProps) => {
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
          border: selected ? '2px solid #2e7d32' : '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: data.isActive === false ? '#f5f5f5' : '#e8f5e8',
          cursor: 'pointer',
          opacity: data.isActive === false ? 0.6 : 1,
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
    </>
  )
}

export default RuleNode 