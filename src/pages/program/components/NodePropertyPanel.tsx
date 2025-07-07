import { Paper, Typography, Divider, IconButton, Box, Tooltip } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import type { Node } from '@xyflow/react'

interface NodePropertyPanelProps {
  selectedNode: Node | null
  onDeleteNode: () => void
}

export function NodePropertyPanel({ selectedNode, onDeleteNode }: NodePropertyPanelProps) {
  const getNodeDataDisplay = (node: Node) => {
    const data = node.data as any
    switch (node.type) {
      case 'operator':
        return `Operator: ${data.operatorType || 'Not set'}`
      case 'constraint':
        return `Parameter: ${data.parameter || 'Not set'}`
      case 'distribution':
        return `Distribution: ${data.distributionType || 'Not set'}`
      default:
        return `Type: ${node.type}`
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #e0e0e0',
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
              {(selectedNode.data as any)?.label || 'Unknown'}
            </Typography>
            <Tooltip title="Delete Node">
              <IconButton 
                size="small" 
                color="error" 
                onClick={onDeleteNode}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Node Type: {selectedNode.type}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {getNodeDataDisplay(selectedNode)}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No node selected. Click on a node to view its properties.
        </Typography>
      )}
    </Paper>
  )
} 