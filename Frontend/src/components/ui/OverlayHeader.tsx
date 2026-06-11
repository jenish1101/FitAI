import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  right?: React.ReactNode;
}

export function OverlayHeader({ title, subtitle, onClose, right }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onClose} hitSlop={8} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { marginBottom: 16 },
    backBtn: { marginBottom: 12 },
    backText: { fontSize: 16, color: c.textMuted, fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    flex1: { flex: 1, minWidth: 0 },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
  });
