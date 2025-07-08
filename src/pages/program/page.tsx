import { useState, useCallback, useRef, useEffect } from 'react'
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
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Divider,
  Alert,
  Snackbar
} from '@mui/material'
import { 
  Save as SaveIcon, 
  FolderOpen as OpenIcon, 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BugReport as ValidationIcon
} from '@mui/icons-material'
import '@xyflow/react/dist/style.css'

// Import node components and types
import {
  OperatorNode,
  RuleNode,
  ConstraintNode,
  DistributionNode,
  type ProgramNodeData,
  CreateNodeButton,
  NodePalette,
  NodePropertyPanel,
  ProgramValidator,
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

// Node types configuration with handlers
const createNodeTypes = (handlers: {
  onDelete: (nodeId: string) => void
  onEdit: (nodeId: string) => void
  onToggleActive: (nodeId: string) => void
  onOpenPalette: (nodeId?: string, handle?: 'top' | 'bottom') => void
}): NodeTypes => ({
  operator: (props: any) => <OperatorNode {...props} {...handlers} />,
  rule: (props: any) => <RuleNode {...props} {...handlers} />,
  constraint: (props: any) => <ConstraintNode {...props} {...handlers} />,
  distribution: (props: any) => <DistributionNode {...props} {...handlers} />,
})

// Local storage utilities
const STORAGE_KEY = 'loyalty_programs'

const saveProgramsToStorage = (programs: LoyaltyProgram[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programs))
}

const loadProgramsFromStorage = (): LoyaltyProgram[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function ProgramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  
  // Program management state
  const [currentProgram, setCurrentProgram] = useState<LoyaltyProgram | null>(null)
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [isNewProgramDialogOpen, setIsNewProgramDialogOpen] = useState(false)
  const [isOpenProgramDialogOpen, setIsOpenProgramDialogOpen] = useState(false)
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false)
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<LoyaltyProgram | null>(null)
  const [newProgramData, setNewProgramData] = useState({ name: '', description: '' })
  const [saveAsData, setSaveAsData] = useState({ name: '', description: '' })
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  
  // NodePropertyPanel state
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>('creation')
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  
  // NodePalette state for handle connections
  const [paletteSourceNodeId, setPaletteSourceNodeId] = useState<string | undefined>()
  const [paletteSourceHandle, setPaletteSourceHandle] = useState<'top' | 'bottom' | undefined>()
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Load programs from storage on mount
  useEffect(() => {
    const storedPrograms = loadProgramsFromStorage()
    setPrograms(storedPrograms)
  }, [])

  // Auto-save current program when nodes/edges change
  useEffect(() => {
    if (currentProgram && (nodes.length > 0 || edges.length > 0)) {
      const updatedProgram = {
        ...currentProgram,
        nodes,
        edges,
        updatedAt: new Date().toISOString()
      }
      setCurrentProgram(updatedProgram)
      
      // Update in programs list
      setPrograms(prev => 
        prev.map(p => p.id === updatedProgram.id ? updatedProgram : p)
      )
    }
  }, [nodes, edges, currentProgram])

  // Save programs to storage whenever programs list changes
  useEffect(() => {
    saveProgramsToStorage(programs)
  }, [programs])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
  }

  const handleNewProgram = () => {
    setNewProgramData({ name: '', description: '' })
    setIsNewProgramDialogOpen(true)
  }

  const handleCreateNewProgram = () => {
    if (!newProgramData.name.trim()) {
      showNotification('Program name is required', 'error')
      return
    }

    const newProgram: LoyaltyProgram = {
      id: `program-${Date.now()}`,
      name: newProgramData.name.trim(),
      description: newProgramData.description.trim(),
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPrograms(prev => [...prev, newProgram])
    setCurrentProgram(newProgram)
    setNodes([])
    setEdges([])
    setIsNewProgramDialogOpen(false)
    showNotification('New program created successfully', 'success')
  }

  const handleOpenProgram = () => {
    setIsOpenProgramDialogOpen(true)
  }

  const handleLoadProgram = (program: LoyaltyProgram) => {
    setCurrentProgram(program)
    setNodes(program.nodes)
    setEdges(program.edges)
    setIsOpenProgramDialogOpen(false)
    showNotification(`Program "${program.name}" loaded successfully`, 'success')
  }

  const handleSaveProgram = () => {
    if (!currentProgram) {
      showNotification('No program to save', 'error')
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

    setPrograms(prev => [...prev, newProgram])
    setCurrentProgram(newProgram)
    setIsSaveAsDialogOpen(false)
    showNotification('Program saved as new copy', 'success')
  }

  const handleDeleteProgram = (program: LoyaltyProgram) => {
    setProgramToDelete(program)
    setIsDeleteConfirmDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!programToDelete) return

    setPrograms(prev => prev.filter(p => p.id !== programToDelete.id))
    
    // If we're deleting the current program, clear the canvas
    if (currentProgram?.id === programToDelete.id) {
      setCurrentProgram(null)
      setNodes([])
      setEdges([])
    }
    
    setIsDeleteConfirmDialogOpen(false)
    setProgramToDelete(null)
    showNotification('Program deleted successfully', 'success')
  }

  const handleImportProgram = (importedProgram: any) => {
    setPrograms(prev => [...prev, importedProgram])
    showNotification(`Program "${importedProgram.name}" imported successfully`, 'success')
  }

  const onConnect = useCallback(
    (params: Connection) => {
      // Basic connection validation
      const sourceNode = nodes.find(node => node.id === params.source)
      const targetNode = nodes.find(node => node.id === params.target)
      
      // Prevent self-connections
      if (params.source === params.target) return
      
      // Add more validation rules here as needed
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, nodes]
  )

  const onNodeClick = useCallback((event: any, node: Node) => {
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

  const addNodeToCanvas = useCallback((nodeType: NodeType, sourceNodeId?: string, sourceHandle?: 'top' | 'bottom') => {
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
        source: sourceHandle === 'top' ? newNode.id : sourceNodeId,
        target: sourceHandle === 'top' ? sourceNodeId : newNode.id,
        sourceHandle: sourceHandle === 'top' ? 'bottom' : 'top',
        targetHandle: sourceHandle === 'top' ? 'top' : 'bottom',
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

  const openPaletteFromHandle = useCallback((nodeId?: string, handle?: 'top' | 'bottom') => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Program Management Toolbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentProgram ? currentProgram.name : 'No Program Loaded'}
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            onClick={handleNewProgram}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            New
          </Button>
          
          <Button
            startIcon={<OpenIcon />}
            onClick={handleOpenProgram}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Open
          </Button>
          
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveProgram}
            variant="contained"
            size="small"
            disabled={!currentProgram}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          
          <Button
            onClick={handleSaveAs}
            variant="outlined"
            size="small"
            disabled={!currentProgram}
            sx={{ mr: 1 }}
          >
            Save As
          </Button>
          
          <ProgramExporter
            program={currentProgram}
            onImport={handleImportProgram}
            disabled={!currentProgram}
          />
          
          <Button
            startIcon={<ValidationIcon />}
            onClick={() => setShowValidation(!showValidation)}
            variant={showValidation ? "contained" : "outlined"}
            size="small"
            sx={{ ml: 1 }}
          >
            Validation
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Canvas */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
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
          nodeTypes={createNodeTypes({ 
            onDelete: deleteNode, 
            onEdit: editNode, 
            onToggleActive: toggleNodeActive,
            onOpenPalette: openPaletteFromHandle
          })}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
          <MiniMap />
        </ReactFlow>

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

        {/* Validation Panel */}
        {showValidation && (
          <Box sx={{ width: 300, p: 2, borderLeft: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <ProgramValidator nodes={nodes} edges={edges} showDetails={true} />
          </Box>
        )}
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

      {/* New Program Dialog */}
      <Dialog open={isNewProgramDialogOpen} onClose={() => setIsNewProgramDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Program</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Program Name"
            fullWidth
            variant="outlined"
            value={newProgramData.name}
            onChange={(e) => setNewProgramData(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newProgramData.description}
            onChange={(e) => setNewProgramData(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewProgramDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNewProgram} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Open Program Dialog */}
      <Dialog open={isOpenProgramDialogOpen} onClose={() => setIsOpenProgramDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Open Program</DialogTitle>
        <DialogContent>
          {programs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No programs found. Create a new program to get started.
            </Typography>
          ) : (
            <List>
              {programs.map((program) => (
                <Box key={program.id}>
                  <ListItem>
                    <ListItemText
                      primary={program.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {program.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(program.createdAt).toLocaleDateString()} | 
                            Updated: {new Date(program.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleLoadProgram(program)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteProgram(program)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpenProgramDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save As Dialog */}
      <Dialog open={isSaveAsDialogOpen} onClose={() => setIsSaveAsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Program As</DialogTitle>
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
          <Button onClick={handleSaveAsConfirm} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

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

function Program() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <ProgramCanvas />
      </ReactFlowProvider>
    </div>
  )
}

export default Program
