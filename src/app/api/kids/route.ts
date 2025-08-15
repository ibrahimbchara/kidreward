import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler } from '@/lib/middleware';
import { addKid, getKidsByParent, AuthError } from '@/lib/auth';

export const GET = createAuthenticatedHandler(async (request: NextRequest, session) => {
  try {
    const kids = await getKidsByParent(session.parentId);
    return NextResponse.json({ kids });
  } catch (error) {
    console.error('Get kids error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = createAuthenticatedHandler(async (request: NextRequest, session) => {
  try {
    const body = await request.json();
    const { name, age } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const kid = await addKid(session.parentId, { name, age });

    return NextResponse.json({
      message: 'Kid added successfully',
      kid
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Add kid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
