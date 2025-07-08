import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Image as ImageIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { exportAndDownloadCanvas, type ExportImageOptions } from '../../../utils/imageExport'

interface ExportImageDialogProps {
  open: boolean
  onClose: () => void
  reactFlowWrapper: HTMLElement | null
  reactFlowInstance: any
  programName: string
}

export function ExportImageDialog({ 
  open, 
  onClose, 
  reactFlowWrapper, 
  reactFlowInstance,
  programName 
}: ExportImageDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportImageOptions>({
    format: 'png',
    backgroundColor: '#ffffff',
    scale: 2
  })
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!reactFlowWrapper) {
      setError('Canvas element not found')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const filename = `${programName.replace(/[^a-zA-Z0-9]/g, '_')}_diagram.png`
      await exportAndDownloadCanvas(reactFlowWrapper, reactFlowInstance, filename, exportOptions)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export image')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setIsExporting(false)
    onClose()
  }

  const handleOptionChange = (key: keyof ExportImageOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon />
          <Typography variant="h6">
            Export Program as Image
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Background Color */}
          <FormControl fullWidth>
            <InputLabel>Background Color</InputLabel>
            <Select
              value={exportOptions.backgroundColor}
              label="Background Color"
              onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
            >
              <MenuItem value="#ffffff">White</MenuItem>
              <MenuItem value="#f5f5f5">Light Gray</MenuItem>
              <MenuItem value="#000000">Black</MenuItem>
              <MenuItem value="transparent">Transparent</MenuItem>
            </Select>
          </FormControl>

          {/* Scale Selection */}
          <Box>
            <Typography gutterBottom>
              Scale: {exportOptions.scale}x
            </Typography>
            <Slider
              value={exportOptions.scale}
              onChange={(_, value) => handleOptionChange('scale', value)}
              min={1}
              max={4}
              step={0.5}
              marks={[
                { value: 1, label: '1x' },
                { value: 2, label: '2x' },
                { value: 3, label: '3x' },
                { value: 4, label: '4x' }
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Higher scale = better quality but larger file size
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export Image'}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 