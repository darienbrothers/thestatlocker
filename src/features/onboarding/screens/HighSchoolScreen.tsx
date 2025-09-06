import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { OnboardingStepper } from '@/components/gamification';

interface HighSchoolScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      profileImage?: string | null;
      sport?: string;
      gender?: 'boys' | 'girls'; 
      position?: string; 
      graduationYear?: number;
      height?: string;
    } 
  };
}

export default function HighSchoolScreen({ navigation, route }: HighSchoolScreenProps) {
  const { firstName, lastName, profileImage, sport, gender, position, graduationYear, height } = route.params || {};
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState<'Varsity' | 'JV' | 'Freshman' | ''>('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<{name: string, city: string, state: string} | null>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLevelSelect = (selectedLevel: 'Varsity' | 'JV' | 'Freshman') => {
    setLevel(selectedLevel);
  };

  // School database with South Shore MA schools
  const mockSchoolData: {[key: string]: {name: string, city: string, state: string}[]} = {
    'MA': [
      // South Shore MA Schools
      {name: 'Duxbury High School', city: 'Duxbury', state: 'MA'},
      {name: 'Marshfield High School', city: 'Marshfield', state: 'MA'},
      {name: 'Hingham High School', city: 'Hingham', state: 'MA'},
      {name: 'Scituate High School', city: 'Scituate', state: 'MA'},
      {name: 'Cohasset High School', city: 'Cohasset', state: 'MA'},
      {name: 'Hull High School', city: 'Hull', state: 'MA'},
      {name: 'Hanover High School', city: 'Hanover', state: 'MA'},
      {name: 'Norwell High School', city: 'Norwell', state: 'MA'},
      {name: 'Rockland High School', city: 'Rockland', state: 'MA'},
      {name: 'Abington High School', city: 'Abington', state: 'MA'},
      {name: 'Whitman-Hanson Regional High School', city: 'Whitman', state: 'MA'},
      {name: 'Plymouth North High School', city: 'Plymouth', state: 'MA'},
      {name: 'Plymouth South High School', city: 'Plymouth', state: 'MA'},
      {name: 'Silver Lake Regional High School', city: 'Kingston', state: 'MA'},
      {name: 'Pembroke High School', city: 'Pembroke', state: 'MA'},
      {name: 'North Quincy High School', city: 'North Quincy', state: 'MA'},
      {name: 'Quincy High School', city: 'Quincy', state: 'MA'},
      {name: 'Weymouth High School', city: 'Weymouth', state: 'MA'},
      {name: 'Braintree High School', city: 'Braintree', state: 'MA'},
      {name: 'Milton High School', city: 'Milton', state: 'MA'},
      // Boston Area
      {name: 'Boston Latin School', city: 'Boston', state: 'MA'},
      {name: 'Boston College High School', city: 'Boston', state: 'MA'},
      {name: 'Xaverian Brothers High School', city: 'Westwood', state: 'MA'},
      {name: 'Malden Catholic High School', city: 'Malden', state: 'MA'},
      {name: 'Archbishop Williams High School', city: 'Braintree', state: 'MA'}
    ],
    'CA': [
      {name: 'Mater Dei High School', city: 'Santa Ana', state: 'CA'},
      {name: 'Harvard-Westlake School', city: 'Studio City', state: 'CA'},
      {name: 'Loyola High School', city: 'Los Angeles', state: 'CA'},
      {name: 'St. Francis High School', city: 'Mountain View', state: 'CA'},
      {name: 'De La Salle High School', city: 'Concord', state: 'CA'}
    ],
    'NY': [
      {name: 'Chaminade High School', city: 'Mineola', state: 'NY'},
      {name: 'Iona Preparatory School', city: 'New Rochelle', state: 'NY'},
      {name: 'St. Anthony\'s High School', city: 'Huntington', state: 'NY'},
      {name: 'Fordham Preparatory School', city: 'Bronx', state: 'NY'}
    ],
    'MD': [
      {name: 'Boys\' Latin School', city: 'Baltimore', state: 'MD'},
      {name: 'Calvert Hall College High School', city: 'Baltimore', state: 'MD'},
      {name: 'Loyola Blakefield', city: 'Towson', state: 'MD'},
      {name: 'McDonogh School', city: 'Owings Mills', state: 'MD'}
    ],
    'CT': [
      {name: 'Brunswick School', city: 'Greenwich', state: 'CT'},
      {name: 'Fairfield College Preparatory School', city: 'Fairfield', state: 'CT'},
      {name: 'Darien High School', city: 'Darien', state: 'CT'},
      {name: 'New Canaan High School', city: 'New Canaan', state: 'CT'}
    ]
  };

  const handleSchoolNameChange = (text: string) => {
    setSchoolName(text);
    setSelectedSchool(null);
    
    if (text.length >= 2 && state.length === 2) {
      const stateSchools = mockSchoolData[state.toUpperCase()] || [];
      const filtered = stateSchools
        .filter(school => school.name.toLowerCase().includes(text.toLowerCase()))
        .map(school => school.name);
      setSchoolSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSchoolSelect = (schoolName: string) => {
    const stateSchools = mockSchoolData[state.toUpperCase()] || [];
    const school = stateSchools.find(s => s.name === schoolName);
    
    if (school) {
      setSchoolName(school.name);
      setCity(school.city);
      setState(school.state);
      setSelectedSchool(school);
    }
    
    setShowSuggestions(false);
    setSchoolSuggestions([]);
  };

  const handleManualEntry = () => {
    setShowSuggestions(false);
    setSchoolSuggestions([]);
    setSelectedSchool(null);
  };

  const handleContinue = () => {
    const isValid = schoolName.trim() && city.trim() && state.trim() && level;

    if (isValid) {
      // Button press animation
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after animation completes
        navigation.navigate('ClubTeam', { 
          firstName,
          lastName,
          profileImage,
          sport,
          gender,
          position,
          graduationYear,
          height,
          schoolName: schoolName.trim(),
          city: city.trim(),
          state: state.trim(),
          level,
          jerseyNumber: jerseyNumber.trim()
        });
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowSuggestions(false);
  };

  const isValid = schoolName.trim() && city.trim() && state.trim() && level;

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={4}
        totalSteps={8}
        stepTitle="High School"
        showBackButton={true}
        onBackPress={handleBack}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Home Turf</Text>
                <Text style={styles.subtitle}>
                  Every locker reps a school. Who are you suiting up for?
                </Text>
              </View>

              {/* School Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>School Information *</Text>
                
                {/* State Selection */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    value={state}
                    onChangeText={setState}
                    placeholder="Enter your state (e.g., CA, NY, TX)"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="characters"
                    maxLength={2}
                    returnKeyType="next"
                  />
                </View>

                {/* School Name Input with Autocomplete */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>School Name</Text>
                  <View style={styles.autocompleteContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={schoolName}
                      onChangeText={handleSchoolNameChange}
                      placeholder="Start typing your school name..."
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {showSuggestions && schoolSuggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        {schoolSuggestions.slice(0, 5).map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSchoolSelect(suggestion)}
                          >
                            <Ionicons name="school-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.manualEntryItem}
                          onPress={() => handleManualEntry()}
                        >
                          <Ionicons name="create-outline" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.manualEntryText}>Enter manually</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* School Confirmation Card */}
                {selectedSchool && (
                  <View style={styles.confirmationCard}>
                    <View style={styles.confirmationHeader}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                      <Text style={styles.confirmationTitle}>School Found!</Text>
                    </View>
                    <View style={styles.confirmationDetails}>
                      <Text style={styles.confirmationSchool}>{selectedSchool.name}</Text>
                      <Text style={styles.confirmationLocation}>{selectedSchool.city}, {selectedSchool.state}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.textInput}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>State</Text>
                    <TextInput
                      style={styles.textInput}
                      value={state}
                      onChangeText={setState}
                      placeholder="ST"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="characters"
                      maxLength={2}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* Team Level Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Team Level</Text>
                <View style={styles.levelContainer}>
                  {(['Varsity', 'JV', 'Freshman'] as const).map((levelOption) => (
                    <TouchableOpacity
                      key={levelOption}
                      style={[
                        styles.levelButton,
                        level === levelOption && styles.selectedLevelButton
                      ]}
                      onPress={() => handleLevelSelect(levelOption)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.levelButtonText,
                        level === levelOption && styles.selectedLevelButtonText
                      ]}>
                        {levelOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Jersey Number (Optional) */}
              <View style={styles.inputSection}>
                <View style={styles.jerseyHeader}>
                  <Ionicons name="shirt-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.inputLabel}>Jersey Number (Optional)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  placeholder="Enter your jersey number"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                  maxLength={3}
                  returnKeyType="done"
                />
              </View>

              {/* Continue Button */}
              <View style={styles.buttonSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <TouchableOpacity
                    style={[styles.continueButton, !isValid && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!isValid}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isValid ? [theme.colors.primary, theme.colors.primary + 'DD'] : [theme.colors.neutral300, theme.colors.neutral300]}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={[styles.buttonText, !isValid && styles.disabledButtonText]}>
                        Continue
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={isValid ? theme.colors.white : theme.colors.textTertiary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                
                <Text style={styles.helperText}>
                  🏠 Claiming your home turf in the locker
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
    minHeight: 600,
  },
  // Header Section
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Section Container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  // Input Styles
  inputSection: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  // Level Selection
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    alignItems: 'center',
  },
  selectedLevelButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  levelButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  selectedLevelButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  // Jersey Number
  jerseyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  // Autocomplete Styles
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral100,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  manualEntryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
  },
  manualEntryText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  // School Confirmation Card
  confirmationCard: {
    backgroundColor: theme.colors.success + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
    marginBottom: 16,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.success,
  },
  confirmationDetails: {
    paddingLeft: 28,
  },
  confirmationSchool: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  confirmationLocation: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  // Level Grid
  levelGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  levelCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    alignItems: 'center',
    position: 'relative',
  },
  levelCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  levelText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  levelTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  levelCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  // Button Section
  buttonSection: {
    gap: 12,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  disabledButtonText: {
    color: theme.colors.textTertiary,
  },
  helperText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
