import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppModals } from '@/components/modals/AppModals';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  ActiveWorkout,
  AICoachScreen,
  AuthScreen,
  CommunityScreen,
  EditProfileScreen,
  HomeScreen,
  LeaderboardScreen,
  MeasurementsScreen,
  MessagesScreen,
  NotificationsScreen,
  NutritionScreen,
  OnboardingScreen,
  PRTrackerScreen,
  ProfileScreen,
  ProgramLibraryScreen,
  ProgressScreen,
  RecoveryScreen,
  SettingsScreen,
  SplashScreen,
  StreakScreen,
  WeeklyReportScreen,
  WorkoutHistoryScreen,
  WorkoutScreen,
} from '@/screens';
import type { WorkoutLog, WorkoutPlan } from '@/types/models';
import type { AppNavigation, ModalState, OverlayScreen } from '@/types/navigation';

export function AppRoot() {
  const state = useApp();
  const { colors } = useTheme();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [overlayStack, setOverlayStack] = useState<NonNullable<OverlayScreen>[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);

  const overlay = overlayStack[overlayStack.length - 1] ?? null;

  const openOverlay = useCallback((screen: NonNullable<OverlayScreen>) => {
    setOverlayStack((prev) => [...prev, screen]);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const closeAllOverlays = useCallback(() => {
    setOverlayStack([]);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((m: ModalState) => setModal(m), []);

  const nav: AppNavigation = useMemo(
    () => ({
      overlay,
      modal,
      openOverlay,
      closeOverlay,
      openModal,
      closeModal,
      openMessages: () => {
        closeAllOverlays();
        state.setCurrentTab('messages');
      },
      startWorkout: (workout) => setActiveWorkout(workout),
    }),
    [overlay, modal, openOverlay, closeOverlay, closeAllOverlays, openModal, closeModal, state],
  );

  const handleTabChange = (tab: string) => {
    closeAllOverlays();
    state.setCurrentTab(tab);
  };

  useEffect(() => {
    if (state.isLoggedIn && state.isOnboarded) {
      closeAllOverlays();
      setModal(null);
      setActiveWorkout(null);
    }
  }, [state.isLoggedIn, state.isOnboarded, closeAllOverlays]);

  if (state.showSplash) {
    return <SplashScreen />;
  }

  if (!state.isLoggedIn) {
    return (
      <AuthScreen onAuthSuccess={state.handleAuthSuccess} />
    );
  }

  if (!state.isOnboarded) {
    return (
      <OnboardingScreen
        profile={state.profile}
        setProfile={state.setProfile}
        onComplete={() => state.completeOnboarding()}
      />
    );
  }

  if (activeWorkout) {
    return (
      <ActiveWorkout
        workout={activeWorkout}
        onFinish={async (log: WorkoutLog) => {
          await state.finishWorkout(activeWorkout, log);
          setActiveWorkout(null);
        }}
        onCancel={() => setActiveWorkout(null)}
      />
    );
  }

  const renderOverlay = () => {
    switch (overlay) {
      case 'profile':
        return <ProfileScreen state={state} nav={nav} onClose={closeOverlay} />;
      case 'streak':
        return <StreakScreen state={state} onClose={closeOverlay} />;
      case 'notifications':
        return <NotificationsScreen state={state} onClose={closeOverlay} />;
      case 'settings':
        return <SettingsScreen nav={nav} onClose={closeOverlay} />;
      case 'ai-coach':
        return <AICoachScreen state={state} onClose={closeOverlay} />;
      case 'workout-history':
        return <WorkoutHistoryScreen state={state} onClose={closeOverlay} />;
      case 'edit-profile':
        return <EditProfileScreen state={state} onClose={closeOverlay} />;
      case 'weekly-report':
        return <WeeklyReportScreen state={state} onClose={closeOverlay} />;
      case 'recovery':
        return <RecoveryScreen state={state} onClose={closeOverlay} />;
      case 'measurements':
        return <MeasurementsScreen state={state} onClose={closeOverlay} />;
      case 'leaderboard':
        return <LeaderboardScreen state={state} onClose={closeOverlay} />;
      case 'prs':
        return <PRTrackerScreen state={state} onClose={closeOverlay} />;
      case 'programs':
        return <ProgramLibraryScreen state={state} onClose={closeOverlay} />;
      default:
        return null;
    }
  };

  const renderScreen = () => {
    const overlayScreen = renderOverlay();
    if (overlayScreen) return overlayScreen;

    switch (state.currentTab) {
      case 'home':
        return (
          <HomeScreen
            state={state}
            nav={nav}
            onStartWorkout={setActiveWorkout}
          />
        );
      case 'workout':
        return <WorkoutScreen state={state} nav={nav} onStartWorkout={setActiveWorkout} />;
      case 'nutrition':
        return <NutritionScreen state={state} />;
      case 'progress':
        return <ProgressScreen state={state} nav={nav} />;
      case 'community':
        return <CommunityScreen state={state} nav={nav} />;
      case 'messages':
        return <MessagesScreen state={state} />;
      default:
        return (
          <HomeScreen
            state={state}
            nav={nav}
            onStartWorkout={setActiveWorkout}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNav
        currentTab={overlayStack.length > 0 ? '' : state.currentTab}
        setCurrentTab={handleTabChange}
      />
      <AppModals modal={modal} onClose={closeModal} state={state} onStartWorkout={setActiveWorkout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
