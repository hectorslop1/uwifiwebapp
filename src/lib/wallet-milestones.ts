export const UWALLET_MILESTONES = [0, 10, 20, 30, 40, 49.95] as const;

export const UWALLET_REDEEMABLE_MILESTONES = UWALLET_MILESTONES.slice(1);

const EPSILON = 0.000001;

export function getHighestUnlockedMilestone(
  valueDollars: number,
  milestones: readonly number[] = UWALLET_REDEEMABLE_MILESTONES,
) {
  if (!Number.isFinite(valueDollars) || valueDollars <= 0) {
    return 0;
  }

  let unlocked = 0;

  for (const milestone of milestones) {
    if (valueDollars + EPSILON >= milestone) {
      unlocked = milestone;
    }
  }

  return unlocked;
}

export function getNextMilestone(
  valueDollars: number,
  milestones: readonly number[] = UWALLET_REDEEMABLE_MILESTONES,
) {
  if (!Number.isFinite(valueDollars) || valueDollars < 0) {
    return milestones[0] ?? null;
  }

  for (const milestone of milestones) {
    if (valueDollars + EPSILON < milestone) {
      return milestone;
    }
  }

  return null;
}

