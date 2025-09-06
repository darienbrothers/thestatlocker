import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useAuthStore } from '@/shared/stores/authStore';
import { RootStackParamList } from '@/types';
import { colors, COLORS, FONTS } from '@shared/theme';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

type Mode = 'signIn' | 'signUp';

export default function AuthScreen({ navigation }: { navigation: AuthScreenNavigationProp }) {
  const { signIn } = useAuthStore();
  
  const [mode, setMode] = useState<Mode>('signUp');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (mode === 'signIn' && !value.trim()) {
          errors.password = 'Password is required';
        } else if (mode === 'signIn' && value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'firstName':
        if (mode === 'signUp' && !value.trim()) {
          errors.firstName = 'First name is required';
        } else {
          delete errors.firstName;
        }
        break;
      case 'lastName':
        if (mode === 'signUp' && !value.trim()) {
          errors.lastName = 'Last name is required';
        } else {
          delete errors.lastName;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const isFormValid = () => {
    const hasNoErrors = Object.keys(fieldErrors).length === 0;
    
    if (mode === 'signUp') {
      // For sign up, only need name and email
      return hasNoErrors && firstName.trim() && lastName.trim() && email.trim();
    } else {
      // For sign in, need email and password
      return hasNoErrors && email.trim() && password.trim();
    }
  };

  const handleAuth = async () => {
    if (!isFormValid()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signUp') {
        // For new users, go directly to onboarding with basic info
        navigation.navigate('NameCollection');
      } else {
        // Existing users sign in normally
        await signIn(email, password);
        navigation.navigate('MainTabs');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
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
      
      if (credential.identityToken) {
        // Handle Apple sign in - for now just go to onboarding
        navigation.navigate('NameCollection');
      } else {
        throw new Error('No identity token received');
      }
      
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('Apple Sign In Error:', error);
      
      // Show specific error message for development mode
      if (error.message?.includes('development mode')) {
        setErrorMsg('Apple Sign In requires a production build. Use email for testing.');
      } else {
        setErrorMsg('Apple Sign In failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    
    // TODO: Implement password reset functionality
    setErrorMsg('Password reset functionality not implemented yet');
  };

  const toggleMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setErrorMsg(null);
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundMuted]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Logo + Title */}
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logos/logoBlack.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              
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
                    placeholderTextColor={colors.textSecondary}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      validateField('firstName', text);
                    }}
                    textContentType="givenName"
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Last name"
                    placeholderTextColor={colors.textSecondary}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      validateField('lastName', text);
                    }}
                    textContentType="familyName"
                    autoCapitalize="words"
                  />
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField('email', text);
                }}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {mode === 'signIn' && (
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      validateField('password', text);
                    }}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {fieldErrors.email && (
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              )}
              {mode === 'signUp' && fieldErrors.firstName && (
                <Text style={styles.errorText}>{fieldErrors.firstName}</Text>
              )}
              {mode === 'signUp' && fieldErrors.lastName && (
                <Text style={styles.errorText}>{fieldErrors.lastName}</Text>
              )}
              {mode === 'signIn' && fieldErrors.password && (
                <Text style={styles.errorText}>{fieldErrors.password}</Text>
              )}
              {errorMsg && (
                <Text style={styles.errorText}>{errorMsg}</Text>
              )}

              {/* Primary CTA */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {mode === 'signIn' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Secondary Links */}
              <View style={styles.secondaryLinks}>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.linkTextPrimary}>
                    {mode === 'signIn' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                  </Text>
                </TouchableOpacity>
                {mode === 'signIn' && (
                  <TouchableOpacity onPress={handleResetPassword}>
                    <Text style={styles.linkTextSecondary}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
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
                <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
              )}

              {/* Legal */}
              <Text style={styles.legalText}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <TouchableOpacity style={[styles.backButton, { top: 80 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 8,
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
    backgroundColor: colors.primary,
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
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
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
  linkTextPrimary: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  linkTextSecondary: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
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
  backButton: {
    position: 'absolute',
    top: 80,
    left: 16,
    zIndex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});
