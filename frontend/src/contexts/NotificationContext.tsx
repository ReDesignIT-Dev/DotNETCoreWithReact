import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertProps, Slide, SlideProps } from '@mui/material';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig {
  message: string;
  type: NotificationType;
  duration?: number;
  action?: React.ReactNode;
}

interface NotificationContextType {
  showNotification: (config: NotificationConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationConfig>({
    message: '',
    type: 'info',
    duration: 4000
  });

  const showNotification = (config: NotificationConfig) => {
    setNotification({
      duration: 4000,
      ...config
    });
    setOpen(true);
  };

  const showSuccess = (message: string, duration = 4000) => {
    showNotification({ message, type: 'success', duration });
  };

  const showError = (message: string, duration = 6000) => {
    showNotification({ message, type: 'error', duration });
  };

  const showWarning = (message: string, duration = 5000) => {
    showNotification({ message, type: 'warning', duration });
  };

  const showInfo = (message: string, duration = 4000) => {
    showNotification({ message, type: 'info', duration });
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getSeverity = (): AlertProps['severity'] => {
    return notification.type;
  };

  return (
    <NotificationContext.Provider 
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
        sx={{
          '& .MuiSnackbar-root': {
            top: '24px !important'
          }
        }}
      >
        <Alert 
          onClose={handleClose} 
          severity={getSeverity()} 
          variant="filled"
          sx={{ 
            width: '100%',
            minWidth: '300px',
            fontSize: '1rem',
            fontWeight: 500,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-action': {
              paddingTop: '4px'
            }
          }}
          action={notification.action}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};