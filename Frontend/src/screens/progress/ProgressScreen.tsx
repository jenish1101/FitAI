import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { TabSelector } from '@/components/ui/TabSelector';
import { MetricFilter, TimeRangeFilter } from '@/components/ui/FilterChips';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SimpleAreaChart } from '@/components/ui/SimpleChart';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { AppNavigation } from '@/types/navigation';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  nav: AppNavigation;
}

const muscleData = [
  { name: 'Chest', trained: 85, recovery: 90 },
  { name: 'Back', trained: 72, recovery: 95 },
  { name: 'Shoulders', trained: 65, recovery: 80 },
  { name: 'Arms', trained: 78, recovery: 85 },
  { name: 'Core', trained: 45, recovery: 100 },
  { name: 'Quads', trained: 60, recovery: 70 },
  { name: 'Hamstrings', trained: 55, recovery: 75 },
  { name: 'Calves', trained: 30, recovery: 100 },
];

const bestLifts = [
  { name: 'Bench Press', weight: 85, estimated1RM: 100, change: 5 },
  { name: 'Squat', weight: 110, estimated1RM: 130, change: 10 },
  { name: 'Deadlift', weight: 140, estimated1RM: 165, change: 7.5 },
  { name: 'Overhead Press', weight: 55, estimated1RM: 65, change: 2.5 },
];

const METRIC_OPTIONS = [
  { id: 'weight', icon: '⚖️', label: 'Weight' },
  { id: 'bodyFat', icon: '📊', label: 'Body Fat' },
  { id: 'measurements', icon: '📐', label: 'Measure' },
] as const;

export function ProgressScreen({ state, nav }: Props) {
  const [activeTab, setActiveTab] = useState('body');
  const [metricView, setMetricView] = useState<'weight' | 'bodyFat' | 'measurements'>('weight');
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M'>('3M');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartHeight = screenWidth < 360 ? 150 : 180;

  const { bodyMetrics, workoutLogs, progressPhotos, addProgressPhoto } = state;

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to save progress pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      addProgressPhoto({
        id: `photo-${Date.now()}`,
        uri: result.assets[0].uri,
        date: new Date().toISOString().split('T')[0],
        label: `Progress · ${new Date().toLocaleDateString()}`,
      });
      Alert.alert('Photo saved', 'Added to your progress timeline.');
    }
  };

  const rangeFilter = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const months = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : 6;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    return date >= cutoff;
  };

  const filteredMetrics = bodyMetrics.filter((m) => rangeFilter(m.date));

  const chartData = filteredMetrics.map((m) => ({
    label: m.date.slice(5),
    value:
      metricView === 'weight'
        ? Math.round(m.weight * 10) / 10
        : metricView === 'bodyFat'
          ? Math.round((m.bodyFat || 0) * 10) / 10
          : Math.round((m.chest || 0) * 10) / 10,
  }));

  const weeklyVolume = [];
  const now = new Date();
  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const vol = workoutLogs
      .filter((l) => {
        const d = new Date(l.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((s, l) => s + l.volume, 0);
    weeklyVolume.push({ label: `W${12 - w}`, value: Math.round(vol / 1000) });
  }

  const weightDelta =
    filteredMetrics.length > 1
      ? filteredMetrics[0].weight - filteredMetrics[filteredMetrics.length - 1].weight
      : 0;
  const bfDelta =
    filteredMetrics.length > 1
      ? (filteredMetrics[0].bodyFat || 0) - (filteredMetrics[filteredMetrics.length - 1].bodyFat || 0)
      : 0;

  const bodyFilters =
    activeTab === 'body' ? (
      <View style={styles.filterBlock}>
        <TimeRangeFilter
          options={['1M', '3M', '6M'] as const}
          value={timeRange}
          onChange={(v) => setTimeRange(v as typeof timeRange)}
        />
        <MetricFilter
          options={[...METRIC_OPTIONS]}
          value={metricView}
          onChange={(v) => setMetricView(v as typeof metricView)}
        />
      </View>
    ) : null;

  return (
    <ScreenContainer
      header={
        <>
          <View style={styles.header}>
            <View style={styles.flex1}>
              <Text style={styles.title}>Progress</Text>
              <Text style={styles.subtitle}>Track your transformation</Text>
            </View>
            <Text style={styles.emoji}>📊</Text>
          </View>
          <TabSelector
            compact
            tabs={[
              { id: 'body', label: 'Body', icon: '📏' },
              { id: 'strength', label: 'Strength', icon: '💪' },
              { id: 'photos', label: 'Photos', icon: '📸' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {bodyFilters}
        </>
      }
      contentStyle={styles.content}>
      {activeTab === 'body' && (
        <View>
          <Card style={styles.chartCard}>
            <SimpleAreaChart
              data={chartData}
              color={metricView === 'bodyFat' ? colors.cyan : colors.indigo}
              height={chartHeight}
            />
          </Card>

          <View style={styles.linkRow}>
            <Pressable onPress={() => nav.openOverlay('measurements')} style={[styles.linkBtn, { backgroundColor: colors.cardMuted }]}>
              <Text style={styles.linkText}>📐 Log Measurements</Text>
            </Pressable>
            <Pressable onPress={() => nav.openOverlay('recovery')} style={[styles.linkBtn, { backgroundColor: colors.cardMuted }]}>
              <Text style={styles.linkText}>😴 Recovery</Text>
            </Pressable>
          </View>

          {filteredMetrics.length > 0 && (
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={[styles.statNum, { color: colors.indigo }]}>
                  {filteredMetrics[filteredMetrics.length - 1].weight.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Weight (kg)</Text>
                <Text style={[styles.statChange, weightDelta >= 0 ? styles.statUp : styles.statDown]}>
                  {weightDelta >= 0 ? '↑' : '↓'} {Math.abs(weightDelta).toFixed(1)} kg
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statNum, { color: colors.cyan }]}>
                  {filteredMetrics[filteredMetrics.length - 1].bodyFat?.toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>Body Fat</Text>
                <Text style={[styles.statChange, bfDelta >= 0 ? styles.statUp : styles.statDown]}>
                  {bfDelta >= 0 ? '↑' : '↓'} {Math.abs(bfDelta).toFixed(1)}%
                </Text>
              </Card>
            </View>
          )}

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Muscle Heatmap</Text>
            <View style={styles.heatLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                <Text style={styles.legendText}>Recovered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.amber }]} />
                <Text style={styles.legendText}>Recovering</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                <Text style={styles.legendText}>Fatigued</Text>
              </View>
            </View>
            {muscleData.map((m) => (
              <View key={m.name} style={styles.heatRow}>
                <Text style={styles.heatName} numberOfLines={1}>
                  {m.name}
                </Text>
                <View style={styles.heatBar}>
                  <View
                    style={[
                      styles.heatFill,
                      {
                        width: `${m.trained}%`,
                        backgroundColor:
                          m.trained > 70 ? colors.orange : m.trained > 50 ? colors.amber : '#3b82f6',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.heatPct}>{m.trained}%</Text>
                <View
                  style={[
                    styles.recoveryDot,
                    {
                      backgroundColor:
                        m.recovery >= 90 ? colors.green : m.recovery >= 70 ? colors.amber : colors.red,
                    },
                  ]}
                />
              </View>
            ))}
          </Card>
        </View>
      )}

      {activeTab === 'strength' && (
        <View>
          <Pressable onPress={() => nav.openOverlay('prs')}>
            <Card style={[styles.section, { marginBottom: 12 }]}>
              <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>🏆 All Personal Records</Text>
              <Text style={{ color: colors.indigo, fontWeight: '600' }}>View full PR tracker →</Text>
            </Card>
          </Pressable>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Personal Records</Text>
            {bestLifts.map((lift) => (
              <View key={lift.name} style={styles.liftCard}>
                <View style={styles.liftHeader}>
                  <Text style={styles.liftName}>{lift.name}</Text>
                  <Text style={styles.liftChange}>+{lift.change}kg</Text>
                </View>
                <View style={styles.liftStats}>
                  <View style={styles.liftStatBox}>
                    <Text style={styles.liftLabel}>Best Set</Text>
                    <Text style={[styles.liftVal, { color: colors.indigo }]}>{lift.weight}kg</Text>
                  </View>
                  <View style={styles.liftStatBox}>
                    <Text style={styles.liftLabel}>Est. 1RM</Text>
                    <Text style={[styles.liftVal, { color: colors.violet }]}>{lift.estimated1RM}kg</Text>
                  </View>
                  <View style={styles.liftBar}>
                    <ProgressBar
                      percent={(lift.weight / lift.estimated1RM) * 100}
                      gradient={['#6366f1', '#8b5cf6']}
                    />
                  </View>
                </View>
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Volume Progression (Weekly)</Text>
            <SimpleAreaChart data={weeklyVolume} color={colors.violet} height={chartHeight} />
          </Card>
        </View>
      )}

      {activeTab === 'photos' && (
        <View>
          <LinearGradient colors={[...colors.gradientHero]} style={styles.photoHero}>
            <Text style={styles.photoEmoji}>📸</Text>
            <Text style={styles.photoTitle}>Progress Photos</Text>
            <Text style={styles.photoSub}>
              Track your visual transformation with before/after comparison.
            </Text>
            <GradientButton title="📷 Add Progress Photo" onPress={pickPhoto} small />
          </LinearGradient>

          <Text style={styles.sectionTitle}>Timeline</Text>
          {progressPhotos.length === 0 ? (
            <Card style={styles.timelineCard}>
              <Text style={{ color: colors.textMuted, textAlign: 'center', flex: 1 }}>
                No photos yet. Tap above to add your first progress photo.
              </Text>
            </Card>
          ) : (
            progressPhotos.map((photo) => (
              <Card key={photo.id} style={styles.timelineCard}>
                <Image source={{ uri: photo.uri }} style={styles.timelineImage} contentFit="cover" />
                <View style={styles.flex1}>
                  <Text style={styles.timelineLabel}>{photo.label}</Text>
                  <Text style={styles.timelineDate}>{photo.date}</Text>
                </View>
              </Card>
            ))
          )}

          {progressPhotos.length >= 2 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Before / After Comparison</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareBox}>
                  <Image source={{ uri: progressPhotos[progressPhotos.length - 1].uri }} style={styles.compareImage} contentFit="cover" />
                  <Text style={styles.compareLabel}>Before</Text>
                </View>
                <View style={[styles.compareBox, styles.compareAfter]}>
                  <Image source={{ uri: progressPhotos[0].uri }} style={styles.compareImage} contentFit="cover" />
                  <Text style={styles.compareLabel}>After</Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1, minWidth: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    emoji: { fontSize: 28 },
    filterBlock: { gap: 10 },
    linkRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    linkBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    linkText: { fontSize: 13, fontWeight: '600', color: c.text },
    chartCard: { marginBottom: 16, paddingVertical: 8 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 16 },
    statNum: { fontSize: 26, fontWeight: '700' },
    statLabel: { fontSize: 12, color: c.textDim, marginTop: 4 },
    statChange: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    statDown: { color: c.green },
    statUp: { color: c.amber },
    heatLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 14,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: c.textDim },
    heatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    heatName: { width: 80, fontSize: 12, fontWeight: '500', color: c.textMuted, flexShrink: 0 },
    heatBar: {
      flex: 1,
      minWidth: 0,
      height: 14,
      backgroundColor: c.track,
      borderRadius: 7,
      overflow: 'hidden',
    },
    heatFill: { height: '100%', borderRadius: 7 },
    heatPct: { width: 36, fontSize: 12, fontWeight: '600', color: c.textDim, textAlign: 'right' },
    recoveryDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    liftCard: { backgroundColor: c.cardMuted, borderRadius: 12, padding: 16, marginBottom: 10 },
    liftHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    liftName: { fontSize: 16, fontWeight: '600', color: c.text, flex: 1 },
    liftChange: { fontSize: 13, color: c.green, fontWeight: '600' },
    liftStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    liftStatBox: { minWidth: 64 },
    liftLabel: { fontSize: 11, color: c.textDim, marginBottom: 2 },
    liftVal: { fontSize: 18, fontWeight: '700' },
    liftBar: { flex: 1, minWidth: 0 },
    photoHero: {
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(99,102,241,0.2)',
    },
    photoEmoji: { fontSize: 48, marginBottom: 16 },
    photoTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 8 },
    photoSub: { fontSize: 14, color: c.textMuted, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
    timelineCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
    timelineImage: { width: 56, height: 56, borderRadius: 12, flexShrink: 0 },
    compareImage: { width: '100%', height: '80%', borderRadius: 8 },
    timelineLabel: { fontSize: 14, fontWeight: '600', color: c.text },
    timelineDate: { fontSize: 12, color: c.textDim, marginTop: 2 },
    viewBtn: { fontSize: 13, color: c.indigo, fontWeight: '600', paddingHorizontal: 8 },
    compareRow: { flexDirection: 'row', gap: 12 },
    compareBox: {
      flex: 1,
      minWidth: 0,
      aspectRatio: 3 / 4,
      backgroundColor: c.cardMuted,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compareAfter: { backgroundColor: 'rgba(99,102,241,0.12)' },
    compareEmoji: { fontSize: 28, marginBottom: 8 },
    compareLabel: { fontSize: 12, color: c.textDim, fontWeight: '500' },
  });
