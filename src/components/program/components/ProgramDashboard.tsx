import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProgramExporter } from '../ProgramExporter'
import type { LoyaltyProgram } from '../hooks/useProgramManagement'

const STORAGE_KEY = 'loyalty_programs'

const loadProgramsFromStorage = (): LoyaltyProgram[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

interface ProgramDashboardProps {
  onImport?: (program: any) => void
}

export function ProgramDashboard({ onImport }: ProgramDashboardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<LoyaltyProgram | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Load programs on mount and when location changes
  useEffect(() => {
    const storedPrograms = loadProgramsFromStorage()
    setPrograms(storedPrograms)
  }, [location])

  const handleCreateProgram = () => {
    navigate('/program/create')
  }

  const handleEditProgram = (programId: string) => {
    navigate(`/program/edit/${programId}`)
  }

  const handleDeleteProgram = (program: LoyaltyProgram) => {
    setProgramToDelete(program)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (programToDelete) {
      const updatedPrograms = programs.filter(p => p.id !== programToDelete.id)
      setPrograms(updatedPrograms)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrograms))
      setNotification({ message: 'Program deleted successfully', type: 'success' })
    }
    setDeleteDialogOpen(false)
    setProgramToDelete(null)
  }

  const handleImportProgram = (importedProgram: any) => {
    const updatedPrograms = [...programs, importedProgram]
    setPrograms(updatedPrograms)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrograms))
    setNotification({ message: `Program "${importedProgram.name}" imported successfully`, type: 'success' })
    if (onImport) {
      onImport(importedProgram)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getNodeCount = (program: LoyaltyProgram) => {
    return program.nodes.length
  }

  const getEdgeCount = (program: LoyaltyProgram) => {
    return program.edges.length
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Loyalty Programs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ProgramExporter
            program={null}
            onImport={handleImportProgram}
            disabled={false}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProgram}
          >
            Create Program
          </Button>
        </Box>
      </Box>

      {/* Programs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Nodes</TableCell>
              <TableCell>Connections</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No programs found. Create your first loyalty program to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{program.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {program.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getNodeCount(program)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={getEdgeCount(program)} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(program.createdAt)}</TableCell>
                  <TableCell>{formatDate(program.updatedAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProgram(program.id)}
                        title="Edit Program"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProgram(program)}
                        title="Delete Program"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Program</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  )
} 