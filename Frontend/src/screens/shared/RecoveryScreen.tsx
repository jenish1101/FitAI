import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

export function RecoveryScreen({ state, onClose }: Props) {
  const { profile, workoutLogs } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const weekLogs = workoutLogs.filter((l) => {
    const d = new Date(l.date);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const recoveryScore = Math.max(40, Math.min(100, 100 - weekLogs.length * 8 + profile.streak));
  const sleepHours = 7.2;
  const fatigue = recoveryScore < 70 ? 'Elevated' : recoveryScore < 85 ? 'Moderate' : 'Low';
  const deloadRecommended = recoveryScore < 75;

  return (
    <ScreenContainer
      header={<OverlayHeader title="Recovery" subtitle="Sleep, fatigue & deload insights" onClose={onClose} />}
      contentStyle={styles.content}>
      <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.hero}>
        <Text style={styles.heroLabel}>Recovery Score</Text>
        <Text style={styles.heroValue}>{recoveryScore}%</Text>
        <Text style={styles.heroSub}>
          {deloadRecommended ? 'Consider a deload week this cycle.' : 'You are well recovered. Push hard!'}
        </Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.cyan }]}>{sleepHours}h</Text>
          <Text style={styles.statLabel}>Avg Sleep</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.amber }]}>{fatigue}</Text>
          <Text style={styles.statLabel}>Fatigue</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.green }]}>{weekLogs.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle Recovery</Text>
        {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map((m, i) => (
          <View key={m} style={styles.recRow}>
            <Text style={styles.recName}>{m}</Text>
            <View style={styles.recBar}>
              <ProgressBar percent={[90, 85, 70, 80, 95][i]} color={colors.cyan} height={8} />
            </View>
            <Text style={styles.recPct}>{[90, 85, 70, 80, 95][i]}%</Text>
          </View>
        ))}
      </Card>

      {deloadRecommended && (
        <Card style={[styles.deload, { borderColor: colors.amber }]}>
          <Text style={styles.deloadTitle}>⚠️ Smart Deload Suggested</Text>
          <Text style={styles.deloadText}>
            Reduce volume by 40% for one week. Focus on form and mobility. Your AI coach predicts optimal
            performance after recovery.
          </Text>
        </Card>
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    hero: { borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
    heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    heroValue: { fontSize: 48, fontWeight: '800', color: '#ffffff', marginVertical: 4 },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    stat: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 14 },
    statNum: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 11, color: c.textDim, marginTop: 4 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    recRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    recName: { width: 72, fontSize: 13, color: c.textMuted },
    recBar: { flex: 1, minWidth: 0 },
    recPct: { width: 36, fontSize: 12, color: c.textDim, textAlign: 'right' },
    deload: { borderWidth: 1 },
    deloadTitle: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 8 },
    deloadText: { fontSize: 14, color: c.textMuted, lineHeight: 20 },
  });
