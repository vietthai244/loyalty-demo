import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material'
import { Close as CloseIcon, PlayArrow as PlayIcon } from '@mui/icons-material'
import { useState } from 'react'
import type { LoyaltyProgram } from '../hooks/useProgramManagement'
import type { EventData, DryTestResult } from '../../../utils/programEvaluator'
import { EventDataInput } from './EventDataInput'
import { TestResultsDisplay } from './TestResultsDisplay'
import { dryTestProgram, type ProgramNode, type ProgramEdge } from '../../../utils/programEvaluator'

interface DryTestModalProps {
  open: boolean
  onClose: () => void
  program: LoyaltyProgram | null
}

export function DryTestModal({ open, onClose, program }: DryTestModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [eventData, setEventData] = useState<EventData>({})
  const [testResults, setTestResults] = useState<DryTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const convertToProgramFormat = (loyaltyProgram: LoyaltyProgram) => {
    const programNodes: ProgramNode[] = loyaltyProgram.nodes.map(node => ({
      id: node.id,
      type: node.type as 'operator' | 'rule' | 'constraint' | 'distribution',
      position: node.position,
      data: node.data as any,
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition
    }))

    const programEdges: ProgramEdge[] = loyaltyProgram.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined
    }))

    return {
      nodes: programNodes,
      edges: programEdges
    }
  }

  const handleRunTest = () => {
    if (!program) return

    setIsLoading(true)
    
    // Simulate async operation
    setTimeout(() => {
      try {
        const programFormat = convertToProgramFormat(program)
        const results = dryTestProgram(programFormat, eventData)
        setTestResults(results)
        // Switch to Results tab after test completion
        setActiveTab(1)
      } catch (error) {
        console.error('Test execution error:', error)
        setTestResults(null)
        // Switch to Results tab even if there's an error to show the error state
        setActiveTab(1)
      } finally {
        setIsLoading(false)
      }
    }, 500)
  }

  const handleClose = () => {
    setActiveTab(0)
    setEventData({})
    setTestResults(null)
    setIsLoading(false)
    onClose()
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Dry Test: {program?.name || 'Program'}
          </Typography>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Test Data" />
            <Tab label="Results" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Test Configuration</Typography>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleRunTest}
                  disabled={!program || program.nodes.length === 0}
                >
                  Run Test
                </Button>
              </Box>
              
              <EventDataInput
                program={program}
                onEventDataChange={setEventData}
                initialEventData={eventData}
              />
            </Box>
          )}

          {activeTab === 1 && (
            <TestResultsDisplay
              results={testResults}
              isLoading={isLoading}
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
} 