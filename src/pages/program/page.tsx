import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ListItemSecondaryAction
} from '@mui/material'
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProgramExporter } from './components'

// Program data interface
interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  nodes: any[]
  edges: any[]
  createdAt: string
  updatedAt: string
}

// Local storage utilities
const STORAGE_KEY = 'loyalty_programs'

const loadProgramsFromStorage = (): LoyaltyProgram[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const programs = stored ? JSON.parse(stored) : []
  console.log('Dashboard loading programs from storage:', programs.map((p: LoyaltyProgram) => ({ id: p.id, name: p.name })))
  return programs
}

function ProgramDashboard() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<LoyaltyProgram | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Load programs from storage on mount and when location changes
  useEffect(() => {
    const storedPrograms = loadProgramsFromStorage()
    setPrograms(storedPrograms)
  }, [location.pathname])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
  }

  const handleNewProgram = () => {
    navigate('/program/create')
  }

  const handleEditProgram = (program: LoyaltyProgram) => {
    navigate(`/program/edit/${program.id}`)
  }

  const handleDeleteProgram = (program: LoyaltyProgram) => {
    setProgramToDelete(program)
    setIsDeleteConfirmDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!programToDelete) return

    const updatedPrograms = programs.filter(p => p.id !== programToDelete.id)
    setPrograms(updatedPrograms)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrograms))
    
    setIsDeleteConfirmDialogOpen(false)
    setProgramToDelete(null)
    showNotification('Program deleted successfully', 'success')
  }

  const handleImportProgram = (importedProgram: any) => {
    const updatedPrograms = [...programs, importedProgram]
    setPrograms(updatedPrograms)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrograms))
    showNotification(`Program "${importedProgram.name}" imported successfully`, 'success')
  }

  const getProgramStatus = (program: LoyaltyProgram) => {
    if (program.nodes.length === 0) {
      return <Chip label="Empty" color="default" size="small" />
    } else if (program.nodes.length > 0 && program.edges.length === 0) {
      return <Chip label="Unconnected" color="warning" size="small" />
    } else {
      return <Chip label="Complete" color="success" size="small" />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Loyalty Programs
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleNewProgram}
            variant="contained"
            size="medium"
          >
            New Program
          </Button>
          
          <ProgramExporter
            program={null}
            onImport={handleImportProgram}
            disabled={false}
          />
        </Box>
      </Box>

      {/* Programs Table */}
      {programs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No programs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first loyalty program to get started
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleNewProgram}
            variant="outlined"
          >
            Create First Program
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Nodes</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {program.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {program.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getProgramStatus(program)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {program.nodes.length} nodes, {program.edges.length} connections
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(program.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(program.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={() => handleEditProgram(program)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteProgram(program)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}



      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmDialogOpen} onClose={() => setIsDeleteConfirmDialogOpen(false)}>
        <DialogTitle>Delete Program</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type} 
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ProgramDashboard
