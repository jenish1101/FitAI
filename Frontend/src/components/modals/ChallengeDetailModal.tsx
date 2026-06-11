import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Challenge } from '@/store';

interface Props {
  challenge: Challenge;
  visible: boolean;
  onClose: () => void;
  onUpdateProgress: (id: string, progress: number) => void;
}

export function ChallengeDetailModal({ challenge, visible, onClose, onUpdateProgress }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const percent = (challenge.progress / challenge.total) * 100;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.indigo }]}>← Back</Text>
        </Pressable>
        <View style={styles.content}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={[styles.name, { color: colors.text }]}>{challenge.name}</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>{challenge.description}</Text>
          <View style={[styles.card, { backgroundColor: colors.cardMuted }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textDim }]}>Progress</Text>
              <Text style={[styles.val, { color: colors.indigo }]}>
                {challenge.progress} / {challenge.total}
              </Text>
            </View>
            <ProgressBar percent={percent} gradient={['#6366f1', '#8b5cf6']} />
            <Text style={[styles.meta, { color: colors.textDim }]}>
              {challenge.duration} days · {challenge.participants.toLocaleString()} participants
            </Text>
          </View>
          <GradientButton
            title="+1 Progress"
            onPress={() => onUpdateProgress(challenge.id, Math.min(challenge.progress + 1, challenge.total))}
            small
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16 },
    backBtn: { marginBottom: 16 },
    back: { fontSize: 16, fontWeight: '600' },
    content: { flex: 1 },
    emoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
    name: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
    desc: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: 24 },
    card: { borderRadius: 16, padding: 20, marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    label: { fontSize: 14 },
    val: { fontSize: 16, fontWeight: '700' },
    meta: { fontSize: 13, marginTop: 12, textAlign: 'center' },
  });
