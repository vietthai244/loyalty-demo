import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Divider, 
  IconButton, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material'
import { Delete as DeleteIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import type { Node } from '@xyflow/react'
import { useState, useEffect } from 'react'

export type PanelMode = 'creation' | 'edit'

interface NodePropertyPanelProps {
  isVisible: boolean
  mode: PanelMode
  selectedNode: Node | null
  onClose: () => void
  onDeleteNode: () => void
  onSaveNode?: (nodeData: any) => void
}

export function NodePropertyPanel({ 
  isVisible, 
  mode, 
  selectedNode, 
  onClose, 
  onDeleteNode, 
  onSaveNode 
}: NodePropertyPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Initialize form data when node changes or mode changes
  useEffect(() => {
    if (selectedNode && mode === 'edit') {
      setFormData(selectedNode.data || {})
    } else if (mode === 'creation') {
      setFormData({
        label: '',
        isActive: true,
        operatorType: 'SUM',
        parameter: 'tx_type',
        distributionType: 'do_to_distribution'
      })
    }
  }, [selectedNode, mode])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (onSaveNode) {
      onSaveNode(formData)
    }
    onClose()
  }

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

  const renderCreationForm = () => (
    <Box>
      <TextField
        fullWidth
        label="Node Label"
        value={formData.label || ''}
        onChange={(e) => handleInputChange('label', e.target.value)}
        margin="normal"
        size="small"
      />

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Active Status</InputLabel>
        <Select
          value={formData.isActive !== false ? 'true' : 'false'}
          onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
          label="Active Status"
        >
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )

  const renderEditForm = () => {
    if (!selectedNode) return null

    const data = selectedNode.data as any
    
    return (
      <Box>
        <TextField
          fullWidth
          label="Node Label"
          value={formData.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
          margin="normal"
          size="small"
        />

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Active Status</InputLabel>
          <Select
            value={formData.isActive !== false ? 'true' : 'false'}
            onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
            label="Active Status"
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Node type specific fields */}
        {selectedNode.type === 'operator' && (
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Operator Type</InputLabel>
            <Select
              value={formData.operatorType || 'SUM'}
              onChange={(e) => handleInputChange('operatorType', e.target.value)}
              label="Operator Type"
            >
              <MenuItem value="SUM">SUM</MenuItem>
              <MenuItem value="MAX">MAX</MenuItem>
              <MenuItem value="SHARE">SHARE</MenuItem>
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
            </Select>
          </FormControl>
        )}

        {selectedNode.type === 'constraint' && (
          <TextField
            fullWidth
            label="Parameter"
            value={formData.parameter || ''}
            onChange={(e) => handleInputChange('parameter', e.target.value)}
            margin="normal"
            size="small"
          />
        )}

        {selectedNode.type === 'distribution' && (
          <TextField
            fullWidth
            label="Distribution Type"
            value={formData.distributionType || ''}
            onChange={(e) => handleInputChange('distributionType', e.target.value)}
            margin="normal"
            size="small"
          />
        )}
      </Box>
    )
  }

  const getDialogTitle = () => {
    if (mode === 'creation') {
      return 'Create New Node'
    } else if (mode === 'edit') {
      return `Edit ${selectedNode?.type?.charAt(0).toUpperCase()}${selectedNode?.type?.slice(1)} Node`
    }
    return 'Node Properties'
  }

  const getDialogActions = () => {
    if (mode === 'creation') {
      return (
        <>
          <Button
            variant="outlined"
            onClick={onClose}
            size="small"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!formData.label}
            size="small"
          >
            Create
          </Button>
        </>
      )
    } else if (mode === 'edit') {
      return (
        <>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDeleteNode}
            size="small"
          >
            Delete
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!formData.label}
            size="small"
          >
            Save
          </Button>
        </>
      )
    }
    return null
  }

  return (
    <Dialog
      open={isVisible}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: mode === 'creation' ? 300 : 400,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div">
          {getDialogTitle()}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        {mode === 'creation' && renderCreationForm()}
        {mode === 'edit' && renderEditForm()}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {getDialogActions()}
      </DialogActions>
    </Dialog>
  )
} 