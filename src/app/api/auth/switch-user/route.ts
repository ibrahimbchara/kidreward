// This endpoint is now replaced by /api/kids/[id]/switch
// Keeping this for backward compatibility but redirecting to the new endpoint

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been moved to /api/kids/[id]/switch' },
    { status: 410 }
  );
}
