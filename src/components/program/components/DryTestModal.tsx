import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import type { LoyaltyProgram } from '../hooks/useProgramManagement'

interface DryTestModalProps {
  open: boolean
  onClose: () => void
  program: LoyaltyProgram | null
}

export function DryTestModal({ open, onClose, program }: DryTestModalProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Dry Test: {program?.name || 'Program'}
          </Typography>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Dry test functionality will be implemented here.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
} 