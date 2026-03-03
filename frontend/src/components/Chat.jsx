import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Chat = ({ disputeId }) => {
  const { user } = useAuth()

  // ✅ Only needed socket helpers
  const {
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    on,
    off
  } = useSocket(disputeId)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [typingUsers, setTypingUsers] = useState([])

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  /* ===============================
      LOAD MESSAGES (REST API)
     =============================== */

  useEffect(() => {
    if (!disputeId) return

    loadMessages()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [disputeId])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await axios.get(
        `/api/messages/dispute/${disputeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (res.data.success) {
        setMessages(res.data.data.messages || [])
      } else {
        setMessages([])
      }
    } catch (err) {
      console.error('Load message error:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  /* ===============================
      SOCKET EVENTS
     =============================== */

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (data) => {
      setMessages(prev => [...prev, data.message])
      scrollToBottom()
    }

    const handleUserTyping = (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data]
          }
          return prev
        })

        setTimeout(() => {
          setTypingUsers(prev =>
            prev.filter(u => u.userId !== data.userId)
          )
        }, 3000)
      }
    }

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev =>
        prev.filter(u => u.userId !== data.userId)
      )
    }

    const handleSocketError = (err) => {
      console.error('Socket error:', err)
      setError(err?.message || 'Socket error')
    }

    on('receive_message', handleReceiveMessage)
    on('user_typing', handleUserTyping)
    on('user_stopped_typing', handleUserStoppedTyping)
    on('error', handleSocketError)

    return () => {
      off('receive_message', handleReceiveMessage)
      off('user_typing', handleUserTyping)
      off('user_stopped_typing', handleUserStoppedTyping)
      off('error', handleSocketError)
    }
  }, [socket])

  /* ===============================
      UI HELPERS
     =============================== */

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /* ===============================
      SEND MESSAGE
     =============================== */

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !isConnected || sending) return

    setSending(true)
    stopTyping(disputeId)

    try {
      sendMessage(disputeId, newMessage.trim())
      setNewMessage('')
    } catch {
      setError('Message send failed')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)

    if (!isConnected) return

    if (e.target.value.trim()) {
      startTyping(disputeId)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(disputeId)
      }, 1000)
    } else {
      stopTyping(disputeId)
    }
  }

  /* ===============================
      UI
     =============================== */

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex justify-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Chat</h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-zinc-400">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-3 py-2 rounded-lg mb-3 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="h-96 overflow-y-auto bg-black border border-zinc-800 rounded-lg p-4 mb-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {messages.length === 0 ? (
          <p className="text-zinc-500 text-center">No messages yet</p>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const mine = msg.senderId._id === user?.id

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs ${
                      mine
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                        : 'bg-zinc-800 border border-zinc-700 text-white'
                    }`}
                  >
                    {!mine && (
                      <p className="text-xs font-semibold text-indigo-400 mb-1">
                        {msg.senderId.name}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${mine ? 'text-indigo-200' : 'text-zinc-400'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="italic text-sm text-zinc-400 mt-2"
            >
              {typingUsers.map(u => u.userName).join(', ')} typing...
            </motion.p>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type message..."
          disabled={!isConnected}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat