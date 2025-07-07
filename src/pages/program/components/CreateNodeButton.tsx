import { Box, Typography, IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

interface CreateNodeButtonProps {
  onOpenPalette: (nodeId?: string, handle?: 'top' | 'bottom') => void
  variant?: 'center' | 'handle' | 'corner' | 'text'
  size?: 'small' | 'medium' | 'large'
  nodeId?: string
  handle?: 'top' | 'bottom'
  customStyles?: {
    container?: any
    button?: any
    icon?: any
    text?: any
  }
}

export function CreateNodeButton({ 
  onOpenPalette, 
  variant = 'center',
  size = 'medium',
  nodeId,
  handle,
  customStyles = {}
}: CreateNodeButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 24,
          height: 24,
          iconSize: 16,
          fontSize: 'caption'
        }
      case 'large':
        return {
          width: 200,
          height: 120,
          iconSize: 32,
          fontSize: 'body2'
        }
      default: // medium
        return {
          width: 40,
          height: 40,
          iconSize: 20,
          fontSize: 'body2'
        }
    }
  }

  const sizeStyles = getSizeStyles()

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          container: {
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          },
          button: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(240,240,240,0.4) 100%)',
            // backdropFilter: 'blur(2px)',
            fontSize: '0.625rem',
            fontWeight: 400,
            color: '#666',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap',
            '&:hover': {
              color: '#1976d2',
              background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.2) 100%)',
              transform: 'translateY(-1px)',
            },
          },
          icon: {
            fontSize: 10,
            marginRight: 2,
          }
        }
      case 'handle':
        return {
          container: {
            position: 'relative',
            zIndex: 1000,
          },
          button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: sizeStyles.width,
            height: sizeStyles.height,
            border: '1px solid #ccc',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: 'white',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: '#f0f8ff',
              transform: 'scale(1.1)',
            },
          },
          icon: {
            fontSize: sizeStyles.iconSize,
            color: '#666',
          }
        }
      case 'corner':
        return {
          container: {
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
          },
          button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: sizeStyles.width,
            height: sizeStyles.height,
            border: '1px solid #ccc',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: '#f0f8ff',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            },
          },
          icon: {
            fontSize: sizeStyles.iconSize,
            color: '#666',
          }
        }
      default: // center
        return {
          container: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          },
          button: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: sizeStyles.width,
            height: sizeStyles.height,
            border: '2px dashed #ccc',
            borderRadius: 2,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          },
          icon: {
            fontSize: sizeStyles.iconSize,
            color: '#666',
            mb: variant === 'center' ? 1 : 0,
          },
          text: {
            fontSize: sizeStyles.fontSize,
            color: 'text.secondary',
          }
        }
    }
  }

  const variantStyles = getVariantStyles()

  const mergedStyles = {
    container: { ...variantStyles.container, ...customStyles.container },
    button: { ...variantStyles.button, ...customStyles.button },
    icon: { ...variantStyles.icon, ...customStyles.icon },
    text: { ...variantStyles.text, ...customStyles.text }
  }

  const handleClick = () => {
    if (variant === 'handle' && nodeId && handle) {
      onOpenPalette(nodeId, handle)
    } else {
      onOpenPalette()
    }
  }

  if (variant === 'text') {
    return (
      <Box sx={mergedStyles.container}>
        <Box
          onClick={handleClick}
          sx={mergedStyles.button}
        >
          <AddIcon sx={mergedStyles.icon} />
          <Typography variant="caption" sx={{ fontSize: '0.625rem', fontWeight: 400 }}>
            Add Node
          </Typography>
        </Box>
      </Box>
    )
  }

  if (variant === 'handle' || variant === 'corner') {
    return (
      <Box sx={mergedStyles.container}>
        <IconButton
          onClick={handleClick}
          sx={mergedStyles.button}
          size="small"
        >
          <AddIcon sx={mergedStyles.icon} />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box sx={mergedStyles.container}>
      <Box
        onClick={handleClick}
        sx={mergedStyles.button}
      >
        <AddIcon sx={mergedStyles.icon} />
        <Typography variant={sizeStyles.fontSize as any} sx={mergedStyles.text}>
          Click to add nodes
        </Typography>
      </Box>
    </Box>
  )
} 