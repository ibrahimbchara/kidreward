import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { addPoints } from '@/lib/points';

export const POST = createKidRequiredHandler(async (request: NextRequest, session, kidId) => {
  try {
    const body = await request.json();
    const { points, description, type } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (typeof points !== 'number' || points === 0) {
      return NextResponse.json(
        { error: 'Points must be a non-zero number' },
        { status: 400 }
      );
    }

    if (!type || !['reward', 'penalty'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "reward" or "penalty"' },
        { status: 400 }
      );
    }

    const transaction = await addPoints({
      kidId,
      points,
      description,
      type
    });

    return NextResponse.json({
      message: 'Points added successfully',
      transaction
    });
  } catch (error) {
    console.error('Add points error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
});
