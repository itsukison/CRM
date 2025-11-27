import { useState, useEffect, useCallback } from 'react';
import type { GmailConnectionStatus } from '../types';

export function useGmailConnection(userId?: string) {
    const [connection, setConnection] = useState<GmailConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkConnection = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const response = await fetch(`/api/gmail/status?userId=${encodeURIComponent(userId)}`);
            
            if (!response.ok) {
                throw new Error('Failed to check Gmail connection');
            }
            
            const data = await response.json();
            
            if (data.connected) {
                setConnection({
                    connected: true,
                    email: data.email,
                    expiresAt: data.expiresAt,
                });
            } else {
                setConnection(null);
            }
        } catch (err) {
            console.error('Error checking Gmail connection:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setConnection(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    const connect = useCallback(() => {
        if (!userId) {
            console.error('User ID required to connect Gmail');
            return;
        }
        // Redirect to Gmail OAuth with userId
        window.location.href = `/api/gmail/auth?userId=${encodeURIComponent(userId)}`;
    }, [userId]);

    const disconnect = useCallback(async () => {
        if (!userId) {
            console.error('User ID required to disconnect Gmail');
            return;
        }
        
        try {
            const response = await fetch('/api/gmail/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });
            
            if (response.ok) {
                setConnection(null);
            }
        } catch (err) {
            console.error('Error disconnecting Gmail:', err);
        }
    }, [userId]);

    return {
        connection,
        loading,
        error,
        connect,
        disconnect,
        refresh: checkConnection,
    };
}

