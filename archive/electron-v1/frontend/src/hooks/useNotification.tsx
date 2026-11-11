import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationPayload } from '../types';

interface Notification extends NotificationPayload {
  id: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationPayload['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationPayload['type'] = 'info', duration: number = 3000) => {
      const id = Date.now() + Math.random().toString(36);
      setNotifications(prev => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
