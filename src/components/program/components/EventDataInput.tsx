import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider
} from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import type { EventData } from '../../../utils/programEvaluator'

interface EventDataInputProps {
  program: { nodes: any[]; edges: any[] } | null
  onEventDataChange: (eventData: EventData) => void
  initialEventData?: EventData
}

export function EventDataInput({ 
  program, 
  onEventDataChange, 
  initialEventData = {} 
}: EventDataInputProps) {
  const [eventData, setEventData] = useState<EventData>(initialEventData)
  const [requiredFields, setRequiredFields] = useState<string[]>([])

  // Extract required fields from program constraints
  useEffect(() => {
    if (program) {
      const fields = new Set<string>()
      
      program.nodes.forEach(node => {
        if (node.type === 'constraint' && node.data.parameter) {
          fields.add(node.data.parameter)
        }
        if (node.type === 'distribution' && node.data.baseValueField) {
          fields.add(node.data.baseValueField)
        }
      })
      
      setRequiredFields(Array.from(fields))
    }
  }, [program])

  // Update parent when event data changes
  useEffect(() => {
    onEventDataChange(eventData)
  }, [eventData, onEventDataChange])

  const handleFieldChange = (field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleReset = () => {
    const resetData: EventData = {}
    requiredFields.forEach(field => {
      resetData[field] = ''
    })
    setEventData(resetData)
  }

  const getFieldType = (field: string): 'text' | 'number' | 'select' => {
    // Determine field type based on common patterns
    if (field === 'value' || field === 'totalSpent') return 'number'
    if (field === 'location') return 'select'
    return 'text'
  }

  const getLocationOptions = () => [
    'HCM', 'HNI', 'DANANG', 'CANTHO', 'HAIPHONG', 'OTHER'
  ]

  const renderField = (field: string) => {
    const fieldType = getFieldType(field)
    const value = eventData[field] || ''

    switch (fieldType) {
      case 'number':
        return (
          <TextField
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field, parseFloat(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        )

      case 'select':
        if (field === 'location') {
          return (
            <FormControl key={field} fullWidth size="small">
              <InputLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</InputLabel>
              <Select
                value={value}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                onChange={(e) => handleFieldChange(field, e.target.value)}
              >
                {getLocationOptions().map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }
        return (
          <TextField
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            fullWidth
            size="small"
          />
        )

      default:
        return (
          <TextField
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            fullWidth
            size="small"
          />
        )
    }
  }

  if (!program) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No program selected for testing.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Test Event Data</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          size="small"
          variant="outlined"
        >
          Reset
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {requiredFields.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No required fields found in the program. Add constraints or distributions to see test fields.
        </Typography>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Required fields from program constraints:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {requiredFields.map(field => (
              <Chip key={field} label={field} size="small" variant="outlined" />
            ))}
          </Box>

          <Stack spacing={2}>
            {requiredFields.map(field => renderField(field))}
          </Stack>
        </Stack>
      )}
    </Box>
  )
} 