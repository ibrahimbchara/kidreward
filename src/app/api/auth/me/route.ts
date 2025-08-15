import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler } from '@/lib/middleware';

export const GET = createAuthenticatedHandler(async (request: NextRequest, session) => {
  return NextResponse.json({
    session: {
      parentId: session.parentId,
      parentName: session.parentName,
      currentKidId: session.currentKidId,
      currentKidName: session.currentKidName,
      currentKidAge: session.currentKidAge,
      currentKidPoints: session.currentKidPoints
    }
  });
});
