import type { PersonalRecord, WorkoutLog } from '@/types/models';

export function computePersonalRecords(logs: WorkoutLog[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  logs.forEach((log) => {
    log.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        const est = Math.round(set.weight * (1 + set.reps / 30));
        const prev = best.get(ex.name);
        if (!prev || est > prev.estimated1RM) {
          best.set(ex.name, {
            exercise: ex.name,
            weight: set.weight,
            reps: set.reps,
            date: log.date,
            estimated1RM: est,
          });
        }
      });
    });
  });
  return [...best.values()].sort((a, b) => b.estimated1RM - a.estimated1RM);
}
