import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

const MILESTONES = [7, 14, 30, 60, 90];

function dateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function getActiveDays(logDates: Set<string>, days: number) {
  const result: { date: Date; active: boolean; isToday: boolean }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      date: d,
      active: logDates.has(dateKey(d)),
      isToday: i === 0,
    });
  }
  return result;
}

function computeLongestStreak(logDates: string[]) {
  if (logDates.length === 0) return 0;
  const sorted = [...new Set(logDates)].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export function StreakScreen({ state, onClose }: Props) {
  const { profile, workoutLogs, achievements } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const logDates = useMemo(
    () => new Set(workoutLogs.map((l) => l.date.split('T')[0])),
    [workoutLogs],
  );

  const calendarDays = useMemo(() => getActiveDays(logDates, 28), [logDates]);
  const activeThisMonth = calendarDays.filter((d) => d.active).length;
  const longestStreak = Math.max(computeLongestStreak([...logDates]), profile.streak);

  const nextMilestone = MILESTONES.find((m) => m > profile.streak) ?? MILESTONES[MILESTONES.length - 1];
  const milestoneProgress = Math.min((profile.streak / nextMilestone) * 100, 100);
  const daysToNext = Math.max(nextMilestone - profile.streak, 0);

  const streakAchievements = achievements.filter((a) => a.category === 'Streak');
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const recentWorkouts = workoutLogs.slice(0, 5);

  const calendarWeeks = useMemo(() => {
    const weeks: (typeof calendarDays)[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    return weeks;
  }, [calendarDays]);

  return (
    <ScreenContainer contentStyle={styles.content}>
      <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIconBox}>
            <Ionicons name="flame" size={32} color="#ffffff" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.heroLabel}>Current Streak</Text>
            <Text style={styles.heroValue}>{profile.streak} days</Text>
          </View>
        </View>
        <Text style={styles.heroSub}>
          {profile.streak >= 7
            ? "You're on fire! Keep showing up every day."
            : `${7 - profile.streak} more day${7 - profile.streak === 1 ? '' : 's'} to unlock Week Warrior 🔥`}
        </Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.orange }]}>{profile.streak}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.violet }]}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNum, { color: colors.cyan }]}>{activeThisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Next Milestone</Text>
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneTarget}>{nextMilestone}-day streak</Text>
          <Text style={styles.milestoneDays}>
            {daysToNext === 0 ? 'Reached!' : `${daysToNext} days to go`}
          </Text>
        </View>
        <ProgressBar percent={milestoneProgress} gradient={['#f97316', '#facc15']} />
        <Text style={styles.milestoneHint}>
          {profile.streak} / {nextMilestone} days completed
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Last 4 Weeks</Text>
        <View style={styles.calendarHeader}>
          {dayLabels.map((label, i) => (
            <Text key={i} style={styles.calendarHeaderLabel}>
              {label}
            </Text>
          ))}
        </View>
        {calendarWeeks.map((week, wi) => (
          <View key={wi} style={styles.calendarRow}>
            {week.map((day) => {
              const dayNum = day.date.getDate();
              return (
                <View key={dateKey(day.date)} style={styles.calendarCell}>
                  <View
                    style={[
                      styles.calendarDot,
                      day.active && { backgroundColor: colors.orange },
                      day.isToday && !day.active && { borderWidth: 2, borderColor: colors.orange },
                      !day.active && !day.isToday && { backgroundColor: colors.track },
                    ]}>
                    {day.active ? <Text style={styles.calendarCheck}>✓</Text> : null}
                  </View>
                  <Text style={[styles.calendarDay, day.isToday && { color: colors.orange, fontWeight: '700' }]}>
                    {dayNum}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
            <Text style={styles.legendText}>Workout day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.track, borderWidth: 2, borderColor: colors.orange }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Streak Badges</Text>
        {streakAchievements.map((badge) => (
          <View key={badge.id} style={[styles.badgeRow, !badge.unlocked && styles.badgeRowLocked]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <View style={styles.flex1}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
            </View>
            <Text style={[styles.badgeStatus, badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
              {badge.unlocked ? '✓' : '🔒'}
            </Text>
          </View>
        ))}
      </Card>

      {recentWorkouts.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Recent Workouts</Text>
          {recentWorkouts.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={[styles.logDot, { backgroundColor: colors.orange }]} />
              <View style={styles.flex1}>
                <Text style={styles.logName}>{log.workoutName}</Text>
                <Text style={styles.logMeta}>
                  {log.date} · {log.duration} min
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Streak tip</Text>
        <Text style={styles.tipText}>
          Log a workout or track nutrition daily to keep your streak alive. Rest days count
          when you log active recovery or hit your macro targets!
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1, minWidth: 0 },
    backBtn: { marginBottom: 12 },
    backText: { fontSize: 16, color: c.textMuted, fontWeight: '600' },
    hero: { borderRadius: 16, padding: 20, marginBottom: 16 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
    heroIconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    heroValue: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginTop: 2 },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 14 },
    statNum: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 11, color: c.textDim, marginTop: 4 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    milestoneTarget: { fontSize: 14, fontWeight: '600', color: c.text },
    milestoneDays: { fontSize: 13, color: c.orange, fontWeight: '600' },
    milestoneHint: { fontSize: 12, color: c.textDim, marginTop: 8 },
    calendarHeader: { flexDirection: 'row', marginBottom: 8 },
    calendarHeaderLabel: {
      flex: 1,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '600',
      color: c.textDim,
    },
    calendarRow: { flexDirection: 'row', marginBottom: 8 },
    calendarCell: { flex: 1, alignItems: 'center' },
    calendarDot: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarCheck: { fontSize: 14, color: '#ffffff', fontWeight: '700' },
    calendarDay: { fontSize: 10, color: c.textDim, marginTop: 4 },
    calendarDow: { fontSize: 9, color: c.textDim, marginTop: 1 },
    legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 4 },
    legendText: { fontSize: 11, color: c.textDim },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.cardMuted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    badgeRowLocked: { opacity: 0.6 },
    badgeIcon: { fontSize: 24 },
    badgeName: { fontSize: 14, fontWeight: '600', color: c.text },
    badgeDesc: { fontSize: 12, color: c.textDim, marginTop: 2 },
    badgeStatus: { fontSize: 18 },
    badgeUnlocked: { color: c.green },
    badgeLocked: { color: c.textDim },
    logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    logDot: { width: 8, height: 8, borderRadius: 4 },
    logName: { fontSize: 14, fontWeight: '500', color: c.text },
    logMeta: { fontSize: 12, color: c.textDim, marginTop: 2 },
    tipCard: { marginBottom: 16 },
    tipTitle: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
    tipText: { fontSize: 13, color: c.textMuted, lineHeight: 19 },
  });
