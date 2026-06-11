import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  scrollable?: boolean;
  compact?: boolean;
}

export function TabSelector({ tabs, activeTab, onTabChange, scrollable, compact }: Props) {
  const { colors } = useTheme();

  const renderTab = (tab: Tab) => {
    const active = activeTab === tab.id;
    return (
      <Pressable
        key={tab.id}
        onPress={() => onTabChange(tab.id)}
        style={[
          styles.tab,
          scrollable ? styles.tabScroll : styles.tabEqual,
          { backgroundColor: active ? colors.chipActive : 'transparent' },
        ]}>
        {tab.icon ? <Text style={styles.tabIcon}>{tab.icon}</Text> : null}
        <Text
          style={[styles.tabText, { color: active ? '#fff' : colors.textMuted }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, compact && styles.compact, { backgroundColor: colors.card }]}>
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {tabs.map(renderTab)}
        </ScrollView>
      ) : (
        <View style={styles.row}>{tabs.map(renderTab)}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  compact: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEqual: {
    flex: 1,
    minWidth: 0,
  },
  tabScroll: {
    paddingHorizontal: 14,
    minWidth: 88,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
