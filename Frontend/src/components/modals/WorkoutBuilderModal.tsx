import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Exercise, WorkoutPlan, useAppState } from '@/store';

interface Props {
  visible: boolean;
  onClose: () => void;
  state: ReturnType<typeof useAppState>;
  onCreated: (plan: WorkoutPlan) => void;
}

export function WorkoutBuilderModal({ visible, onClose, state, onCreated }: Props) {
  const [name, setName] = useState('Custom Workout');
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const filtered = state.exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (ex: Exercise) => {
    setSelected((prev) =>
      prev.some((s) => s.id === ex.id) ? prev.filter((s) => s.id !== ex.id) : [...prev, ex],
    );
  };

  const create = () => {
    if (selected.length === 0) return;
    const plan: WorkoutPlan = {
      id: `custom-${Date.now()}`,
      name,
      day: 'Custom',
      muscleGroups: [...new Set(selected.map((e) => e.muscleGroup))],
      exercises: selected,
      duration: selected.length * 8 + 10,
      calories: selected.length * 45,
      completed: false,
    };
    onCreated(plan);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.back, { color: colors.indigo }]}>← Cancel</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Build Workout</Text>
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Workout name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textDim}
          />
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Selected ({selected.length})
          </Text>
          {selected.map((ex) => (
            <View key={ex.id} style={[styles.chip, { backgroundColor: colors.chipActive }]}>
              <Text style={styles.chipText}>{ex.name}</Text>
              <Pressable onPress={() => toggle(ex)}>
                <Text style={styles.chipRemove}>✕</Text>
              </Pressable>
            </View>
          ))}
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text, marginTop: 12 }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
          />
          {filtered.slice(0, 20).map((ex) => {
            const active = selected.some((s) => s.id === ex.id);
            return (
              <Pressable
                key={ex.id}
                onPress={() => toggle(ex)}
                style={[styles.exRow, { backgroundColor: active ? 'rgba(79,70,229,0.15)' : colors.cardMuted }]}>
                <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                <Text style={[styles.exMeta, { color: colors.textDim }]}>
                  {ex.muscleGroup} · {ex.equipment}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <GradientButton title={`Save Workout (${selected.length})`} onPress={create} />
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
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: { borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16 },
    chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 10, marginBottom: 6 },
    chipText: { color: '#ffffff', fontSize: 13, flex: 1 },
    chipRemove: { color: '#ffffff', fontSize: 14, paddingLeft: 8 },
    exRow: { padding: 14, borderRadius: 12, marginBottom: 8 },
    exName: { fontSize: 14, fontWeight: '600' },
    exMeta: { fontSize: 12, marginTop: 2 },
    footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  });
