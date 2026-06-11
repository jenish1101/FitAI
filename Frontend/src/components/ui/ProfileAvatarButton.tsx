import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  name: string;
  onPress: () => void;
  size?: number;
}

export function ProfileAvatarButton({ name, onPress, size = 40 }: Props) {
  const fontSize = size * 0.4;

  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel="Open profile">
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize }]}>{name.charAt(0)}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: '#ffffff' },
});
