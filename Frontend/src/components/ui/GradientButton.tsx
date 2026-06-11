import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  small?: boolean;
  disabled?: boolean;
}

export function GradientButton({ title, onPress, style, small, disabled }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <LinearGradient
        colors={[...colors.gradientButton]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, small && styles.buttonSmall, disabled && styles.buttonDisabled]}>
        <Text style={[styles.text, small && styles.textSmall]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSmall: {
    paddingVertical: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
});
