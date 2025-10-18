import * as signalR from '@microsoft/signalr';
import { BACKEND_BASE_URL } from 'config';
import { getValidatedToken } from 'utils/cookies';

// Define specific callback types for type safety
type ButtonSuccessData = {
    requestId: string;
    success: boolean;
    timestamp: string;
};

type ForceLogoutData = {
    reason: string;
    timestamp: string;
    type: 'global' | 'individual';
};

type GlobalNotificationData = {
    message: string;
    type: string;
    timestamp: string;
};

type WebSocketEventCallback<T = any> = (data: T) => void;

type WebSocketEventMap = {
    ButtonSuccess: ButtonSuccessData;
    ForceLogout: ForceLogoutData;
    GlobalNotification: GlobalNotificationData;
    // Add more event types here as needed
    [key: string]: any;
};

class WebSocketService {
    private connection: signalR.HubConnection | null = null;
    private callbacks: { [K in keyof WebSocketEventMap]?: WebSocketEventCallback<WebSocketEventMap[K]>[] } & { [key: string]: WebSocketEventCallback[] } = {};
    private isConnecting = false;
    private connectionPromise: Promise<void> | null = null;
    private initialized = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    async connect(): Promise<void> {
        // If we're already connected, just return
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('Already connected to SignalR');
            return;
        }

        // If we're already connecting, wait for that connection to complete
        if (this.isConnecting && this.connectionPromise) {
            console.log('Connection attempt already in progress, waiting for it to complete...');
            return this.connectionPromise;
        }

        // Prevent multiple simultaneous connection attempts
        this.isConnecting = true;
        this.connectionPromise = this._doConnect();
        
        try {
            await this.connectionPromise;
        } finally {
            this.isConnecting = false;
            this.connectionPromise = null;
        }
    }

    private async _doConnect(): Promise<void> {
        try {
            // Clean up any existing connection
            if (this.connection) {
                await this._cleanupConnection();
            }

            const token = getValidatedToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            // Use the correct HTTPS URL from config
            const hubUrl = `${BACKEND_BASE_URL}/hub`;

            console.log('Creating new SignalR connection to:', hubUrl);

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => {
                        const currentToken = getValidatedToken();
                        console.log('Token requested for SignalR:', currentToken ? 'Token available' : 'No token');
                        return currentToken || '';
                    },
                    withCredentials: true
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this._setupEventHandlers();

            // Start the connection
            console.log('Starting SignalR connection...');
            await this.connection.start();
            
            console.log('SignalR connected successfully');
            console.log('Connection ID:', this.connection.connectionId);
            console.log('Connection state:', this.connection.state);
            
            this.initialized = true;
            this.reconnectAttempts = 0;

            // Test the connection with a delay to ensure it's stable
            setTimeout(async () => {
                try {
                    if (this.connection?.state === signalR.HubConnectionState.Connected) {
                        await this.connection.invoke('TestMethod', 'Connection established successfully');
                        console.log('Test method invoked successfully after connection');
                    }
                } catch (invokeErr) {
                    console.warn('Failed to invoke test method after connection:', invokeErr);
                }
            }, 1000);

        } catch (err) {
            console.error('SignalR connection failed:', err);
            this.initialized = false;
            this.reconnectAttempts++;
            
            // Try to reconnect if we haven't exceeded max attempts
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in 2 seconds...`);
                setTimeout(() => {
                    if (!this.isConnected()) {
                        this.connect().catch(console.error);
                    }
                }, 2000);
            }
            
            throw err;
        }
    }

    private _setupEventHandlers(): void {
        if (!this.connection) return;

        // Set up event handlers before starting connection
        this.connection.on('ButtonSuccess', (data: ButtonSuccessData) => {
            console.log('🎉 Button success received in WebSocketService:', data);
            this.emit('ButtonSuccess', data);
        });

        this.connection.on('ForceLogout', (data: ForceLogoutData) => {
            console.log('🚪 Force logout received:', data);
            this.emit('ForceLogout', data);
        });

        this.connection.on('GlobalNotification', (data: GlobalNotificationData) => {
            console.log('📢 Global notification received:', data);
            this.emit('GlobalNotification', data);
        });

        this.connection.onreconnecting((error) => {
            console.log('🔄 SignalR reconnecting:', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('✅ SignalR reconnected with connection ID:', connectionId);
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.log('❌ SignalR connection closed:', error);
            this.initialized = false;
            
            // Try to reconnect if the connection was closed unexpectedly
            if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
                console.log('Connection closed unexpectedly, attempting to reconnect...');
                setTimeout(() => {
                    if (!this.isConnected()) {
                        this.connect().catch(console.error);
                    }
                }, 1000);
            }
        });
    }

    private async _cleanupConnection(): Promise<void> {
        if (this.connection) {
            try {
                // Remove all listeners
                this.connection.off('ButtonSuccess');
                this.connection.off('TestResponse');
                
                // Stop the connection
                if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
                    await this.connection.stop();
                }
            } catch (err) {
                console.warn('Error cleaning up connection:', err);
            } finally {
                this.connection = null;
                this.initialized = false;
            }
        }
    }

    async disconnect(): Promise<void> {
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection attempts
        
        if (this.isConnecting && this.connectionPromise) {
            // Wait for connection attempt to finish before disconnecting
            try {
                await this.connectionPromise;
            } catch {
                // Ignore errors, we're disconnecting anyway
            }
        }

        await this._cleanupConnection();
    }

    on<K extends keyof WebSocketEventMap>(event: K, callback: WebSocketEventCallback<WebSocketEventMap[K]>): void;
    on(event: string, callback: WebSocketEventCallback): void;
    on(event: string, callback: WebSocketEventCallback): void {
        console.log('🔗 Registering callback for event:', event);
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        console.log('📝 Current callbacks for', event, ':', this.callbacks[event].length);
    }

    off<K extends keyof WebSocketEventMap>(event: K, callback: WebSocketEventCallback<WebSocketEventMap[K]>): void;
    off(event: string, callback: WebSocketEventCallback): void;
    off(event: string, callback: WebSocketEventCallback): void {
        console.log('🔓 Unregistering callback for event:', event);
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
            console.log('📝 Remaining callbacks for', event, ':', this.callbacks[event].length);
        }
    }

    private emit<K extends keyof WebSocketEventMap>(event: K, data: WebSocketEventMap[K]): void;
    private emit(event: string, data: any): void;
    private emit(event: string, data: any): void {
        console.log('📢 Emitting event:', event, 'with data:', data);
        console.log('📋 Available callbacks for event:', event, ':', this.callbacks[event]?.length || 0);
        
        if (this.callbacks[event]) {
            console.log('✅ Found callbacks, calling them...');
            this.callbacks[event].forEach((callback, index) => {
                console.log(`🔄 Calling callback ${index + 1} for event: ${event}`);
                try {
                    callback(data);
                    console.log(`✅ Callback ${index + 1} executed successfully`);
                } catch (error) {
                    console.error(`❌ Error in callback ${index + 1}:`, error);
                }
            });
        } else {
            console.warn('⚠️ No callbacks registered for event:', event);
            console.log('📋 All registered events:', Object.keys(this.callbacks));
        }
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    getConnectionState(): string {
        if (!this.connection) return 'Not initialized';
        return signalR.HubConnectionState[this.connection.state];
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    // Add method to manually invoke test
    async invokeTest(message: string): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                console.log('🚀 Invoking test method with message:', message);
                await this.connection.invoke('TestMethod', message);
                console.log('✅ Test method invoked successfully');
            } catch (err) {
                console.error('❌ Failed to invoke test method:', err);
                throw err;
            }
        } else {
            const errorMsg = `Not connected to SignalR hub. Current state: ${this.getConnectionState()}`;
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
    }

    // Add method to get connection info for debugging
    getConnectionInfo(): object {
        return {
            isConnected: this.isConnected(),
            connectionState: this.getConnectionState(),
            isInitialized: this.initialized,
            connectionId: this.connection?.connectionId || 'None',
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Add debug method to check callbacks
    getRegisteredCallbacks(): object {
        return Object.keys(this.callbacks).reduce((acc, key) => {
            acc[key] = this.callbacks[key]?.length || 0;
            return acc;
        }, {} as Record<string, number>);
    }
}

export const webSocketService = new WebSocketService();