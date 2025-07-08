import { useState } from 'react'
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box, 
  FormControlLabel,
  Checkbox,
  Alert,
  Divider
} from '@mui/material'
import { 
  FileDownload as ExportIcon, 
  FileUpload as ImportIcon
} from '@mui/icons-material'
import type { Node, Edge } from '@xyflow/react'

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
  version?: string
  metadata?: Record<string, any>
}

export interface ExportOptions {
  includeMetadata: boolean
  includeTimestamps: boolean
  prettyPrint: boolean
}

interface ProgramExporterProps {
  program: LoyaltyProgram | null
  onImport: (program: LoyaltyProgram) => void
  disabled?: boolean
}

export function ProgramExporter({ program, onImport, disabled = false }: ProgramExporterProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeTimestamps: true,
    prettyPrint: true
  })
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    if (!program) return

    const exportData: Partial<LoyaltyProgram> = {
      name: program.name,
      description: program.description,
      nodes: program.nodes,
      edges: program.edges,
      version: '1.0.0'
    }

    if (exportOptions.includeTimestamps) {
      exportData.createdAt = program.createdAt
      exportData.updatedAt = program.updatedAt
    }

    if (exportOptions.includeMetadata) {
      exportData.metadata = {
        exportedAt: new Date().toISOString(),
        exportOptions,
        nodeCount: program.nodes.length,
        edgeCount: program.edges.length
      }
    }

    const jsonString = exportOptions.prettyPrint 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)

    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${program.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_program.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExportDialogOpen(false)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedProgram = JSON.parse(content) as LoyaltyProgram

        // Validate the imported program
        if (!importedProgram.name || !importedProgram.nodes || !importedProgram.edges) {
          throw new Error('Invalid program format: missing required fields')
        }

        // Generate new ID and timestamps for the imported program
        const newProgram: LoyaltyProgram = {
          ...importedProgram,
          id: `program-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        onImport(newProgram)
        setIsImportDialogOpen(false)
        setImportError(null)
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to parse program file')
      }
    }
    reader.readAsText(file)
  }



  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          startIcon={<ExportIcon />}
          onClick={() => setIsExportDialogOpen(true)}
          disabled={disabled || !program}
          variant="outlined"
          size="small"
        >
          Export
        </Button>
        
        <Button
          startIcon={<ImportIcon />}
          onClick={() => setIsImportDialogOpen(true)}
          disabled={disabled}
          variant="outlined"
          size="small"
        >
          Import
        </Button>
      </Box>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Program</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export "{program?.name}" as a JSON file that can be shared or imported later.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Export Options
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                size="small"
              />
            }
            label="Include metadata (export date, options, statistics)"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includeTimestamps}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                size="small"
              />
            }
            label="Include creation and update timestamps"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.prettyPrint}
                onChange={(e) => setExportOptions(prev => ({ ...prev, prettyPrint: e.target.checked }))}
                size="small"
              />
            }
            label="Pretty print JSON (formatted)"
          />
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Program Summary:</strong><br />
              • Name: {program?.name}<br />
              • Nodes: {program?.nodes.length || 0}<br />
              • Edges: {program?.edges.length || 0}<br />
              • Created: {program?.createdAt ? new Date(program.createdAt).toLocaleDateString() : 'Unknown'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Program</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import a loyalty program from a JSON file. The imported program will be added to your program list.
          </Typography>
          
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}
          
          <Box sx={{ border: '2px dashed', borderColor: 'grey.300', borderRadius: 2, p: 3, textAlign: 'center' }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-file-input"
              type="file"
              onChange={handleImport}
            />
            <label htmlFor="import-file-input">
              <Button
                component="span"
                variant="outlined"
                startIcon={<ImportIcon />}
                sx={{ cursor: 'pointer' }}
              >
                Choose JSON File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              or drag and drop a JSON file here
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            <strong>Supported format:</strong> JSON files exported from this application
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 