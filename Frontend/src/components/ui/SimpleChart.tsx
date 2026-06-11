import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function SimpleAreaChart({ data, color, height = 160 }: AreaChartProps) {
  const { colors } = useTheme();
  const chartColor = color ?? colors.indigo;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: colors.textDim }]}>Not enough data</Text>
      </View>
    );
  }

  const width = 300;
  const padding = 20;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <View style={{ height }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={chartColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={linePath} stroke={chartColor} strokeWidth={2} fill="none" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={chartColor} />
        ))}
      </Svg>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.label, { color: colors.textDim }]} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface BarChartProps {
  data: { label: string; value: number; over?: boolean }[];
  height?: number;
}

export function SimpleBarChart({ data, height = 128 }: BarChartProps) {
  const { colors, isDark } = useTheme();
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ height }}>
      <View style={styles.bars}>
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / maxVal) * (height - 24), 4);
          return (
            <View key={i} style={styles.barCol}>
              {d.value > 0 && (
                <Text style={[styles.barValue, { color: colors.textDim }]}>{d.value}</Text>
              )}
              <View style={[styles.barTrack, { height: height - 32 }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: d.over
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.6)'
                          : 'rgba(239, 68, 68, 0.45)'
                        : isDark
                          ? 'rgba(99, 102, 241, 0.6)'
                          : 'rgba(79, 70, 229, 0.45)',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textDim }]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 9,
    marginBottom: 2,
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
