import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
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

export function MeasurementsScreen({ state, onClose }: Props) {
  const { bodyMetrics, addBodyMetric } = state;
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const save = async () => {
    if (!weight) {
      Alert.alert('Required', 'Please enter at least your weight.');
      return;
    }
    try {
      await addBodyMetric({
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
      });
      Alert.alert('Saved', 'Measurement logged successfully.');
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
    } catch {
      Alert.alert('Error', 'Could not save measurement. Please try again.');
    }
  };

  const latest = bodyMetrics[bodyMetrics.length - 1];

  return (
    <ScreenContainer
      header={<OverlayHeader title="Log Measurements" subtitle="Track body metrics" onClose={onClose} />}
      contentStyle={styles.content}>
      {latest && (
        <Card style={styles.latest}>
          <Text style={styles.latestTitle}>Latest ({latest.date})</Text>
          <Text style={styles.latestVal}>{latest.weight.toFixed(1)} kg · {latest.bodyFat?.toFixed(1) ?? '—'}% BF</Text>
        </Card>
      )}

      {[
        { label: 'Weight (kg)', value: weight, set: setWeight },
        { label: 'Body Fat (%)', value: bodyFat, set: setBodyFat },
        { label: 'Chest (cm)', value: chest, set: setChest },
        { label: 'Waist (cm)', value: waist, set: setWaist },
      ].map((f) => (
        <View key={f.label}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]}
            value={f.value}
            onChangeText={f.set}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textDim}
          />
        </View>
      ))}

      <GradientButton title="Save Measurement" onPress={save} style={{ marginTop: 16 }} />

      <Text style={styles.historyTitle}>Recent History</Text>
      {bodyMetrics.slice(-5).reverse().map((m) => (
        <Card key={m.date} style={styles.historyRow}>
          <Text style={styles.historyDate}>{m.date}</Text>
          <Text style={styles.historyVal}>{m.weight.toFixed(1)} kg</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    latest: { marginBottom: 20, alignItems: 'center', paddingVertical: 16 },
    latestTitle: { fontSize: 13, color: c.textMuted },
    latestVal: { fontSize: 18, fontWeight: '700', color: c.text, marginTop: 4 },
    label: { fontSize: 13, fontWeight: '600', color: c.textMuted, marginBottom: 8, marginTop: 8 },
    input: { borderRadius: 12, padding: 14, fontSize: 15 },
    historyTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginTop: 24, marginBottom: 12 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 12 },
    historyDate: { fontSize: 14, color: c.textMuted },
    historyVal: { fontSize: 14, fontWeight: '600', color: c.text },
  });
