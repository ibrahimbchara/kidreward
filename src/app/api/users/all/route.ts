// This endpoint is now replaced by /api/kids
// Keeping this for backward compatibility but redirecting to the new endpoint

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been moved to /api/kids' },
    { status: 410 }
  );
}
