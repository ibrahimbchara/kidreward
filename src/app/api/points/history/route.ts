import { NextRequest, NextResponse } from 'next/server';
import { createKidRequiredHandler } from '@/lib/middleware';
import { getPointHistory } from '@/lib/points';

export const GET = createKidRequiredHandler(async (request: NextRequest, session, kidId) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const history = await getPointHistory(kidId, limit);

    return NextResponse.json({
      history
    });
  } catch (error) {
    console.error('Get point history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
