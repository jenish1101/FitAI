import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChallengeDetailModal } from '@/components/modals/ChallengeDetailModal';
import { CommentsModal } from '@/components/modals/CommentsModal';
import { ExerciseDetailModal } from '@/components/modals/ExerciseDetailModal';
import { WorkoutBuilderModal } from '@/components/modals/WorkoutBuilderModal';
import { WorkoutPreviewModal } from '@/components/modals/WorkoutPreviewModal';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { ModalState } from '@/types/navigation';
import type { useAppState } from '@/store';

interface Props {
  modal: ModalState | null;
  onClose: () => void;
  state: ReturnType<typeof useAppState>;
  onStartWorkout: (id: import('@/store').WorkoutPlan) => void;
}

export function AppModals({ modal, onClose, state, onStartWorkout }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!modal) return null;

  if (modal.type === 'workout-preview' && modal.workout) {
    return (
      <WorkoutPreviewModal
        workout={modal.workout}
        visible
        onClose={onClose}
        onStart={() => {
          onClose();
          onStartWorkout(modal.workout!);
        }}
      />
    );
  }

  if (modal.type === 'workout-builder') {
    return (
      <WorkoutBuilderModal
        visible
        onClose={onClose}
        state={state}
        onCreated={(plan) => {
          state.setWorkoutPlans((prev) => [...prev, plan]);
          onClose();
          Alert.alert('Workout created', `"${plan.name}" added to your plan.`);
        }}
      />
    );
  }

  if (modal.type === 'exercise-detail' && modal.exercise) {
    return <ExerciseDetailModal exercise={modal.exercise} visible onClose={onClose} />;
  }

  if (modal.type === 'challenge-detail' && modal.challenge) {
    return (
      <ChallengeDetailModal
        challenge={modal.challenge}
        visible
        onClose={onClose}
        onUpdateProgress={(id, p) => state.updateChallengeProgress(id, p)}
      />
    );
  }

  if (modal.type === 'comments' && modal.postId) {
    return (
      <CommentsModal
        postId={modal.postId}
        postUser={modal.postUser ?? 'User'}
        visible
        onClose={onClose}
      />
    );
  }

  if (modal.type === 'info') {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={[styles.infoOverlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
          <Pressable
            style={[styles.infoCard, { backgroundColor: colors.card, marginBottom: insets.bottom }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>{modal.title}</Text>
            <ScrollView style={styles.infoScroll}>
              <Text style={[styles.infoBody, { color: colors.textMuted }]}>{modal.message}</Text>
            </ScrollView>
            <Pressable onPress={onClose} style={[styles.infoBtn, { backgroundColor: colors.chipActive }]}>
              <Text style={styles.infoBtnText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return null;
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    infoOverlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
    infoCard: { borderRadius: 16, padding: 20, maxHeight: '70%' },
    infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    infoScroll: { maxHeight: 280 },
    infoBody: { fontSize: 15, lineHeight: 22 },
    infoBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    infoBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  });
