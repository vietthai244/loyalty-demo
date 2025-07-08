import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'

interface SaveAsDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function SaveAsDialog({ 
  open, 
  onClose, 
  onConfirm, 
  name, 
  description, 
  onNameChange, 
  onDescriptionChange 
}: SaveAsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Save Program</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Program Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
} 