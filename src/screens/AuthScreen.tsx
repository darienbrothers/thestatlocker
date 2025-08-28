import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useAuthStore } from '../stores/authStore';
import { RootStackParamList } from '../types';
import { COLORS, FONTS } from '../constants/theme';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

type Mode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { signIn, signUp, resetPassword } = useAuthStore();
  
  const [mode, setMode] = useState<Mode>('signIn');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Enter email and password.');
      return;
    }

    if (mode === 'signUp' && (!firstName.trim() || !lastName.trim())) {
      setErrorMsg('Enter your name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signUp') {
        await signUp(email, password, { firstName, lastName });
        navigation.navigate('OnboardingStart');
      } else {
        await signIn(email, password);
        // Check if user needs onboarding
        navigation.navigate('OnboardingStart');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Enter your email to reset password.');
      return;
    }
    
    try {
      await resetPassword(email);
      Alert.alert('Password Reset', 'Password reset email sent.');
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // TODO: Implement Apple Sign In with Firebase
      console.log('Apple credential:', credential);
      Alert.alert('Apple Sign In', 'Apple Sign In not yet implemented');
      
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      setErrorMsg('Apple Sign In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setErrorMsg(null);
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundMuted]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo + Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>SL</Text>
            </View>
            
            <Text style={styles.title}>
              {mode === 'signIn' ? 'Welcome Back' : 'Create Your Account'}
            </Text>
            
            <Text style={styles.subtitle}>
              Your stats. Your story. Your future.
            </Text>
          </View>

          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'signIn' && styles.modeButtonActive]}
              onPress={() => setMode('signIn')}
            >
              <Text style={[styles.modeButtonText, mode === 'signIn' && styles.modeButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'signUp' && styles.modeButtonActive]}
              onPress={() => setMode('signUp')}
            >
              <Text style={[styles.modeButtonText, mode === 'signUp' && styles.modeButtonTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signUp' && (
              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder="First name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  textContentType="givenName"
                  autoCapitalize="words"
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  textContentType="familyName"
                  autoCapitalize="words"
                />
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}

            {/* Primary CTA */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {mode === 'signIn' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Secondary Links */}
            <View style={styles.secondaryLinks}>
              {mode === 'signIn' && (
                <TouchableOpacity onPress={handlePasswordReset}>
                  <Text style={styles.linkText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.linkTextPrimary}>
                  {mode === 'signIn' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign In */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            )}
            
            {Platform.OS !== 'ios' && (
              <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={isLoading}>
                <Ionicons name="logo-apple" size={20} color="white" />
                <Text style={styles.appleButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>
            )}

            {isLoading && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            )}

            {/* Legal */}
            <Text style={styles.legalText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: 'white',
  },
  form: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    height: 56,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 56,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  secondaryLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  linkTextPrimary: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginHorizontal: 16,
  },
  appleButton: {
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  loader: {
    marginTop: 6,
  },
  legalText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 8,
    lineHeight: 16,
  },
});
