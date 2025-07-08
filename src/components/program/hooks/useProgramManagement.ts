import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Node, Edge } from '@xyflow/react'

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'loyalty_programs'

const saveProgramsToStorage = (programs: LoyaltyProgram[]) => {
  console.log('Saving programs to storage:', programs.map((p: LoyaltyProgram) => ({ id: p.id, name: p.name })))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programs))
}

const loadProgramsFromStorage = (): LoyaltyProgram[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const programs = stored ? JSON.parse(stored) : []
  console.log('Loading programs from storage:', programs.map((p: LoyaltyProgram) => ({ id: p.id, name: p.name })))
  return programs
}

export function useProgramManagement(mode: 'create' | 'edit', programId?: string) {
  const navigate = useNavigate()
  const [currentProgram, setCurrentProgram] = useState<LoyaltyProgram | null>(null)
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false)
  const [saveAsData, setSaveAsData] = useState({ name: '', description: '' })
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load programs and current program on mount
  useEffect(() => {
    const storedPrograms = loadProgramsFromStorage()
    setPrograms(storedPrograms)
    
    if (mode === 'create') {
      setIsInitialLoad(false)
    } else if (mode === 'edit' && programId) {
      const program = storedPrograms.find(p => p.id === programId)
      if (program) {
        setCurrentProgram(program)
        setIsInitialLoad(false)
      } else {
        console.error('Program not found:', programId, 'Available programs:', storedPrograms.map(p => p.id))
        setTimeout(() => {
          showNotification('Program not found', 'error')
          navigate('/program')
        }, 100)
      }
    } else {
      setIsInitialLoad(false)
    }
  }, [programId, mode, navigate])

  // Save programs to storage only when explicitly saving
  // Removed auto-save to prevent infinite loops

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
  }

  const handleSaveProgram = (nodes: Node[], edges: Edge[]) => {
    if (!currentProgram || currentProgram.id === 'temp-create') {
      setIsSaveAsDialogOpen(true)
      setSaveAsData({ 
        name: currentProgram?.name || 'New Program', 
        description: currentProgram?.description || '' 
      })
    } else {
      const updatedProgram = {
        ...currentProgram,
        nodes: [...nodes],
        edges: [...edges],
        updatedAt: new Date().toISOString()
      }
      
      const updatedPrograms = programs.map(p => p.id === updatedProgram.id ? updatedProgram : p)
      setPrograms(updatedPrograms)
      setCurrentProgram(updatedProgram)
      saveProgramsToStorage(updatedPrograms)
      
      showNotification('Program saved successfully', 'success')
    }
  }

  const handleSaveAsConfirm = (nodes: Node[], edges: Edge[]) => {
    if (!saveAsData.name.trim()) {
      showNotification('Program name is required', 'error')
      return
    }

    const newProgram: LoyaltyProgram = {
      id: `program-${Date.now()}`,
      name: saveAsData.name,
      description: saveAsData.description,
      nodes: [...nodes],
      edges: [...edges],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedPrograms = [...programs, newProgram]
    setPrograms(updatedPrograms)
    setCurrentProgram(newProgram)
    saveProgramsToStorage(updatedPrograms)
    
    setIsSaveAsDialogOpen(false)
    setSaveAsData({ name: '', description: '' })
    
    showNotification('Program saved successfully', 'success')
    
    // Redirect to dashboard after creation
    navigate('/program')
  }

  const handleImportProgram = (importedProgram: any) => {
    const updatedPrograms = [...programs, importedProgram]
    setPrograms(updatedPrograms)
    saveProgramsToStorage(updatedPrograms)
    showNotification(`Program "${importedProgram.name}" imported successfully`, 'success')
  }

  // Removed updateCurrentProgram to prevent infinite loops
  // Auto-save functionality removed

  return {
    currentProgram,
    setCurrentProgram,
    programs,
    setPrograms,
    isSaveAsDialogOpen,
    setIsSaveAsDialogOpen,
    saveAsData,
    setSaveAsData,
    notification,
    setNotification,
    isInitialLoad,
    showNotification,
    handleSaveProgram,
    handleSaveAsConfirm,
    handleImportProgram
  }
} 