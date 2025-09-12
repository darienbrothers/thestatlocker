import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import { useKeyboardAwareScrolling } from '@/utils/keyboardUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { OnboardingStepper } from '@/components/gamification';
import { theme } from '@/constants/theme';

interface TeamInformationScreenProps {
  navigation: any;
  route: {
    params?: {
      firstName?: string;
      lastName?: string;
      profileImage?: string | null;
      sport?: string;
      gender?: string;
      position?: string;
      graduationYear?: string;
      height?: string;
      returnTo?: string;
      teamData?: {
        schoolName?: string;
        city?: string;
        state?: string;
        level?: string;
        jerseyNumber?: string;
        clubEnabled?: boolean;
        clubOrgName?: string;
        clubTeamName?: string;
        clubCity?: string;
        clubState?: string;
        clubJerseyNumber?: string;
        isManualEntry?: boolean;
        selectedSchool?: any;
      };
      academicData?: {
        gpa?: string;
        hasHonorsAP?: boolean | null;
        satScore?: string;
        actScore?: string;
        academicInterest?: string;
        customInterest?: string;
        academicAwards?: string;
      };
      [key: string]: any;
    };
  };
}

// Massachusetts MIAA Schools Database
const MASSACHUSETTS_SCHOOLS = [
  // Division 1 Schools
  { name: 'Belmont High School', city: 'Belmont', state: 'MA', division: 'D1' },
  { name: 'Boston Latin School', city: 'Boston', state: 'MA', division: 'D1' },
  { name: 'Needham High School', city: 'Needham', state: 'MA', division: 'D1' },
  {
    name: 'Wellesley High School',
    city: 'Wellesley',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Newton North High School',
    city: 'Newton',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Newton South High School',
    city: 'Newton',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Brookline High School',
    city: 'Brookline',
    state: 'MA',
    division: 'D1',
  },
  { name: 'Waltham High School', city: 'Waltham', state: 'MA', division: 'D1' },
  {
    name: 'Lexington High School',
    city: 'Lexington',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Winchester High School',
    city: 'Winchester',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Concord-Carlisle High School',
    city: 'Concord',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Lincoln-Sudbury Regional High School',
    city: 'Sudbury',
    state: 'MA',
    division: 'D1',
  },

  // Division 2 Schools
  { name: 'Walpole High School', city: 'Walpole', state: 'MA', division: 'D2' },
  {
    name: 'Westwood High School',
    city: 'Westwood',
    state: 'MA',
    division: 'D2',
  },
  { name: 'Hingham High School', city: 'Hingham', state: 'MA', division: 'D2' },
  { name: 'Duxbury High School', city: 'Duxbury', state: 'MA', division: 'D2' },
  {
    name: 'Scituate High School',
    city: 'Scituate',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Marshfield High School',
    city: 'Marshfield',
    state: 'MA',
    division: 'D2',
  },
  { name: 'Hanover High School', city: 'Hanover', state: 'MA', division: 'D2' },
  { name: 'Norwell High School', city: 'Norwell', state: 'MA', division: 'D2' },
  {
    name: 'Cohasset High School',
    city: 'Cohasset',
    state: 'MA',
    division: 'D2',
  },
  { name: 'Hull High School', city: 'Hull', state: 'MA', division: 'D2' },
  {
    name: 'Pembroke High School',
    city: 'Pembroke',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Silver Lake Regional High School',
    city: 'Kingston',
    state: 'MA',
    division: 'D2',
  },

  // Catholic/Private Schools
  {
    name: 'Boston College High School',
    city: 'Boston',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Xaverian Brothers High School',
    city: 'Westwood',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Catholic Memorial School',
    city: 'West Roxbury',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Malden Catholic High School',
    city: 'Malden',
    state: 'MA',
    division: 'D1',
  },
  { name: "St. John's Prep", city: 'Danvers', state: 'MA', division: 'D1' },
  {
    name: 'Archbishop Williams High School',
    city: 'Braintree',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Cardinal Spellman High School',
    city: 'Brockton',
    state: 'MA',
    division: 'D2',
  },

  // Additional South Shore Schools
  {
    name: 'Braintree High School',
    city: 'Braintree',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Weymouth High School',
    city: 'Weymouth',
    state: 'MA',
    division: 'D1',
  },
  { name: 'Milton High School', city: 'Milton', state: 'MA', division: 'D2' },
  { name: 'Quincy High School', city: 'Quincy', state: 'MA', division: 'D1' },
  {
    name: 'North Quincy High School',
    city: 'Quincy',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Randolph High School',
    city: 'Randolph',
    state: 'MA',
    division: 'D3',
  },
  {
    name: 'Holbrook High School',
    city: 'Holbrook',
    state: 'MA',
    division: 'D4',
  },
  {
    name: 'Rockland High School',
    city: 'Rockland',
    state: 'MA',
    division: 'D3',
  },
  {
    name: 'Abington High School',
    city: 'Abington',
    state: 'MA',
    division: 'D3',
  },
  {
    name: 'Whitman-Hanson Regional High School',
    city: 'Whitman',
    state: 'MA',
    division: 'D2',
  },

  // North Shore Schools
  {
    name: 'Marblehead High School',
    city: 'Marblehead',
    state: 'MA',
    division: 'D2',
  },
  {
    name: 'Swampscott High School',
    city: 'Swampscott',
    state: 'MA',
    division: 'D3',
  },
  { name: 'Beverly High School', city: 'Beverly', state: 'MA', division: 'D1' },
  { name: 'Salem High School', city: 'Salem', state: 'MA', division: 'D2' },
  { name: 'Peabody High School', city: 'Peabody', state: 'MA', division: 'D1' },
  {
    name: 'Lynn English High School',
    city: 'Lynn',
    state: 'MA',
    division: 'D1',
  },
  {
    name: 'Lynn Classical High School',
    city: 'Lynn',
    state: 'MA',
    division: 'D2',
  },

  // MetroWest Schools
  { name: 'Natick High School', city: 'Natick', state: 'MA', division: 'D1' },
  {
    name: 'Framingham High School',
    city: 'Framingham',
    state: 'MA',
    division: 'D1',
  },
  { name: 'Wayland High School', city: 'Wayland', state: 'MA', division: 'D2' },
  {
    name: 'Dover-Sherborn High School',
    city: 'Dover',
    state: 'MA',
    division: 'D3',
  },
];

export default function TeamInformationScreen({
  navigation,
  route,
}: TeamInformationScreenProps) {
  const {
    firstName,
    lastName,
    profileImage,
    sport,
    gender,
    position,
    graduationYear,
    height,
    returnTo,
    ...otherParams
  } = route.params || {};

  // Enhanced keyboard-aware scrolling
  const { scrollViewRef } = useKeyboardAwareScrolling();

  // High School Info
  const teamData = route.params?.teamData;
  const [schoolName, setSchoolName] = useState(teamData?.schoolName || '');
  const [city, setCity] = useState(teamData?.city || '');
  const [state, setState] = useState(teamData?.state || '');
  const [level, setLevel] = useState(teamData?.level || '');
  const [jerseyNumber, setJerseyNumber] = useState(
    teamData?.jerseyNumber || '',
  );
  const [schoolSuggestions, setSchoolSuggestions] = useState<
    { name: string; city: string; state: string; division?: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(
    teamData?.isManualEntry || false,
  );
  const [selectedSchool, setSelectedSchool] = useState<any>(
    teamData?.selectedSchool || null,
  );

  // Club Team Info
  const [clubEnabled, setClubEnabled] = useState(
    teamData?.clubEnabled || false,
  );
  const [clubOrgName, setClubOrgName] = useState(teamData?.clubOrgName || '');
  const [clubTeamName, setClubTeamName] = useState(
    teamData?.clubTeamName || '',
  );
  const [clubCity, setClubCity] = useState(teamData?.clubCity || '');
  const [clubState, setClubState] = useState(teamData?.clubState || '');
  const [clubJerseyNumber, setClubJerseyNumber] = useState(
    teamData?.clubJerseyNumber || '',
  );

  // Numeric validation helpers
  const handleJerseyNumberChange = (text: string) => {
    // Allow only numbers for jersey numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setJerseyNumber(numericText);
  };

  const handleClubJerseyNumberChange = (text: string) => {
    // Allow only numbers for club jersey numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setClubJerseyNumber(numericText);
  };

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const clubFormFadeAnim = useRef(new Animated.Value(0)).current;
  const clubFormSlideAnim = useRef(new Animated.Value(-20)).current;

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
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate club form visibility
    if (clubEnabled) {
      Animated.parallel([
        Animated.timing(clubFormFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(clubFormSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(clubFormFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(clubFormSlideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [clubEnabled]);

  const searchSchools = async (query: string) => {
    if (query.length < 2) {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filteredSchools = MASSACHUSETTS_SCHOOLS.filter(
      school =>
        school.name.toLowerCase().includes(query.toLowerCase()) ||
        school.city.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 8); // Limit to 8 results

    setSchoolSuggestions(filteredSchools);
    setShowSuggestions(filteredSchools.length > 0);
  };

  const handleSchoolSelect = (school: {
    name: string;
    city: string;
    state: string;
    division?: string;
  }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSchool(school);
    setSchoolName(school.name);
    setCity(school.city);
    setState(school.state);
    setShowSuggestions(false);
    setIsManualEntry(false);
  };

  const handleManualEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsManualEntry(true);
    setShowSuggestions(false);
    // Clear auto-populated data when switching to manual entry
    setCity('');
    setState('');
  };

  const handleToggleClub = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClubEnabled(!clubEnabled);
  };

  // Validation logic for form completion
  const isHighSchoolValid = () => {
    return (
      schoolName.trim() &&
      city.trim() &&
      state.trim() &&
      level &&
      jerseyNumber.trim()
    );
  };

  const isClubTeamValid = () => {
    if (!clubEnabled) {
      return true;
    }
    return (
      clubOrgName.trim() &&
      clubTeamName.trim() &&
      clubCity.trim() &&
      clubState.trim() &&
      clubJerseyNumber.trim()
    );
  };

  const isFormValid = () => {
    return isHighSchoolValid() && isClubTeamValid();
  };

  const handleBack = () => {
    // Save current form data before going back
    const currentData = {
      schoolName,
      city,
      state,
      level,
      jerseyNumber,
      clubEnabled,
      clubOrgName,
      clubTeamName,
      clubCity,
      clubState,
      clubJerseyNumber,
      isManualEntry,
      selectedSchool,
    };

    // Navigate back based on returnTo parameter
    if (returnTo === 'Review') {
      navigation.navigate('Review', {
        firstName,
        lastName,
        profileImage,
        sport,
        gender,
        position,
        graduationYear,
        height,
        // Flat structure for compatibility
        schoolName,
        city,
        state,
        level,
        jerseyNumber,
        clubEnabled,
        clubOrgName,
        clubTeamName,
        clubCity,
        clubState,
        clubJerseyNumber,
        ...otherParams,
      });
    } else {
      navigation.navigate('BasicInfo', {
        firstName,
        lastName,
        profileImage,
        sport,
        gender,
        position,
        graduationYear,
        height,
        teamData: currentData,
        ...otherParams,
      });
    }
  };

  const handleContinue = () => {
    // Double-check validation (should not be reachable if button is properly disabled)
    if (!isFormValid()) {
      if (!isHighSchoolValid()) {
        Alert.alert(
          'Incomplete Information',
          'Please complete all high school team information.',
        );
      } else if (!isClubTeamValid()) {
        Alert.alert(
          'Incomplete Information',
          'Please complete all club team information or disable the club team option.',
        );
      }
      return;
    }

    // Prepare data in the format expected by other screens
    const updatedParams = {
      firstName,
      lastName,
      profileImage,
      sport,
      gender,
      position,
      graduationYear,
      height,
      // Flat structure for compatibility
      schoolName: schoolName.trim(),
      city: city.trim(),
      state: state.trim(),
      level,
      jerseyNumber: jerseyNumber.trim(),
      clubEnabled,
      clubOrgName: clubEnabled ? clubOrgName.trim() : null,
      clubTeamName: clubEnabled ? clubTeamName.trim() : null,
      clubCity: clubEnabled ? clubCity.trim() : null,
      clubState: clubEnabled ? clubState.trim() : null,
      clubJerseyNumber: clubEnabled ? clubJerseyNumber.trim() : null,
      // Preserve any existing data
      academicData: route.params?.academicData,
      ...otherParams,
    };

    // Navigate based on returnTo parameter
    if (returnTo === 'Review') {
      navigation.navigate('Review', updatedParams);
    } else {
      navigation.navigate('Academic', updatedParams);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper
        currentStep={4}
        totalSteps={8}
        stepTitle="Team Information"
        showBackButton={true}
        onBackPress={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
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
                },
              ]}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require('../../../../assets/logos/logoBlack.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Rep Your Home Turf</Text>
                <Text style={styles.subtitle}>
                  Show pride in your school and club teams — this is where
                  champions are made
                </Text>
              </View>

              {/* High School Team Card */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="school"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>High School Team</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Your school colors, your legacy
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>School Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={schoolName}
                    onChangeText={text => {
                      setSchoolName(text);
                      searchSchools(text);
                    }}
                    placeholder="Start typing your school name..."
                    placeholderTextColor={theme.colors.textTertiary}
                    onFocus={() => {
                      if (schoolName.length >= 2) {
                        searchSchools(schoolName);
                      }
                    }}
                  />

                  {/* School Suggestions */}
                  {showSuggestions && schoolSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {schoolSuggestions.map((school, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSchoolSelect(school)}
                        >
                          <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionName}>
                              {school.name}
                            </Text>
                            <Text style={styles.suggestionLocation}>
                              {school.city}, {school.state}
                            </Text>
                          </View>
                          {school.division && (
                            <View
                              style={[
                                styles.divisionBadge,
                                {
                                  backgroundColor: getDivisionColor(
                                    school.division,
                                  ),
                                },
                              ]}
                            >
                              <Text style={styles.divisionText}>
                                {school.division}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Manual Entry Button */}
                  {!showSuggestions &&
                    schoolName.length > 0 &&
                    !isManualEntry && (
                      <TouchableOpacity
                        style={styles.manualEntryButton}
                        onPress={handleManualEntry}
                      >
                        <Text style={styles.manualEntryText}>
                          Can't find it? Enter manually
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>

                {/* City and State Row */}
                <View style={styles.inputRow}>
                  <View
                    style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}
                  >
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Belmont"
                      placeholderTextColor={theme.colors.textTertiary}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>State *</Text>
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor={theme.colors.textTertiary}
                      maxLength={2}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Team Level *</Text>
                  <View style={styles.levelContainer}>
                    {['Varsity', 'JV', 'Freshman'].map(levelOption => (
                      <TouchableOpacity
                        key={levelOption}
                        style={[
                          styles.levelButton,
                          level === levelOption && styles.levelButtonActive,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          setLevel(
                            levelOption as 'Varsity' | 'JV' | 'Freshman',
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.levelButtonText,
                            level === levelOption &&
                              styles.levelButtonTextActive,
                          ]}
                        >
                          {levelOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Jersey Number *</Text>
                  <TextInput
                    style={[styles.input, styles.jerseyInput]}
                    value={jerseyNumber}
                    onChangeText={handleJerseyNumberChange}
                    placeholder="00"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Club Team Toggle */}
              <View style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.toggleHeader}
                  onPress={handleToggleClub}
                >
                  <View style={styles.toggleLeft}>
                    <Ionicons
                      name="trophy"
                      size={24}
                      color={theme.colors.primary}
                    />
                    <View style={styles.toggleTextContainer}>
                      <Text style={styles.sectionTitle}>Club Team</Text>
                      <Text style={styles.toggleSubtitle}>
                        {clubEnabled
                          ? 'Double the pride, double the grind'
                          : 'Tap to add your club team'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggleSwitch,
                      clubEnabled && styles.toggleSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        clubEnabled && styles.toggleKnobActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {/* Club Team Form */}
                {clubEnabled && (
                  <Animated.View
                    style={[
                      styles.clubForm,
                      {
                        opacity: clubFormFadeAnim,
                        transform: [{ translateY: clubFormSlideAnim }],
                      },
                    ]}
                  >
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Organization Name *</Text>
                      <TextInput
                        style={styles.input}
                        value={clubOrgName}
                        onChangeText={setClubOrgName}
                        placeholder="Boston Lacrosse Club"
                        placeholderTextColor={theme.colors.textTertiary}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Team Name *</Text>
                      <TextInput
                        style={styles.input}
                        value={clubTeamName}
                        onChangeText={setClubTeamName}
                        placeholder="Elite, Select, etc."
                        placeholderTextColor={theme.colors.textTertiary}
                      />
                    </View>

                    <View style={styles.inputRow}>
                      <View
                        style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}
                      >
                        <Text style={styles.label}>City *</Text>
                        <TextInput
                          style={styles.input}
                          value={clubCity}
                          onChangeText={setClubCity}
                          placeholder="Boston"
                          placeholderTextColor={theme.colors.textTertiary}
                        />
                      </View>

                      <View
                        style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}
                      >
                        <Text style={styles.label}>State *</Text>
                        <TextInput
                          style={styles.input}
                          value={clubState}
                          onChangeText={setClubState}
                          placeholder="MA"
                          placeholderTextColor={theme.colors.textTertiary}
                          maxLength={2}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Jersey Number</Text>
                      <TextInput
                        style={[styles.input, styles.jerseyInput]}
                        value={clubJerseyNumber}
                        onChangeText={handleClubJerseyNumberChange}
                        placeholder="00"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                  </Animated.View>
                )}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !isFormValid() && styles.disabledButton,
                ]}
                onPress={handleContinue}
                activeOpacity={isFormValid() ? 0.8 : 1}
                disabled={!isFormValid()}
              >
                <LinearGradient
                  colors={
                    isFormValid()
                      ? [
                          theme.colors.primary,
                          theme.colors.primaryDark || theme.colors.primary,
                        ]
                      : ['#D1D5DB', '#9CA3AF']
                  }
                  style={styles.buttonGradient}
                >
                  <Text
                    style={[
                      styles.continueButtonText,
                      !isFormValid() && styles.disabledButtonText,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={isFormValid() ? '#FFFFFF' : '#6B7280'}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper function for division colors
const getDivisionColor = (division: string) => {
  switch (division) {
    case 'D1':
      return '#FF6B35';
    case 'D2':
      return '#4ECDC4';
    case 'D3':
      return '#45B7D1';
    case 'D4':
      return '#96CEB4';
    default:
      return '#95A5A6';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    marginLeft: 36,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  jerseyInput: {
    width: 80,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  suggestionLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  divisionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  divisionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  manualEntryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  manualEntryText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  clubForm: {
    marginTop: 16,
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
  continueButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
});
