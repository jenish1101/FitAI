import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

const goals = ['Lose weight', 'Gain muscle', 'Maintain', 'Improve endurance'];
const frequencies = ['2-3 days', '4-5 days', '6 days'];

export function EditProfileScreen({ state, onClose }: Props) {
  const { profile } = state;
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(String(profile.weight));
  const [height, setHeight] = useState(String(profile.height));
  const [goal, setGoal] = useState(profile.goal);
  const [frequency, setFrequency] = useState(profile.frequency);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const save = async () => {
    try {
      await state.persistProfile({
        name,
        weight: parseFloat(weight) || profile.weight,
        height: parseFloat(height) || profile.height,
        goal,
        frequency,
      });
      Alert.alert('Saved', 'Your profile has been updated.');
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    }
  };

  return (
    <ScreenContainer
      header={<OverlayHeader title="Edit Profile" subtitle="Update your details" onClose={onClose} />}
      contentStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]} value={name} onChangeText={setName} />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]} value={height} onChangeText={setHeight} keyboardType="number-pad" />
        </View>
      </View>

      <Text style={styles.label}>Goal</Text>
      <View style={styles.chips}>
        {goals.map((g) => (
          <Pressable key={g} onPress={() => setGoal(g)} style={[styles.chip, goal === g && { backgroundColor: colors.chipActive }]}>
            <Text style={[styles.chipText, goal === g && { color: '#ffffff' }]}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.chips}>
        {frequencies.map((f) => (
          <Pressable key={f} onPress={() => setFrequency(f)} style={[styles.chip, frequency === f && { backgroundColor: colors.chipActive }]}>
            <Text style={[styles.chipText, frequency === f && { color: '#ffffff' }]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <GradientButton title="Save Changes" onPress={save} style={{ marginTop: 24 }} />
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    label: { fontSize: 13, fontWeight: '600', color: c.textMuted, marginBottom: 8, marginTop: 12 },
    input: { borderRadius: 12, padding: 14, fontSize: 15 },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1, minWidth: 0 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: c.chipBg },
    chipText: { fontSize: 13, fontWeight: '600', color: c.textMuted },
  });
