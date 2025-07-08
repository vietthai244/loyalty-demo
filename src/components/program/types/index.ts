// Node types
export type NodeType = 'operator' | 'rule' | 'constraint' | 'distribution'

// Panel modes
export type PanelMode = 'creation' | 'edit'

// Node data interfaces
export interface OperatorNodeData {
  label: string
  isActive: boolean
  operatorType: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR'
}

export interface RuleNodeData {
  label: string
  isActive: boolean
  ruleType?: string
  conditions?: any[]
}

export interface ConstraintNodeData {
  label: string
  isActive: boolean
  parameter: string
  comparisonOperator?: string
  value?: string
}

export interface DistributionNodeData {
  label: string
  isActive: boolean
  distributionType: string
  pointMappingType?: string
  multiplier?: number
  baseValueField?: string
}

// Union type for all node data
export type ProgramNodeData = OperatorNodeData | RuleNodeData | ConstraintNodeData | DistributionNodeData

// Node toolbar types
export interface NodeToolbarAction {
  id: string
  icon: React.ReactNode
  title: string
  ariaLabel: string
  onClick: (e: React.MouseEvent) => void
  color?: string
  hoverColor?: string
  disabled?: boolean
}

export interface NodeToolbarProps {
  isVisible: boolean
  actions: NodeToolbarAction[]
  position?: any
  offset?: number
}

// Validation types
export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  nodeId?: string
  edgeId?: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
}

// Export types
export interface ExportOptions {
  includeMetadata: boolean
  includeTimestamps: boolean
  prettyPrint: boolean
}

// Program template types
export interface ProgramTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: any[]
  edges: any[]
  tags: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
}

// Node handlers interface
export interface NodeHandlers {
  onDelete: (nodeId: string) => void
  onEdit: (nodeId: string) => void
  onToggleActive: (nodeId: string) => void
  onOpenPalette: (nodeId?: string, handle?: 'top' | 'bottom' | 'left' | 'right') => void
} 