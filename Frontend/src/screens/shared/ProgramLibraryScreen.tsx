import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { workoutPrograms, type useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

export function ProgramLibraryScreen({ state, onClose }: Props) {
  const { profile } = state;
  const styles = useThemedStyles(createStyles);

  const applyProgram = (programId: string, programName: string) => {
    const splitMap: Record<string, string> = {
      ppl: 'Push/Pull/Legs',
      fullbody: 'Full Body',
      upperlower: 'Upper/Lower',
      '5x5': 'StrongLifts 5×5',
    };
    const freqMap: Record<string, string> = {
      ppl: '6 days',
      fullbody: '2-3 days',
      upperlower: '4-5 days',
      '5x5': '2-3 days',
    };
    void state
      .applyWorkoutProgram({
        workoutSplit: splitMap[programId] ?? programName,
        frequency: freqMap[programId] ?? profile.frequency,
      })
      .then(() => {
        Alert.alert('Program Applied', `${programName} is now your active program.`);
        onClose();
      })
      .catch(() => {
        Alert.alert('Error', 'Could not apply this program. Please try again.');
      });
  };

  return (
    <ScreenContainer
      header={<OverlayHeader title="Program Library" subtitle="Choose a training program" onClose={onClose} />}
      contentStyle={styles.content}>
      {workoutPrograms.map((p) => (
        <Card key={p.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.icon}>{p.icon}</Text>
            <View style={styles.flex1}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.desc}>{p.description}</Text>
              <Text style={styles.meta}>{p.days} days/wk · {p.duration}</Text>
            </View>
          </View>
          <GradientButton title="Use Program" onPress={() => applyProgram(p.id, p.name)} small style={{ marginTop: 12 }} />
        </Card>
      ))}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    card: { marginBottom: 12 },
    row: { flexDirection: 'row', gap: 14 },
    icon: { fontSize: 32 },
    flex1: { flex: 1, minWidth: 0 },
    name: { fontSize: 16, fontWeight: '600', color: c.text },
    desc: { fontSize: 13, color: c.textMuted, marginTop: 4, lineHeight: 18 },
    meta: { fontSize: 12, color: c.textDim, marginTop: 6 },
  });
