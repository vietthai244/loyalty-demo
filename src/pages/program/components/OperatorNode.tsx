import { Box, Typography, Paper } from '@mui/material'
import { Functions as OperatorIcon } from '@mui/icons-material'
import { Handle, Position } from '@xyflow/react'

export interface OperatorNodeData {
  label: string
  operatorType?: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR'
  description?: string
}

interface OperatorNodeProps {
  data: OperatorNodeData
  selected: boolean
}

const OperatorNode = ({ data, selected }: OperatorNodeProps) => (
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

export default OperatorNode 