import { io } from 'socket.io-client'

class SocketService {

  socket = null

  connect(token) {

    // ✅ Always destroy old socket before creating new
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    const serverUrl = 'http://localhost:5000'

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,   // IMPORTANT
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    // Manually connect
    this.socket.connect()

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
  }

  /* ===== Chat helpers ===== */

  joinDispute(id) {
    this.socket?.emit('join_dispute', id)
  }

  leaveDispute(id) {
    this.socket?.emit('leave_dispute', id)
  }

  sendMessage(id, msg) {
    this.socket?.emit('send_message', { disputeId: id, content: msg })
  }

  startTyping(id) {
    this.socket?.emit('typing_start', { disputeId: id })
  }

  stopTyping(id) {
    this.socket?.emit('typing_stop', { disputeId: id })
  }

  on(event, cb) {
    this.socket?.on(event, cb)
  }

  off(event, cb) {
    this.socket?.off(event, cb)
  }
}

export default new SocketService()