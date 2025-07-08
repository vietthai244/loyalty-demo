import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { NodeHandlers } from '../types'

const NodeHandlersContext = createContext<NodeHandlers | null>(null)

interface NodeHandlersProviderProps {
  children: ReactNode
  handlers: NodeHandlers
}

export function NodeHandlersProvider({ children, handlers }: NodeHandlersProviderProps) {
  return (
    <NodeHandlersContext.Provider value={handlers}>
      {children}
    </NodeHandlersContext.Provider>
  )
}

export function useNodeHandlers() {
  const context = useContext(NodeHandlersContext)
  if (!context) {
    throw new Error('useNodeHandlers must be used within a NodeHandlersProvider')
  }
  return context
} 