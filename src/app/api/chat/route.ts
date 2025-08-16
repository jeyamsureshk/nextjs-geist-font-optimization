import { NextRequest, NextResponse } from 'next/server';
import { fetchChatMessages, sendMessage } from '@/lib/catalyst';
import { z } from 'zod';

// Validation schema for sending messages
const sendMessageSchema = z.object({
  senderId: z.string().min(1, 'Sender ID is required'),
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  chatId: z.string().min(1, 'Chat ID is required'),
});

// GET - Fetch chat messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const messages = await fetchChatMessages(chatId);

    return NextResponse.json(
      { 
        success: true, 
        messages: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fetch messages error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = sendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const messageData = validationResult.data;

    // Send message through Catalyst
    const newMessage = await sendMessage(messageData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        data: newMessage
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Send message error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
