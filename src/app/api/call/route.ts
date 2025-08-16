import { NextRequest, NextResponse } from 'next/server';
import { initiateCall, updateCallStatus } from '@/lib/catalyst';
import { z } from 'zod';

// Validation schema for initiating calls
const initiateCallSchema = z.object({
  callerId: z.string().min(1, 'Caller ID is required'),
  receiverId: z.string().min(1, 'Receiver ID is required'),
  status: z.enum(['initiated', 'ongoing', 'ended', 'missed']).default('initiated'),
});

// Validation schema for updating call status
const updateCallSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
  status: z.enum(['initiated', 'ongoing', 'ended', 'missed']),
  endTime: z.string().optional(),
});

// POST - Initiate a new call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = initiateCallSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const callData = validationResult.data;

    // Initiate call through Catalyst
    const newCall = await initiateCall(callData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Call initiated successfully',
        call: newCall
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Initiate call error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    );
  }
}

// PUT - Update call status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = updateCallSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { callId, status, endTime } = validationResult.data;

    // Update call status through Catalyst
    const updatedCall = await updateCallStatus(callId, status, endTime);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Call status updated successfully',
        call: updatedCall
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update call status error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update call status' },
      { status: 500 }
    );
  }
}

// GET - Fetch call history (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch calls from localStorage (in production, this would be from Catalyst)
    const allCalls = JSON.parse(localStorage?.getItem('calls') || '[]');
    const userCalls = allCalls.filter((call: any) => 
      call.callerId === userId || call.receiverId === userId
    );

    return NextResponse.json(
      { 
        success: true, 
        calls: userCalls.sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fetch calls error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
