import { useRef, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { ProgramToolbar } from './components/ProgramToolbar'
import { NodePalette } from './NodePalette'
import { NodePropertyPanel } from './NodePropertyPanel'
import { CreateNodeButton } from './CreateNodeButton'
import { DryTestModal } from './components/DryTestModal'
import { ExportImageDialog } from './components/ExportImageDialog'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import '@xyflow/react/dist/style.css'

// Import hooks
import { useProgramManagement } from './hooks/useProgramManagement'
import { useNodeManagement } from './hooks/useNodeManagement'

// Import components
import { SaveAsDialog } from './components/SaveAsDialog'
import { NotificationSnackbar } from './components/NotificationSnackbar'
import { TemplateSelectionModal } from './TemplateSelectionModal'

// Import node components
import OperatorNode from './OperatorNode'
import RuleNode from './RuleNode'
import ConstraintNode from './ConstraintNode'
import DistributionNode from './DistributionNode'

// Import types
import type { ProgramTemplate } from './types'

// Import context
import { NodeHandlersProvider } from './context/NodeHandlersContext'

// Node types configuration - defined outside component to prevent React Flow warnings
const nodeTypes = {
  operator: (props: any) => <OperatorNode {...props} />,
  rule: (props: any) => <RuleNode {...props} />,
  constraint: (props: any) => <ConstraintNode {...props} />,
  distribution: (props: any) => <DistributionNode {...props} />,
}

interface ProgramCanvasProps {
  mode: 'create' | 'edit'
}

export default function ProgramCanvas({ mode }: ProgramCanvasProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  
  // Check if we're in create mode by looking at the pathname
  const isCreateMode = mode === 'create' || location.pathname === '/program/create'
  // Check if we're in edit mode by looking at the pathname
  const isEditMode = mode === 'edit' || (location.pathname.startsWith('/program/edit/') && !!id)
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  
  // Template selection modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  
  // Dry test modal state
  const [isDryTestModalOpen, setIsDryTestModalOpen] = useState(false)
  
  // Export image dialog state
  const [isExportImageDialogOpen, setIsExportImageDialogOpen] = useState(false)
  
  // Use custom hooks
  const programManagement = useProgramManagement(mode, id)
  const nodeManagement = useNodeManagement()
  
  const {
    currentProgram,
    setCurrentProgram,
    isSaveAsDialogOpen,
    setIsSaveAsDialogOpen,
    saveAsData,
    setSaveAsData,
    notification,
    setNotification,
    isInitialLoad,
    handleSaveProgram,
    handleSaveAsConfirm,
    handleImportProgram
  } = programManagement

  const {
    isPaletteOpen,
    setIsPaletteOpen,
    isPanelVisible,
    setIsPanelVisible,
    panelMode,
    setPanelMode,
    editingNode,
    setEditingNode,
    paletteSourceNodeId,
    paletteSourceHandle,
    onConnect,
    onNodeClick,
    onPaneClick,
    onDragOver,
    onDrop,
    deleteSelectedNode,
    deleteNode,
    editNode,
    toggleNodeActive,
    addNodeToCanvas,
    handleSaveNode,
    openPalette
  } = nodeManagement

  // Create a ref to store the current handlers
  const handlersRef = useRef({
    onDelete: (nodeId: string) => deleteNode(nodeId, setNodes, setEdges),
    onEdit: (nodeId: string) => editNode(nodeId, nodes),
    onToggleActive: (nodeId: string) => toggleNodeActive(nodeId, setNodes),
    onOpenPalette: openPalette,
  })

  // Update handlers ref when dependencies change
  useEffect(() => {
    handlersRef.current = {
      onDelete: (nodeId: string) => deleteNode(nodeId, setNodes, setEdges),
      onEdit: (nodeId: string) => editNode(nodeId, nodes),
      onToggleActive: (nodeId: string) => toggleNodeActive(nodeId, setNodes),
      onOpenPalette: openPalette,
    }
  }, [deleteNode, editNode, toggleNodeActive, openPalette, setNodes, setEdges, nodes])

  // Load program data when currentProgram changes
  useEffect(() => {
    if (currentProgram && isEditMode) {
      setNodes([...currentProgram.nodes])
      setEdges([...currentProgram.edges])
    }
  }, [currentProgram, isEditMode, setNodes, setEdges])

  // Remove auto-save to prevent infinite loops
  // Auto-save will be handled manually when user saves

  // Fallback: Always open modal if in create mode and no program is set
  useEffect(() => {
    if (isCreateMode && !isTemplateModalOpen && !currentProgram) {
      setIsTemplateModalOpen(true)
    }
  }, [isCreateMode, currentProgram, isTemplateModalOpen])

  const handleTemplateSelect = (template: ProgramTemplate) => {
    console.log('📋 Selected template:', {
      id: template.id,
      name: template.name,
      nodes: template.nodes.length,
      edges: template.edges.length
    })
    console.log('🔗 Template edges:', template.edges)
    
    // Create new program from template
    const newProgram = {
      id: 'temp-create',
      name: `${template.name} Copy`,
      description: template.description,
      nodes: template.nodes,
      edges: template.edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCurrentProgram(newProgram)
    setNodes([...template.nodes])
    setEdges([...template.edges])
    setIsTemplateModalOpen(false)
  }

  const handleManualCreate = () => {
    // Create empty program
    const newProgram = {
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
  }

  const handleTemplateModalClose = () => {
    if (isCreateMode) {
      navigate('/program')
    }
  }

  const handleSave = () => {
    handleSaveProgram(nodes, edges)
  }

  const handleSaveAsConfirmLocal = () => {
    handleSaveAsConfirm(nodes, edges)
  }

  const handleBack = () => {
    navigate('/program')
  }

  const handleNotificationClose = () => {
    setNotification(null)
  }

  const handleSaveAsClose = () => {
    setIsSaveAsDialogOpen(false)
  }

  const handleSaveAsNameChange = (name: string) => {
    setSaveAsData(prev => ({ ...prev, name }))
  }

  const handleSaveAsDescriptionChange = (description: string) => {
    setSaveAsData(prev => ({ ...prev, description }))
  }

  const handleDryTest = () => {
    setIsDryTestModalOpen(true)
  }

  const handleDryTestClose = () => {
    setIsDryTestModalOpen(false)
  }

  const handleExportImage = () => {
    setIsExportImageDialogOpen(true)
  }

  const handleExportImageClose = () => {
    setIsExportImageDialogOpen(false)
  }

  if (isInitialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Initializing...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <ProgramToolbar
        mode={mode}
        currentProgram={currentProgram}
        onBack={handleBack}
        onSave={handleSave}
        onImport={handleImportProgram}
        onDryTest={handleDryTest}
        onExportImage={handleExportImage}
      />

      {/* React Flow Canvas */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <NodeHandlersProvider handlers={handlersRef.current}>
            <div 
              ref={reactFlowWrapper} 
              data-testid="react-flow-wrapper"
              style={{ width: '100%', height: '100%' }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={(params) => {
                  const result = onConnect(params)
                  if (result) {
                    setEdges((eds) => addEdge(result, eds))
                  }
                }}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={(event) => {
                  const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
                  onDrop(event, reactFlowBounds, setNodes, setEditingNode, setPanelMode, setIsPanelVisible)
                }}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Controls />
                <Background />
                <MiniMap />
                
                {/* Node creation button */}
                            <CreateNodeButton
              size="large"
              onOpenPalette={openPalette}
              hasNodes={nodes.length > 0}
            />
              </ReactFlow>
            </div>
          </NodeHandlersProvider>
        </ReactFlowProvider>
      </Box>

      {/* Node Property Panel */}
      <NodePropertyPanel
        isVisible={isPanelVisible}
        mode={panelMode}
        selectedNode={editingNode}
        onClose={() => {
          setIsPanelVisible(false)
          setEditingNode(null)
        }}
        onDeleteNode={() => deleteSelectedNode(setNodes, setEdges)}
        onSaveNode={(nodeData) => handleSaveNode(nodeData, setNodes)}
      />

      {/* Node Palette */}
      <NodePalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onDragStart={(event, nodeType) => {
          event.dataTransfer.setData('application/reactflow', nodeType)
          event.dataTransfer.effectAllowed = 'move'
        }}
        onNodeClick={(nodeType, sourceNodeId, sourceHandle) => {
          const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
          addNodeToCanvas(nodeType, reactFlowBounds, nodes, setNodes, setEdges, sourceNodeId, sourceHandle)
        }}
        sourceNodeId={paletteSourceNodeId}
        sourceHandle={paletteSourceHandle}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={isTemplateModalOpen}
        onClose={handleTemplateModalClose}
        onSelectTemplate={handleTemplateSelect}
        onManualCreate={handleManualCreate}
      />

      {/* Save As Dialog */}
      <SaveAsDialog
        open={isSaveAsDialogOpen}
        onClose={handleSaveAsClose}
        onConfirm={handleSaveAsConfirmLocal}
        name={saveAsData.name}
        description={saveAsData.description}
        onNameChange={handleSaveAsNameChange}
        onDescriptionChange={handleSaveAsDescriptionChange}
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        notification={notification}
        onClose={handleNotificationClose}
      />

      {/* Dry Test Modal */}
      <DryTestModal
        open={isDryTestModalOpen}
        onClose={handleDryTestClose}
        program={currentProgram}
      />

      {/* Export Image Dialog */}
      <ExportImageDialog
        open={isExportImageDialogOpen}
        onClose={handleExportImageClose}
        reactFlowWrapper={reactFlowWrapper.current}
        reactFlowInstance={reactFlowInstance}
        programName={currentProgram?.name || 'Program'}
      />
    </Box>
  )
} 