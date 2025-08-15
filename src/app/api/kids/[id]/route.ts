import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler } from '@/lib/middleware';
import { updateKid, deleteKid, AuthError } from '@/lib/auth';

export const PUT = createAuthenticatedHandler<{ params: Promise<{ id: string }> }>(async (request: NextRequest, session, context) => {
  try {
    if (!context?.params) {
      return NextResponse.json(
        { error: 'Missing params' },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const kidId = parseInt(id);
    
    if (isNaN(kidId)) {
      return NextResponse.json(
        { error: 'Invalid kid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, age } = body;

    const updatedKid = await updateKid(kidId, session.parentId, { name, age });

    return NextResponse.json({
      message: 'Kid updated successfully',
      kid: updatedKid
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Update kid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = createAuthenticatedHandler<{ params: Promise<{ id: string }> }>(async (request: NextRequest, session, context) => {
  try {
    if (!context?.params) {
      return NextResponse.json(
        { error: 'Missing params' },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const kidId = parseInt(id);
    
    if (isNaN(kidId)) {
      return NextResponse.json(
        { error: 'Invalid kid ID' },
        { status: 400 }
      );
    }

    await deleteKid(kidId, session.parentId);

    return NextResponse.json({
      message: 'Kid deleted successfully'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Delete kid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
