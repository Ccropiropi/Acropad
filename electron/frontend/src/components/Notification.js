import React from 'react';
import { useNotification } from '../hooks/useNotification';
import '../App.css';

function Notification() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((note) => (
        <div
          key={note.id}
          className={`notification notification-${note.type}`}
          onClick={() => removeNotification(note.id)}
          role="alert"
        >
          <span>{note.message}</span>
        </div>
      ))}
    </div>
  );
}

export default Notification;
