import { useEffect, useRef, useCallback, useState } from 'react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

interface RoomState {
  code: string
  roomName: string
  isPublic: boolean
  mediaId: string
  mediaType: string
  mediaTitle: string
  mediaPoster: string
  playing: boolean
  currentTime: number
  status: string
  members: string[]
}

interface ChatMessage {
  type: 'CHAT'
  username: string
  message: string
  timestamp: number
}

interface PublicRoom {
  code: string
  roomName?: string
  mediaTitle?: string
  mediaPoster?: string
  memberCount: number
  members?: string[]
}

export function useWatchParty() {
  const ws = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const isHostRef = useRef(false)
  const onPlaybackRef = useRef<((msg: any) => void) | null>(null)
  const onRoomCreatedRef = useRef<((code: string) => void) | null>(null)

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)

    socket.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'ROOM_CREATED':
          isHostRef.current = true
          sessionStorage.setItem(`watch-party-host:${msg.code}`, msg.hostKey)
          sessionStorage.setItem(`watch-party-name:${msg.code}`, msg.state.members[0])
          setRoomState(msg.state)
          if (onRoomCreatedRef.current) onRoomCreatedRef.current(msg.code)
          break
        case 'ROOM_JOINED':
          setRoomState(msg.state)
          break
        case 'PLAYBACK':
          if (!isHostRef.current && onPlaybackRef.current) onPlaybackRef.current(msg)
          break
        case 'SEEK':
          if (!isHostRef.current && onPlaybackRef.current) onPlaybackRef.current({ action: 'seek', time: msg.time })
          break
        case 'CHANGE_MEDIA':
          setRoomState(prev => prev ? { ...prev, ...msg } : prev)
          break
        case 'CHAT':
          setMessages(prev => [...prev, msg])
          break
        case 'MEMBER_JOINED':
        case 'MEMBER_LEFT':
          setRoomState(prev => prev ? { ...prev, members: msg.members } : prev)
          break
        case 'ROOMS_LIST':
          setRooms(msg.rooms)
          break
      }
    }

    return () => socket.close()
  }, [])

  const send = useCallback((data: Record<string, any>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const createRoom = useCallback((opts: Record<string, any>) => send({ type: 'CREATE_ROOM', ...opts }), [send])
  const joinRoom = useCallback((code: string, username: string) => send({ type: 'JOIN_ROOM', code, username }), [send])
  const reconnectHost = useCallback((code: string, hostKey: string, username: string) => send({ type: 'RECONNECT_HOST', code, hostKey, username }), [send])
  const sendPlayback = useCallback((action: string, time?: number) => send({ type: 'PLAYBACK', action, time }), [send])
  const sendSeek = useCallback((time: number) => send({ type: 'SEEK', time }), [send])
  const sendChat = useCallback((message: string) => send({ type: 'CHAT', message }), [send])
  const sendChangeMedia = useCallback((media: Record<string, any>) => send({ type: 'CHANGE_MEDIA', ...media }), [send])
  const getRooms = useCallback(() => send({ type: 'GET_ROOMS' }), [send])
  const setOnPlayback = useCallback((fn: (msg: any) => void) => { onPlaybackRef.current = fn }, [])
  const setOnRoomCreated = useCallback((fn: (code: string) => void) => { onRoomCreatedRef.current = fn }, [])

  return {
    connected,
    roomState,
    messages,
    rooms,
    isHost: isHostRef.current,
    createRoom,
    joinRoom,
    reconnectHost,
    sendPlayback,
    sendSeek,
    sendChat,
    sendChangeMedia,
    getRooms,
    setOnPlayback,
    setOnRoomCreated,
  }
}
