import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { WorkoutPlan } from '@/store';

interface Props {
  workout: WorkoutPlan;
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function WorkoutPreviewModal({ workout, visible, onClose, onStart }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.back, { color: colors.indigo }]}>← Close</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Workout Preview</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          <Text style={[styles.name, { color: colors.text }]}>{workout.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {workout.muscleGroups.join(' · ')} · {workout.duration} min · ~{workout.calories} kcal
          </Text>
          <Text style={[styles.section, { color: colors.text }]}>Exercises ({workout.exercises.length})</Text>
          {workout.exercises.map((ex, i) => (
            <View key={ex.id} style={[styles.row, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.num, { color: colors.indigo }]}>{i + 1}</Text>
              <View style={styles.flex1}>
                <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                <Text style={[styles.exMeta, { color: colors.textDim }]}>
                  {ex.sets} sets × {ex.reps} · {ex.weight}kg · {ex.restTime}s rest
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <GradientButton title="Start Workout 💪" onPress={onStart} />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
    back: { fontSize: 16, fontWeight: '600' },
    title: { fontSize: 20, fontWeight: '700' },
    content: { padding: 16 },
    name: { fontSize: 22, fontWeight: '700' },
    meta: { fontSize: 14, marginTop: 4, marginBottom: 20 },
    section: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    row: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, marginBottom: 8 },
    num: { fontSize: 16, fontWeight: '700', width: 24 },
    flex1: { flex: 1, minWidth: 0 },
    exName: { fontSize: 15, fontWeight: '600' },
    exMeta: { fontSize: 12, marginTop: 4 },
    footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  });
