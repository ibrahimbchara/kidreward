import { NextRequest } from 'next/server';
import { verifyToken, AuthSession, AuthError } from './auth';

export async function getAuthenticatedSession(request: NextRequest): Promise<AuthSession> {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    throw new AuthError('No authentication token provided');
  }

  try {
    const session = verifyToken(token);
    return session;
  } catch (error) {
    throw new AuthError('Invalid authentication token');
  }
}

export function createAuthenticatedHandler<T = any>(
  handler: (request: NextRequest, session: AuthSession, ...args: any[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const session = await getAuthenticatedSession(request);
      return await handler(request, session, ...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.error('Authentication middleware error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

export function createKidRequiredHandler<T = any>(
  handler: (request: NextRequest, session: AuthSession, kidId: number, ...args: any[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const session = await getAuthenticatedSession(request);

      if (!session.currentKidId) {
        return new Response(
          JSON.stringify({ error: 'No kid selected. Please select a kid first.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return await handler(request, session, session.currentKidId, ...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.error('Authentication middleware error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
