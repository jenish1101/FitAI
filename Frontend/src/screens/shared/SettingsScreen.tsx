import { Pressable, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { AppNavigation } from '@/types/navigation';

interface Props {
  nav: AppNavigation;
  onClose: () => void;
}

export function SettingsScreen({ nav, onClose }: Props) {
  const styles = useThemedStyles(createStyles);
  const { isDark, toggleColorScheme } = useTheme();

  const showInfo = (title: string, message: string) => {
    nav.openModal({ type: 'info', title, message });
  };

  const rows = [
    { icon: '🔔', label: 'Notifications', action: () => nav.openOverlay('notifications') },
    { icon: '⌚', label: 'Wearable Integration', action: () => showInfo('Wearable Integration', 'Connect Apple Watch, Garmin, or Fitbit to sync heart rate, steps, and workout data automatically.') },
    { icon: '📱', label: 'Apple Health / Google Fit', action: () => showInfo('Health Sync', 'FitAI can read steps, calories, and workouts from Apple Health and Google Fit. Enable in your device settings.') },
    { icon: '📤', label: 'Export Data (PDF)', action: () => showInfo('Export', 'Your workout logs, nutrition history, and progress photos will be exported as a PDF report. (Demo: export queued.)') },
    { icon: isDark ? '☀️' : '🌙', label: isDark ? 'Light Mode' : 'Dark Mode', action: toggleColorScheme },
    { icon: '🔒', label: 'Privacy & Security', action: () => showInfo('Privacy', 'Your data is encrypted and never sold. Manage permissions and delete your account from here.') },
    { icon: '❓', label: 'Help & Support', action: () => showInfo('Help', 'Email support@fitai.com or visit fitai.com/help for FAQs and tutorials.') },
  ];

  return (
    <ScreenContainer
      header={<OverlayHeader title="Settings" subtitle="Preferences & account" onClose={onClose} />}
      contentStyle={styles.content}>
      <Card style={styles.card}>
        {rows.map((row, i) => (
          <Pressable key={i} onPress={row.action} style={[styles.row, i > 0 && styles.rowBorder]}>
            <Text style={styles.icon}>{row.icon}</Text>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </Card>
      <Text style={styles.version}>FitAI v1.0.0</Text>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    card: { padding: 0, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    rowBorder: { borderTopWidth: 1, borderTopColor: c.cardBorder },
    icon: { fontSize: 18 },
    label: { flex: 1, fontSize: 15, fontWeight: '500', color: c.text },
    chevron: { fontSize: 18, color: c.textDim },
    version: { textAlign: 'center', fontSize: 12, color: c.textDim, marginTop: 24 },
  });
