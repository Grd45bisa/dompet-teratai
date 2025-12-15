import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

// Store user socket connections - maps userId to array of socket IDs
const userSockets: Map<string, string[]> = new Map();

export function initializeSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Handle user authentication
        socket.on('authenticate', (userId: string) => {
            if (!userId) return;

            // Store socket for this user
            const existingSockets = userSockets.get(userId) || [];
            existingSockets.push(socket.id);
            userSockets.set(userId, existingSockets);

            // Join user-specific room
            socket.join(`user:${userId}`);
            console.log(`👤 User ${userId} authenticated with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);

            // Remove socket from user mappings
            for (const [userId, sockets] of userSockets.entries()) {
                const index = sockets.indexOf(socket.id);
                if (index !== -1) {
                    sockets.splice(index, 1);
                    if (sockets.length === 0) {
                        userSockets.delete(userId);
                    }
                    break;
                }
            }
        });
    });

    console.log('🔌 Socket.io initialized');
    return io;
}

export function getIO(): Server | null {
    return io;
}

// Emit to specific user's room
export function emitToUser(userId: string, event: string, data: unknown): void {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
}

// Socket events enum
export const SocketEvents = {
    // Expense events
    EXPENSE_CREATED: 'expense:created',
    EXPENSE_UPDATED: 'expense:updated',
    EXPENSE_DELETED: 'expense:deleted',

    // Category events
    CATEGORY_CREATED: 'category:created',
    CATEGORY_UPDATED: 'category:updated',
    CATEGORY_DELETED: 'category:deleted',
} as const;
