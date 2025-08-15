import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { achieveGoal } from '@/lib/points';

export const POST = createKidRequiredHandler(async (request: NextRequest, session, kidId, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
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
