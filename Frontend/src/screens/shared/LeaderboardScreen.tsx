import { StyleSheet, Text } from 'react-native';
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

const leaderboard = [
  { name: 'Sarah M.', score: 4850, avatar: '👩‍🦰', badge: '🥇' },
  { name: 'Mike T.', score: 4620, avatar: '👨‍🦱', badge: '🥈' },
  { name: 'Alex J.', score: 4200, avatar: '💪', badge: '🥉', isYou: true },
  { name: 'Emma L.', score: 3980, avatar: '👩', badge: '' },
  { name: 'Chris P.', score: 3750, avatar: '👨', badge: '' },
  { name: 'Lisa K.', score: 3500, avatar: '👩‍🦳', badge: '' },
];

export function LeaderboardScreen({ state, onClose }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const yourRank = leaderboard.findIndex((u) => u.isYou) + 1;

  return (
    <ScreenContainer
      header={
        <OverlayHeader
          title="Leaderboard"
          subtitle={`You're #${yourRank} this week`}
          onClose={onClose}
        />
      }
      contentStyle={styles.content}>
      <Card style={[styles.youCard, { borderColor: colors.indigo }]}>
        <Text style={styles.youLabel}>Your Score</Text>
        <Text style={[styles.youScore, { color: colors.indigo }]}>
          {leaderboard.find((u) => u.isYou)?.score ?? 0} pts
        </Text>
        <Text style={styles.youSub}>Based on workouts, streak & volume</Text>
      </Card>

      {leaderboard.map((user, i) => (
        <Card key={user.name} style={[styles.row, user.isYou && { backgroundColor: 'rgba(99,102,241,0.08)' }]}>
          <Text style={styles.rank}>{user.badge || `#${i + 1}`}</Text>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <Text style={[styles.name, user.isYou && { color: colors.indigo }]}>{user.name}</Text>
          <Text style={styles.score}>{user.score.toLocaleString()}</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    youCard: { alignItems: 'center', paddingVertical: 20, marginBottom: 16, borderWidth: 1 },
    youLabel: { fontSize: 13, color: c.textMuted },
    youScore: { fontSize: 36, fontWeight: '800', marginVertical: 4 },
    youSub: { fontSize: 12, color: c.textDim },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, paddingVertical: 14 },
    rank: { width: 32, fontSize: 16, textAlign: 'center' },
    avatar: { fontSize: 24 },
    name: { flex: 1, fontSize: 15, fontWeight: '600', color: c.text },
    score: { fontSize: 14, fontWeight: '700', color: c.textSecondary },
  });
