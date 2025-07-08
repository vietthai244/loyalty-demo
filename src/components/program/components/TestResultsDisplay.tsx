import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import type { DryTestResult, EvaluationLogEntry } from '../../../utils/programEvaluator'

interface TestResultsDisplayProps {
  results: DryTestResult | null
  isLoading?: boolean
}

export function TestResultsDisplay({ results, isLoading = false }: TestResultsDisplayProps) {
  const [expandedLog, setExpandedLog] = useState(false)

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Running test...
        </Typography>
      </Box>
    )
  }

  if (!results) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No test results available. Run a test to see results.
        </Typography>
      </Box>
    )
  }

  const { overallProgramResult, detailedDistributions, evaluationLog } = results

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <CheckCircleIcon color="success" fontSize="small" />
      case 'NOT_MATCHED':
        return <CancelIcon color="error" fontSize="small" />
      case 'EVALUATED':
        return <InfoIcon color="info" fontSize="small" />
      case 'SKIPPED':
        return <WarningIcon color="warning" fontSize="small" />
      default:
        return <InfoIcon color="action" fontSize="small" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return 'success'
      case 'NOT_MATCHED':
        return 'error'
      case 'EVALUATED':
        return 'info'
      case 'SKIPPED':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Overall Result Summary */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Results Summary
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            icon={overallProgramResult.triggered ? <CheckCircleIcon /> : <CancelIcon />}
            label={overallProgramResult.triggered ? 'Program Triggered' : 'Program Not Triggered'}
            color={overallProgramResult.triggered ? 'success' : 'error'}
            variant="outlined"
          />
          <Typography variant="body1">
            Total Points: <strong>{overallProgramResult.totalCalculatedPoints}</strong>
          </Typography>
        </Stack>

        {overallProgramResult.triggered ? (
          <Alert severity="success">
            <AlertTitle>Program Activated</AlertTitle>
            The loyalty program was successfully triggered and calculated {overallProgramResult.totalCalculatedPoints} points.
          </Alert>
        ) : (
          <Alert severity="info">
            <AlertTitle>Program Not Activated</AlertTitle>
            The loyalty program was not triggered with the provided test data.
          </Alert>
        )}
      </Paper>

      {/* Detailed Distributions */}
      {detailedDistributions.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Distributions ({detailedDistributions.length})
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Distribution</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Triggered By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailedDistributions.map((dist) => (
                  <TableRow key={dist.distributionId}>
                    <TableCell>{dist.distributionLabel}</TableCell>
                    <TableCell>{dist.distributionType}</TableCell>
                    <TableCell align="right">
                      <strong>{dist.calculatedAmount}</strong>
                    </TableCell>
                    <TableCell>{dist.triggeredByRuleLabel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Evaluation Log */}
      <Paper sx={{ p: 2 }}>
        <Accordion 
          expanded={expandedLog} 
          onChange={() => setExpandedLog(!expandedLog)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Evaluation Log ({evaluationLog.length} entries)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {evaluationLog.map((entry, index) => (
                <Box key={index} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {getStatusIcon(entry.evaluationStatus)}
                    <Typography variant="subtitle2">
                      {entry.nodeLabel}
                    </Typography>
                    <Chip 
                      label={entry.nodeType} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={entry.evaluationStatus} 
                      size="small" 
                      color={getStatusColor(entry.evaluationStatus) as any}
                    />
                  </Stack>
                  
                  {entry.resultValue !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      Result: <strong>{String(entry.resultValue)}</strong>
                    </Typography>
                  )}
                  
                  {entry.details && (
                    <Typography variant="body2" color="text.secondary">
                      {entry.details}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  )
} 