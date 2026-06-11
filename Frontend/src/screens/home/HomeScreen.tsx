import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileAvatarButton } from '@/components/ui/ProfileAvatarButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { AppNavigation } from '@/types/navigation';
import type { useAppState, WorkoutPlan } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  nav: AppNavigation;
  onStartWorkout: (w: WorkoutPlan) => void;
}

export function HomeScreen({ state, nav, onStartWorkout }: Props) {
  const { profile, workoutPlans, workoutLogs, foodLogs, notifications, getWaterForToday, setWaterForToday } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const waterGlasses = getWaterForToday();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const totalCalories = foodLogs.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foodLogs.reduce((s, f) => s + f.protein, 0);
  const calPercent = Math.min((totalCalories / profile.calorieTarget) * 100, 100);
  const protPercent = Math.min((totalProtein / profile.proteinTarget) * 100, 100);
  const carbsTotal = foodLogs.reduce((s, f) => s + f.carbs, 0);
  const fatsTotal = foodLogs.reduce((s, f) => s + f.fats, 0);

  const todayWorkout = workoutPlans.find((w) => !w.completed);
  const weekWorkouts = workoutLogs.filter((l) => {
    const d = new Date(l.date);
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const weekVolume = weekWorkouts.reduce((s, w) => s + w.volume, 0);

  const insights = [
    totalProtein < profile.proteinTarget * 0.8
      ? '⚠️ Protein intake is low today. Consider adding a protein shake.'
      : '✅ Great protein intake today!',
    weekWorkouts.length >= 4
      ? '🔥 Excellent consistency this week! Keep it up!'
      : `📊 ${weekWorkouts.length}/5 workouts this week. Stay on track!`,
    '💡 AI suggests increasing bench press weight by 2.5kg next session.',
  ];

  const quickLinks = [
    { icon: '🤖', label: 'AI Coach', action: () => nav.openOverlay('ai-coach') },
    { icon: '📋', label: 'History', action: () => nav.openOverlay('workout-history') },
    { icon: '😴', label: 'Recovery', action: () => nav.openOverlay('recovery') },
    { icon: '🏆', label: 'PRs', action: () => nav.openOverlay('prs') },
  ];

  return (
    <ScreenContainer
      header={
        <View style={styles.header}>
          <View style={styles.flex1}>
            <Text style={styles.date}>
              {dayNames[today.getDay()]}, {monthNames[today.getMonth()]} {today.getDate()}
            </Text>
            <Text style={styles.greeting}>Hey, {profile.name.split(' ')[0]}! 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => nav.openOverlay('notifications')} style={styles.notifBtn} hitSlop={6}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadNotifs > 0 && (
                <View style={[styles.notifBadge, { backgroundColor: colors.red }]}>
                  <Text style={styles.notifBadgeText}>{unreadNotifs}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => nav.openOverlay('streak')}
              style={styles.streakBadge}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${profile.streak} day streak`}>
              <Text>🔥</Text>
              <Text style={styles.streakText}>{profile.streak}</Text>
            </Pressable>
            <ProfileAvatarButton name={profile.name} onPress={() => nav.openOverlay('profile')} />
          </View>
        </View>
      }
      contentStyle={styles.content}>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.indigo }]}>{profile.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.violet }]}>{(weekVolume / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Week Vol (kg)</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.cyan }]}>{weekWorkouts.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
      </View>

      <View style={styles.quickRow}>
        {quickLinks.map((link) => (
          <Pressable key={link.label} onPress={link.action} style={[styles.quickCard, { backgroundColor: colors.card }]}>
            <Text style={styles.quickIcon}>{link.icon}</Text>
            <Text style={styles.quickLabel} numberOfLines={1}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      {todayWorkout && (
        <LinearGradient colors={[...colors.gradientHero]} style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View style={styles.flex1}>
              <Text style={styles.workoutLabel}>TODAY&apos;S WORKOUT</Text>
              <Text style={styles.workoutName}>{todayWorkout.name}</Text>
              <Text style={styles.workoutMeta}>
                {todayWorkout.muscleGroups.join(' · ')} · {todayWorkout.duration} min
              </Text>
            </View>
            <Text style={styles.workoutEmoji}>🏋️</Text>
          </View>
          <View style={styles.workoutActions}>
            <GradientButton
              title="Start Workout 💪"
              onPress={() => onStartWorkout(todayWorkout)}
              style={styles.flex1}
              small
            />
            <Pressable
              style={styles.previewBtn}
              onPress={() => nav.openModal({ type: 'workout-preview', workout: todayWorkout })}>
              <Text style={styles.previewText}>Preview</Text>
            </Pressable>
          </View>
        </LinearGradient>
      )}

      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Today&apos;s Nutrition</Text>
          <Text style={styles.meta}>
            {totalCalories} / {profile.calorieTarget} kcal
          </Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>Calories</Text>
          <Text style={styles.macroPct}>{Math.round(calPercent)}%</Text>
        </View>
        <ProgressBar percent={calPercent} gradient={['#6366f1', '#8b5cf6']} />
        <View style={styles.ringsRow}>
          <View style={styles.ringItem}>
            <ProgressRing size={48} percent={protPercent} color={colors.indigo} label={`${totalProtein}g`} />
            <Text style={styles.ringLabel}>Protein</Text>
          </View>
          <View style={styles.ringItem}>
            <ProgressRing
              size={48}
              percent={Math.min((carbsTotal / profile.carbsTarget) * 100, 100)}
              color={colors.cyan}
              label={`${Math.round(carbsTotal)}g`}
            />
            <Text style={styles.ringLabel}>Carbs</Text>
          </View>
          <View style={styles.ringItem}>
            <ProgressRing
              size={48}
              percent={Math.min((fatsTotal / profile.fatsTarget) * 100, 100)}
              color={colors.amber}
              label={`${Math.round(fatsTotal)}g`}
            />
            <Text style={styles.ringLabel}>Fats</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>💧 Water</Text>
          <Text style={styles.meta}>{waterGlasses} / 8 glasses</Text>
        </View>
        <View style={styles.waterRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setWaterForToday(i + 1)}
              style={[styles.waterGlass, i < waterGlasses && styles.waterFilled]}>
              <Text style={styles.waterEmoji}>{i < waterGlasses ? '💧' : ''}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Pressable onPress={() => nav.openOverlay('ai-coach')} style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>🤖 AI Coach Insights</Text>
          <Text style={[styles.seeAll, { color: colors.indigo }]}>Chat →</Text>
        </Pressable>
        {insights.map((insight, i) => (
          <Pressable key={i} onPress={() => nav.openOverlay('ai-coach')} style={styles.insightBox}>
            <Text style={styles.insightText}>{insight}</Text>
          </Pressable>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() - today.getDay() + i + 1);
            const hasWorkout = workoutLogs.some((l) => l.date === dayDate.toISOString().split('T')[0]);
            const isToday = dayDate.toDateString() === today.toDateString();
            return (
              <View key={i} style={styles.weekDay}>
                <Text style={styles.weekDayLabel}>{day}</Text>
                <View style={[styles.weekCircle, isToday && styles.weekToday, hasWorkout && styles.weekDone]}>
                  <Text style={[styles.weekNum, hasWorkout && styles.weekNumDone]}>
                    {hasWorkout ? '✓' : dayDate.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Pressable onPress={() => nav.openOverlay('workout-history')}>
        <Card style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <Text style={[styles.seeAll, { color: colors.indigo }]}>See all</Text>
          </View>
          {workoutLogs.slice(0, 4).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logIcon}>
                <Text>{log.prs.length > 0 ? '🏆' : '💪'}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.logName} numberOfLines={1}>
                  {log.workoutName || 'Workout'}
                </Text>
                <Text style={styles.logMeta}>
                  {log.date} · {log.duration}min · {(log.volume / 1000).toFixed(1)}k kg
                </Text>
              </View>
              <Text style={styles.logCal}>{log.calories} kcal</Text>
            </View>
          ))}
        </Card>
      </Pressable>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1, minWidth: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    date: { fontSize: 14, color: c.textMuted },
    greeting: { fontSize: 24, fontWeight: '700', color: c.text, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    notifBtn: { position: 'relative', padding: 4 },
    notifBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    notifBadgeText: { fontSize: 9, fontWeight: '700', color: '#ffffff' },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(249, 115, 22, 0.2)',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    streakText: { fontSize: 14, fontWeight: '700', color: c.orange },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: { flex: 1, minWidth: 0, alignItems: 'center', padding: 12 },
    statNum: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 11, color: c.textDim, marginTop: 2 },
    quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    quickCard: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
    quickIcon: { fontSize: 20 },
    quickLabel: { fontSize: 10, fontWeight: '600', color: c.textMuted, marginTop: 4 },
    workoutCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
    workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    workoutLabel: { fontSize: 11, fontWeight: '500', color: c.indigoLight, marginBottom: 4 },
    workoutName: { fontSize: 20, fontWeight: '700', color: c.text },
    workoutMeta: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    workoutEmoji: { fontSize: 36 },
    workoutActions: { flexDirection: 'row', gap: 12 },
    previewBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: c.cardMuted, borderRadius: 12 },
    previewText: { color: c.textMuted, fontSize: 14, fontWeight: '500' },
    section: { marginBottom: 20 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    seeAll: { fontSize: 13, fontWeight: '600' },
    meta: { fontSize: 12, color: c.textDim },
    macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    macroLabel: { fontSize: 12, color: c.textMuted },
    macroPct: { fontSize: 12, color: c.textDim },
    ringsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
    ringItem: { alignItems: 'center' },
    ringLabel: { fontSize: 11, color: c.textDim, marginTop: 4 },
    waterRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
    waterGlass: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 40,
      borderRadius: 8,
      backgroundColor: c.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waterFilled: { backgroundColor: 'rgba(6,182,212,0.2)' },
    waterEmoji: { fontSize: 14 },
    insightBox: { backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 8 },
    insightText: { fontSize: 14, color: c.textSecondary },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
    weekDay: { alignItems: 'center', gap: 8 },
    weekDayLabel: { fontSize: 12, color: c.textDim },
    weekCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekToday: { borderWidth: 2, borderColor: c.indigoLight },
    weekDone: { backgroundColor: c.chipActive },
    weekNum: { fontSize: 12, fontWeight: '500', color: c.textDim },
    weekNumDone: { color: c.text },
    logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 8 },
    logIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79,70,229,0.2)', alignItems: 'center', justifyContent: 'center' },
    logName: { fontSize: 14, fontWeight: '500', color: c.text },
    logMeta: { fontSize: 12, color: c.textDim, marginTop: 2 },
    logCal: { fontSize: 12, color: c.textDim },
  });
