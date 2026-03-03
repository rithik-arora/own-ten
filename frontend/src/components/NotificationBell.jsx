import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import { notificationService } from '../services/notificationService'

const NotificationBell = () => {
  const { isAuthenticated } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef(null)

  const loadNotifications = async () => {
    if (!isAuthenticated) return
    try {
      setLoading(true)
      const response = await notificationService.fetchNotifications({ limit: 20 })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 50))
      setUnreadCount((count) => count + 1)
    }

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
    }
  }, [socket])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const relativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now - date) / 60000)
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const handleToggle = () => {
    const nextState = !open
    setOpen(nextState)
    if (nextState && notifications.length === 0) {
      loadNotifications()
    }
  }

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  const handleItemClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((count) => Math.max(0, count - 1))
      }

      if (notification.dispute) {
        navigate(`/disputes/${notification.dispute}`)
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center ring-2 ring-black">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-xs text-zinc-400">{unreadCount} unread</p>
              </div>
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Mark all
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-400">No notifications yet</div>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-zinc-800 transition-colors ${
                        !notification.isRead ? 'bg-indigo-900/20' : ''
                      }`}
                      onClick={() => handleItemClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-zinc-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="inline-flex mt-2 items-center text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {relativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell