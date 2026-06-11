import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { TabSelector } from '@/components/ui/TabSelector';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState, WorkoutPlan } from '@/store';
import type { AppNavigation } from '@/types/navigation';

interface Props {
  state: ReturnType<typeof useAppState>;
  nav: AppNavigation;
  onStartWorkout: (w: WorkoutPlan) => void;
}

const muscles = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const equipment = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

const muscleEmoji: Record<string, string> = {
  Chest: '🫁',
  Back: '🔙',
  Legs: '🦵',
  Shoulders: '🤷',
  Arms: '💪',
  Core: '🎯',
};

export function WorkoutScreen({ state, nav, onStartWorkout }: Props) {
  const [activeTab, setActiveTab] = useState('plan');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipFilter, setEquipFilter] = useState('All');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const filteredExercises = state.exercises.filter((e) => {
    if (muscleFilter !== 'All' && e.muscleGroup !== muscleFilter) return false;
    if (equipFilter !== 'All' && e.equipment !== equipFilter) return false;
    return true;
  });

  return (
    <ScreenContainer
      header={
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Workouts</Text>
              <Text style={styles.subtitle}>
                {state.profile.workoutSplit} · {state.profile.frequency}
              </Text>
            </View>
            <Text style={styles.emoji}>🏋️</Text>
          </View>
          <TabSelector
            compact
            tabs={[
              { id: 'plan', label: '📋 Plan' },
              { id: 'exercises', label: '📚 Exercises' },
              { id: 'builder', label: '🔧 Builder' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      }
      contentStyle={styles.content}>
      {activeTab === 'plan' && (
        <View>
          {state.workoutPlans.map((plan) => (
            <Card key={plan.id} style={[styles.planCard, plan.completed && styles.planDone]}>
              <View style={styles.planHeader}>
                <View style={styles.planLeft}>
                  <View style={[styles.planIcon, plan.completed && styles.planIconDone]}>
                    <Text>{plan.completed ? '✅' : '💪'}</Text>
                  </View>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planMeta}>
                      {plan.day} · {plan.muscleGroups.join(', ')}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.planDuration}>{plan.duration} min</Text>
                  <Text style={styles.planCal}>{plan.calories} kcal</Text>
                </View>
              </View>
              <View style={styles.tags}>
                {plan.exercises.slice(0, 4).map((ex, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{ex.name}</Text>
                  </View>
                ))}
                {plan.exercises.length > 4 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{plan.exercises.length - 4} more</Text>
                  </View>
                )}
              </View>
              {!plan.completed ? (
                <GradientButton title="Start Workout" onPress={() => onStartWorkout(plan)} small />
              ) : (
                <Text style={styles.completedText}>✓ Completed</Text>
              )}
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'exercises' && (
        <View>
          <Text style={styles.filterLabel}>Muscle Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {muscles.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMuscleFilter(m)}
                style={[styles.chip, muscleFilter === m && styles.chipActive]}>
                <Text style={[styles.chipText, muscleFilter === m && styles.chipTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Equipment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {equipment.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEquipFilter(e)}
                style={[styles.chip, equipFilter === e && styles.chipViolet]}>
                <Text style={[styles.chipText, equipFilter === e && styles.chipTextActive]}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.count}>{filteredExercises.length} exercises found</Text>

          {filteredExercises.map((ex) => (
            <Card key={ex.id} style={styles.exerciseCard}>
              <Pressable
                onPress={() => nav.openModal({ type: 'exercise-detail', exercise: ex })}
                onLongPress={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                style={styles.exerciseHeader}>
                <View style={styles.exerciseIcon}>
                  <Text>{muscleEmoji[ex.muscleGroup] || '💪'}</Text>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.muscleGroup} · {ex.equipment} ·{' '}
                    <Text
                      style={{
                        color:
                          ex.difficulty === 'Beginner'
                            ? colors.green
                            : ex.difficulty === 'Intermediate'
                              ? colors.amber
                              : colors.red,
                      }}>
                      {ex.difficulty}
                    </Text>
                  </Text>
                </View>
                <Text style={styles.chevron}>{expandedExercise === ex.id ? '▲' : '▼'}</Text>
              </Pressable>
              {expandedExercise === ex.id && (
                <View style={styles.exerciseDetail}>
                  <Text style={styles.instructions}>{ex.instructions}</Text>
                  <View style={styles.exerciseStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Sets</Text>
                      <Text style={styles.statVal}>{ex.sets}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Reps</Text>
                      <Text style={styles.statVal}>{ex.reps}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Rest</Text>
                      <Text style={styles.statVal}>{ex.restTime}s</Text>
                    </View>
                  </View>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'builder' && (
        <View>
          <LinearGradient colors={[...colors.gradientHero]} style={styles.builderCard}>
            <Text style={styles.builderEmoji}>🔧</Text>
            <Text style={styles.builderTitle}>Custom Workout Builder</Text>
            <Text style={styles.builderSub}>
              Create your own workout by picking exercises, sets, reps, and rest times.
            </Text>
            {[
              { icon: '➕', title: 'Add Exercises', desc: 'Browse and add from our library' },
              { icon: '⚡', title: 'Create Supersets', desc: 'Pair exercises for efficiency' },
              { icon: '📊', title: 'Track RPE & Tempo', desc: 'Fine-tune your training intensity' },
              { icon: '↕️', title: 'Drag & Reorder', desc: 'Arrange exercises your way' },
            ].map((item, i) => (
              <View key={i} style={styles.builderItem}>
                <Text style={styles.builderItemIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.builderItemTitle}>{item.title}</Text>
                  <Text style={styles.builderItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
            <GradientButton title="Create New Workout" onPress={() => nav.openModal({ type: 'workout-builder' })} small style={{ marginTop: 16 }} />
            <Pressable onPress={() => nav.openOverlay('programs')} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={[styles.useBtn, { fontSize: 14 }]}>Browse Program Library →</Text>
            </Pressable>
          </LinearGradient>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Templates</Text>
          {['Full Body Blast', 'Upper Body Focus', 'Leg Destroyer', 'Core & Cardio'].map((t, i) => (
            <Pressable key={i} onPress={() => nav.openModal({ type: 'workout-builder' })}>
              <Card style={styles.templateCard}>
                <View style={styles.templateIcon}>
                  <Text>{['🏋️', '💪', '🦵', '🎯'][i]}</Text>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.templateName}>{t}</Text>
                  <Text style={styles.templateMeta}>
                    {[6, 5, 5, 4][i]} exercises · {[55, 45, 50, 30][i]} min
                  </Text>
                </View>
                <Text style={styles.useBtn}>Use</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    emoji: { fontSize: 28 },
    planCard: { marginBottom: 12 },
    planDone: { borderColor: 'rgba(34,197,94,0.3)' },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    planLeft: { flexDirection: 'row', gap: 12, flex: 1 },
    planIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79,70,229,0.2)', alignItems: 'center', justifyContent: 'center' },
    planIconDone: { backgroundColor: 'rgba(34,197,94,0.2)' },
    planName: { fontSize: 16, fontWeight: '600', color: c.text },
    planMeta: { fontSize: 12, color: c.textDim, marginTop: 2 },
    planDuration: { fontSize: 14, fontWeight: '500', color: c.textSecondary, textAlign: 'right' },
    planCal: { fontSize: 12, color: c.textDim, textAlign: 'right' },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    tag: { backgroundColor: c.chipBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 11, color: c.textMuted },
    completedText: { textAlign: 'center', color: c.green, fontWeight: '500', paddingVertical: 8 },
    filterLabel: { fontSize: 12, fontWeight: '500', color: c.textMuted, marginBottom: 8 },
    filterScroll: { marginBottom: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: c.chipBg, marginRight: 8 },
    chipActive: { backgroundColor: c.chipActive },
    chipViolet: { backgroundColor: c.chipActiveAlt },
    chipText: { fontSize: 12, fontWeight: '500', color: c.textMuted },
    chipTextActive: { color: c.text },
    count: { fontSize: 12, color: c.textDim, marginVertical: 12 },
    exerciseCard: { marginBottom: 8, padding: 0, overflow: 'hidden' },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    exerciseIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79,70,229,0.2)', alignItems: 'center', justifyContent: 'center' },
    exerciseName: { fontSize: 14, fontWeight: '500', color: c.text },
    exerciseMeta: { fontSize: 12, color: c.textDim, marginTop: 2 },
    chevron: { color: c.textDim, fontSize: 12 },
    exerciseDetail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: c.cardBorder, paddingTop: 12 },
    instructions: { fontSize: 14, color: c.textSecondary, marginBottom: 12 },
    exerciseStats: { flexDirection: 'row', gap: 12 },
    statBox: { backgroundColor: c.cardMuted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    statLabel: { fontSize: 11, color: c.textDim },
    statVal: { fontSize: 14, fontWeight: '700', color: c.text },
    builderCard: { borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
    builderEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
    builderTitle: { fontSize: 18, fontWeight: '700', color: c.text, textAlign: 'center', marginBottom: 8 },
    builderSub: { fontSize: 14, color: c.textMuted, textAlign: 'center', marginBottom: 16 },
    builderItem: { flexDirection: 'row', gap: 12, backgroundColor: c.cardMuted, borderRadius: 12, padding: 16, marginBottom: 8 },
    builderItemIcon: { fontSize: 22 },
    builderItemTitle: { fontSize: 14, fontWeight: '500', color: c.text },
    builderItemDesc: { fontSize: 12, color: c.textDim, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    templateCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    templateIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
    templateName: { fontSize: 14, fontWeight: '500', color: c.text },
    templateMeta: { fontSize: 12, color: c.textDim, marginTop: 2 },
    useBtn: { fontSize: 12, color: c.indigo, fontWeight: '500' },
  });
