import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Dashboard as TemplateIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon
} from '@mui/icons-material'
import type { Node, Edge } from '@xyflow/react'
import programTemplates from '../../../configs/programTemplates.json'

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

interface TemplateSelectionModalProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: ProgramTemplate) => void
  onManualCreate: () => void
}

// Import templates from JSON config
const PREDEFINED_TEMPLATES: ProgramTemplate[] = programTemplates.templates as ProgramTemplate[]

export function TemplateSelectionModal({
  open,
  onClose,
  onSelectTemplate,
  onManualCreate
}: TemplateSelectionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null)

  const handleTemplateSelect = (template: ProgramTemplate) => {
    setSelectedTemplate(template)
  }

  const handleConfirmTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      setSelectedTemplate(null)
    }
  }

  const handleManualCreate = () => {
    onManualCreate()
    setSelectedTemplate(null)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'error'
      default: return 'default'
    }
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'Basic'
      case 'intermediate': return 'Intermediate'
      case 'advanced': return 'Advanced'
      default: return complexity
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1
      }}>
        <TemplateIcon color="primary" />
        <Typography variant="h6">Choose Program Template</Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a template to get started quickly, or create a program from scratch.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleManualCreate}
            fullWidth
            size="large"
            sx={{ py: 2 }}
          >
            Create Program from Scratch
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Or choose a template
          </Typography>
        </Divider>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {PREDEFINED_TEMPLATES.map((template) => (
            <Box key={template.id}>
              <Card 
                variant={selectedTemplate?.id === template.id ? "elevation" : "outlined"}
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id ? 2 : 1,
                  borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2
                  }
                }}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {template.name}
                    </Typography>
                    <Chip 
                      label={getComplexityLabel(template.complexity)}
                      color={getComplexityColor(template.complexity)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {template.tags.map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {template.category}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {template.nodes.length} nodes, {template.edges.length} connections
                    </Typography>
                  </Box>
                                 </CardContent>
               </Card>
             </Box>
           ))}
         </Box>

        {PREDEFINED_TEMPLATES.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No templates available yet. Create a program from scratch to get started.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {selectedTemplate && (
          <Button 
            onClick={handleConfirmTemplate} 
            variant="contained"
            startIcon={<TemplateIcon />}
          >
            Use Template
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export { PREDEFINED_TEMPLATES } 