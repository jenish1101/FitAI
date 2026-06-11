import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Friend } from '@/types/models';

interface SuggestedUser {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  goal: string;
}

const suggestions: SuggestedUser[] = [
  { id: 's1', name: 'Jordan K.', avatar: '🧑', mutualFriends: 3, goal: 'Gain muscle' },
  { id: 's2', name: 'Taylor R.', avatar: '👱', mutualFriends: 1, goal: 'Lose fat' },
  { id: 's3', name: 'Riley S.', avatar: '🧔', mutualFriends: 5, goal: 'Strength' },
  { id: 's4', name: 'Casey W.', avatar: '👩‍🦱', mutualFriends: 2, goal: 'Recomposition' },
  { id: 's5', name: 'Morgan L.', avatar: '🧑‍🦰', mutualFriends: 0, goal: 'Gain muscle' },
];

interface Props {
  visible: boolean;
  existingFriends: Friend[];
  onClose: () => void;
  onAdd: (friend: Friend) => void;
}

export function AddFriendsModal({ visible, existingFriends, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const existingNames = useMemo(
    () => new Set(existingFriends.map((f) => f.name.toLowerCase())),
    [existingFriends],
  );

  const filtered = suggestions.filter((user) => {
    if (existingNames.has(user.name.toLowerCase())) return false;
    if (!query.trim()) return true;
    return user.name.toLowerCase().includes(query.toLowerCase());
  });

  const handleAdd = (user: SuggestedUser) => {
    if (addedIds.includes(user.id)) return;
    onAdd({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      status: 'New friend added! Say hi 👋',
      online: Math.random() > 0.5,
      lastWorkout: 'Recently',
      workouts: 20 + Math.floor(Math.random() * 80),
      streak: 1 + Math.floor(Math.random() * 14),
      goal: user.goal,
      memberSince: '2025-01-01',
    });
    setAddedIds((prev) => [...prev, user.id]);
  };

  const handleClose = () => {
    setQuery('');
    setAddedIds([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={[styles.close, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Add Friends</Text>
          <View style={styles.close} />
        </View>

        <View style={styles.body}>
          <View style={[styles.searchWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name..."
              placeholderTextColor={colors.textDim}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Suggested for you</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No users found</Text>
              </View>
            ) : (
              filtered.map((user) => {
                const isAdded = addedIds.includes(user.id);
                return (
                  <View
                    key={user.id}
                    style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.chipActive }]}>
                      <Text style={styles.avatarText}>{user.avatar}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                      <Text style={[styles.userMeta, { color: colors.textDim }]}>
                        {user.mutualFriends > 0
                          ? `${user.mutualFriends} mutual friends · `
                          : ''}
                        {user.goal}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleAdd(user)}
                      disabled={isAdded}
                      style={[
                        styles.addBtn,
                        isAdded
                          ? { backgroundColor: colors.cardMuted }
                          : { backgroundColor: 'rgba(79,70,229,0.12)' },
                      ]}>
                      <Text style={[styles.addBtnText, { color: isAdded ? colors.green : colors.indigo }]}>
                        {isAdded ? 'Added ✓' : 'Add'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>

          <GradientButton title="Done" onPress={handleClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    close: { width: 28, fontSize: 20, textAlign: 'center' },
    title: { fontSize: 17, fontWeight: '700' },
    body: { flex: 1, padding: 16 },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
    sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
    list: { paddingBottom: 16, gap: 10 },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 22 },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: '600' },
    userMeta: { fontSize: 12, marginTop: 2 },
    addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { fontSize: 13, fontWeight: '600' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyText: { fontSize: 14 },
  });
