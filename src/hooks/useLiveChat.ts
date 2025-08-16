"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  chatId: string;
}

interface UseLiveChatProps {
  userId: string;
  chatId: string;
}

interface UseLiveChatReturn {
  messages: Message[];
  sendMessage: (content: string, receiverId: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLiveChat({ userId, chatId }: UseLiveChatProps): UseLiveChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !chatId) return;

    // For now, we'll use polling instead of WebSocket since we don't have a socket server
    // In production, this would connect to a real WebSocket server
    setIsConnected(true);

    // Fetch initial messages
    fetchMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, chatId]);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Send message function
  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    if (!content.trim() || !userId || !receiverId || !chatId) {
      setError('Missing required fields for sending message');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const messageData = {
        senderId: userId,
        receiverId,
        content: content.trim(),
        chatId,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        // Add the new message to the local state
        const newMessage: Message = data.data;
        setMessages(prev => [...prev, newMessage]);

        // In a real implementation, this would emit to other connected clients
        // socketRef.current?.emit('message', newMessage);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, chatId]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Polling for new messages (simulating real-time updates)
  useEffect(() => {
    if (!isConnected || !chatId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [isConnected, chatId, fetchMessages]);

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    error,
    clearError,
  };
}

export default useLiveChat;
