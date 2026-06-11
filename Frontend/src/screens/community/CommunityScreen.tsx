import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AddFriendsModal } from '@/components/features/community/AddFriendsModal';
import { FriendProfileModal } from '@/components/features/community/FriendProfileModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { TabSelector } from '@/components/ui/TabSelector';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Friend } from '@/types/models';
import type { AppNavigation } from '@/types/navigation';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  nav: AppNavigation;
}

const leaderboard = [
  { name: 'Sarah M.', score: 4850, avatar: '👩‍🦰', badge: '🥇' },
  { name: 'Mike T.', score: 4620, avatar: '👨‍🦱', badge: '🥈' },
  { name: 'Alex J.', score: 4200, avatar: '💪', badge: '🥉' },
  { name: 'Emma L.', score: 3980, avatar: '👩', badge: '' },
  { name: 'Chris P.', score: 3750, avatar: '👨', badge: '' },
  { name: 'Lisa K.', score: 3500, avatar: '👩‍🦳', badge: '' },
];

const initialFriends: Friend[] = [
  {
    id: 'f1',
    name: 'Sarah M.',
    status: 'Just finished Leg Day 🦵',
    avatar: '👩‍🦰',
    online: true,
    lastWorkout: '2h ago',
    workouts: 52,
    streak: 8,
    goal: 'Gain muscle',
    memberSince: '2024-03-15',
  },
  {
    id: 'f2',
    name: 'Mike T.',
    status: 'Hit a new squat PR! 💪',
    avatar: '👨‍🦱',
    online: true,
    lastWorkout: '5h ago',
    workouts: 68,
    streak: 12,
    goal: 'Strength',
    memberSince: '2024-01-20',
  },
  {
    id: 'f3',
    name: 'Emma L.',
    status: 'Rest day 😴',
    avatar: '👩',
    online: false,
    lastWorkout: 'Yesterday',
    workouts: 34,
    streak: 3,
    goal: 'Lose fat',
    memberSince: '2024-06-01',
  },
  {
    id: 'f4',
    name: 'Chris P.',
    status: '30-day streak! 🔥',
    avatar: '👨',
    online: false,
    lastWorkout: '1d ago',
    workouts: 41,
    streak: 30,
    goal: 'Recomposition',
    memberSince: '2024-02-10',
  },
];

const feed = [
  {
    id: 'p1',
    user: 'Sarah M.',
    avatar: '👩‍🦰',
    action: 'completed Push Day',
    time: '2h ago',
    likes: 12,
    comments: 3,
    workout: '55min · 8,500kg volume',
  },
  {
    id: 'p2',
    user: 'Mike T.',
    avatar: '👨‍🦱',
    action: 'set a new PR on Squat',
    time: '5h ago',
    likes: 24,
    comments: 8,
    workout: '130kg x 3 reps',
  },
  {
    id: 'p3',
    user: 'Emma L.',
    avatar: '👩',
    action: 'completed 30-Day Fat Burn Challenge',
    time: '1d ago',
    likes: 45,
    comments: 15,
    workout: '🏆 Challenge Complete!',
  },
];

export function CommunityScreen({ state, nav }: Props) {
  const [activeTab, setActiveTab] = useState('feed');
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const { achievements, challenges } = state;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getLikeCount = (postId: string, baseLikes: number) => {
    const liked = likedPosts[postId];
    return baseLikes + (liked ? 1 : 0);
  };

  return (
    <>
      <ScreenContainer
        header={
          <>
            <View style={styles.header}>
              <View style={styles.flex1}>
                <Text style={styles.title}>Community</Text>
                <Text style={styles.subtitle}>Connect & compete</Text>
              </View>
              <Text style={styles.emoji}>🧑‍🤝‍🧑</Text>
            </View>
            <TabSelector
              compact
              tabs={[
                { id: 'feed', label: 'Feed', icon: '📱' },
                { id: 'challenges', label: 'Challenges', icon: '🏆' },
                { id: 'friends', label: 'Friends', icon: '👥' },
                { id: 'badges', label: 'Badges', icon: '🎖️' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        }
        contentStyle={styles.content}>
        {activeTab === 'feed' && (
          <View>
            {feed.map((post) => {
              const liked = likedPosts[post.id];
              return (
                <Card key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{post.avatar}</Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.postText}>
                        <Text style={styles.postUser}>{post.user}</Text> {post.action}
                      </Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                  </View>
                  <View style={styles.postBody}>
                    <Text style={styles.postWorkout}>{post.workout}</Text>
                  </View>
                  <View style={styles.postActions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => toggleLike(post.id)}>
                      <Text>{liked ? '❤️' : '🤍'}</Text>
                      <Text style={[styles.actionCount, liked && { color: colors.red }]}>
                        {getLikeCount(post.id, post.likes)}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => nav.openModal({ type: 'comments', postId: post.id, postUser: post.user })}>
                      <Text>💬</Text>
                      <Text style={styles.actionCount}>{post.comments}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.shareBtn]}
                      onPress={() =>
                        nav.openModal({
                          type: 'info',
                          title: 'Shared!',
                          message: `You shared ${post.user}'s workout achievement with your friends.`,
                        })
                      }>
                      <Text>🔗</Text>
                      <Text style={styles.actionCount}>Share</Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {activeTab === 'challenges' && (
          <View>
            <Pressable onPress={() => nav.openOverlay('leaderboard')}>
              <Card style={[styles.section, { marginBottom: 12 }]}>
                <Text style={styles.sectionTitle}>🏅 Global Leaderboard</Text>
                <Text style={{ color: colors.indigo, fontWeight: '600' }}>View rankings →</Text>
              </Card>
            </Pressable>
            {challenges.map((challenge) => (
              <Pressable key={challenge.id} onPress={() => nav.openModal({ type: 'challenge-detail', challenge })}>
              <Card style={styles.section}>
                <View style={styles.challengeHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.challengeName}>{challenge.name}</Text>
                    <Text style={styles.challengeDesc}>{challenge.description}</Text>
                  </View>
                  <Text style={styles.challengeIcon}>
                    {challenge.type === 'workout'
                      ? '🏋️'
                      : challenge.type === 'cardio'
                        ? '🏃'
                        : challenge.type === 'strength'
                          ? '💪'
                          : '🥗'}
                  </Text>
                </View>
                <View style={styles.challengeProgress}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.meta}>
                      {challenge.progress} / {challenge.total}
                    </Text>
                    <Text style={styles.meta}>
                      {Math.round((challenge.progress / challenge.total) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    percent={(challenge.progress / challenge.total) * 100}
                    gradient={['#6366f1', '#8b5cf6']}
                  />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.meta}>👥 {challenge.participants.toLocaleString()} participants</Text>
                  <Text style={styles.meta}>{challenge.duration} days</Text>
                </View>
              </Card>
              </Pressable>
            ))}

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
              {leaderboard.map((user, i) => (
                <View
                  key={i}
                  style={[
                    styles.leaderRow,
                    i < 3 && styles.leaderTop,
                    user.name === 'Alex J.' && styles.leaderHighlight,
                  ]}>
                  <Text style={styles.leaderRank}>{i + 1}</Text>
                  <View style={styles.leaderAvatar}>
                    <Text>{user.avatar}</Text>
                  </View>
                  <Text style={styles.leaderName}>
                    {user.name} {user.badge}
                  </Text>
                  <Text style={styles.leaderScore}>{user.score.toLocaleString()}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {activeTab === 'friends' && (
          <View>
            <Pressable style={styles.addFriendsBtn} onPress={() => setShowAddFriends(true)}>
              <Text style={styles.addFriendsText}>+ Add Friends</Text>
            </Pressable>
            {friends.length === 0 ? (
              <Card style={styles.emptyFriends}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyTitle}>No friends yet</Text>
                <Text style={styles.emptySub}>Tap &quot;+ Add Friends&quot; to connect with others</Text>
              </Card>
            ) : (
              friends.map((friend) => (
                <Card key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendAvatarWrap}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
                    </View>
                    {friend.online && <View style={styles.onlineDot} />}
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendStatus} numberOfLines={2}>
                      {friend.status}
                    </Text>
                    <Text style={styles.friendLast}>Last workout: {friend.lastWorkout}</Text>
                  </View>
                  <Pressable style={styles.viewFriendBtn} onPress={() => setSelectedFriend(friend)}>
                    <Text style={styles.viewFriendText}>View</Text>
                  </Pressable>
                </Card>
              ))
            )}
          </View>
        )}

        {activeTab === 'badges' && (
          <View>
            <Card style={styles.badgeSummary}>
              <Text style={styles.badgeCount}>
                {unlockedCount} / {achievements.length}
              </Text>
              <Text style={styles.badgeSub}>Achievements Unlocked</Text>
              <ProgressBar
                percent={(unlockedCount / achievements.length) * 100}
                gradient={['#f59e0b', '#facc15']}
              />
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Streaks</Text>
              <View style={styles.streakRow}>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.orange }]}>{state.profile.streak}</Text>
                  <Text style={styles.streakLabel}>Workout</Text>
                </View>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.cyan }]}>8</Text>
                  <Text style={styles.streakLabel}>Tracking</Text>
                </View>
                <View style={styles.streakBox}>
                  <Text style={[styles.streakNum, { color: colors.green }]}>5</Text>
                  <Text style={styles.streakLabel}>Steps</Text>
                </View>
              </View>
            </Card>

            <View style={styles.badgeGrid}>
              {achievements.map((a) => (
                <Card key={a.id} style={[styles.badgeCard, !a.unlocked && styles.badgeLocked]}>
                  <Text style={styles.badgeIcon}>{a.icon}</Text>
                  <Text style={styles.badgeName}>{a.name}</Text>
                  <Text style={styles.badgeDesc}>{a.description}</Text>
                  {a.unlocked && a.date && <Text style={styles.badgeDate}>{a.date.slice(5)}</Text>}
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScreenContainer>

      <AddFriendsModal
        visible={showAddFriends}
        existingFriends={friends}
        onClose={() => setShowAddFriends(false)}
        onAdd={(friend) => setFriends((prev) => [...prev, friend])}
      />

      <FriendProfileModal
        friend={selectedFriend}
        onClose={() => setSelectedFriend(null)}
        onMessage={() => {
          setSelectedFriend(null);
          nav.openMessages();
        }}
      />
    </>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    emoji: { fontSize: 28 },
    postCard: { marginBottom: 16 },
    postHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.chipActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 20 },
    postText: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
    postUser: { fontWeight: '700', color: c.text },
    postTime: { fontSize: 12, color: c.textDim, marginTop: 4 },
    postBody: { backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 12 },
    postWorkout: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
    postActions: { flexDirection: 'row', gap: 20, alignItems: 'center' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
    actionCount: { fontSize: 13, color: c.textDim, fontWeight: '500' },
    shareBtn: { marginLeft: 'auto' },
    section: { marginBottom: 16 },
    challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    challengeName: { fontSize: 16, fontWeight: '600', color: c.text },
    challengeDesc: { fontSize: 13, color: c.textDim, marginTop: 4, lineHeight: 18 },
    challengeIcon: { fontSize: 24 },
    challengeProgress: { marginBottom: 12, gap: 6 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    meta: { fontSize: 12, color: c.textDim },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
    leaderTop: { backgroundColor: c.cardMuted },
    leaderHighlight: { borderWidth: 1, borderColor: 'rgba(99,102,241,0.5)' },
    leaderRank: { width: 24, fontSize: 14, fontWeight: '700', color: c.textDim },
    leaderAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.chipActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leaderName: { flex: 1, fontSize: 14, fontWeight: '500', color: c.text },
    leaderScore: { fontSize: 14, fontWeight: '700', color: c.indigo },
    addFriendsBtn: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.indigo,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: 'rgba(79,70,229,0.06)',
    },
    addFriendsText: { fontSize: 15, color: c.indigo, fontWeight: '600' },
    emptyFriends: { alignItems: 'center', padding: 32 },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 4 },
    emptySub: { fontSize: 13, color: c.textMuted, textAlign: 'center' },
    friendCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    friendAvatarWrap: { position: 'relative' },
    friendAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.chipActive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    friendAvatarText: { fontSize: 24 },
    onlineDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: c.green,
      borderWidth: 2,
      borderColor: c.background,
    },
    friendName: { fontSize: 15, fontWeight: '600', color: c.text },
    friendStatus: { fontSize: 13, color: c.textMuted, marginTop: 3, lineHeight: 18 },
    friendLast: { fontSize: 11, color: c.textDim, marginTop: 4 },
    viewFriendBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: 'rgba(79,70,229,0.12)',
      borderRadius: 8,
    },
    viewFriendText: { fontSize: 13, color: c.indigo, fontWeight: '600' },
    badgeSummary: { alignItems: 'center', marginBottom: 16, gap: 8 },
    badgeCount: { fontSize: 28, fontWeight: '700', color: c.text },
    badgeSub: { fontSize: 14, color: c.textDim },
    streakRow: { flexDirection: 'row', gap: 12 },
    streakBox: { flex: 1, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, alignItems: 'center' },
    streakNum: { fontSize: 24, fontWeight: '700' },
    streakLabel: { fontSize: 11, color: c.textDim, marginTop: 4 },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    badgeCard: { width: '30%', alignItems: 'center', padding: 12 },
    badgeLocked: { opacity: 0.5 },
    badgeIcon: { fontSize: 28, marginBottom: 8 },
    badgeName: { fontSize: 11, fontWeight: '500', color: c.text, textAlign: 'center' },
    badgeDesc: { fontSize: 10, color: c.textDim, textAlign: 'center', marginTop: 4 },
    badgeDate: { fontSize: 10, color: c.amber, marginTop: 4 },
  });
