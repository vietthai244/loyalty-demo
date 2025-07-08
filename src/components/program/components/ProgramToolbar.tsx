import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material'
import { ProgramExporter } from '../ProgramExporter'
import type { LoyaltyProgram } from '../hooks/useProgramManagement'

interface ProgramToolbarProps {
  mode: 'create' | 'edit'
  currentProgram: LoyaltyProgram | null
  onBack: () => void
  onSave: () => void
  onImport: (program: any) => void
}

export function ProgramToolbar({ 
  mode, 
  currentProgram, 
  onBack, 
  onSave, 
  onImport 
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