import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

export function WorkoutHistoryScreen({ state, onClose }: Props) {
  const { workoutLogs } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const totalVol = workoutLogs.reduce((s, l) => s + l.volume, 0);

  return (
    <ScreenContainer
      header={
        <OverlayHeader
          title="Workout History"
          subtitle={`${workoutLogs.length} sessions · ${(totalVol / 1000).toFixed(1)}k kg total`}
          onClose={onClose}
        />
      }
      contentStyle={styles.content}>
      {workoutLogs.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyText}>No workouts logged yet. Start your first session!</Text>
        </Card>
      ) : (
        workoutLogs.map((log) => (
          <Card key={log.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{log.prs.length > 0 ? '🏆' : '💪'}</Text>
              <View style={styles.flex1}>
                <Text style={styles.name}>{log.workoutName}</Text>
                <Text style={styles.meta}>
                  {log.date} · {log.duration} min · {(log.volume / 1000).toFixed(1)}k kg
                </Text>
                {log.exercises.length > 0 && (
                  <Text style={styles.exCount}>{log.exercises.length} exercises logged</Text>
                )}
              </View>
              <Text style={[styles.cal, { color: colors.orange }]}>{log.calories} kcal</Text>
            </View>
            {log.prs.length > 0 && (
              <View style={[styles.prBadge, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                <Text style={[styles.prText, { color: colors.green }]}>{log.prs.join(' · ')}</Text>
              </View>
            )}
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    empty: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: c.textMuted, textAlign: 'center' },
    card: { marginBottom: 10 },
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    emoji: { fontSize: 28 },
    flex1: { flex: 1, minWidth: 0 },
    name: { fontSize: 16, fontWeight: '600', color: c.text },
    meta: { fontSize: 12, color: c.textDim, marginTop: 4 },
    exCount: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    cal: { fontSize: 13, fontWeight: '600' },
    prBadge: { marginTop: 10, padding: 8, borderRadius: 8 },
    prText: { fontSize: 12, fontWeight: '600' },
  });
