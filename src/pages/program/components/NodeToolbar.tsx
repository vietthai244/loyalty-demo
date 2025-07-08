import { Box, IconButton } from '@mui/material'
import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ActivateIcon,
  VisibilityOff as DeactivateIcon
} from '@mui/icons-material'

export interface NodeToolbarAction {
  id: string
  icon: React.ReactNode
  title: string
  ariaLabel: string
  onClick: (e: React.MouseEvent) => void
  color?: string
  hoverColor?: string
  disabled?: boolean
}

export interface NodeToolbarProps {
  isVisible: boolean
  nodeId: string
  actions: NodeToolbarAction[]
  position?: Position
  offset?: number
}

export function NodeToolbar({ 
  isVisible, 
  actions, 
  position = Position.Top, 
  offset = 8 
}: NodeToolbarProps) {
  return (
    <ReactFlowNodeToolbar 
      isVisible={isVisible}
      position={position}
      offset={offset}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {actions.map((action) => (
          <IconButton
            key={action.id}
            size="medium"
            onClick={action.onClick}
            title={action.title}
            aria-label={action.ariaLabel}
            disabled={action.disabled}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: action.color || '#666',
              width: 20,
              height: 20,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                color: action.hoverColor || action.color || '#666',
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            }}
          >
            {action.icon}
          </IconButton>
        ))}
      </Box>
    </ReactFlowNodeToolbar>
  )
}

// Helper function to create standard node toolbar actions
export function createNodeToolbarActions(
  nodeId: string,
  handlers: {
    onDelete?: (nodeId: string) => void
    onEdit?: (nodeId: string) => void
    onToggleActive?: (nodeId: string) => void
  },
  nodeData?: { isActive?: boolean }
): NodeToolbarAction[] {
  const actions: NodeToolbarAction[] = []

  // Edit action
  if (handlers.onEdit) {
    actions.push({
      id: 'edit',
      icon: <EditIcon sx={{ fontSize: 12 }} />,
      title: 'Edit',
      ariaLabel: 'Edit node',
      onClick: (e) => {
        e.stopPropagation()
        handlers.onEdit?.(nodeId)
      },
      color: '#666',
      hoverColor: '#1976d2',
    })
  }

  // Toggle active action
  if (handlers.onToggleActive) {
    const isActive = nodeData?.isActive !== false
    actions.push({
      id: 'toggle-active',
      icon: isActive ? <ActivateIcon sx={{ fontSize: 12 }} /> : <DeactivateIcon sx={{ fontSize: 12 }} />,
      title: isActive ? 'Deactivate' : 'Activate',
      ariaLabel: isActive ? 'Deactivate node' : 'Activate node',
      onClick: (e) => {
        e.stopPropagation()
        handlers.onToggleActive?.(nodeId)
      },
      color: isActive ? '#666' : '#999',
      hoverColor: isActive ? '#f57c00' : '#2e7d32',
    })
  }

  // Delete action
  if (handlers.onDelete) {
    actions.push({
      id: 'delete',
      icon: <DeleteIcon sx={{ fontSize: 12 }} />,
      title: 'Delete',
      ariaLabel: 'Delete node',
      onClick: (e) => {
        e.stopPropagation()
        handlers.onDelete?.(nodeId)
      },
      color: '#666',
      hoverColor: '#d32f2f',
    })
  }

  return actions
} 