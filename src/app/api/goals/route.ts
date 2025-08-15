import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { createGoal, getKidGoals } from '@/lib/points';

export const GET = createKidRequiredHandler(async (request: NextRequest, session, kidId) => {
  try {
    const goals = await getKidGoals(kidId);
    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = createKidRequiredHandler(async (request: NextRequest, session, kidId) => {
  try {
    const body = await request.json();
    const { title, description, pointsRequired } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (typeof pointsRequired !== 'number' || pointsRequired <= 0) {
      return NextResponse.json(
        { error: 'Points required must be a positive number' },
        { status: 400 }
      );
    }

    const goal = await createGoal({
      kidId,
      title,
      description: description || '',
      pointsRequired
    });

    return NextResponse.json({
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
});
