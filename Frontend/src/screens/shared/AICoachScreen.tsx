import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { OverlayHeader } from '@/components/ui/OverlayHeader';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  from: 'user' | 'coach';
}

const coachReplies = [
  'Based on your recent volume, I recommend increasing bench press by 2.5kg next session.',
  'Your protein intake has been low — try adding a shake post-workout.',
  'Recovery score is 78%. Consider a deload week with 60% volume.',
  'Great consistency! You hit 4 workouts this week. Keep it up! 🔥',
];

export function AICoachScreen({ state, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hey ${state.profile.name.split(' ')[0]}! I'm your FitAI Coach. Ask me about workouts, nutrition, or recovery.`, from: 'coach' },
  ]);
  const [draft, setDraft] = useState('');
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, text, from: 'user' }]);
    setDraft('');
    setTimeout(() => {
      const reply = coachReplies[Math.floor(Math.random() * coachReplies.length)];
      setMessages((prev) => [...prev, { id: `c${Date.now()}`, text: reply, from: 'coach' }]);
    }, 800);
  };

  return (
    <ScreenContainer
      scroll={false}
      header={<OverlayHeader title="AI Coach" subtitle="Personalized fitness advice" onClose={onClose} />}
      contentStyle={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.messages}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.from === 'user' && styles.bubbleRowUser]}>
              <View style={[styles.bubble, m.from === 'coach' ? { backgroundColor: colors.cardMuted } : { backgroundColor: colors.chipActive }]}>
                {m.from === 'coach' && <Text style={styles.coachLabel}>🤖 FitAI Coach</Text>}
                <Text style={[styles.bubbleText, { color: m.from === 'user' ? '#ffffff' : colors.text }]}>{m.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardMuted, color: colors.text }]}
            placeholder="Ask your coach..."
            placeholderTextColor={colors.textDim}
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable onPress={send} style={[styles.send, { backgroundColor: colors.chipActive }]}>
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    messages: { padding: 16, paddingBottom: 24, gap: 12 },
    bubbleRow: { flexDirection: 'row' },
    bubbleRowUser: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '85%', borderRadius: 16, padding: 14 },
    coachLabel: { fontSize: 11, fontWeight: '600', color: c.indigo, marginBottom: 4 },
    bubbleText: { fontSize: 15, lineHeight: 21 },
    inputBar: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
    input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
    send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    sendText: { color: '#ffffff', fontSize: 18 },
  });
