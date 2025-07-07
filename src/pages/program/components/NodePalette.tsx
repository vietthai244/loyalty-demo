import { Drawer, Paper, Box, Typography, Divider, IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import {
  Functions as OperatorIcon,
  Rule as RuleIcon,
  FilterList as ConstraintIcon,
  AccountBalance as DistributionIcon,
} from '@mui/icons-material'

// Palette items for drag and drop
const paletteItems = [
  {
    type: 'operator',
    label: 'Operator',
    icon: <OperatorIcon />,
    description: 'SUM, MAX, SHARE, AND, OR'
  },
  {
    type: 'rule',
    label: 'Reward Rule',
    icon: <RuleIcon />,
    description: 'Define reward logic'
  },
  {
    type: 'constraint',
    label: 'Constraint',
    icon: <ConstraintIcon />,
    description: 'Set conditions and filters'
  },
  {
    type: 'distribution',
    label: 'Distribution',
    icon: <DistributionIcon />,
    description: 'Configure point distribution'
  }
] as const

export type NodeType = typeof paletteItems[number]['type']

interface NodePaletteProps {
  isOpen: boolean
  onClose: () => void
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void
  onNodeClick: (nodeType: NodeType) => void
}

export function NodePalette({ isOpen, onClose, onDragStart, onNodeClick }: NodePaletteProps) {
  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          borderLeft: '1px solid #e0e0e0',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          p: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Node Palette
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <AddIcon sx={{ transform: 'rotate(45deg)' }} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {paletteItems.map((item) => (
          <Paper
            key={item.type}
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              cursor: 'pointer',
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
            draggable
            onDragStart={(event) => onDragStart(event, item.type)}
            onClick={() => onNodeClick(item.type)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {item.icon}
              <Typography variant="subtitle2" fontWeight="bold">
                {item.label}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.description}
            </Typography>
          </Paper>
        ))}
      </Paper>
    </Drawer>
  )
} 