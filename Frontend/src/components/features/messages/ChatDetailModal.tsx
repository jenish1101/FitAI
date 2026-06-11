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

export interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  unreadCount: number;
  messages: ChatMessage[];
}

interface Props {
  conversation: Conversation | null;
  visible: boolean;
  onClose: () => void;
  onSend: (conversationId: string, text: string) => void;
}

export function ChatDetailModal({ conversation, visible, onClose, onSend }: Props) {
  const [draft, setDraft] = useState('');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!conversation) return null;

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(conversation.id, text);
    setDraft('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.indigo }]}>← Back</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerAvatar}>{conversation.avatar}</Text>
            <View style={styles.flex1}>
              <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
                {conversation.name}
              </Text>
              <Text style={[styles.headerStatus, { color: conversation.online ? colors.green : colors.textDim }]}>
                {conversation.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {conversation.messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.bubbleRow, msg.sent ? styles.bubbleRowSent : styles.bubbleRowReceived]}>
                <View
                  style={[
                    styles.bubble,
                    msg.sent
                      ? { backgroundColor: colors.chipActive }
                      : { backgroundColor: colors.cardMuted },
                  ]}>
                  <Text style={[styles.bubbleText, { color: msg.sent ? '#ffffff' : colors.text }]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.bubbleTime, { color: msg.sent ? 'rgba(255,255,255,0.7)' : colors.textDim }]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.cardBorder,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textDim}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              style={[styles.sendBtn, { backgroundColor: colors.chipActive, opacity: draft.trim() ? 1 : 0.5 }]}
              disabled={!draft.trim()}>
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1, minWidth: 0 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 8,
    },
    backBtn: { paddingRight: 4 },
    backText: { fontSize: 16, fontWeight: '600' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
    headerAvatar: { fontSize: 28 },
    headerName: { fontSize: 16, fontWeight: '600' },
    headerStatus: { fontSize: 12, marginTop: 1 },
    messages: { padding: 16, paddingBottom: 24, gap: 10 },
    bubbleRow: { flexDirection: 'row' },
    bubbleRowSent: { justifyContent: 'flex-end' },
    bubbleRowReceived: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 100,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendIcon: { fontSize: 18, color: '#ffffff' },
  });
