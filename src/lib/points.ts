import { getDatabase, PointTransaction, Goal, DatabaseWrapper } from './database';

export interface AddPointsData {
  kidId: number;
  points: number;
  description: string;
  type: 'reward' | 'penalty';
}

export interface CreateGoalData {
  kidId: number;
  title: string;
  description: string;
  pointsRequired: number;
}

export async function addPoints(data: AddPointsData): Promise<PointTransaction> {
  const { kidId, points, description, type } = data;

  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  if (points === 0) {
    throw new Error('Points cannot be zero');
  }

  if (type === 'penalty' && points > 0) {
    throw new Error('Penalty points should be negative');
  }

  if (type === 'reward' && points < 0) {
    throw new Error('Reward points should be positive');
  }

  const db = await getDatabase();

  // Start transaction
  await db.run('BEGIN TRANSACTION');

  try {
    // Add point transaction
    const result = await db.run(
      'INSERT INTO point_transactions (kid_id, points, description, type) VALUES (?, ?, ?, ?)',
      [kidId, points, description.trim(), type]
    );

    // Update kid's total points
    await db.run(
      'UPDATE kids SET total_points = total_points + ? WHERE id = ?',
      [points, kidId]
    );

    // Check if any goals are achieved
    if (type === 'reward' && points > 0) {
      await checkAndAchieveGoals(kidId, db);
    }

    await db.run('COMMIT');

    // Get the created transaction
    const transaction = await db.get(
      'SELECT * FROM point_transactions WHERE id = ?',
      [result.lastID]
    ) as PointTransaction;

    return transaction;
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

export async function getPointHistory(kidId: number, limit: number = 50): Promise<PointTransaction[]> {
  const db = await getDatabase();

  const transactions = await db.all(
    'SELECT * FROM point_transactions WHERE kid_id = ? ORDER BY created_at DESC LIMIT ?',
    [kidId, limit]
  ) as PointTransaction[];

  return transactions;
}

export async function createGoal(data: CreateGoalData): Promise<Goal> {
  const { kidId, title, description, pointsRequired } = data;

  if (!title || title.trim().length === 0) {
    throw new Error('Goal title is required');
  }

  if (pointsRequired <= 0) {
    throw new Error('Points required must be greater than 0');
  }

  const db = await getDatabase();

  const result = await db.run(
    'INSERT INTO goals (kid_id, title, description, points_required) VALUES (?, ?, ?, ?)',
    [kidId, title.trim(), description?.trim() || '', pointsRequired]
  );

  const goal = await db.get(
    'SELECT * FROM goals WHERE id = ?',
    [result.lastID]
  ) as Goal;

  return goal;
}

export async function getKidGoals(kidId: number): Promise<Goal[]> {
  const db = await getDatabase();

  const goals = await db.all(
    'SELECT * FROM goals WHERE kid_id = ? ORDER BY created_at DESC',
    [kidId]
  ) as Goal[];

  return goals;
}

export async function achieveGoal(goalId: number, kidId: number): Promise<Goal> {
  const db = await getDatabase();

  // Verify the goal belongs to the kid and is not already achieved
  const goal = await db.get(
    'SELECT * FROM goals WHERE id = ? AND kid_id = ? AND is_achieved = FALSE',
    [goalId, kidId]
  ) as Goal | undefined;

  if (!goal) {
    throw new Error('Goal not found or already achieved');
  }

  // Check if kid has enough points
  const kid = await db.get(
    'SELECT total_points FROM kids WHERE id = ?',
    [kidId]
  ) as { total_points: number } | undefined;

  if (!kid || kid.total_points < goal.points_required) {
    throw new Error('Not enough points to achieve this goal');
  }

  // Mark goal as achieved
  await db.run(
    'UPDATE goals SET is_achieved = TRUE, achieved_at = CURRENT_TIMESTAMP WHERE id = ?',
    [goalId]
  );

  // Get updated goal
  const updatedGoal = await db.get(
    'SELECT * FROM goals WHERE id = ?',
    [goalId]
  ) as Goal;

  return updatedGoal;
}

async function checkAndAchieveGoals(kidId: number, db: DatabaseWrapper): Promise<void> {
  // Get kid's current points
  const kid = await db.get(
    'SELECT total_points FROM kids WHERE id = ?',
    [kidId]
  ) as { total_points: number } | undefined;

  if (!kid) return;

  // Get unachieved goals that can now be achieved
  const achievableGoals = await db.all(
    'SELECT * FROM goals WHERE kid_id = ? AND is_achieved = FALSE AND points_required <= ?',
    [kidId, kid.total_points]
  ) as Goal[];

  // Auto-achieve goals (optional - you might want manual achievement)
  for (const goal of achievableGoals) {
    await db.run(
      'UPDATE goals SET is_achieved = TRUE, achieved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [goal.id]
    );
  }
}

export async function getKidStats(kidId: number): Promise<{
  totalPoints: number;
  totalRewards: number;
  totalPenalties: number;
  goalsAchieved: number;
  goalsTotal: number;
}> {
  const db = await getDatabase();

  const kid = await db.get(
    'SELECT total_points FROM kids WHERE id = ?',
    [kidId]
  ) as { total_points: number } | undefined;

  const rewardPoints = await db.get(
    'SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE kid_id = ? AND type = "reward"',
    [kidId]
  ) as { total: number };

  const penaltyPoints = await db.get(
    'SELECT COALESCE(SUM(ABS(points)), 0) as total FROM point_transactions WHERE kid_id = ? AND type = "penalty"',
    [kidId]
  ) as { total: number };

  const goalsStats = await db.get(
    'SELECT COUNT(*) as total, SUM(CASE WHEN is_achieved THEN 1 ELSE 0 END) as achieved FROM goals WHERE kid_id = ?',
    [kidId]
  ) as { total: number; achieved: number };

  return {
    totalPoints: kid?.total_points || 0,
    totalRewards: rewardPoints?.total || 0,
    totalPenalties: penaltyPoints?.total || 0,
    goalsAchieved: goalsStats?.achieved || 0,
    goalsTotal: goalsStats?.total || 0
  };
}
