import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Save as SaveIcon, ArrowBack as BackIcon, PlayArrow as PlayIcon } from '@mui/icons-material'
import { ProgramExporter } from '../ProgramExporter'
import type { LoyaltyProgram } from '../hooks/useProgramManagement'

interface ProgramToolbarProps {
  mode: 'create' | 'edit'
  currentProgram: LoyaltyProgram | null
  onBack: () => void
  onSave: () => void
  onImport: (program: any) => void
  onDryTest: () => void
}

export function ProgramToolbar({ 
  mode, 
  currentProgram, 
  onBack, 
  onSave, 
  onImport,
  onDryTest
}: ProgramToolbarProps) {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          Back to Programs
        </Button>
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {mode === 'create' ? 'Create New Program' : `Edit: ${currentProgram?.name || 'Program'}`}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<PlayIcon />}
            onClick={onDryTest}
            variant="outlined"
            color="primary"
            disabled={!currentProgram || currentProgram.nodes.length === 0}
          >
            Dry Test
          </Button>
          
          <ProgramExporter
            program={currentProgram}
            onImport={onImport}
            disabled={mode === 'create'}
          />
          
          <Button
            startIcon={<SaveIcon />}
            onClick={onSave}
            variant="contained"
            disabled={!currentProgram}
          >
            {currentProgram?.id === 'temp-create' ? 'Save Program' : 'Save Changes'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
} 