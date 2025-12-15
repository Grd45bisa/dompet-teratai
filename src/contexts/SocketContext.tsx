import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../lib/api';

// Socket events (matching backend)
export const SocketEvents = {
    EXPENSE_CREATED: 'expense:created',
    EXPENSE_UPDATED: 'expense:updated',
    EXPENSE_DELETED: 'expense:deleted',
    CATEGORY_CREATED: 'category:created',
    CATEGORY_UPDATED: 'category:updated',
    CATEGORY_DELETED: 'category:deleted',
} as const;

type SocketEventType = typeof SocketEvents[keyof typeof SocketEvents];

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    subscribe: (event: SocketEventType, callback: (data: unknown) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3100';

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = getToken();

        // Only connect if user is authenticated
        if (!token) {
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('🔌 WebSocket connected');
            setIsConnected(true);

            // Authenticate with user token (user ID)
            newSocket.emit('authenticate', token);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('🔌 WebSocket connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Subscribe to socket events
    const subscribe = useCallback((event: SocketEventType, callback: (data: unknown) => void) => {
        if (!socket) {
            return () => { };
        }

        socket.on(event, callback);

        // Return unsubscribe function
        return () => {
            socket.off(event, callback);
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, subscribe }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

// Hook to auto-refresh data when socket events occur
export function useSocketEvent(event: SocketEventType, callback: (data: unknown) => void) {
    const { subscribe } = useSocket();

    useEffect(() => {
        const unsubscribe = subscribe(event, callback);
        return unsubscribe;
    }, [event, callback, subscribe]);
}
