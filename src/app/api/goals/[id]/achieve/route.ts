import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { achieveGoal } from '@/lib/points';

export const POST = createKidRequiredHandler<{ params: Promise<{ id: string }> }>(async (request: NextRequest, session, kidId, context) => {
  try {
    if (!context?.params) {
      return NextResponse.json(
        { error: 'Missing params' },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const goalId = parseInt(id);

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const goal = await achieveGoal(goalId, kidId);

    return NextResponse.json({
      message: 'Goal achieved successfully',
      goal
    });
  } catch (error) {
    console.error('Achieve goal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
});
