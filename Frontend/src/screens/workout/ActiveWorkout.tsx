import { useState, useEffect, useCallback } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/GradientButton';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { WorkoutPlan, WorkoutLog } from '@/store';

interface Props {
  workout: WorkoutPlan;
  onFinish: (log: WorkoutLog) => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, onFinish, onCancel }: Props) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<Record<string, { reps: number; weight: number }[]>>({});
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    workout.exercises.forEach((ex) => {
      w[ex.id] = ex.weight;
    });
    return w;
  });
  const [reps, setReps] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    workout.exercises.forEach((ex) => {
      r[ex.id] = parseInt(ex.reps, 10) || 10;
    });
    return r;
  });
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const currentExercise = workout.exercises[currentExIdx];

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isResting && restTime > 0) {
      const timer = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            setIsResting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isResting, restTime]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completeSet = useCallback(() => {
    if (!currentExercise) return;

    const exSets = [...(completedSets[currentExercise.id] || [])];
    exSets.push({ reps: reps[currentExercise.id] || 10, weight: weights[currentExercise.id] || 0 });
    const newCompleted = { ...completedSets, [currentExercise.id]: exSets };
    setCompletedSets(newCompleted);

    if (currentSet < currentExercise.sets) {
      setCurrentSet((s) => s + 1);
      setIsResting(true);
      setRestTime(currentExercise.restTime);
    } else if (currentExIdx < workout.exercises.length - 1) {
      const nextEx = workout.exercises[currentExIdx + 1];
      setCurrentExIdx((i) => i + 1);
      setCurrentSet(1);
      setIsResting(true);
      setRestTime(nextEx?.restTime ?? 90);
    } else {
      setShowSummary(true);
    }
  }, [currentExercise, currentSet, currentExIdx, completedSets, workout.exercises.length, reps, weights]);

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const addRestTime = () => setRestTime((t) => t + 30);

  const totalVolume = Object.values(completedSets).reduce(
    (total, sets) => total + sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0,
  );
  const caloriesBurned = Math.round(elapsed * 0.12);
  const totalSetsDone = Object.values(completedSets).reduce((t, s) => t + s.length, 0);
  const progressPercent = ((currentExIdx * 4 + currentSet) / (workout.exercises.length * 4)) * 100;

  const finishWorkout = () => {
    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      workoutName: workout.name,
      duration: Math.round(elapsed / 60),
      volume: totalVolume,
      calories: caloriesBurned,
      exercises: workout.exercises.map((ex) => ({
        name: ex.name,
        sets: completedSets[ex.id] || [],
      })),
      prs: totalVolume > 10000 ? ['Volume PR!'] : [],
    };
    onFinish(log);
  };

  if (showSummary) {
    return (
      <LinearGradient colors={[...colors.backgroundGradient]} style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.summaryScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.summaryEmoji}>🎉</Text>
            <Text style={styles.summaryTitle}>Workout Complete!</Text>
            <Text style={styles.summarySub}>{workout.name}</Text>

            <View style={styles.summaryGrid}>
              {[
                { value: formatTime(elapsed), label: 'Duration', color: colors.indigo },
                { value: `${(totalVolume / 1000).toFixed(1)}k`, label: 'Volume (kg)', color: colors.violet },
                { value: `${caloriesBurned}`, label: 'Calories', color: colors.cyan },
                { value: `${totalSetsDone}`, label: 'Total Sets', color: colors.amber },
              ].map((s, i) => (
                <Card key={i} style={styles.summaryStat}>
                  <Text style={[styles.summaryStatVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.summaryStatLabel}>{s.label}</Text>
                </Card>
              ))}
            </View>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Muscles Worked</Text>
              <View style={styles.muscleTags}>
                {workout.muscleGroups.map((mg, i) => (
                  <View key={i} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{mg}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Exercise Summary</Text>
              {workout.exercises.map((ex) => {
                const sets = completedSets[ex.id] || [];
                return (
                  <View key={ex.id} style={styles.exerciseSummaryRow}>
                    <Text style={styles.exerciseSummaryName}>{ex.name}</Text>
                    <Text style={styles.exerciseSummaryMeta}>
                      {sets.length} sets · {sets.reduce((t, s) => t + s.reps * s.weight, 0)}kg
                    </Text>
                  </View>
                );
              })}
            </Card>

            <Card style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Fatigue Score</Text>
                <Text style={styles.fatigueScore}>7.2 / 10</Text>
              </View>
              <ProgressBar percent={72} gradient={['#22c55e', '#ef4444']} />
              <Text style={styles.fatigueNote}>
                AI suggests moderate recovery — rest day recommended tomorrow.
              </Text>
            </Card>

            <GradientButton title="Save & Close 💾" onPress={finishWorkout} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const nextExIdx = Math.min(
    currentExIdx + (currentSet >= (currentExercise?.sets || 0) ? 1 : 0),
    workout.exercises.length - 1,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.headerBtn}>
          <Text style={styles.cancelText}>← Cancel</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        </View>
        <Pressable onPress={() => setShowSummary(true)} style={styles.headerBtn}>
          <Text style={styles.finishText}>Finish</Text>
        </Pressable>
      </View>

      <ProgressBar percent={progressPercent} gradient={['#6366f1', '#8b5cf6']} height={4} />

      <Modal visible={isResting} transparent animationType="fade">
        <View style={[styles.restOverlay, { backgroundColor: colors.overlay }]}>
          <Text style={styles.restLabel}>REST TIME</Text>
          <Text style={styles.restTimer}>{formatTime(restTime)}</Text>
          <Text style={styles.restNext}>Next: {workout.exercises[nextExIdx]?.name}</Text>
          <View style={styles.restActions}>
            <Pressable onPress={addRestTime} style={styles.restActionBtn}>
              <Text style={styles.restActionText}>+30s</Text>
            </Pressable>
            <Pressable onPress={skipRest} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip Rest</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {currentExercise && (
        <ScrollView style={styles.flex} contentContainerStyle={styles.workoutContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.exerciseCount}>
            Exercise {currentExIdx + 1} of {workout.exercises.length}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseMeta}>
            {currentExercise.muscleGroup} · {currentExercise.equipment}
          </Text>

          <View style={styles.setRow}>
            {Array.from({ length: currentExercise.sets }).map((_, i) => {
              const done = (completedSets[currentExercise.id] || []).length > i;
              const active = i === currentSet - 1;
              return (
                <View key={i} style={[styles.setCircle, done && styles.setDone, active && styles.setActive]}>
                  <Text style={[styles.setNum, (done || active) && styles.setNumActive]}>
                    {done ? '✓' : i + 1}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.adjustRow}>
            <Card style={styles.adjustCard}>
              <Text style={styles.adjustLabel}>Weight (kg)</Text>
              <View style={styles.adjustControls}>
                <Pressable
                  onPress={() =>
                    setWeights({
                      ...weights,
                      [currentExercise.id]: Math.max(0, (weights[currentExercise.id] || 0) - 2.5),
                    })
                  }
                  style={styles.adjustBtn}>
                  <Text style={styles.adjustBtnText}>−</Text>
                </Pressable>
                <Text style={styles.adjustValue}>{weights[currentExercise.id] || 0}</Text>
                <Pressable
                  onPress={() =>
                    setWeights({
                      ...weights,
                      [currentExercise.id]: (weights[currentExercise.id] || 0) + 2.5,
                    })
                  }
                  style={styles.adjustBtn}>
                  <Text style={styles.adjustBtnText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.aiSuggest}>AI suggests: {(weights[currentExercise.id] || 0) + 2.5}kg ↑</Text>
            </Card>

            <Card style={styles.adjustCard}>
              <Text style={styles.adjustLabel}>Reps</Text>
              <View style={styles.adjustControls}>
                <Pressable
                  onPress={() =>
                    setReps({
                      ...reps,
                      [currentExercise.id]: Math.max(1, (reps[currentExercise.id] || 10) - 1),
                    })
                  }
                  style={styles.adjustBtn}>
                  <Text style={styles.adjustBtnText}>−</Text>
                </Pressable>
                <Text style={styles.adjustValue}>{reps[currentExercise.id] || 10}</Text>
                <Pressable
                  onPress={() =>
                    setReps({
                      ...reps,
                      [currentExercise.id]: (reps[currentExercise.id] || 10) + 1,
                    })
                  }
                  style={styles.adjustBtn}>
                  <Text style={styles.adjustBtnText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.targetReps}>Target: {currentExercise.reps}</Text>
            </Card>
          </View>

          <View style={styles.prevSession}>
            <Text>📊</Text>
            <View>
              <Text style={styles.prevLabel}>Previous session</Text>
              <Text style={styles.prevVal}>
                {currentExercise.weight}kg × {currentExercise.reps}
              </Text>
            </View>
          </View>

          <GradientButton title={`Complete Set ${currentSet} ✓`} onPress={completeSet} />

          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatVal, { color: colors.indigo }]}>{totalSetsDone}</Text>
              <Text style={styles.quickStatLabel}>Sets Done</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatVal, { color: colors.violet }]}>
                {(totalVolume / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.quickStatLabel}>Volume</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatVal, { color: colors.cyan }]}>{caloriesBurned}</Text>
              <Text style={styles.quickStatLabel}>Calories</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.cardBorder,
    },
    headerBtn: { minWidth: 70 },
    headerCenter: { alignItems: 'center' },
    cancelText: { fontSize: 14, color: c.textMuted },
    workoutName: { fontSize: 14, fontWeight: '600', color: c.text },
    timer: { fontSize: 12, color: c.indigo, fontFamily: 'monospace', marginTop: 2 },
    finishText: { fontSize: 14, fontWeight: '500', color: c.indigo, textAlign: 'right' },
    restOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    restLabel: { fontSize: 14, color: c.textMuted, marginBottom: 8 },
    restTimer: { fontSize: 72, fontWeight: '700', color: c.text, fontFamily: 'monospace', marginBottom: 16 },
    restNext: { fontSize: 14, color: c.textDim, marginBottom: 32, textAlign: 'center' },
    restActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    restActionBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    restActionText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
    skipBtn: { paddingHorizontal: 32, paddingVertical: 12, backgroundColor: c.chipActive, borderRadius: 12 },
    skipText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
    workoutContent: { padding: 16, paddingBottom: 32 },
    exerciseCount: { fontSize: 12, color: c.textDim, textAlign: 'center', marginBottom: 4 },
    exerciseName: { fontSize: 24, fontWeight: '700', color: c.text, textAlign: 'center' },
    exerciseMeta: { fontSize: 14, color: c.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
    setRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
    setCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setDone: { backgroundColor: c.green },
    setActive: { backgroundColor: c.chipActive, borderWidth: 2, borderColor: 'rgba(99,102,241,0.5)', transform: [{ scale: 1.1 }] },
    setNum: { fontSize: 14, fontWeight: '700', color: c.textDim },
    setNumActive: { color: c.text },
    adjustRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    adjustCard: { flex: 1, alignItems: 'center' },
    adjustLabel: { fontSize: 12, color: c.textMuted, marginBottom: 8 },
    adjustControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    adjustBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    adjustBtnText: { fontSize: 20, fontWeight: '700', color: c.textSecondary },
    adjustValue: { fontSize: 28, fontWeight: '700', color: c.text, minWidth: 48, textAlign: 'center' },
    aiSuggest: { fontSize: 12, color: c.indigo, marginTop: 8 },
    targetReps: { fontSize: 12, color: c.textDim, marginTop: 8 },
    prevSession: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: c.cardMuted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 24,
    },
    prevLabel: { fontSize: 12, color: c.textMuted },
    prevVal: { fontSize: 14, color: c.textSecondary, marginTop: 2 },
    quickStats: { flexDirection: 'row', gap: 12, marginTop: 24 },
    quickStat: { flex: 1, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, alignItems: 'center' },
    quickStatVal: { fontSize: 14, fontWeight: '700' },
    quickStatLabel: { fontSize: 11, color: c.textDim, marginTop: 2 },
    summaryScroll: { padding: 24, paddingBottom: 40 },
    summaryEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
    summaryTitle: { fontSize: 24, fontWeight: '700', color: c.text, textAlign: 'center' },
    summarySub: { fontSize: 14, color: c.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    summaryStat: { width: '47%', alignItems: 'center' },
    summaryStatVal: { fontSize: 24, fontWeight: '700' },
    summaryStatLabel: { fontSize: 12, color: c.textDim, marginTop: 4 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    muscleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    muscleTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(79,70,229,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(99,102,241,0.3)',
      borderRadius: 20,
    },
    muscleTagText: { fontSize: 12, fontWeight: '500', color: c.indigo },
    exerciseSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.cardBorder,
    },
    exerciseSummaryName: { fontSize: 14, color: c.textSecondary, flex: 1 },
    exerciseSummaryMeta: { fontSize: 12, color: c.textDim },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    fatigueScore: { fontSize: 18, fontWeight: '700', color: c.amber },
    fatigueNote: { fontSize: 12, color: c.textDim, marginTop: 8 },
  });
