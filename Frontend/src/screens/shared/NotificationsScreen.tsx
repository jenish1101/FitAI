import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  streak: 'flame',
  workout: 'barbell',
  social: 'people',
  coach: 'sparkles',
  nutrition: 'nutrition',
};

export function NotificationsScreen({ state, onClose }: Props) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = state;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <ScreenContainer
      header={
        <OverlayHeader
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
          onClose={onClose}
          right={
            unread > 0 ? (
              <Pressable onPress={markAllNotificationsRead}>
                <Text style={[styles.markAll, { color: colors.indigo }]}>Mark all</Text>
              </Pressable>
            ) : null
          }
        />
      }
      contentStyle={styles.content}>
      {notifications.map((n) => (
        <Pressable key={n.id} onPress={() => markNotificationRead(n.id)}>
          <Card style={[styles.card, !n.read && { borderColor: colors.indigo, borderWidth: 1 }]}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: colors.cardMuted }]}>
                <Ionicons name={typeIcon[n.type] ?? 'notifications'} size={20} color={colors.indigo} />
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.title, !n.read && styles.unreadTitle]}>{n.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
              {!n.read && <View style={[styles.dot, { backgroundColor: colors.indigo }]} />}
            </View>
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    markAll: { fontSize: 13, fontWeight: '600' },
    card: { marginBottom: 10, paddingVertical: 14 },
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    flex1: { flex: 1, minWidth: 0 },
    title: { fontSize: 14, fontWeight: '600', color: c.text },
    unreadTitle: { color: c.text },
    body: { fontSize: 13, color: c.textMuted, marginTop: 4, lineHeight: 18 },
    time: { fontSize: 11, color: c.textDim, marginTop: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  });
