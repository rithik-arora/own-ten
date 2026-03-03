import { useEffect, useState } from 'react'
import socketService from '../services/socketService'

export const useSocket = (disputeId) => {

  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {

    const token = localStorage.getItem('token')

    if (!token) {
      socketService.disconnect()
      setSocket(null)
      setIsConnected(false)
      return
    }

    const socketInstance = socketService.connect(token)
    setSocket(socketInstance)

    const onConnect = () => {
      setIsConnected(true)

      // ✅ Auto join room after reconnect
      if (disputeId) {
        socketService.joinDispute(disputeId)
      }
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    socketInstance.on('connect', onConnect)
    socketInstance.on('disconnect', onDisconnect)

    return () => {
      socketInstance.off('connect', onConnect)
      socketInstance.off('disconnect', onDisconnect)
    }

  }, [disputeId])

  return {
    socket,
    isConnected,
    joinDispute: socketService.joinDispute.bind(socketService),
    leaveDispute: socketService.leaveDispute.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService)
  }
}