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
          <>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Parameter</InputLabel>
              <Select
                value={formData.parameter || 'tx_type'}
                onChange={(e) => handleInputChange('parameter', e.target.value)}
                label="Parameter"
              >
                <MenuItem value="tx_type">Transaction Type</MenuItem>
                <MenuItem value="value">Value</MenuItem>
                <MenuItem value="location">Location</MenuItem>
                <MenuItem value="time">Time</MenuItem>
                <MenuItem value="actor">Actor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Comparison Operator</InputLabel>
              <Select
                value={formData.comparisonOperator || 'EQUAL'}
                onChange={(e) => handleInputChange('comparisonOperator', e.target.value)}
                label="Comparison Operator"
              >
                <MenuItem value="EQUAL">Equal (=)</MenuItem>
                <MenuItem value="NOT_EQUAL">Not Equal (≠)</MenuItem>
                <MenuItem value="GREATER_THAN">Greater Than (&gt;)</MenuItem>
                <MenuItem value="GREATER_OR_EQUAL">Greater or Equal (≥)</MenuItem>
                <MenuItem value="LESS_THAN">Less Than (&lt;)</MenuItem>
                <MenuItem value="LESS_OR_EQUAL">Less or Equal (≤)</MenuItem>
                <MenuItem value="BETWEEN">Between</MenuItem>
                <MenuItem value="IN">In List</MenuItem>
                <MenuItem value="NOT_IN">Not In List</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Value"
              value={formData.value || ''}
              onChange={(e) => handleInputChange('value', e.target.value)}
              margin="normal"
              size="small"
              placeholder={formData.comparisonOperator === 'BETWEEN' ? 'min, max' : 
                         formData.comparisonOperator === 'IN' ? 'value1, value2, value3' : 'Enter value'}
              helperText={formData.comparisonOperator === 'BETWEEN' ? 'Enter two values separated by comma' :
                         formData.comparisonOperator === 'IN' ? 'Enter multiple values separated by commas' : ''}
            />
          </>
        )}

        {selectedNode.type === 'distribution' && (
          <>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Distribution Type</InputLabel>
              <Select
                value={formData.distributionType || 'do_to_distribution'}
                onChange={(e) => handleInputChange('distributionType', e.target.value)}
                label="Distribution Type"
              >
                <MenuItem value="do_to_distribution">To Distribution</MenuItem>
                <MenuItem value="do_campaign_distribution">Campaign Distribution</MenuItem>
                <MenuItem value="do_event_distribution">Event Distribution</MenuItem>
                <MenuItem value="do_behavior_distribution">Behavior Distribution</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Point Mapping Type</InputLabel>
              <Select
                value={formData.pointMappingType || 'VALUE_MULTIPLIER'}
                onChange={(e) => handleInputChange('pointMappingType', e.target.value)}
                label="Point Mapping Type"
              >
                <MenuItem value="VALUE_MULTIPLIER">Value Multiplier (value × X)</MenuItem>
                <MenuItem value="FIXED_RATIO">Fixed Ratio (RATIO=X)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={formData.pointMappingType === 'VALUE_MULTIPLIER' ? 'Multiplier' : 'Ratio'}
              type="number"
              value={formData.multiplier || ''}
              onChange={(e) => handleInputChange('multiplier', parseFloat(e.target.value) || 0)}
              margin="normal"
              size="small"
              placeholder={formData.pointMappingType === 'VALUE_MULTIPLIER' ? '1.5' : '0.1'}
            />

            {formData.pointMappingType === 'VALUE_MULTIPLIER' && (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Base Value Field</InputLabel>
                <Select
                  value={formData.baseValueField || 'value'}
                  onChange={(e) => handleInputChange('baseValueField', e.target.value)}
                  label="Base Value Field"
                >
                  <MenuItem value="value">Transaction Value</MenuItem>
                  <MenuItem value="points">Points</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                </Select>
              </FormControl>
            )}
          </>
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