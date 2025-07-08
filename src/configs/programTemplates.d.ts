import type { Node, Edge } from '@xyflow/react'

export interface ProgramTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: Node[]
  edges: Edge[]
  tags: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
}

declare const programTemplates: {
  templates: ProgramTemplate[]
}

export default programTemplates 