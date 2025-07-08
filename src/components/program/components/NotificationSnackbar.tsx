import { Snackbar, Alert } from '@mui/material'

interface NotificationSnackbarProps {
  notification: { message: string; type: 'success' | 'error' } | null
  onClose: () => void
}

export function NotificationSnackbar({ notification, onClose }: NotificationSnackbarProps) {
  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={6000}
      onClose={onClose}
    >
      <Alert
        onClose={onClose}
        severity={notification?.type}
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  )
} 