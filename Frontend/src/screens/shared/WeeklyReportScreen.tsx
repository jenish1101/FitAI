import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import { SimpleBarChart } from '@/components/ui/SimpleChart';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

export function WeeklyReportScreen({ state, onClose }: Props) {
  const { profile, workoutLogs, foodLogs } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const weekVol = workoutLogs.slice(0, 7).map((l, i) => ({
    label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] ?? 'D',
    value: Math.round(l.volume / 1000),
  }));

  const avgProtein = foodLogs.length
    ? Math.round(foodLogs.reduce((s, f) => s + f.protein, 0) / Math.max(foodLogs.length / 5, 1))
    : 0;

  const insights = [
    { icon: '📊', text: 'You trained chest 2× this week — volume is optimal.' },
    { icon: '⚠️', text: `Protein intake averaged ${avgProtein}g — target is ${profile.proteinTarget}g.` },
    { icon: '📈', text: 'Overall strength improved ~4% based on logged volume.' },
    { icon: '😴', text: 'Recovery score: 78%. Consider a deload next week.' },
    { icon: '🔥', text: `${profile.streak}-day streak — top 15% of FitAI users!` },
  ];

  return (
    <ScreenContainer
      header={<OverlayHeader title="Weekly AI Report" subtitle="Your personalized summary" onClose={onClose} />}
      contentStyle={styles.content}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Volume This Week</Text>
        <SimpleBarChart data={weekVol.length ? weekVol : [{ label: '—', value: 0 }]} height={140} />
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.indigo }]}>{profile.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.orange }]}>{profile.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
        {insights.map((item, i) => (
          <View key={i} style={styles.insight}>
            <Text>{item.icon}</Text>
            <Text style={styles.insightText}>{item.text}</Text>
          </View>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    stat: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statNum: { fontSize: 28, fontWeight: '700' },
    statLabel: { fontSize: 12, color: c.textDim, marginTop: 4 },
    insight: { flexDirection: 'row', gap: 10, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 8 },
    insightText: { flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 },
  });
