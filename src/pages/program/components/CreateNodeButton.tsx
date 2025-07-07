import { Box, Typography } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

interface CreateNodeButtonProps {
  onOpenPalette: () => void
}

export function CreateNodeButton({ onOpenPalette }: CreateNodeButtonProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        onClick={onOpenPalette}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 200,
          height: 120,
          border: '2px dashed #ccc',
          borderRadius: 2,
          cursor: 'pointer',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 32, color: '#666', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Click to add nodes
        </Typography>
      </Box>
    </Box>
  )
} 