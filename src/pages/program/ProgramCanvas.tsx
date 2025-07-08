import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react'
import { 
  ReactFlow, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background, 
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react'
import type { Node, Edge, Connection, NodeTypes } from '@xyflow/react'
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert,
  Snackbar
} from '@mui/material'
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon
} from '@mui/icons-material'
import { TemplateSelectionModal, type ProgramTemplate } from './components/TemplateSelectionModal'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import '@xyflow/react/dist/style.css'

// Import node components and types
import {
  OperatorNode,
  RuleNode,
  ConstraintNode,
  DistributionNode,
  CreateNodeButton,
  NodePalette,
  NodePropertyPanel,
  ProgramExporter,
  type NodeType,
  type PanelMode
} from './components'

// Program data interface
interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

// Local storage utilities
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

// Node handlers context
interface NodeHandlers {
  onDelete: (nodeId: string) => void
  onEdit: (nodeId: string) => void
  onToggleActive: (nodeId: string) => void
  onOpenPalette: (nodeId?: string, handle?: 'top' | 'bottom' | 'left' | 'right') => void
}

const NodeHandlersContext = createContext<NodeHandlers | null>(null)

export const useNodeHandlers = () => {
  const context = useContext(NodeHandlersContext)
  if (!context) {
    throw new Error('useNodeHandlers must be used within a NodeHandlersProvider')
  }
  return context
}

// Node types configuration - moved outside component to prevent recreation
const nodeTypes: NodeTypes = {
  operator: (props: any) => <OperatorNode {...props} />,
  rule: (props: any) => <RuleNode {...props} />,
  constraint: (props: any) => <ConstraintNode {...props} />,
  distribution: (props: any) => <DistributionNode {...props} />,
}

function ProgramCanvasEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're in create mode by looking at the pathname
  const isCreateMode = location.pathname === '/program/create'
  // Check if we're in edit mode by looking at the pathname
  const isEditMode = location.pathname.startsWith('/program/edit/') && !!id
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  
  // Program management state
  const [currentProgram, setCurrentProgram] = useState<LoyaltyProgram | null>(null)
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false)
  const [saveAsData, setSaveAsData] = useState({ name: '', description: '' })
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // NodePropertyPanel state
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>('creation')
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  
  // NodePalette state for handle connections
  const [paletteSourceNodeId, setPaletteSourceNodeId] = useState<string | undefined>()
  const [paletteSourceHandle, setPaletteSourceHandle] = useState<'top' | 'bottom' | 'left' | 'right' | undefined>()
  
  // Template selection modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Load programs and current program on mount
  useEffect(() => {
    const storedPrograms = loadProgramsFromStorage()
    setPrograms(storedPrograms)
    
    if (isCreateMode) {
      // Create mode - show template selection modal
      setIsTemplateModalOpen(true)
      setIsInitialLoad(false)
    } else if (isEditMode && id) {
      const program = storedPrograms.find(p => p.id === id)
      if (program) {
        setCurrentProgram(program)
        setNodes([...program.nodes])
        setEdges([...program.edges])
        setIsInitialLoad(false)
      } else {
        console.error('Program not found:', id, 'Available programs:', storedPrograms.map(p => p.id))
        // Use setTimeout to ensure component is mounted before showing notification
        setTimeout(() => {
          showNotification('Program not found', 'error')
          navigate('/program')
        }, 100)
      }
    } else {
      setIsInitialLoad(false)
    }
  }, [id, isCreateMode, isEditMode, navigate])

  // Auto-save current program when nodes/edges change
  useEffect(() => {
    // Only auto-save if we have a real program (not temp), not in create mode, and not in initial load
    if (currentProgram && 
        currentProgram.id !== 'temp-create' && 
        !isCreateMode && 
        !isInitialLoad &&
        (nodes.length > 0 || edges.length > 0)) {
      const updatedProgram = {
        ...currentProgram,
        nodes: [...nodes],
        edges: [...edges],
        updatedAt: new Date().toISOString()
      }
      
      // Update in programs list
      setPrograms(prev => 
        prev.map(p => p.id === updatedProgram.id ? updatedProgram : p)
      )
      
      // Update current program
      setCurrentProgram(updatedProgram)
    }
  }, [nodes, edges, currentProgram?.id, isCreateMode, isInitialLoad]) // Only depend on currentProgram.id to prevent infinite loops

  // Save programs to storage whenever programs list changes
  useEffect(() => {
    // Don't save during initial load or if programs array is empty
    if (!isInitialLoad && programs.length > 0) {
      saveProgramsToStorage(programs)
    }
  }, [programs, isInitialLoad])

  // Fallback: Always open modal if in create mode and no program is set
  useEffect(() => {
    if (isCreateMode && !isTemplateModalOpen && !currentProgram) {
      setIsTemplateModalOpen(true)
    }
  }, [isCreateMode, currentProgram]) // Removed isTemplateModalOpen from dependencies

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
  }

  const handleTemplateSelect = (template: ProgramTemplate) => {
    // Create new program from template
    const newProgram: LoyaltyProgram = {
      id: 'temp-create',
      name: `${template.name} Copy`,
      description: template.description,
      nodes: template.nodes,
      edges: template.edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCurrentProgram(newProgram)
    setNodes(template.nodes)
    setEdges(template.edges)
    setIsTemplateModalOpen(false)
    
    showNotification(`Program created from template: ${template.name}`, 'success')
  }

  const handleManualCreate = () => {
    // Create empty program
    const newProgram: LoyaltyProgram = {
      id: 'temp-create',
      name: 'New Program',
      description: '',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCurrentProgram(newProgram)
    setNodes([])
    setEdges([])
    setIsTemplateModalOpen(false)
    
    showNotification('Empty program created', 'success')
  }

  const handleTemplateModalClose = () => {
    setIsTemplateModalOpen(false)
    // Navigate back to dashboard if user cancels template selection
    navigate('/program')
  }

  const handleSaveProgram = () => {
    if (!currentProgram) {
      showNotification('No program to save', 'error')
      return
    }

    if (isCreateMode) {
      // In create mode, prompt for program name
      setSaveAsData({ 
        name: '', 
        description: '' 
      })
      setIsSaveAsDialogOpen(true)
      return
    }

    const updatedProgram = {
      ...currentProgram,
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    }

    setPrograms(prev => 
      prev.map(p => p.id === updatedProgram.id ? updatedProgram : p)
    )
    setCurrentProgram(updatedProgram)
    showNotification('Program saved successfully', 'success')
  }

  const handleSaveAs = () => {
    setSaveAsData({ 
      name: currentProgram ? `${currentProgram.name} (Copy)` : '', 
      description: currentProgram?.description || '' 
    })
    setIsSaveAsDialogOpen(true)
  }

  const handleSaveAsConfirm = () => {
    if (!saveAsData.name.trim()) {
      showNotification('Program name is required', 'error')
      return
    }

    const newProgram: LoyaltyProgram = {
      id: `program-${Date.now()}`,
      name: saveAsData.name.trim(),
      description: saveAsData.description.trim(),
      nodes: [...nodes],
      edges: [...edges],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('Saving new program:', newProgram.id, newProgram.name)
    
    setPrograms(prev => {
      const updated = [...prev, newProgram]
      console.log('Updated programs list:', updated.map(p => ({ id: p.id, name: p.name })))
      return updated
    })
    setCurrentProgram(newProgram)
    setIsSaveAsDialogOpen(false)
    
    if (isCreateMode) {
      showNotification('Program created successfully', 'success')
      // Navigate to program dashboard after creating
      navigate('/program')
    } else {
      showNotification('Program saved as new copy', 'success')
      // Navigate to the new program for edit mode
      navigate(`/program/edit/${newProgram.id}`)
    }
  }

  const handleImportProgram = (importedProgram: any) => {
    setPrograms(prev => [...prev, importedProgram])
    showNotification(`Program "${importedProgram.name}" imported successfully`, 'success')
  }

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) return
      
      // Add more validation rules here as needed
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: type.charAt(0).toUpperCase() + type.slice(1),
          isActive: true,
          ...(type === 'operator' && { operatorType: 'SUM' as const }),
          ...(type === 'constraint' && { parameter: 'tx_type' }),
          ...(type === 'distribution' && { distributionType: 'do_to_distribution' })
        },
      }

      setNodes((nds) => [...nds, newNode])
      
      // Open panel in creation mode for the new node
      setEditingNode(newNode)
      setPanelMode('creation')
      setIsPanelVisible(true)
    },
    [setNodes]
  )

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
      setIsPanelVisible(false)
    }
  }, [selectedNode, setNodes, setEdges])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
    if (editingNode?.id === nodeId) {
      setEditingNode(null)
      setIsPanelVisible(false)
    }
  }, [setNodes, setEdges, selectedNode, editingNode])

  const editNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setEditingNode(node)
      setPanelMode('edit')
      setIsPanelVisible(true)
    }
  }, [nodes])

  const toggleNodeActive = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                isActive: !(node.data as any).isActive,
              },
            }
          : node
      )
    )
  }, [setNodes])

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const addNodeToCanvas = useCallback((nodeType: NodeType, sourceNodeId?: string, sourceHandle?: 'top' | 'bottom' | 'left' | 'right') => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!reactFlowBounds) return

    // Calculate position based on source node if provided
    let position: { x: number; y: number }
    
    if (sourceNodeId && sourceHandle) {
      const sourceNode = nodes.find(n => n.id === sourceNodeId)
      if (sourceNode) {
        // Position the new node below or above the source node
        const offset = sourceHandle === 'top' ? -120 : 120
        position = {
          x: sourceNode.position.x,
          y: sourceNode.position.y + offset
        }
      } else {
        // Fallback to center if source node not found
        position = {
          x: reactFlowBounds.width / 2 - 100,
          y: reactFlowBounds.height / 2 - 50,
        }
      }
    } else {
      // Default center position
      position = {
        x: reactFlowBounds.width / 2 - 100,
        y: reactFlowBounds.height / 2 - 50,
      }
    }

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        isActive: true,
        ...(nodeType === 'operator' && { operatorType: 'SUM' as const }),
        ...(nodeType === 'constraint' && { parameter: 'tx_type' }),
        ...(nodeType === 'distribution' && { distributionType: 'do_to_distribution' })
      },
    }

    setNodes((nds) => [...nds, newNode])
    setIsPaletteOpen(false) // Close the palette after adding node
    
    // Create connection if source node is provided
    if (sourceNodeId && sourceHandle) {
      const newEdge: Edge = {
        id: `edge-${sourceNodeId}-${newNode.id}`,
        source: sourceHandle === 'top' || sourceHandle === 'left' ? newNode.id : sourceNodeId,
        target: sourceHandle === 'top' || sourceHandle === 'left' ? sourceNodeId : newNode.id,
        sourceHandle: sourceHandle === 'top' ? 'bottom' : sourceHandle === 'left' ? 'right' : sourceHandle === 'right' ? 'left' : 'top',
        targetHandle: sourceHandle === 'top' ? 'top' : sourceHandle === 'left' ? 'left' : sourceHandle === 'right' ? 'right' : 'bottom',
      }
      setEdges((eds) => [...eds, newEdge])
    }
    
    // Open panel in creation mode for the new node
    setEditingNode(newNode)
    setPanelMode('creation')
    setIsPanelVisible(true)
  }, [setNodes, setEdges, nodes])

  const handleSaveNode = useCallback((nodeData: any) => {
    if (editingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === editingNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...nodeData,
                },
              }
            : node
        )
      )
      
      // Update selectedNode if it's the same as editingNode
      if (selectedNode?.id === editingNode.id) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            ...nodeData,
          },
        })
      }
    }
  }, [editingNode, setNodes, selectedNode])

  const handleClosePanel = useCallback(() => {
    setIsPanelVisible(false)
    setEditingNode(null)
  }, [])

  const openPaletteFromHandle = useCallback((nodeId?: string, handle?: 'top' | 'bottom' | 'left' | 'right') => {
    setPaletteSourceNodeId(nodeId)
    setPaletteSourceHandle(handle)
    setIsPaletteOpen(true)
  }, [])

  const openPaletteFromCorner = useCallback(() => {
    setPaletteSourceNodeId(undefined)
    setPaletteSourceHandle(undefined)
    setIsPaletteOpen(true)
  }, [])

  const closePalette = useCallback(() => {
    setIsPaletteOpen(false)
    setPaletteSourceNodeId(undefined)
    setPaletteSourceHandle(undefined)
  }, [])



  // Show loading only if we're in edit mode and don't have a program yet
  if (!currentProgram && isEditMode && id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading program...</Typography>
      </Box>
    )
  }

  // For create mode, show initializing only if template modal is not open
  if (!currentProgram && isCreateMode && !isTemplateModalOpen) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Initializing...</Typography>
      </Box>
    )
  }

  // Render the canvas (either with currentProgram or with template modal open)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Program Management Toolbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/program')}
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isCreateMode ? 'Create New Program' : currentProgram?.name || 'Program'}
          </Typography>
          
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveProgram}
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          
          <Button
            onClick={handleSaveAs}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Save As
          </Button>
          
          <ProgramExporter
            program={currentProgram}
            onImport={handleImportProgram}
            disabled={!currentProgram}
          />
        </Toolbar>
      </AppBar>

      {/* Main Canvas */}
      <Box sx={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <NodeHandlersContext.Provider value={{
          onDelete: deleteNode,
          onEdit: editNode,
          onToggleActive: toggleNodeActive,
          onOpenPalette: openPaletteFromHandle
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </NodeHandlersContext.Provider>

        {/* Centered Add Button - Only show when no nodes exist */}
        {nodes.length === 0 && (
          <CreateNodeButton 
            onOpenPalette={openPaletteFromCorner} 
            variant="center"
            size="large"
          />
        )}

        {/* Fixed Create Node Button - Top Right Corner */}
        <CreateNodeButton
          onOpenPalette={openPaletteFromCorner}
          variant="corner"
          size="medium"
        />
      </Box>

      {/* Node Palette */}
      <NodePalette
        isOpen={isPaletteOpen}
        onClose={closePalette}
        onDragStart={onDragStart}
        onNodeClick={addNodeToCanvas}
        sourceNodeId={paletteSourceNodeId}
        sourceHandle={paletteSourceHandle}
      />

      {/* Node Property Panel Modal */}
      <NodePropertyPanel
        isVisible={isPanelVisible}
        mode={panelMode}
        selectedNode={editingNode}
        onClose={handleClosePanel}
        onDeleteNode={deleteSelectedNode}
        onSaveNode={handleSaveNode}
      />

      {/* Save As Dialog */}
      <Dialog open={isSaveAsDialogOpen} onClose={() => setIsSaveAsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isCreateMode ? 'Save New Program' : 'Save Program As'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Program Name"
            fullWidth
            variant="outlined"
            value={saveAsData.name}
            onChange={(e) => setSaveAsData(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={saveAsData.description}
            onChange={(e) => setSaveAsData(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveAsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAsConfirm} variant="contained">
            {isCreateMode ? 'Create Program' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={isTemplateModalOpen}
        onClose={handleTemplateModalClose}
        onSelectTemplate={handleTemplateSelect}
        onManualCreate={handleManualCreate}
      />

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

function ProgramCanvas() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
          <ProgramCanvasEditor />
      </ReactFlowProvider>
    </div>
  )
}

export default ProgramCanvas 