import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'

let ioServer: Server | null = null

export function initSocketServer(httpServer: HttpServer): Server {
  ioServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  ioServer.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`)

    socket.on('join:room', (room: string) => {
      socket.join(room)
      console.log(`[WebSocket] Socket ${socket.id} joined room: ${room}`)
    })

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`)
    })
  })

  return ioServer
}

export function getSocketServer(): Server | null {
  return ioServer
}

// Broadcast ticket auto-assignment event to live clients & specialists
export function broadcastTicketAssigned(ticket: any, assignment: any) {
  if (!ioServer) return
  ioServer.emit('ticket:assigned', {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    assignedAdminId: ticket.assignedAdminId,
    assignedAdminName: assignment?.assignedAdminName,
    subject: ticket.subject,
    priority: ticket.priority,
    score: assignment?.scoreResult?.totalScore,
    timestamp: new Date().toISOString(),
  })
}

// Broadcast background guidance document indexing completed event
export function broadcastDocumentIndexed(documentId: string, chunkCount: number) {
  if (!ioServer) return
  ioServer.emit('guidance:document_indexed', {
    documentId,
    chunkCount,
    status: 'PUBLISHED',
    timestamp: new Date().toISOString(),
  })
}
