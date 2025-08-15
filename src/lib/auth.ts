import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, Parent, Kid } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthSession {
  parentId: number;
  parentName: string;
  currentKidId?: number;
  currentKidName?: string;
  currentKidAge?: number;
  currentKidPoints?: number;
}

export interface RegisterParentData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AddKidData {
  name: string;
  age?: number;
}

export interface UpdateKidData {
  name?: string;
  age?: number;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(session: AuthSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
    return decoded;
  } catch {
    throw new AuthError('Invalid token');
  }
}

export async function registerParent(data: RegisterParentData): Promise<AuthSession> {
  const { name, email, password, confirmPassword } = data;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    throw new AuthError('All fields are required');
  }

  if (name.length < 2) {
    throw new AuthError('Name must be at least 2 characters long');
  }

  if (password.length < 6) {
    throw new AuthError('Password must be at least 6 characters long');
  }

  if (password !== confirmPassword) {
    throw new AuthError('Passwords do not match');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AuthError('Please enter a valid email address');
  }

  const db = await getDatabase();

  // Check if parent already exists
  const existingParent = await db.get('SELECT id FROM parents WHERE email = ?', [email]) as { id: number } | undefined;
  if (existingParent) {
    throw new AuthError('An account with this email already exists');
  }

  // Hash password and create parent
  const hashedPassword = await hashPassword(password);
  const result = await db.run(
    'INSERT INTO parents (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  const session: AuthSession = {
    parentId: result.lastID!,
    parentName: name
  };

  return session;
}

export async function loginParent(data: LoginData): Promise<AuthSession> {
  const { email, password } = data;

  if (!email || !password) {
    throw new AuthError('Email and password are required');
  }

  const db = await getDatabase();

  // Get parent from database
  const parent = await db.get(
    'SELECT id, name, password FROM parents WHERE email = ?',
    [email]
  ) as Parent | undefined;

  if (!parent) {
    throw new AuthError('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, parent.password);
  if (!isValidPassword) {
    throw new AuthError('Invalid credentials');
  }

  const session: AuthSession = {
    parentId: parent.id,
    parentName: parent.name
  };

  return session;
}

export async function addKid(parentId: number, data: AddKidData): Promise<Kid> {
  const { name, age } = data;

  if (!name || name.trim().length < 2) {
    throw new AuthError('Kid name must be at least 2 characters long');
  }

  const db = await getDatabase();

  // Check if kid name already exists for this parent
  const existingKid = await db.get(
    'SELECT id FROM kids WHERE parent_id = ? AND name = ?',
    [parentId, name.trim()]
  ) as { id: number } | undefined;

  if (existingKid) {
    throw new AuthError('A kid with this name already exists');
  }

  const result = await db.run(
    'INSERT INTO kids (parent_id, name, age) VALUES (?, ?, ?)',
    [parentId, name.trim(), age || null]
  );

  const kid = await db.get(
    'SELECT * FROM kids WHERE id = ?',
    [result.lastID]
  ) as Kid;

  return kid;
}

export async function getKidsByParent(parentId: number): Promise<Kid[]> {
  const db = await getDatabase();

  const kids = await db.all(
    'SELECT * FROM kids WHERE parent_id = ? ORDER BY name',
    [parentId]
  ) as Kid[];

  return kids;
}

export async function getKidById(kidId: number, parentId: number): Promise<Kid | null> {
  const db = await getDatabase();

  const kid = await db.get(
    'SELECT * FROM kids WHERE id = ? AND parent_id = ?',
    [kidId, parentId]
  ) as Kid | undefined;

  return kid || null;
}

export async function updateKid(kidId: number, parentId: number, data: UpdateKidData): Promise<Kid> {
  const db = await getDatabase();

  const { name, age } = data;

  // Check if new name already exists for this parent (if name is being changed)
  if (name) {
    const existingKid = await db.get(
      'SELECT id FROM kids WHERE parent_id = ? AND name = ? AND id != ?',
      [parentId, name, kidId]
    );
    if (existingKid) {
      throw new AuthError('A kid with this name already exists');
    }
  }

  // Build update query dynamically
  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name.trim());
  }

  if (age !== undefined) {
    updates.push('age = ?');
    values.push(age);
  }

  if (updates.length === 0) {
    throw new AuthError('No data to update');
  }

  values.push(kidId, parentId);

  await db.run(
    `UPDATE kids SET ${updates.join(', ')} WHERE id = ? AND parent_id = ?`,
    values
  );

  // Get updated kid
  const updatedKid = await getKidById(kidId, parentId);
  if (!updatedKid) {
    throw new AuthError('Kid not found after update');
  }

  return updatedKid;
}

export async function deleteKid(kidId: number, parentId: number): Promise<void> {
  const db = await getDatabase();

  // Start transaction
  await db.run('BEGIN TRANSACTION');

  try {
    // Delete kid's point transactions
    await db.run('DELETE FROM point_transactions WHERE kid_id = ?', [kidId]);

    // Delete kid's goals
    await db.run('DELETE FROM goals WHERE kid_id = ?', [kidId]);

    // Delete kid
    const result = await db.run('DELETE FROM kids WHERE id = ? AND parent_id = ?', [kidId, parentId]);

    if (result.changes === 0) {
      throw new AuthError('Kid not found');
    }

    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

export async function switchToKid(parentId: number, kidId: number): Promise<AuthSession> {
  const kid = await getKidById(kidId, parentId);
  if (!kid) {
    throw new AuthError('Kid not found');
  }

  const db = await getDatabase();
  const parent = await db.get('SELECT name FROM parents WHERE id = ?', [parentId]) as Parent;

  const session: AuthSession = {
    parentId,
    parentName: parent.name,
    currentKidId: kid.id,
    currentKidName: kid.name,
    currentKidAge: kid.age,
    currentKidPoints: kid.total_points
  };

  return session;
}
