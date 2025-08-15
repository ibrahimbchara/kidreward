import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler } from '@/lib/middleware';
import { switchToKid, generateToken, AuthError } from '@/lib/auth';

export const POST = createAuthenticatedHandler(async (request: NextRequest, session, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const kidId = parseInt(id);
    
    if (isNaN(kidId)) {
      return NextResponse.json(
        { error: 'Invalid kid ID' },
        { status: 400 }
      );
    }

    const newSession = await switchToKid(session.parentId, kidId);
    const token = generateToken(newSession);

    const response = NextResponse.json({
      message: 'Switched to kid successfully',
      session: {
        parentId: newSession.parentId,
        parentName: newSession.parentName,
        currentKidId: newSession.currentKidId,
        currentKidName: newSession.currentKidName,
        currentKidAge: newSession.currentKidAge,
        currentKidPoints: newSession.currentKidPoints
      }
    });

    // Update HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Switch kid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
