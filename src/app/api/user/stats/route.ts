import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { getKidStats } from '@/lib/points';

export const GET = createKidRequiredHandler(async (request: NextRequest, session, kidId) => {
  try {
    const stats = await getKidStats(kidId);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get kid stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
