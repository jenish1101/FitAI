import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';

interface Props {
  postId: string;
  postUser: string;
  visible: boolean;
  onClose: () => void;
}

const initialComments = [
  { id: '1', user: 'Mike T.', text: 'Beast mode! 💪', time: '1h ago' },
  { id: '2', user: 'Emma L.', text: 'What was your bench working weight?', time: '2h ago' },
];

export function CommentsModal({ postUser, visible, onClose }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState('');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [...prev, { id: `c${Date.now()}`, user: 'You', text, time: 'now' }]);
    setDraft('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.back, { color: colors.indigo }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Comments on {postUser}&apos;s post</Text>
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {comments.map((c) => (
            <View key={c.id} style={[styles.comment, { backgroundColor: colors.cardMuted }]}>
              <Text style={[styles.user, { color: colors.text }]}>{c.user}</Text>
              <Text style={[styles.text, { color: colors.textSecondary }]}>{c.text}</Text>
              <Text style={[styles.time, { color: colors.textDim }]}>{c.time}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.inputBar, { borderTopColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textDim}
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable onPress={send} style={[styles.send, { backgroundColor: colors.chipActive }]}>
            <Text style={styles.sendText}>Post</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
    back: { fontSize: 16, fontWeight: '600' },
    title: { fontSize: 16, fontWeight: '600' },
    list: { padding: 16, gap: 10 },
    comment: { padding: 14, borderRadius: 12 },
    user: { fontSize: 14, fontWeight: '600' },
    text: { fontSize: 14, marginTop: 4, lineHeight: 20 },
    time: { fontSize: 11, marginTop: 6 },
    inputBar: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
    input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
    send: { paddingHorizontal: 16, borderRadius: 22, justifyContent: 'center' },
    sendText: { color: '#ffffff', fontWeight: '600' },
  });
