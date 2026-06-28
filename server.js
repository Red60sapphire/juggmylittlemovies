const { WebSocketServer } = require('ws')

const wss = new WebSocketServer({ port: 3001 })

const rooms = {}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function broadcast(roomCode, message, excludeWs = null) {
  const room = rooms[roomCode]
  if (!room) return
  const data = JSON.stringify(message)
  if (room.host && room.host !== excludeWs && room.host.readyState === 1) {
    room.host.send(data)
  }
  room.guests.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(data)
  })
}

wss.on('connection', (ws) => {
  let currentRoom = null
  let isHost = false
  let username = 'Guest'

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    switch (msg.type) {

      case 'CREATE_ROOM': {
        const code = generateCode()
        const hostKey = Math.random().toString(36).substring(2, 10)
        rooms[code] = {
          host: ws,
          hostKey,
          guests: new Set(),
          state: {
            code,
            roomName: msg.roomName || 'Watch Party',
            isPublic: msg.isPublic !== false,
            mediaId: msg.mediaId,
            mediaType: msg.mediaType,
            mediaTitle: msg.mediaTitle,
            mediaPoster: msg.mediaPoster,
            playing: false,
            currentTime: 0,
            status: 'idle',
            members: [msg.username || 'Host']
          }
        }
        currentRoom = code
        isHost = true
        username = msg.username || 'Host'
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', code, hostKey, state: rooms[code].state }))
        break
      }

      case 'JOIN_ROOM': {
        const room = rooms[msg.code]
        if (!room) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }))
          return
        }
        room.guests.add(ws)
        room.state.members.push(msg.username || 'Guest')
        currentRoom = msg.code
        isHost = false
        username = msg.username || 'Guest'
        ws.send(JSON.stringify({ type: 'ROOM_JOINED', state: room.state }))
        broadcast(msg.code, { type: 'MEMBER_JOINED', username, members: room.state.members }, ws)
        break
      }

      case 'RECONNECT_HOST': {
        const room = rooms[msg.code]
        if (!room || room.hostKey !== msg.hostKey) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid host key' }))
          return
        }
        room.host = ws
        currentRoom = msg.code
        isHost = true
        username = msg.username || 'Host'
        room.state.members = room.state.members.filter(m => m !== username)
        room.state.members.push(username)
        ws.send(JSON.stringify({ type: 'ROOM_JOINED', state: room.state }))
        broadcast(msg.code, { type: 'MEMBER_JOINED', username, members: room.state.members }, ws)
        break
      }

      case 'PLAYBACK': {
        if (!isHost || !currentRoom || !rooms[currentRoom]) return
        const room = rooms[currentRoom]
        room.state.playing = msg.action === 'play'
        room.state.currentTime = msg.time ?? room.state.currentTime
        room.state.status = msg.action === 'pause' ? 'paused' : 'active'
        broadcast(currentRoom, { type: 'PLAYBACK', action: msg.action, time: msg.time, timestamp: Date.now() }, ws)
        break
      }

      case 'SEEK': {
        if (!isHost || !currentRoom || !rooms[currentRoom]) return
        rooms[currentRoom].state.currentTime = msg.time
        broadcast(currentRoom, { type: 'SEEK', time: msg.time }, ws)
        break
      }

      case 'CHANGE_MEDIA': {
        if (!isHost || !currentRoom || !rooms[currentRoom]) return
        const room = rooms[currentRoom]
        room.state.mediaId = msg.mediaId
        room.state.mediaType = msg.mediaType
        room.state.mediaTitle = msg.mediaTitle
        room.state.mediaPoster = msg.mediaPoster
        room.state.playing = false
        room.state.currentTime = 0
        broadcast(currentRoom, { type: 'CHANGE_MEDIA', mediaId: msg.mediaId, mediaType: msg.mediaType, mediaTitle: msg.mediaTitle, mediaPoster: msg.mediaPoster })
        break
      }

      case 'CHAT': {
        if (!currentRoom) return
        broadcast(currentRoom, { type: 'CHAT', username, message: msg.message, timestamp: Date.now() }, ws)
        break
      }

      case 'GET_ROOMS': {
        const publicRooms = Object.values(rooms)
          .filter(r => r.state.isPublic)
          .map(r => ({ ...r.state, memberCount: r.guests.size + 1 }))
        ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms: publicRooms }))
        break
      }
    }
  })

  ws.on('close', () => {
    if (!currentRoom || !rooms[currentRoom]) return
    const room = rooms[currentRoom]
    if (isHost) {
      room.host = null
      broadcast(currentRoom, { type: 'HOST_DISCONNECTED', message: 'The host has disconnected. They can rejoin to reclaim host status.' })
    } else {
      room.guests.delete(ws)
      room.state.members = room.state.members.filter(m => m !== username)
      broadcast(currentRoom, { type: 'MEMBER_LEFT', username, members: room.state.members })
    }
  })
})

console.log('Watch party WebSocket server running on ws://localhost:3001')
