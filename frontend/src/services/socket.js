import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io({
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })
  }
  return socket
}

export function joinShowRoom(showId) {
  const s = getSocket()
  if (!s.connected) s.connect()
  s.emit('join:show', showId)
  console.log('[Socket] Joined show room:', showId)
}

export function leaveShowRoom(showId) {
  const s = getSocket()
  s.emit('leave:show', showId)
  console.log('[Socket] Left show room:', showId)
}

export default getSocket
