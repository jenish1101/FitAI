import type { WorkoutProgram } from '@/types/models';

export const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Classic 6-day split for muscle gain',
    days: 6,
    duration: '60 min',
    icon: '💪',
    muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
  },
  {
    id: 'fullbody',
    name: 'Full Body 3x',
    description: 'Beginner-friendly full body routine',
    days: 3,
    duration: '45 min',
    icon: '🏋️',
    muscleGroups: ['Full Body'],
  },
  {
    id: 'upperlower',
    name: 'Upper / Lower',
    description: '4-day upper/lower split',
    days: 4,
    duration: '55 min',
    icon: '⚡',
    muscleGroups: ['Upper', 'Lower'],
  },
  {
    id: '5x5',
    name: 'StrongLifts 5×5',
    description: 'Strength-focused compound lifts',
    days: 3,
    duration: '50 min',
    icon: '🏆',
    muscleGroups: ['Squat', 'Bench', 'Row'],
  },
];
