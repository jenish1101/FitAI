import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

interface Props {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'workout', label: 'Workout', icon: '🏋️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'community', label: 'Social', icon: '👥' },
  { id: 'messages', label: 'Messages', icon: '💬' },
];

export function BottomNav({ currentTab, setCurrentTab }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View style={styles.row}>
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setCurrentTab(tab.id)}
              style={styles.tab}
              hitSlop={4}>
              <Text style={[styles.icon, { opacity: active ? 1 : 0.55 }]}>{tab.icon}</Text>
              <Text
                style={[styles.label, { color: active ? colors.indigo : colors.textDim }]}
                numberOfLines={1}>
                {tab.label}
              </Text>
              {active && <View style={[styles.dot, { backgroundColor: colors.indigo }]} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 48,
    flex: 1,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
