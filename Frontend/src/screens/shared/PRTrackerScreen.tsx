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

export function PRTrackerScreen({ state, onClose }: Props) {
  const { personalRecords } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <ScreenContainer
      header={<OverlayHeader title="Personal Records" subtitle="Your best lifts" onClose={onClose} />}
      contentStyle={styles.content}>
      {personalRecords.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>Complete workouts to track your PRs automatically.</Text>
        </Card>
      ) : (
        personalRecords.map((pr, i) => (
          <Card key={pr.exercise} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rank}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}</Text>
              <View style={styles.flex1}>
                <Text style={styles.name}>{pr.exercise}</Text>
                <Text style={styles.meta}>{pr.weight}kg × {pr.reps} reps · {pr.date}</Text>
              </View>
              <View style={styles.rmBox}>
                <Text style={[styles.rm, { color: colors.violet }]}>{pr.estimated1RM}</Text>
                <Text style={styles.rmLabel}>Est. 1RM</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    empty: { alignItems: 'center', padding: 32 },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyText: { fontSize: 14, color: c.textMuted, textAlign: 'center' },
    card: { marginBottom: 10 },
    row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    rank: { fontSize: 20, width: 32, textAlign: 'center' },
    flex1: { flex: 1, minWidth: 0 },
    name: { fontSize: 15, fontWeight: '600', color: c.text },
    meta: { fontSize: 12, color: c.textDim, marginTop: 4 },
    rmBox: { alignItems: 'center' },
    rm: { fontSize: 20, fontWeight: '700' },
    rmLabel: { fontSize: 10, color: c.textDim },
  });
