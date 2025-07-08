import { Box, Alert, List, ListItem, ListItemIcon, ListItemText, Typography, Chip } from '@mui/material'
import { 
  Error as ErrorIcon, 
  Warning as WarningIcon, 
  CheckCircle as SuccessIcon,
  Info as InfoIcon 
} from '@mui/icons-material'
import type { Node, Edge } from '@xyflow/react'

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  nodeId?: string
  edgeId?: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export function validateProgram(nodes: Node[], edges: Edge[]): ValidationResult {
  const issues: ValidationIssue[] = []
  
  // Check for orphaned nodes (nodes without connections)
  const connectedNodeIds = new Set<string>()
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })
  
  nodes.forEach(node => {
    if (!connectedNodeIds.has(node.id)) {
      issues.push({
        type: 'warning',
        message: `Node "${node.data.label || node.id}" is not connected to any other node`,
        nodeId: node.id
      })
    }
  })
  
  // Check for cycles in the graph
  const hasCycle = detectCycle(nodes, edges)
  if (hasCycle) {
    issues.push({
      type: 'error',
      message: 'Program contains circular dependencies which could cause infinite loops'
    })
  }
  
  // Check for multiple entry points
  const entryNodes = nodes.filter(node => {
    const incomingEdges = edges.filter(edge => edge.target === node.id)
    return incomingEdges.length === 0
  })
  
  if (entryNodes.length === 0) {
    issues.push({
      type: 'error',
      message: 'Program has no entry point (no nodes without incoming connections)'
    })
  } else if (entryNodes.length > 1) {
    issues.push({
      type: 'warning',
      message: `Program has ${entryNodes.length} entry points, which may cause unexpected behavior`
    })
  }
  
  // Check for multiple exit points
  const exitNodes = nodes.filter(node => {
    const outgoingEdges = edges.filter(edge => edge.source === node.id)
    return outgoingEdges.length === 0
  })
  
  if (exitNodes.length === 0) {
    issues.push({
      type: 'warning',
      message: 'Program has no exit point (no nodes without outgoing connections)'
    })
  }
  
  // Check for specific node type issues
  nodes.forEach(node => {
    const data = node.data as any
    
    // Check operator nodes
    if (node.type === 'operator') {
      if (!data.operatorType) {
        issues.push({
          type: 'error',
          message: `Operator node "${data.label || node.id}" has no operator type selected`,
          nodeId: node.id
        })
      }
    }
    
    // Check constraint nodes
    if (node.type === 'constraint') {
      if (!data.parameter) {
        issues.push({
          type: 'error',
          message: `Constraint node "${data.label || node.id}" has no parameter defined`,
          nodeId: node.id
        })
      }
    }
    
    // Check distribution nodes
    if (node.type === 'distribution') {
      if (!data.distributionType) {
        issues.push({
          type: 'error',
          message: `Distribution node "${data.label || node.id}" has no distribution type selected`,
          nodeId: node.id
        })
      }
    }
    
    // Check for inactive nodes
    if (data.isActive === false) {
      issues.push({
        type: 'info',
        message: `Node "${data.label || node.id}" is inactive`,
        nodeId: node.id
      })
    }
  })
  
  // Check for disconnected components
  const components = findConnectedComponents(nodes, edges)
  if (components.length > 1) {
    issues.push({
      type: 'warning',
      message: `Program contains ${components.length} disconnected components`
    })
  }
  
  const errors = issues.filter(issue => issue.type === 'error').length
  const warnings = issues.filter(issue => issue.type === 'warning').length
  const info = issues.filter(issue => issue.type === 'info').length
  
  return {
    isValid: errors === 0,
    issues,
    summary: { errors, warnings, info }
  }
}

// Helper function to detect cycles using DFS
function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  const visited = new Set<string>()
  const recStack = new Set<string>()
  
  const adjList = new Map<string, string[]>()
  nodes.forEach(node => adjList.set(node.id, []))
  edges.forEach(edge => {
    const neighbors = adjList.get(edge.source) || []
    neighbors.push(edge.target)
    adjList.set(edge.source, neighbors)
  })
  
  function hasCycleDFS(nodeId: string): boolean {
    if (recStack.has(nodeId)) return true
    if (visited.has(nodeId)) return false
    
    visited.add(nodeId)
    recStack.add(nodeId)
    
    const neighbors = adjList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (hasCycleDFS(neighbor)) return true
    }
    
    recStack.delete(nodeId)
    return false
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) return true
    }
  }
  
  return false
}

// Helper function to find connected components
function findConnectedComponents(nodes: Node[], edges: Edge[]): string[][] {
  const visited = new Set<string>()
  const components: string[][] = []
  
  const adjList = new Map<string, string[]>()
  nodes.forEach(node => adjList.set(node.id, []))
  edges.forEach(edge => {
    const neighbors = adjList.get(edge.source) || []
    neighbors.push(edge.target)
    adjList.set(edge.source, neighbors)
    
    const reverseNeighbors = adjList.get(edge.target) || []
    reverseNeighbors.push(edge.source)
    adjList.set(edge.target, reverseNeighbors)
  })
  
  function dfs(nodeId: string, component: string[]) {
    visited.add(nodeId)
    component.push(nodeId)
    
    const neighbors = adjList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component)
      }
    }
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const component: string[] = []
      dfs(node.id, component)
      components.push(component)
    }
  }
  
  return components
}

interface ProgramValidatorProps {
  nodes: Node[]
  edges: Edge[]
  showDetails?: boolean
}

export function ProgramValidator({ nodes, edges, showDetails = false }: ProgramValidatorProps) {
  const validation = validateProgram(nodes, edges)
  
  if (validation.issues.length === 0) {
    return (
      <Alert severity="success" icon={<SuccessIcon />}>
        Program validation passed! No issues found.
      </Alert>
    )
  }
  
  const getSeverity = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'info'
    }
  }
  
  const getIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <ErrorIcon />
      case 'warning': return <WarningIcon />
      case 'info': return <InfoIcon />
      default: return <InfoIcon />
    }
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Program Validation</Typography>
        <Chip 
          label={`${validation.summary.errors} errors, ${validation.summary.warnings} warnings, ${validation.summary.info} info`}
          color={validation.isValid ? 'warning' : 'error'}
          size="small"
        />
      </Box>
      
      {showDetails && (
        <List dense>
          {validation.issues.map((issue, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getIcon(issue.type)}
              </ListItemIcon>
              <ListItemText 
                primary={issue.message}
                secondary={issue.nodeId && `Node ID: ${issue.nodeId}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {!showDetails && (
        <Alert severity={getSeverity(validation.issues[0]?.type || 'info')} icon={getIcon(validation.issues[0]?.type || 'info')}>
          {validation.issues.length} validation issue{validation.issues.length !== 1 ? 's' : ''} found. 
          {validation.summary.errors > 0 && ` ${validation.summary.errors} error${validation.summary.errors !== 1 ? 's' : ''}.`}
          {validation.summary.warnings > 0 && ` ${validation.summary.warnings} warning${validation.summary.warnings !== 1 ? 's' : ''}.`}
        </Alert>
      )}
    </Box>
  )
} 