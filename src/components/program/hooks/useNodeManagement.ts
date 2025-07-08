import { useState, useCallback } from 'react'
import type { Node, Edge, Connection } from '@xyflow/react'
import type { NodeType, PanelMode } from '../types'

export function useNodeManagement() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>('creation')
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [paletteSourceNodeId, setPaletteSourceNodeId] = useState<string | undefined>()
  const [paletteSourceHandle, setPaletteSourceHandle] = useState<'top' | 'bottom' | 'left' | 'right' | undefined>()

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) return
      
      // Add more validation rules here as needed
      return params
    },
    []
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
    (event: React.DragEvent, reactFlowBounds: DOMRect | undefined, setNodes: any, setEditingNode: any, setPanelMode: any, setIsPanelVisible: any) => {
      event.preventDefault()

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

      setNodes((nds: Node[]) => [...nds, newNode])
      
      // Open panel in creation mode for the new node
      setEditingNode(newNode)
      setPanelMode('creation')
      setIsPanelVisible(true)
    },
    []
  )

  const deleteSelectedNode = useCallback((setNodes: any, setEdges: any) => {
    if (selectedNode) {
      setNodes((nds: Node[]) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds: Edge[]) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
      setIsPanelVisible(false)
    }
  }, [selectedNode])

  const deleteNode = useCallback((nodeId: string, setNodes: any, setEdges: any) => {
    setNodes((nds: Node[]) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds: Edge[]) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
    if (editingNode?.id === nodeId) {
      setEditingNode(null)
      setIsPanelVisible(false)
    }
  }, [selectedNode, editingNode, setSelectedNode, setEditingNode, setIsPanelVisible])

  const editNode = useCallback((nodeId: string, nodes: Node[]) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setEditingNode(node)
      setPanelMode('edit')
      setIsPanelVisible(true)
    }
  }, [setEditingNode, setPanelMode, setIsPanelVisible])

  const toggleNodeActive = useCallback((nodeId: string, setNodes: any) => {
    setNodes((nds: Node[]) =>
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
  }, [])

  const addNodeToCanvas = useCallback((
    nodeType: NodeType, 
    reactFlowBounds: DOMRect | undefined,
    nodes: Node[],
    setNodes: any, 
    setEdges: any,
    sourceNodeId?: string, 
    sourceHandle?: 'top' | 'bottom' | 'left' | 'right'
  ) => {
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

    setNodes((nds: Node[]) => [...nds, newNode])
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
      setEdges((eds: Edge[]) => [...eds, newEdge])
    }
    
    // Open panel in creation mode for the new node
    setEditingNode(newNode)
    setPanelMode('creation')
    setIsPanelVisible(true)
  }, [])

  const handleSaveNode = useCallback((nodeData: any, setNodes: any) => {
    if (editingNode) {
      setNodes((nds: Node[]) =>
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
      
      // Update editingNode
      setEditingNode({
        ...editingNode,
        data: {
          ...editingNode.data,
          ...nodeData,
        },
      })
      
      setIsPanelVisible(false)
      setEditingNode(null)
    }
  }, [editingNode, selectedNode])

  const openPalette = useCallback((nodeId?: string, handle?: 'top' | 'bottom' | 'left' | 'right') => {
    setPaletteSourceNodeId(nodeId)
    setPaletteSourceHandle(handle)
    setIsPaletteOpen(true)
  }, [setPaletteSourceNodeId, setPaletteSourceHandle, setIsPaletteOpen])

  return {
    selectedNode,
    setSelectedNode,
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
  }
} 