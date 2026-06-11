import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/ThemeContext';

interface Props {
  percent: number;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
  height?: number;
}

export function ProgressBar({ percent, color, gradient, height = 8 }: Props) {
  const { colors } = useTheme();
  const width = `${Math.min(Math.max(percent, 0), 100)}%` as `${number}%`;
  const fillColor = color ?? colors.indigo;

  if (gradient) {
    return (
      <View style={[styles.track, { height, backgroundColor: colors.track }]}>
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width }]}
        />
      </View>
    );
  }

  return (
    <View style={[styles.track, { height, backgroundColor: colors.track }]}>
      <View style={[styles.fill, { width, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
