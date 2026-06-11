import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { TabSelector } from '@/components/ui/TabSelector';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SimpleBarChart } from '@/components/ui/SimpleChart';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { useAppState } from '@/store';

interface Props {
  state: ReturnType<typeof useAppState>;
}

const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const mealIcons: Record<string, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

function CalorieRing({
  current,
  target,
  ringTrack,
  textColor,
  dimColor,
}: {
  current: number;
  target: number;
  ringTrack: string;
  textColor: string;
  dimColor: string;
}) {
  const size = 112;
  const percent = Math.min((current / target) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={ringTrack} strokeWidth={strokeWidth} fill="none" />
        <Defs>
          <LinearGradient id="calGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#818cf8" />
            <Stop offset="100%" stopColor="#22d3ee" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#calGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={ringStyles.center}>
        <Text style={[ringStyles.value, { color: textColor }]}>{current}</Text>
        <Text style={[ringStyles.target, { color: dimColor }]}>/ {target}</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 20, fontWeight: '700' },
  target: { fontSize: 11 },
});

export function NutritionScreen({ state }: Props) {
  const { profile, foodLogs, foods, addFoodEntry, removeFoodEntry, getWaterForToday, setWaterForToday } =
    state;
  const [activeTab, setActiveTab] = useState('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const waterGlasses = getWaterForToday() || 5;
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const totalCalories = foodLogs.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foodLogs.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = foodLogs.reduce((s, f) => s + f.carbs, 0);
  const totalFats = foodLogs.reduce((s, f) => s + f.fats, 0);
  const remaining = profile.calorieTarget - totalCalories;

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addFood = (food: (typeof foods)[0]) => {
    void addFoodEntry({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      meal: selectedMeal,
      portion: 1,
      date: new Date().toISOString().split('T')[0],
    });
    setActiveTab('log');
  };

  const weeklyData = [
    { label: 'Mon', value: 2450, over: false },
    { label: 'Tue', value: 2680, over: true },
    { label: 'Wed', value: 2520, over: false },
    { label: 'Thu', value: 2300, over: false },
    { label: 'Fri', value: 2590, over: false },
    { label: 'Sat', value: 2700, over: true },
    { label: 'Sun', value: totalCalories, over: totalCalories > profile.calorieTarget },
  ];

  return (
    <ScreenContainer
      header={
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Nutrition</Text>
              <Text style={styles.subtitle}>
                {remaining > 0 ? `${remaining} kcal remaining` : 'Target reached!'}
              </Text>
            </View>
            <Text style={styles.emoji}>🥗</Text>
          </View>
          <TabSelector
            compact
            tabs={[
              { id: 'log', label: 'Log', icon: '📝' },
              { id: 'search', label: 'Add', icon: '🔍' },
              { id: 'meals', label: 'Meals', icon: '🍽️' },
              { id: 'analysis', label: 'Stats', icon: '📊' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      }
      contentStyle={styles.content}>
      {activeTab === 'log' && (
        <View>
          <Card style={styles.calorieCard}>
            <CalorieRing
              current={totalCalories}
              target={profile.calorieTarget}
              ringTrack={colors.ringTrack}
              textColor={colors.text}
              dimColor={colors.textDim}
            />
            <View style={styles.macroList}>
              {[
                { label: 'Protein', value: totalProtein, target: profile.proteinTarget, color: colors.indigo },
                { label: 'Carbs', value: totalCarbs, target: profile.carbsTarget, color: colors.cyan },
                { label: 'Fats', value: totalFats, target: profile.fatsTarget, color: colors.amber },
              ].map((m) => (
                <View key={m.label} style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                    <Text style={styles.macroVal}>
                      {Math.round(m.value)}g / {m.target}g
                    </Text>
                  </View>
                  <ProgressBar percent={(m.value / m.target) * 100} color={m.color} height={6} />
                </View>
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>💧 Water Intake</Text>
              <Text style={styles.meta}>{waterGlasses} / 8 glasses</Text>
            </View>
            <View style={styles.waterRow}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setWaterForToday(i + 1)}
                  style={[styles.waterGlass, i < waterGlasses && styles.waterFilled]}>
                  <Text style={styles.waterEmoji}>{i < waterGlasses ? '💧' : ''}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {meals.map((meal) => {
            const mealFoods = foodLogs.filter((f) => f.meal === meal);
            const mealCals = mealFoods.reduce((s, f) => s + f.calories, 0);
            return (
              <Card key={meal} style={styles.section}>
                <View style={styles.rowBetween}>
                  <View style={styles.mealHeader}>
                    <Text>{mealIcons[meal]}</Text>
                    <Text style={styles.sectionTitle}>{meal}</Text>
                  </View>
                  <Text style={styles.meta}>{mealCals} kcal</Text>
                </View>
                {mealFoods.length === 0 ? (
                  <Text style={styles.emptyMeal}>No foods logged</Text>
                ) : (
                  mealFoods.map((food) => (
                    <View key={food.id} style={styles.foodRow}>
                      <View>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodMacro}>
                          {food.protein}P · {food.carbs}C · {food.fats}F
                        </Text>
                      </View>
                      <View style={styles.foodRight}>
                        <Text style={styles.foodCal}>{food.calories} kcal</Text>
                        <Pressable onPress={() => removeFoodEntry(food.id)}>
                          <Text style={styles.removeBtn}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
                <Pressable
                  onPress={() => {
                    setSelectedMeal(meal);
                    setActiveTab('search');
                  }}
                  style={styles.addFoodBtn}>
                  <Text style={styles.addFoodText}>+ Add Food</Text>
                </Pressable>
              </Card>
            );
          })}
        </View>
      )}

      {activeTab === 'search' && (
        <View>
          <Text style={styles.addingTo}>Adding to:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealChips}>
            {meals.map((m) => (
              <Pressable
                key={m}
                onPress={() => setSelectedMeal(m)}
                style={[styles.mealChip, selectedMeal === m && styles.mealChipActive]}>
                <Text style={[styles.mealChipText, selectedMeal === m && styles.mealChipTextActive]}>
                  {mealIcons[m]} {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods..."
              placeholderTextColor={colors.textDim}
              style={styles.searchInput}
            />
          </View>

          <Card style={styles.barcodeCard}>
            <Text style={styles.barcodeIcon}>📷</Text>
            <View>
              <Text style={styles.barcodeTitle}>Scan Barcode</Text>
              <Text style={styles.barcodeSub}>Quick add using barcode scanner</Text>
            </View>
          </Card>

          {filteredFoods.map((food, i) => (
            <Pressable key={i} onPress={() => addFood(food)} style={styles.foodSearchItem}>
              <View style={styles.foodSearchIcon}>
                <Text>🍽️</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.foodName} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={styles.foodMacro}>
                  {food.portion} · {food.protein}P · {food.carbs}C · {food.fats}F
                </Text>
              </View>
              <View>
                <Text style={styles.foodCalBold}>{food.calories}</Text>
                <Text style={styles.kcalLabel}>kcal</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {activeTab === 'meals' && (
        <View>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ AI Meal Plan</Text>
            <Text style={styles.mealPlanSub}>
              Personalized for {profile.goal.toLowerCase()} · {profile.calorieTarget} kcal/day
            </Text>
          </Card>
          {[
            {
              meal: 'Breakfast',
              icon: '🌅',
              items: ['Oatmeal + banana', 'Whey protein shake'],
              cals: 420,
              protein: 35,
            },
            {
              meal: 'Lunch',
              icon: '☀️',
              items: ['Chicken breast 150g', 'Brown rice', 'Broccoli'],
              cals: 580,
              protein: 52,
            },
            {
              meal: 'Dinner',
              icon: '🌙',
              items: ['Salmon 120g', 'Sweet potato', 'Mixed salad'],
              cals: 520,
              protein: 42,
            },
            {
              meal: 'Snack',
              icon: '🍎',
              items: ['Greek yogurt', 'Almonds'],
              cals: 280,
              protein: 22,
            },
          ].map((plan) => (
            <Card key={plan.meal} style={styles.mealPlanCard}>
              <View style={styles.mealPlanHeader}>
                <Text style={styles.mealPlanIcon}>{plan.icon}</Text>
                <View style={styles.flex1}>
                  <Text style={styles.mealPlanName}>{plan.meal}</Text>
                  <Text style={styles.mealPlanItems}>{plan.items.join(' · ')}</Text>
                </View>
                <View>
                  <Text style={[styles.mealPlanCals, { color: colors.indigo }]}>{plan.cals}</Text>
                  <Text style={styles.mealPlanMacro}>{plan.protein}g protein</Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  plan.items.forEach((item) => {
                    void addFoodEntry({
                      name: item,
                      calories: Math.round(plan.cals / plan.items.length),
                      protein: Math.round(plan.protein / plan.items.length),
                      carbs: 20,
                      fats: 8,
                      meal: plan.meal,
                      portion: 1,
                      date: new Date().toISOString().split('T')[0],
                    });
                  });
                  setActiveTab('log');
                }}
                style={[styles.logMealBtn, { backgroundColor: colors.chipActive }]}>
                <Text style={styles.logMealText}>Log this meal</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'analysis' && (
        <View>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Weekly Calories</Text>
            <SimpleBarChart data={weeklyData} />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI Nutrition Coach</Text>
            {[
              { icon: '📉', text: 'Your average protein intake was 12% below target this week. Try adding an extra protein shake post-workout.' },
              { icon: '🔄', text: 'Consider swapping white rice for quinoa to boost fiber and protein.' },
              { icon: '🛒', text: 'AI Grocery List: Chicken breast, Greek yogurt, oats, broccoli, eggs, almonds.' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipBox}>
                <Text>{tip.icon}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </Card>

          <View style={styles.statsGrid}>
            {[
              { value: '87%', label: 'Adherence Rate', color: colors.green },
              { value: '2,534', label: 'Avg Daily Cal', color: colors.indigo },
              { value: '162g', label: 'Avg Protein', color: colors.violet },
              { value: '-2.3kg', label: 'Weight Change', color: colors.cyan },
            ].map((s, i) => (
              <Card key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Card>
            ))}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    content: { paddingBottom: 100 },
    flex1: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 2 },
    emoji: { fontSize: 28 },
    mealPlanSub: { fontSize: 14, color: c.textMuted, marginTop: -8 },
    mealPlanCard: { marginBottom: 12 },
    mealPlanHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
    mealPlanIcon: { fontSize: 24 },
    mealPlanName: { fontSize: 16, fontWeight: '600', color: c.text },
    mealPlanItems: { fontSize: 13, color: c.textMuted, marginTop: 4, lineHeight: 18 },
    mealPlanCals: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
    mealPlanMacro: { fontSize: 11, color: c.textDim, textAlign: 'right' },
    logMealBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    logMealText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
    calorieCard: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
    macroList: { flex: 1, gap: 12 },
    macroItem: { gap: 4 },
    macroHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    macroLabel: { fontSize: 12, color: c.textMuted },
    macroVal: { fontSize: 12, color: c.textDim },
    section: { marginBottom: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    meta: { fontSize: 14, color: c.textMuted },
    waterRow: { flexDirection: 'row', gap: 6 },
    waterGlass: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      backgroundColor: c.chipBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waterFilled: { backgroundColor: 'rgba(6,182,212,0.3)', borderColor: 'rgba(6,182,212,0.5)' },
    waterEmoji: { fontSize: 12 },
    mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    emptyMeal: { fontSize: 14, color: c.textDim, fontStyle: 'italic', marginBottom: 12 },
    foodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.cardMuted,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },
    foodName: { fontSize: 14, color: c.text },
    foodMacro: { fontSize: 12, color: c.textDim, marginTop: 2 },
    foodRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    foodCal: { fontSize: 14, color: c.textMuted },
    removeBtn: { color: 'rgba(239,68,68,0.6)', fontSize: 14 },
    addFoodBtn: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.cardBorder,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    addFoodText: { fontSize: 14, color: c.textDim },
    addingTo: { fontSize: 14, color: c.textMuted, marginBottom: 8 },
    mealChips: { marginBottom: 16 },
    mealChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: c.chipBg, marginRight: 8 },
    mealChipActive: { backgroundColor: c.chipActive },
    mealChipText: { fontSize: 12, fontWeight: '500', color: c.textMuted },
    mealChipTextActive: { color: c.text },
    searchWrap: { position: 'relative', marginBottom: 16 },
    searchIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
    searchInput: {
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingLeft: 40,
      paddingVertical: 14,
      color: c.text,
      fontSize: 16,
    },
    barcodeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    barcodeIcon: { fontSize: 24 },
    barcodeTitle: { fontSize: 14, fontWeight: '500', color: c.text },
    barcodeSub: { fontSize: 12, color: c.textDim, marginTop: 2 },
    foodSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    foodSearchIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: 'rgba(34,197,94,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    foodCalBold: { fontSize: 14, fontWeight: '700', color: c.text, textAlign: 'right' },
    kcalLabel: { fontSize: 11, color: c.textDim, textAlign: 'right' },
    tipBox: { flexDirection: 'row', gap: 12, backgroundColor: c.cardMuted, borderRadius: 12, padding: 12, marginBottom: 8 },
    tipText: { flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { width: '47%', alignItems: 'center', padding: 16 },
    statValue: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 11, color: c.textDim, marginTop: 4, textAlign: 'center' },
  });
