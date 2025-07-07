import { Box, Typography, Paper } from '@mui/material'
import { FilterList as ConstraintIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'

export interface ConstraintNodeData {
  label: string
  parameter?: string
  comparisonOperator?: string
  value?: string | number | string[]
  description?: string
}

interface ConstraintNodeProps {
  data: ConstraintNodeData
  selected: boolean
}

const ConstraintNode = ({ data, selected }: ConstraintNodeProps) => (
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

export default ConstraintNode 