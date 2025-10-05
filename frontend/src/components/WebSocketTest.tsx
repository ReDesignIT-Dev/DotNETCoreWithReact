import React, { useState, useEffect, useRef } from 'react';
import { webSocketService } from 'services/webSocketService';
import { testWebSocket } from 'services/shopServices/cartApiRequests';

interface ButtonState {
    status: 'idle' | 'waiting' | 'success';
    requestId: string | null;
}

const WebSocketTest: React.FC = () => {
    const [buttonState, setButtonState] = useState<ButtonState>({ status: 'idle', requestId: null });
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('Not initialized');
    const [connectionInfo, setConnectionInfo] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const connectionInitialized = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef<((data: any) => void) | null>(null); // Store callback reference

    useEffect(() => {
        // Create callback function once and store reference
        const handleButtonSuccess = (data: { requestId: string; success: boolean; timestamp: string }) => {
            console.log('🎉 Button success event received in component:', data);
            setButtonState(prev => {
                console.log('prev request id', prev.requestId);
                console.log('data request id', data.requestId);
                if (prev.requestId === data.requestId) {
                    console.log('✅ Request ID matches, updating button to success');
                    return { ...prev, status: 'success' };
                } else {
                    console.log('⚠️ Request ID mismatch. Expected:', prev.requestId, 'Received:', data.requestId);
                }
                return prev;
            });
        };

        // Store callback reference
        callbackRef.current = handleButtonSuccess;

        // Only initialize connection once
        if (!connectionInitialized.current) {
            const connectWebSocket = async () => {
                try {
                    setError(null);
                    console.log('🔌 Initializing WebSocket connection...');
                    await webSocketService.connect();
                    setIsConnected(webSocketService.isConnected());
                    setConnectionState(webSocketService.getConnectionState());
                    setConnectionInfo(webSocketService.getConnectionInfo());
                    console.log('✅ WebSocket initialization completed');
                } catch (err) {
                    setError(`Failed to connect to WebSocket: ${err}`);
                    console.error('❌ WebSocket connection error:', err);
                    setIsConnected(false);
                    setConnectionState(webSocketService.getConnectionState());
                    setConnectionInfo(webSocketService.getConnectionInfo());
                }
            };

            // Update connection state periodically
            intervalRef.current = setInterval(() => {
                const connected = webSocketService.isConnected();
                const state = webSocketService.getConnectionState();
                const info = webSocketService.getConnectionInfo();
                setIsConnected(connected);
                setConnectionState(state);
                setConnectionInfo(info);
            }, 1000);

            // Mark as initialized before connecting
            connectionInitialized.current = true;
            connectWebSocket();
        }

        // Always register the callback (even on re-mount in StrictMode)
        console.log('🔗 Registering ButtonSuccess callback');
        webSocketService.on('ButtonSuccess', handleButtonSuccess);

        return () => {
            // Only unregister THIS specific callback
            if (callbackRef.current) {
                console.log('🔓 Unregistering ButtonSuccess callback');
                webSocketService.off('ButtonSuccess', callbackRef.current);
            }
            
            // Only cleanup interval and connection on final unmount
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []); // Keep empty dependency array

    const handleButtonClick = async () => {
        if (buttonState.status !== 'idle') return;

        try {
            setError(null);
            console.log('🚀 Initiating WebSocket test...');
            const response = await testWebSocket();

            if (response?.data) {
                setButtonState({
                    status: 'waiting',
                    requestId: response.data.requestId
                });
                console.log('✅ WebSocket test initiated:', response.data);
                console.log('🕐 Waiting for ButtonSuccess message with requestId:', response.data.requestId);
            }
        } catch (err) {
            setError('Failed to initiate WebSocket test');
            console.error('❌ Error initiating WebSocket test:', err);
        }
    };

    const handleManualTest = async () => {
        try {
            setError(null);
            console.log('🧪 Invoking manual test...');
            await webSocketService.invokeTest('Manual test from UI');
            console.log('✅ Manual test invoked successfully');
        } catch (err) {
            setError('Failed to invoke manual test');
            console.error('❌ Error invoking manual test:', err);
        }
    };

    const resetButton = () => {
        setButtonState({ status: 'idle', requestId: null });
    };

    const getButtonText = () => {
        switch (buttonState.status) {
            case 'idle':
                return 'Test WebSocket';
            case 'waiting':
                return 'Waiting...';
            case 'success':
                return 'Success!';
            default:
                return 'Test WebSocket';
        }
    };

    const getButtonStyle = () => {
        const baseStyle = {
            padding: '12px 24px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '6px',
            cursor: buttonState.status === 'idle' ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            minWidth: '150px',
            margin: '5px'
        };

        switch (buttonState.status) {
            case 'idle':
                return { ...baseStyle, backgroundColor: '#007bff', color: 'white' };
            case 'waiting':
                return { ...baseStyle, backgroundColor: '#ffc107', color: 'black' };
            case 'success':
                return { ...baseStyle, backgroundColor: '#28a745', color: 'white' };
            default:
                return baseStyle;
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h3>WebSocket Test</h3>

            <div style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <h4>Connection Status</h4>
                <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
                <p>State: <code>{connectionState}</code></p>
                <p>Connection ID: <code>{connectionInfo.connectionId || 'None'}</code></p>
                <p>Reconnect Attempts: {connectionInfo.reconnectAttempts || 0}</p>
                <p>Current Request ID: <code>{buttonState.requestId || 'None'}</code></p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={handleButtonClick}
                    disabled={buttonState.status !== 'idle' || !isConnected}
                    style={getButtonStyle()}
                >
                    {getButtonText()}
                </button>

                <button
                    onClick={handleManualTest}
                    disabled={!isConnected}
                    style={{
                        ...getButtonStyle(),
                        backgroundColor: isConnected ? '#17a2b8' : '#6c757d'
                    }}
                >
                    Manual Test
                </button>
            </div>

            {buttonState.status === 'success' && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={resetButton}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset
                    </button>
                </div>
            )}

            {error && (
                <div style={{ color: 'red', marginTop: '10px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>How it works:</strong></p>
                <ol>
                    <li>{`Click "Test WebSocket" - sends HTTP request to backend`}</li>
                    <li>{`Backend responds immediately and starts 5-second timer`}</li>
                    <li>{`After 5 seconds, backend sends ButtonSuccess via SignalR`}</li>
                    <li>{`Frontend receives message and updates button to Success`}</li>
                </ol>
                <p><strong>Debug tips:</strong></p>
                <ul>
                    <li>{`Check browser console for detailed logs with emojis`}</li>
                    <li>{`Connection should stay connected for full 5 seconds`}</li>
                    <li>{`Manual Test button tests direct hub communication`}</li>
                </ul>
            </div>
        </div>
    );
};

export default WebSocketTest;