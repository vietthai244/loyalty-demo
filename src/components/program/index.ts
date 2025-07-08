// Main components
export { default as ProgramCanvas } from './ProgramCanvas'
export { ProgramToolbar } from './components/ProgramToolbar'
export { SaveAsDialog } from './components/SaveAsDialog'
export { NotificationSnackbar } from './components/NotificationSnackbar'
export { ProgramDashboard } from './components/ProgramDashboard'

// Node components
export { default as OperatorNode } from './OperatorNode'
export { default as RuleNode } from './RuleNode'
export { default as ConstraintNode } from './ConstraintNode'
export { default as DistributionNode } from './DistributionNode'

// UI components
export { CreateNodeButton } from './CreateNodeButton'
export { NodePalette } from './NodePalette'
export { NodePropertyPanel } from './NodePropertyPanel'
export { NodeToolbar } from './NodeToolbar'
export { TemplateSelectionModal } from './TemplateSelectionModal'
export { ProgramValidator } from './ProgramValidator'
export { ProgramExporter } from './ProgramExporter'

// Hooks
export { useProgramManagement } from './hooks/useProgramManagement'
export { useNodeManagement } from './hooks/useNodeManagement'

// Types
export * from './types'

// Node Data Interfaces
export type { OperatorNodeData } from './OperatorNode'
export type { RuleNodeData } from './RuleNode'
export type { ConstraintNodeData } from './ConstraintNode'
export type { DistributionNodeData } from './DistributionNode'

// Export types
export type { NodeType } from './NodePalette'
export type { NodeToolbarAction, NodeToolbarProps } from './NodeToolbar'
export type { PanelMode } from './NodePropertyPanel'
export type { ValidationIssue, ValidationResult } from './ProgramValidator'
export type { LoyaltyProgram as ExportedLoyaltyProgram, ExportOptions } from './ProgramExporter'
export type { ProgramTemplate } from './TemplateSelectionModal'

// Union type for all node data
import type { OperatorNodeData } from './OperatorNode'
import type { RuleNodeData } from './RuleNode'
import type { ConstraintNodeData } from './ConstraintNode'
import type { DistributionNodeData } from './DistributionNode'

export type ProgramNodeData = OperatorNodeData | RuleNodeData | ConstraintNodeData | DistributionNodeData 