import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatDetailModal, type Conversation } from '@/components/features/messages/ChatDetailModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { TabSelector } from '@/components/ui/TabSelector';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
}

const initialConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Sarah M.',
    avatar: '👩‍🦰',
    online: true,
    unreadCount: 2,
    messages: [
      { id: 'm1', text: 'Hey! Are you hitting legs today?', sent: false, time: '10:30 AM' },
      { id: 'm2', text: 'Thinking about it! Maybe after work 💪', sent: true, time: '10:32 AM' },
      { id: 'm3', text: 'Great job on today\'s workout! Keep the streak going 🔥', sent: false, time: '2m ago' },
    ],
  },
  {
    id: 'c2',
    name: 'Mike T.',
    avatar: '👨‍🦱',
    online: true,
    unreadCount: 0,
    messages: [
      { id: 'm1', text: 'Want to join the 30-day challenge?', sent: false, time: '1h ago' },
      { id: 'm2', text: 'Count me in! Send the details.', sent: true, time: '55m ago' },
    ],
  },
  {
    id: 'c3',
    name: 'FitAI Coach',
    avatar: '🤖',
    online: true,
    unreadCount: 1,
    messages: [
      { id: 'm1', text: 'Your weekly report is ready 📊', sent: false, time: 'Yesterday' },
      { id: 'm2', text: 'You improved bench press by 5kg this week!', sent: false, time: 'Yesterday' },
    ],
  },
  {
    id: 'c4',
    name: 'Emma L.',
    avatar: '👩',
    online: false,
    unreadCount: 0,
    messages: [
      { id: 'm1', text: 'See you at the gym tomorrow morning?', sent: false, time: '2d ago' },
      { id: 'm2', text: 'Yes! 7 AM works for me.', sent: true, time: '2d ago' },
    ],
  },
  {
    id: 'c5',
    name: 'Chris P.',
    avatar: '👨',
    online: false,
    unreadCount: 0,
    messages: [
      { id: 'm1', text: 'Nice PR on deadlift! 🏆', sent: false, time: '3d ago' },
    ],
  },
];

function getPreview(conv: Conversation) {
  const last = conv.messages[conv.messages.length - 1];
  return last?.text ?? '';
}

function getTime(conv: Conversation) {
  const last = conv.messages[conv.messages.length - 1];
  return last?.time ?? '';
}

export function MessagesScreen({ state }: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { profile } = state;

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') {
      list = list.filter((c) => c.unreadCount > 0);
    } else if (filter === 'coaches') {
      list = list.filter((c) => c.name.includes('Coach'));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || getPreview(c).toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, filter, search]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSend = (conversationId: string, text: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, { id: `m${Date.now()}`, text, sent: true, time }],
            }
          : c,
      ),
    );
    setActiveChat((prev) =>
      prev?.id === conversationId
        ? {
            ...prev,
            messages: [...prev.messages, { id: `m${Date.now()}`, text, sent: true, time }],
          }
        : prev,
    );
  };

  const openChat = (conv: Conversation) => {
    const latest = conversations.find((c) => c.id === conv.id) ?? conv;
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
    );
    setActiveChat({ ...latest, unreadCount: 0 });
  };

  return (
    <>
      <ScreenContainer
        header={
          <>
            <View style={styles.header}>
              <View style={styles.flex1}>
                <Text style={styles.title}>Messages</Text>
                <Text style={styles.subtitle}>Stay connected with your fitness circle</Text>
              </View>
              <View style={[styles.headerIconBox, { backgroundColor: colors.cardMuted }]}>
                <Ionicons name="chatbubbles" size={26} color={colors.indigo} />
                {totalUnread > 0 && (
                  <View style={[styles.headerBadge, { backgroundColor: colors.red, borderColor: colors.background }]}>
                    <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.cardMuted }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search messages..."
                placeholderTextColor={colors.textDim}
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
              />
            </View>

            <TabSelector
              compact
              tabs={[
                { id: 'all', label: 'All', icon: '💬' },
                { id: 'unread', label: 'Unread', icon: '🔔' },
                { id: 'coaches', label: 'Coaches', icon: '🤖' },
              ]}
              activeTab={filter}
              onTabChange={setFilter}
            />
          </>
        }
        contentStyle={styles.content}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No messages found</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try a different search term.' : 'Start a conversation from the Social tab.'}
            </Text>
          </Card>
        ) : (
          filtered.map((conv) => {
            const unread = conv.unreadCount;
            const preview = getPreview(conv);
            const isCoach = conv.name.includes('Coach');

            return (
              <Pressable key={conv.id} onPress={() => openChat(conv)}>
                <Card style={styles.threadCard}>
                  <View style={styles.threadRow}>
                    <View style={styles.avatarWrap}>
                      <Text style={styles.avatar}>{conv.avatar}</Text>
                      {conv.online && (
                        <View style={[styles.onlineDot, { backgroundColor: colors.green, borderColor: colors.card }]} />
                      )}
                    </View>
                    <View style={styles.threadBody}>
                      <View style={styles.threadTop}>
                        <Text style={styles.threadName} numberOfLines={1}>
                          {conv.name}
                          {isCoach && ' ✨'}
                        </Text>
                        <Text style={styles.threadTime}>{getTime(conv)}</Text>
                      </View>
                      <View style={styles.threadBottom}>
                        <Text
                          style={[styles.threadPreview, unread > 0 && styles.threadPreviewUnread]}
                          numberOfLines={2}>
                          {preview}
                        </Text>
                        {unread > 0 && (
                          <View style={[styles.threadUnread, { backgroundColor: colors.indigo }]}>
                            <Text style={styles.threadUnreadText}>{unread}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Quick tip</Text>
          <Text style={styles.tipText}>
            Message your friends from Social → Friends, or chat with FitAI Coach for personalized
            workout advice, {profile.name.split(' ')[0]}.
          </Text>
        </Card>
      </ScreenContainer>

      <ChatDetailModal
        conversation={activeChat}
        visible={activeChat !== null}
        onClose={() => setActiveChat(null)}
        onSend={handleSend}
      />
    </>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1, minWidth: 0 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    headerIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    headerBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      borderWidth: 2,
    },
    unreadBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
    threadCard: { marginBottom: 10, paddingVertical: 14 },
    threadRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    avatarWrap: { position: 'relative', flexShrink: 0 },
    avatar: { fontSize: 32 },
    onlineDot: {
      position: 'absolute',
      bottom: 0,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
    },
    threadBody: { flex: 1, minWidth: 0 },
    threadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    threadName: { flex: 1, fontSize: 15, fontWeight: '600', color: c.text },
    threadTime: { fontSize: 11, color: c.textDim, flexShrink: 0 },
    threadBottom: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 },
    threadPreview: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 18 },
    threadPreviewUnread: { color: c.text, fontWeight: '500' },
    threadUnread: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      flexShrink: 0,
    },
    threadUnreadText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
    emptyCard: { alignItems: 'center', paddingVertical: 32 },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    emptySub: { fontSize: 14, color: c.textMuted, marginTop: 6, textAlign: 'center' },
    tipCard: { marginTop: 8 },
    tipTitle: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
    tipText: { fontSize: 13, color: c.textMuted, lineHeight: 19 },
  });
