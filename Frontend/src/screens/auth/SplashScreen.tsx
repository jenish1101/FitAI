import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';

export function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 100));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient colors={[...colors.backgroundGradient]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.orb1, { backgroundColor: isDark ? 'rgba(79,70,229,0.15)' : 'rgba(99,102,241,0.12)' }]} />
        <View style={[styles.orb2, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' }]} />

        <View style={styles.content}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#22d3ee']}
            style={styles.logoBox}>
            <Text style={styles.logoIcon}>🏋️</Text>
          </LinearGradient>

          <Text style={styles.title}>FitAI</Text>
          <Text style={styles.subtitle}>SMART FITNESS COACH</Text>

          <View style={styles.progressWrap}>
            <ProgressBar percent={progress} gradient={['#6366f1', '#22d3ee']} height={6} />
          </View>
          <Text style={styles.loading}>Preparing your coach...</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    gradient: { flex: 1 },
    safe: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    orb1: {
      position: 'absolute',
      top: 80,
      left: 40,
      width: 200,
      height: 200,
      borderRadius: 100,
    },
    orb2: {
      position: 'absolute',
      bottom: 80,
      right: 40,
      width: 240,
      height: 240,
      borderRadius: 120,
    },
    content: { alignItems: 'center', zIndex: 1, paddingHorizontal: 24 },
    logoBox: {
      width: 112,
      height: 112,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    logoIcon: { fontSize: 48 },
    title: {
      fontSize: 48,
      fontWeight: '900',
      color: c.indigo,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 12,
      color: c.textMuted,
      letterSpacing: 3,
      marginTop: 4,
    },
    progressWrap: { width: 192, marginTop: 24 },
    loading: { fontSize: 12, color: c.textDim, marginTop: 12 },
  });
