import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Friend } from '@/types/models';

interface Props {
  friend: Friend | null;
  onClose: () => void;
  onMessage?: () => void;
}

export function FriendProfileModal({ friend, onClose, onMessage }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  if (!friend) return null;

  const recentActivity = [
    { icon: '🏋️', text: friend.status, time: friend.lastWorkout },
    { icon: '🔥', text: `${friend.streak} day workout streak`, time: 'Active' },
    { icon: '🎯', text: `Goal: ${friend.goal}`, time: 'Profile' },
  ];

  return (
    <Modal visible={!!friend} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[styles.back, { color: colors.indigo }]}>← Back</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <LinearGradient colors={[...colors.gradientHero]} style={styles.hero}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.avatar}>
                <Text style={styles.avatarText}>{friend.avatar}</Text>
              </LinearGradient>
              {friend.online && <View style={[styles.onlineDot, { borderColor: colors.background }]} />}
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{friend.name}</Text>
            <Text style={[styles.status, { color: colors.textMuted }]}>{friend.status}</Text>
            {friend.online && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDotSmall} />
                <Text style={[styles.onlineText, { color: colors.green }]}>Online now</Text>
              </View>
            )}
          </LinearGradient>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.indigo }]}>{friend.workouts}</Text>
              <Text style={[styles.statLabel, { color: colors.textDim }]}>Workouts</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.orange }]}>{friend.streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textDim }]}>Streak</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.cyan }]}>{friend.goal.split(' ')[0]}</Text>
              <Text style={[styles.statLabel, { color: colors.textDim }]}>Goal</Text>
            </Card>
          </View>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Last workout</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{friend.lastWorkout}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Fitness goal</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{friend.goal}</Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Member since</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{friend.memberSince}</Text>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {recentActivity.map((item, i) => (
              <View key={i} style={[styles.activityRow, { backgroundColor: colors.cardMuted }]}>
                <Text style={styles.activityIcon}>{item.icon}</Text>
                <View style={styles.flex1}>
                  <Text style={[styles.activityText, { color: colors.textSecondary }]}>{item.text}</Text>
                  <Text style={[styles.activityTime, { color: colors.textDim }]}>{item.time}</Text>
                </View>
              </View>
            ))}
          </Card>

          <GradientButton title="Message 💬" onPress={onMessage ?? onClose} />
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>Close</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    back: { fontSize: 16, fontWeight: '500' },
    scroll: { padding: 16, paddingBottom: 32 },
    hero: {
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(99,102,241,0.2)',
    },
    avatarWrap: { position: 'relative', marginBottom: 12 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 36 },
    onlineDot: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: c.green,
      borderWidth: 3,
    },
    name: { fontSize: 22, fontWeight: '700' },
    status: { fontSize: 14, marginTop: 4, textAlign: 'center' },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    onlineDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.green },
    onlineText: { fontSize: 12, fontWeight: '500' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, alignItems: 'center', padding: 12 },
    statNum: { fontSize: 20, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 4 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.cardBorder,
    },
    detailRowLast: { borderBottomWidth: 0 },
    detailLabel: { fontSize: 14 },
    detailValue: { fontSize: 14, fontWeight: '500' },
    activityRow: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
    },
    activityIcon: { fontSize: 18 },
    flex1: { flex: 1 },
    activityText: { fontSize: 14 },
    activityTime: { fontSize: 12, marginTop: 2 },
    closeBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
    closeBtnText: { fontSize: 14, fontWeight: '500' },
  });
