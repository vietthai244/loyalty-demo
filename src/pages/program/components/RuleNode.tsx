import { Box, Typography, Paper } from '@mui/material'
import { Rule as RuleIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'

export interface RuleNodeData {
  label: string
  description?: string
}

interface RuleNodeProps {
  data: RuleNodeData
  selected: boolean
}

const RuleNode = ({ data, selected }: RuleNodeProps) => (
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

export default RuleNode 