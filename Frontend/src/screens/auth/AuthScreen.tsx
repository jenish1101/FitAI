import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ThemeColors } from '@/constants/theme/fitai-theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { formatAuthError } from '@/services/api/auth-errors';
import { authApi } from '@/services/api/endpoints';
import { saveAuthToken } from '@/services/storage/auth';
import type { UserProfile } from '@/types/models';
import { showAlert } from '@/utils/alert';

interface Props {
  onAuthSuccess: (profile: UserProfile, mode: 'login' | 'register') => void | Promise<void>;
}

type FieldErrors = {
  email?: string;
  password?: string;
  name?: string;
  form?: string;
};

export function AuthScreen({ onAuthSuccess }: Props) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const scrollRef = useRef<ScrollView>(null);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const clearErrors = () => setFieldErrors({});

  const showErrors = (errors: FieldErrors, showPopup = false) => {
    setFieldErrors(errors);
    scrollRef.current?.scrollTo({ y: 280, animated: true });
    if (showPopup && errors.form) {
      showAlert(isLogin ? 'Sign in failed' : 'Registration failed', errors.form);
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!isLogin) {
      if (!name.trim()) {
        errors.name = 'Full name is required.';
      }
      if (!agreed) {
        errors.form = 'Please agree to the Terms of Service to continue.';
      }
    }

    if (Object.keys(errors).length > 0) {
      if (!errors.form) {
        errors.form = 'Please fix the highlighted fields below.';
      }
      showErrors(errors);
      return false;
    }

    clearErrors();
    return true;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    clearErrors();

    try {
      const response = isLogin
        ? await authApi.login(email.trim(), password)
        : await authApi.register(email.trim(), password, name.trim());

      if (!response.token) {
        throw new Error('Server did not return an authentication token.');
      }

      await saveAuthToken(response.token);
      await onAuthSuccess(response.user, isLogin ? 'login' : 'register');
    } catch (error) {
      const mode = isLogin ? 'login' : 'register';
      showErrors(
        {
          form: formatAuthError(error, mode),
        },
        true,
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', colors.red, colors.amber, colors.green];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  const inputBorder = (hasError: boolean) =>
    hasError ? { borderColor: colors.red, borderWidth: 1.5 } : undefined;

  if (showForgotPassword) {
    return (
      <ForgotPasswordScreen
        initialEmail={email}
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false);
          setIsLogin(true);
          clearErrors();
        }}
      />
    );
  }

  return (
    <LinearGradient colors={[...colors.backgroundGradient]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.logoSection}>
              <LinearGradient colors={['#6366f1', '#8b5cf6', '#22d3ee']} style={styles.logoBox}>
                <Text style={styles.logoIcon}>🏋️</Text>
              </LinearGradient>
              <Text style={styles.title}>FitAI</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome back, champion!' : 'Start your fitness journey'}
              </Text>
            </View>

            {!isLogin && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (fieldErrors.name || fieldErrors.form) clearErrors();
                  }}
                  placeholder="Your name"
                  placeholderTextColor={colors.textDim}
                  style={[styles.input, inputBorder(Boolean(fieldErrors.name))]}
                />
                {fieldErrors.name ? (
                  <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.name}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (fieldErrors.email || fieldErrors.form) clearErrors();
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={[styles.input, inputBorder(Boolean(fieldErrors.email))]}
              />
              {fieldErrors.email ? (
                <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.email}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (fieldErrors.password || fieldErrors.form) clearErrors();
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!showPassword}
                  autoComplete={isLogin ? 'password' : 'new-password'}
                  style={[styles.input, styles.passwordInput, inputBorder(Boolean(fieldErrors.password))]}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
              {fieldErrors.password ? (
                <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.password}</Text>
              ) : null}
              {!isLogin && password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              i <= passwordStrength ? strengthColors[passwordStrength] : colors.chipBg,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: strengthColors[passwordStrength] || colors.textDim,
                    }}>
                    {strengthLabels[passwordStrength]}
                  </Text>
                </View>
              )}
            </View>

            {isLogin && (
              <Pressable onPress={() => setShowForgotPassword(true)} style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            )}

            {!isLogin && (
              <Pressable onPress={() => setAgreed(!agreed)} style={styles.checkboxRow}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.terms}>
                  I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </Pressable>
            )}

            <GradientButton
              title={loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              onPress={() => void handleSubmit()}
              disabled={loading}
              style={styles.submitBtn}
            />
            {loading && <ActivityIndicator color={colors.indigo} style={styles.loader} />}

            {fieldErrors.form ? (
              <View
                style={[styles.errorBanner, { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: colors.red }]}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive">
                <Text style={[styles.errorBannerIcon, { color: colors.red }]}>⚠️</Text>
                <Text style={[styles.errorBannerText, { color: colors.red }]}>{fieldErrors.form}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                setIsLogin(!isLogin);
                clearErrors();
              }}
              style={styles.toggle}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.link}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    gradient: { flex: 1 },
    safe: { flex: 1 },
    flex: { flex: 1 },
    scroll: { paddingHorizontal: 24, paddingVertical: 32, flexGrow: 1, justifyContent: 'center' },
    logoSection: { alignItems: 'center', marginBottom: 32 },
    logoBox: {
      width: 80,
      height: 80,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logoIcon: { fontSize: 36 },
    title: { fontSize: 32, fontWeight: '900', color: c.indigo },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 4 },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 16,
    },
    errorBannerIcon: { fontSize: 16, marginTop: 1 },
    errorBannerText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
    field: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '500', color: c.textMuted, marginBottom: 6 },
    fieldError: { fontSize: 12, marginTop: 6, fontWeight: '600' },
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
    passwordWrap: { position: 'relative' },
    passwordInput: { paddingRight: 48 },
    eyeBtn: { position: 'absolute', right: 16, top: 14 },
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    forgot: { alignSelf: 'flex-end', marginBottom: 16 },
    forgotText: { fontSize: 14, color: c.indigo },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkboxChecked: { backgroundColor: c.chipActive, borderColor: c.chipActive },
    checkmark: { color: '#fff', fontSize: 12 },
    terms: { flex: 1, fontSize: 12, color: c.textMuted, lineHeight: 18 },
    link: { color: c.indigo },
    submitBtn: { marginTop: 8 },
    loader: { marginTop: 12 },
    toggle: { marginTop: 24, alignItems: 'center' },
    toggleText: { fontSize: 14, color: c.textDim },
  });
