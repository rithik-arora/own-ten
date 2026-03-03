import { createContext, useContext, useEffect, useState } from 'react'
import socketService from '../services/socketService'
import toast from 'react-hot-toast'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {

  const [notifications, setNotifications] = useState([])

  // Add notification to state
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
  }

  useEffect(() => {

    const socket = socketService.getSocket()

    if (!socket) return

    const handleNotification = (notification) => {

      // Update bell count
      addNotification(notification)

      // Toast popup
      toast(notification.title, {
        description: notification.message
      })
    }

    socket.on('notification:new', handleNotification)

    return () => {
      socket.off('notification:new', handleNotification)
    }

  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)