import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/GradientButton';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { UserProfile } from '@/store';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onComplete: () => void;
}

const goals = [
  { id: 'Lose fat', icon: '🔥', desc: 'Burn fat, get lean' },
  { id: 'Gain muscle', icon: '💪', desc: 'Build size & strength' },
  { id: 'Recomposition', icon: '⚡', desc: 'Lose fat, gain muscle' },
  { id: 'Strength', icon: '🏋️', desc: 'Get stronger' },
];

const experiences = [
  { id: 'Beginner', icon: '🌱', desc: '< 6 months' },
  { id: 'Intermediate', icon: '🌿', desc: '6 months - 2 years' },
  { id: 'Advanced', icon: '🌳', desc: '2+ years' },
];

const environments = [
  { id: 'Gym', icon: '🏢', desc: 'Full gym access' },
  { id: 'Home', icon: '🏠', desc: 'Home equipment' },
  { id: 'No equipment', icon: '🤸', desc: 'Bodyweight only' },
  { id: 'Limited equipment', icon: '📦', desc: 'Dumbbells & bands' },
];

const frequencies = [
  { id: '2-3 days', icon: '📅', desc: 'Easy schedule' },
  { id: '4-5 days', icon: '📆', desc: 'Moderate schedule' },
  { id: '6 days', icon: '🗓️', desc: 'Intense schedule' },
];

const injuryOptions = ['Knee issues', 'Shoulder issues', 'Back pain', 'None'];

type OnboardingStyles = ReturnType<typeof createStyles>;

function OptionCard({
  icon,
  title,
  desc,
  selected,
  onPress,
  styles,
}: {
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
  styles: OnboardingStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}>
      <Text style={styles.optionIcon}>{icon}</Text>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDesc}>{desc}</Text>
      </View>
      {selected && <Text style={styles.check}>✓</Text>}
    </Pressable>
  );
}

export function OnboardingScreen({ profile, setProfile, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height.toString());
  const [weight, setWeight] = useState(profile.weight.toString());
  const [goal, setGoal] = useState(profile.goal);
  const [experience, setExperience] = useState(profile.experience);
  const [environment, setEnvironment] = useState(profile.environment);
  const [frequency, setFrequency] = useState(profile.frequency);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const calculatePlan = () => {
    const w = parseFloat(weight) || 82;
    const h = parseFloat(height) || 178;
    const a = parseInt(age, 10) || 28;
    const bmr =
      gender === 'Male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const activityMultiplier =
      frequency === '6 days' ? 1.725 : frequency === '4-5 days' ? 1.55 : 1.375;
    const tdee = bmr * activityMultiplier;
    const calorieTarget =
      goal === 'Lose fat' ? tdee - 500 : goal === 'Gain muscle' ? tdee + 300 : Math.round(tdee);
    const proteinTarget = Math.round(w * (goal === 'Gain muscle' ? 2.2 : 2));
    const fatsTarget = Math.round((calorieTarget * 0.25) / 9);
    const carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
    const workoutSplit =
      frequency === '2-3 days'
        ? 'Full Body'
        : frequency === '4-5 days'
          ? 'Push/Pull/Legs'
          : 'PPL + Upper/Lower';

    setProfile({
      ...profile,
      age: a,
      gender,
      height: h,
      weight: w,
      goal,
      experience,
      environment,
      frequency,
      injuries,
      calorieTarget: Math.round(calorieTarget),
      proteinTarget,
      carbsTarget,
      fatsTarget,
      workoutSplit,
    });
    setShowResult(true);
  };

  const toggleInjury = (injury: string) => {
    if (injury === 'None') {
      setInjuries([]);
      return;
    }
    setInjuries((prev) =>
      prev.includes(injury) ? prev.filter((i) => i !== injury) : [...prev.filter((i) => i !== 'None'), injury],
    );
  };

  if (showResult) {
    return (
      <LinearGradient colors={[...colors.backgroundGradient]} style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.resultHeader}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>✅</Text>
              </View>
              <Text style={styles.resultTitle}>Your AI Plan is Ready!</Text>
              <Text style={styles.resultSub}>Personalized for your goals</Text>
            </View>

            <Card style={styles.mb16}>
              <Text style={styles.cardLabel}>📊 Daily Targets</Text>
              <View style={styles.grid2}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.indigo }]}>{profile.calorieTarget}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.violet }]}>{profile.proteinTarget}g</Text>
                  <Text style={styles.statLabel}>Protein</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.cyan }]}>{profile.carbsTarget}g</Text>
                  <Text style={styles.statLabel}>Carbs</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.amber }]}>{profile.fatsTarget}g</Text>
                  <Text style={styles.statLabel}>Fats</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.mb16}>
              <Text style={styles.cardLabel}>🏋️ Workout Plan</Text>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.planName}>{profile.workoutSplit}</Text>
                  <Text style={styles.planSub}>{profile.frequency} per week</Text>
                </View>
                <Text style={styles.planEmoji}>🎯</Text>
              </View>
            </Card>

            <Card style={styles.mb24}>
              <Text style={styles.cardLabel}>🤖 AI Recommendation</Text>
              <Text style={styles.aiText}>
                Based on your profile as {experience.toLowerCase()} {gender.toLowerCase()}, {age}yo, {weight}kg —
                focusing on <Text style={styles.highlight}>{goal.toLowerCase()}</Text> with a{' '}
                {profile.workoutSplit} split. Progressive overload will be applied weekly.
              </Text>
            </Card>

            <GradientButton title="Let's Go! 🚀" onPress={onComplete} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...colors.backgroundGradient]} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.progressHeader}>
          {step > 0 && (
            <Pressable onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          )}
          <View style={styles.progressTrack}>
            <ProgressBar percent={progress} gradient={['#6366f1', '#8b5cf6']} />
          </View>
          <Text style={styles.stepCount}>
            {step + 1}/{totalSteps}
          </Text>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.stepScroll} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>Tell us about yourself</Text>
              <Text style={styles.stepSub}>We&apos;ll use this to personalize your experience</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Age</Text>
                <TextInput value={age} onChangeText={setAge} placeholder="28" placeholderTextColor={colors.textDim} keyboardType="number-pad" style={styles.input} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <Pressable key={g} onPress={() => setGender(g)} style={[styles.genderBtn, gender === g && styles.genderBtnActive]}>
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.row2}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput value={height} onChangeText={setHeight} placeholder="178" placeholderTextColor={colors.textDim} keyboardType="number-pad" style={styles.input} />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput value={weight} onChangeText={setWeight} placeholder="82" placeholderTextColor={colors.textDim} keyboardType="number-pad" style={styles.input} />
                </View>
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>What&apos;s your goal?</Text>
              <Text style={styles.stepSub}>This shapes everything — your plan, meals, and more</Text>
              {goals.map((g) => (
                <OptionCard key={g.id} icon={g.icon} title={g.id} desc={g.desc} selected={goal === g.id} onPress={() => setGoal(g.id)} styles={styles} />
              ))}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Experience Level</Text>
              <Text style={styles.stepSub}>This helps us set appropriate intensity</Text>
              {experiences.map((e) => (
                <OptionCard key={e.id} icon={e.icon} title={e.id} desc={e.desc} selected={experience === e.id} onPress={() => setExperience(e.id)} styles={styles} />
              ))}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Where do you train?</Text>
              <Text style={styles.stepSub}>We&apos;ll pick the right exercises for your setup</Text>
              {environments.map((e) => (
                <OptionCard key={e.id} icon={e.icon} title={e.id} desc={e.desc} selected={environment === e.id} onPress={() => setEnvironment(e.id)} styles={styles} />
              ))}
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>How often can you train?</Text>
              <Text style={styles.stepSub}>Consistency beats intensity</Text>
              {frequencies.map((f) => (
                <OptionCard key={f.id} icon={f.icon} title={f.id} desc={f.desc} selected={frequency === f.id} onPress={() => setFrequency(f.id)} styles={styles} />
              ))}
            </View>
          )}

          {step === 5 && (
            <View>
              <Text style={styles.stepTitle}>Any injuries or restrictions?</Text>
              <Text style={styles.stepSub}>We&apos;ll avoid problematic movements</Text>
              {injuryOptions.map((inj) => (
                <OptionCard
                  key={inj}
                  icon={inj === 'None' ? '✅' : '⚠️'}
                  title={inj}
                  desc=""
                  selected={inj === 'None' ? injuries.length === 0 : injuries.includes(inj)}
                  onPress={() => toggleInjury(inj)}
                  styles={styles}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            title={step < 5 ? 'Continue' : 'Generate My Plan 🤖'}
            onPress={() => (step < 5 ? setStep((s) => s + 1) : calculatePlan())}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
    backBtn: { padding: 4 },
    backText: { fontSize: 24, color: c.textMuted },
    progressTrack: { flex: 1 },
    stepCount: { fontSize: 12, color: c.textDim, fontWeight: '500' },
    stepScroll: { paddingHorizontal: 24, paddingBottom: 16 },
    stepTitle: { fontSize: 24, fontWeight: '700', color: c.text, marginBottom: 4 },
    stepSub: { fontSize: 14, color: c.textMuted, marginBottom: 24 },
    field: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '500', color: c.textMuted, marginBottom: 6 },
    input: {
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.text,
      fontSize: 16,
    },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      alignItems: 'center',
    },
    genderBtnActive: { backgroundColor: c.chipActive, borderColor: c.chipActive },
    genderText: { fontSize: 14, fontWeight: '500', color: c.textMuted },
    genderTextActive: { color: c.text },
    row2: { flexDirection: 'row', gap: 16 },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: c.inputBg,
      borderWidth: 2,
      borderColor: 'transparent',
      marginBottom: 12,
    },
    optionCardSelected: { backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: c.indigoLight },
    optionIcon: { fontSize: 28 },
    optionText: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    optionDesc: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    check: { color: c.indigo, fontSize: 18 },
    footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
    resultScroll: { paddingHorizontal: 24, paddingVertical: 32 },
    resultHeader: { alignItems: 'center', marginBottom: 32 },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.green,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    successEmoji: { fontSize: 32 },
    resultTitle: { fontSize: 24, fontWeight: '700', color: c.text },
    resultSub: { fontSize: 14, color: c.textMuted, marginTop: 4 },
    mb16: { marginBottom: 16 },
    mb24: { marginBottom: 24 },
    cardLabel: { fontSize: 14, fontWeight: '500', color: c.textMuted, marginBottom: 12 },
    grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statBox: {
      width: '47%',
      backgroundColor: c.cardMuted,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    statValue: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 12, color: c.textDim, marginTop: 4 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    planName: { fontSize: 18, fontWeight: '700', color: c.text },
    planSub: { fontSize: 14, color: c.textDim, marginTop: 2 },
    planEmoji: { fontSize: 28 },
    aiText: { fontSize: 14, color: c.textSecondary, lineHeight: 22 },
    highlight: { color: c.indigo, fontWeight: '500' },
  });
