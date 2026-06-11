import { useState } from 'react';
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
import { formatAuthError } from '@/services/api/auth-errors';
import { authApi } from '@/services/api/endpoints';
import { showAlert } from '@/utils/alert';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  initialEmail?: string;
}

type Step = 'request' | 'reset';

export function ForgotPasswordScreen({ onBack, onSuccess, initialEmail = '' }: Props) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const clearErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const handleRequestCode = async () => {
    if (loading) return;
    clearErrors();

    if (!email.trim()) {
      setFieldErrors({ email: 'Email is required.' });
      return;
    }
    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email.trim());
      if (response.resetCode) {
        setDevCode(response.resetCode);
        setCode(response.resetCode);
      }
      setStep('reset');
      showAlert('Reset code sent', response.message);
    } catch (error) {
      const message = formatAuthError(error, 'login');
      setFormError(message);
      showAlert('Request failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;
    clearErrors();

    const errors: Record<string, string> = {};
    if (!code.trim() || code.trim().length !== 6) {
      errors.code = 'Enter the 6-digit reset code.';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword(email.trim(), code.trim(), newPassword);
      showAlert('Password updated', response.message);
      onSuccess();
    } catch (error) {
      const message = formatAuthError(error, 'login');
      setFormError(message);
      showAlert('Reset failed', message);
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = (hasError: boolean) =>
    hasError ? { borderColor: colors.red, borderWidth: 1.5 } : undefined;

  return (
    <LinearGradient colors={[...colors.backgroundGradient]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={[styles.backText, { color: colors.indigo }]}>← Back to Sign In</Text>
            </Pressable>

            <View style={styles.logoSection}>
              <LinearGradient colors={['#6366f1', '#8b5cf6', '#22d3ee']} style={styles.logoBox}>
                <Text style={styles.logoIcon}>🔐</Text>
              </LinearGradient>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {step === 'request'
                  ? 'Enter your email and we will send a reset code'
                  : 'Enter the code and your new password'}
              </Text>
            </View>

            {formError ? (
              <View
                style={[styles.errorBanner, { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: colors.red }]}>
                <Text style={[styles.errorBannerText, { color: colors.red }]}>{formError}</Text>
              </View>
            ) : null}

            {devCode ? (
              <View
                style={[
                  styles.devBanner,
                  { backgroundColor: colors.indigo + '14', borderColor: colors.indigo + '44' },
                ]}>
                <Text style={[styles.devBannerText, { color: colors.indigo }]}>
                  Dev mode — your reset code: <Text style={styles.devCode}>{devCode}</Text>
                </Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearErrors();
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={step === 'request'}
                style={[styles.input, inputBorder(Boolean(fieldErrors.email)), step === 'reset' && styles.inputDisabled]}
              />
              {fieldErrors.email ? (
                <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.email}</Text>
              ) : null}
            </View>

            {step === 'reset' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Reset Code</Text>
                  <TextInput
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/\D/g, '').slice(0, 6));
                      clearErrors();
                    }}
                    placeholder="6-digit code"
                    placeholderTextColor={colors.textDim}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[styles.input, inputBorder(Boolean(fieldErrors.code))]}
                  />
                  {fieldErrors.code ? (
                    <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.code}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      value={newPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        clearErrors();
                      }}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textDim}
                      secureTextEntry={!showPassword}
                      style={[styles.input, styles.passwordInput, inputBorder(Boolean(fieldErrors.newPassword))]}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Text>{showPassword ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {fieldErrors.newPassword ? (
                    <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.newPassword}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      clearErrors();
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry={!showPassword}
                    style={[styles.input, inputBorder(Boolean(fieldErrors.confirmPassword))]}
                  />
                  {fieldErrors.confirmPassword ? (
                    <Text style={[styles.fieldError, { color: colors.red }]}>{fieldErrors.confirmPassword}</Text>
                  ) : null}
                </View>
              </>
            ) : null}

            <GradientButton
              title={
                loading
                  ? 'Please wait...'
                  : step === 'request'
                    ? 'Send Reset Code'
                    : 'Update Password'
              }
              onPress={() => void (step === 'request' ? handleRequestCode() : handleResetPassword())}
              disabled={loading}
              style={styles.submitBtn}
            />
            {loading && <ActivityIndicator color={colors.indigo} style={styles.loader} />}

            {step === 'reset' ? (
              <Pressable onPress={() => void handleRequestCode()} style={styles.resend}>
                <Text style={[styles.resendText, { color: colors.indigo }]}>Resend code</Text>
              </Pressable>
            ) : null}
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
    scroll: { paddingHorizontal: 24, paddingVertical: 24, flexGrow: 1 },
    backBtn: { marginBottom: 16 },
    backText: { fontSize: 14, fontWeight: '600' },
    logoSection: { alignItems: 'center', marginBottom: 28 },
    logoBox: {
      width: 72,
      height: 72,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    logoIcon: { fontSize: 32 },
    title: { fontSize: 28, fontWeight: '900', color: c.indigo },
    subtitle: { fontSize: 14, color: c.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
    errorBanner: {
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
    },
    errorBannerText: { fontSize: 14, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
    devBanner: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
    },
    devBannerText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
    devCode: { fontWeight: '800', letterSpacing: 2 },
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
    inputDisabled: { opacity: 0.7 },
    passwordWrap: { position: 'relative' },
    passwordInput: { paddingRight: 48 },
    eyeBtn: { position: 'absolute', right: 16, top: 14 },
    submitBtn: { marginTop: 8 },
    loader: { marginTop: 12 },
    resend: { marginTop: 20, alignItems: 'center' },
    resendText: { fontSize: 14, fontWeight: '600' },
  });
