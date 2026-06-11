import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface TimeRangeProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeFilter({ options, value, onChange }: TimeRangeProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.timeRow}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.timeChip,
              active && { backgroundColor: colors.chipActive },
            ]}>
            <Text
              style={[
                styles.timeText,
                { color: active ? '#ffffff' : colors.textMuted },
              ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface MetricOption {
  id: string;
  icon: string;
  label: string;
}

interface MetricFilterProps {
  options: MetricOption[];
  value: string;
  onChange: (id: string) => void;
}

export function MetricFilter({ options, value, onChange }: MetricFilterProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.metricRow}>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[
              styles.metricChip,
              { backgroundColor: active ? colors.chipActive : colors.chipBg },
            ]}>
            <Text style={styles.metricIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.metricLabel,
                { color: active ? '#ffffff' : colors.textMuted },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricChip: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
