import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { AppNavigation } from '@/types/navigation';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
  nav?: AppNavigation;
  onClose?: () => void;
}

const premiumAlert = () =>
  Alert.alert('FitAI Premium', 'Subscription flow would open here. Enjoy all premium features in demo mode!');

export function ProfileScreen({ state, nav, onClose }: Props) {
  const { profile } = state;
  const [showPremium, setShowPremium] = useState(false);
  const styles = useThemedStyles(createStyles);
  const { colors, isDark, toggleColorScheme } = useTheme();
  const memberDays = Math.floor(
    (Date.now() - new Date(profile.memberSince).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (showPremium) {
    return (
      <ScreenContainer contentStyle={styles.content}>
        <Pressable onPress={() => setShowPremium(false)} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.premiumHeader}>
          <Text style={styles.premiumEmoji}>👑</Text>
          <Text style={styles.premiumTitle}>FitAI Premium</Text>
          <Text style={styles.premiumSub}>Unlock your full potential</Text>
        </View>

        {[
          { icon: '🤖', title: 'AI Workout Adjuster', desc: 'Auto-adjusts sets, reps & weight based on performance' },
          { icon: '🥗', title: 'AI Nutrition Coach', desc: 'Personalized meal plans & macro adjustments' },
          { icon: '📊', title: 'Advanced Analytics', desc: 'Deep insights, periodization & recovery scoring' },
          { icon: '📋', title: 'Unlimited Plans', desc: 'Create unlimited custom workout plans' },
          { icon: '🎯', title: 'Smart Deload', desc: 'AI-predicted deload weeks for optimal recovery' },
          { icon: '📱', title: 'Wearable Sync', desc: 'Apple Health, Google Fit & smartwatch integration' },
          { icon: '📄', title: 'Export to PDF', desc: 'Download your plans and progress reports' },
        ].map((f, i) => (
          <Card key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.flex1}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </Card>
        ))}

        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.priceCard}>
          <Text style={styles.priceLabel}>Monthly</Text>
          <Text style={styles.priceValue}>
            $9.99<Text style={styles.priceUnit}>/mo</Text>
          </Text>
          <GradientButton title="Subscribe Monthly" onPress={premiumAlert} small />
        </LinearGradient>

        <LinearGradient colors={['#d97706', '#ea580c']} style={[styles.priceCard, { marginTop: 12 }]}>
          <View style={styles.saveBadge}>
            <Text style={styles.saveText}>SAVE 40%</Text>
          </View>
          <Text style={styles.priceLabel}>Yearly</Text>
          <Text style={styles.priceValue}>
            $71.99<Text style={styles.priceUnit}>/yr</Text>
          </Text>
          <Text style={styles.priceNote}>$5.99/mo billed annually</Text>
          <Pressable style={styles.subscribeBtn} onPress={premiumAlert}>
            <Text style={styles.subscribeText}>Subscribe Yearly</Text>
          </Pressable>
        </LinearGradient>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.content}>
      {onClose ? (
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      ) : null}
      <LinearGradient colors={[...colors.gradientHero]} style={styles.profileHeader}>
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{profile.name.charAt(0)}</Text>
        </LinearGradient>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
        {nav && (
          <Pressable onPress={() => nav.openOverlay('edit-profile')} style={styles.editBtn}>
            <Text style={[styles.editBtnText, { color: colors.indigo }]}>Edit Profile</Text>
          </Pressable>
        )}
        {profile.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>👑 Premium Member</Text>
          </View>
        )}
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatNum, { color: colors.indigo }]}>{profile.totalWorkouts}</Text>
            <Text style={styles.profileStatLabel}>Workouts</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatNum, { color: colors.orange }]}>{profile.streak}</Text>
            <Text style={styles.profileStatLabel}>Streak</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={[styles.profileStatNum, { color: colors.cyan }]}>{memberDays}</Text>
            <Text style={styles.profileStatLabel}>Days</Text>
          </View>
        </View>
      </LinearGradient>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Profile Details</Text>
        {[
          { label: 'Age', value: `${profile.age} years` },
          { label: 'Gender', value: profile.gender },
          { label: 'Height', value: `${profile.height} cm` },
          { label: 'Weight', value: `${profile.weight} kg` },
          { label: 'Goal', value: profile.goal },
          { label: 'Experience', value: profile.experience },
          { label: 'Environment', value: profile.environment },
          { label: 'Frequency', value: profile.frequency },
        ].map((item, i) => (
          <View key={i} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Daily Targets</Text>
        <View style={styles.targetsGrid}>
          {[
            { value: profile.calorieTarget, label: 'Calories', color: colors.indigo },
            { value: `${profile.proteinTarget}g`, label: 'Protein', color: colors.violet },
            { value: `${profile.carbsTarget}g`, label: 'Carbs', color: colors.cyan },
            { value: `${profile.fatsTarget}g`, label: 'Fats', color: colors.amber },
          ].map((t, i) => (
            <View key={i} style={styles.targetBox}>
              <Text style={[styles.targetValue, { color: t.color }]}>{t.value}</Text>
              <Text style={styles.targetLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Pressable onPress={() => nav?.openOverlay('weekly-report')}>
        <Card style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>🤖 AI Weekly Report</Text>
            <Text style={{ color: colors.indigo, fontSize: 13, fontWeight: '600' }}>Full report →</Text>
          </View>
        {[
          { icon: '📊', text: 'You trained chest 2x this week — volume is optimal.' },
          { icon: '⚠️', text: 'Protein intake was 15% below target on average.' },
          { icon: '📈', text: 'Overall strength improved 4% — great progress!' },
          { icon: '😴', text: 'Recovery score: 78%. Consider a deload next week.' },
        ].map((r, i) => (
          <View key={i} style={styles.reportRow}>
            <Text>{r.icon}</Text>
            <Text style={styles.reportText}>{r.text}</Text>
          </View>
        ))}
        </Card>
      </Pressable>

      <Card style={styles.settingsCard}>
        <Text style={[styles.sectionTitle, { padding: 16, paddingBottom: 8 }]}>⚙️ Settings</Text>
        {[
          { icon: '👑', label: 'Upgrade to Premium', action: () => setShowPremium(true), accent: true },
          { icon: '⚙️', label: 'Settings', action: () => nav?.openOverlay('settings') },
          { icon: '🔔', label: 'Notifications', action: () => nav?.openOverlay('notifications') },
          { icon: '📚', label: 'Program Library', action: () => nav?.openOverlay('programs') },
          { icon: '😴', label: 'Recovery & Sleep', action: () => nav?.openOverlay('recovery') },
          { icon: isDark ? '☀️' : '🌙', label: isDark ? 'Light Mode' : 'Dark Mode', action: toggleColorScheme },
        ].map((item, i) => (
          <Pressable key={i} onPress={item.action} style={styles.settingRow}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={[styles.settingLabel, item.accent && styles.settingAccent]}>{item.label}</Text>
            <Text style={styles.settingChevron}>›</Text>
          </Pressable>
        ))}
      </Card>

      <Pressable
        onPress={() => {
          void state.signOut();
        }}
        style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>FitAI v1.0.0 · Made with ❤️</Text>
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1 },
    backBtn: { marginBottom: 24 },
    backText: { fontSize: 16, color: c.textMuted },
    premiumHeader: { alignItems: 'center', marginBottom: 32 },
    premiumEmoji: { fontSize: 48, marginBottom: 16 },
    premiumTitle: { fontSize: 24, fontWeight: '700', color: c.text },
    premiumSub: { fontSize: 14, color: c.textMuted, marginTop: 4 },
    featureCard: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    featureIcon: { fontSize: 22 },
    featureTitle: { fontSize: 14, fontWeight: '500', color: c.text },
    featureDesc: { fontSize: 12, color: c.textDim, marginTop: 2 },
    priceCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 16 },
    priceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
    priceValue: { fontSize: 32, fontWeight: '700', color: c.text, marginTop: 4 },
    priceUnit: { fontSize: 14, fontWeight: '400' },
    priceNote: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 12 },
    saveBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    saveText: { fontSize: 10, fontWeight: '700', color: c.text },
    subscribeBtn: { width: '100%', paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center' },
    subscribeText: { color: c.text, fontWeight: '600', fontSize: 14 },
    profileHeader: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
    profileAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    closeBtn: { marginBottom: 12 },
    profileAvatarText: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
    profileName: { fontSize: 20, fontWeight: '700', color: c.text },
    profileEmail: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    editBtn: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 16 },
    editBtnText: { fontSize: 14, fontWeight: '600' },
    premiumBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 20 },
    premiumBadgeText: { fontSize: 12, fontWeight: '500', color: '#fbbf24' },
    profileStats: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
    profileStat: { flex: 1, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, alignItems: 'center' },
    profileStatNum: { fontSize: 18, fontWeight: '700' },
    profileStatLabel: { fontSize: 11, color: c.textDim, marginTop: 2 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.cardBorder },
    detailLabel: { fontSize: 14, color: c.textMuted },
    detailValue: { fontSize: 14, fontWeight: '500', color: c.text },
    targetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    targetBox: { width: '47%', backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, alignItems: 'center' },
    targetValue: { fontSize: 20, fontWeight: '700' },
    targetLabel: { fontSize: 12, color: c.textDim, marginTop: 4 },
    reportRow: { flexDirection: 'row', gap: 8, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 8 },
    reportText: { flex: 1, fontSize: 14, color: c.textSecondary },
    settingsCard: { padding: 0, overflow: 'hidden', marginBottom: 16 },
    settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.cardBorder },
    settingIcon: { fontSize: 18 },
    settingLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: c.text },
    settingAccent: { color: '#fbbf24' },
    settingChevron: { fontSize: 18, color: c.textDim },
    logoutBtn: { paddingVertical: 14, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 12, alignItems: 'center', marginBottom: 16 },
    logoutText: { fontSize: 14, fontWeight: '500', color: '#f87171' },
    version: { textAlign: 'center', fontSize: 12, color: c.textDim, marginBottom: 16 },
  });
