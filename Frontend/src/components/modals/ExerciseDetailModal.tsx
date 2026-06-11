import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Exercise } from '@/store';

interface Props {
  exercise: Exercise;
  visible: boolean;
  onClose: () => void;
}

export function ExerciseDetailModal({ exercise, visible, onClose }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.indigo }]}>← Back</Text>
        </Pressable>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={[styles.name, { color: colors.text }]}>{exercise.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {exercise.muscleGroup} · {exercise.equipment} · {exercise.difficulty}
          </Text>
          <View style={styles.statsRow}>
            {[
              { label: 'Sets', value: exercise.sets },
              { label: 'Reps', value: exercise.reps },
              { label: 'Weight', value: `${exercise.weight}kg` },
              { label: 'Rest', value: `${exercise.restTime}s` },
            ].map((s) => (
              <View key={s.label} style={[styles.stat, { backgroundColor: colors.cardMuted }]}>
                <Text style={[styles.statVal, { color: colors.indigo }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>{s.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.section, { color: colors.text }]}>Instructions</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{exercise.instructions}</Text>
          <View style={[styles.tip, { backgroundColor: colors.cardMuted }]}>
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              💡 Tip: Control the negative phase and keep rest times consistent for best results.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    backBtn: { padding: 16 },
    back: { fontSize: 16, fontWeight: '600' },
    content: { paddingHorizontal: 16 },
    name: { fontSize: 24, fontWeight: '700' },
    meta: { fontSize: 14, marginTop: 4, marginBottom: 20 },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    stat: { flex: 1, minWidth: '45%', alignItems: 'center', padding: 14, borderRadius: 12 },
    statVal: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 4 },
    section: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    body: { fontSize: 15, lineHeight: 22 },
    tip: { marginTop: 20, padding: 14, borderRadius: 12 },
    tipText: { fontSize: 14, lineHeight: 20 },
  });
