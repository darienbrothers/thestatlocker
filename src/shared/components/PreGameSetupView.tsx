import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';

interface PreGameSetupViewProps {
  opponent: string;
  setOpponent: (value: string) => void;
  gameDate: Date;
  setGameDate: (value: Date) => void;
  seasonType: 'School Season' | 'Club Season';
  setSeasonType: (value: 'School Season' | 'Club Season') => void;
  venue: string;
  setVenue: (value: string) => void;
  actualPosition: string;
  onStartGame: () => void;
}

const PreGameSetupView: React.FC<PreGameSetupViewProps> = ({
  opponent,
  setOpponent,
  gameDate,
  setGameDate,
  seasonType,
  setSeasonType,
  venue,
  setVenue,
  actualPosition,
  onStartGame,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const buttonScale = new Animated.Value(1);

  const handleStartPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onStartGame();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.iconGradient}
          >
            <Ionicons name="play" size={32} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.heroTitle}>Ready to Track Your Game?</Text>
        <Text style={styles.heroSubtitle}>
          Set up your game details and start real-time stat tracking as a{' '}
          {actualPosition}
        </Text>
      </View>

      {/* Game Setup Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Game Details</Text>

        {/* Opponent Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Opponent *</Text>
          <TextInput
            style={[styles.textInput, !opponent && styles.inputRequired]}
            value={opponent}
            onChangeText={setOpponent}
            placeholder="Enter opponent team name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
          {!opponent && (
            <Text style={styles.requiredText}>Required to start game</Text>
          )}
        </View>

        {/* Game Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Game Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {gameDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Season Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Season Type</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                seasonType === 'School Season' && styles.segmentButtonActive,
              ]}
              onPress={() => setSeasonType('School Season')}
            >
              <Text
                style={[
                  styles.segmentText,
                  seasonType === 'School Season' && styles.segmentTextActive,
                ]}
              >
                School Season
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                seasonType === 'Club Season' && styles.segmentButtonActive,
              ]}
              onPress={() => setSeasonType('Club Season')}
            >
              <Text
                style={[
                  styles.segmentText,
                  seasonType === 'Club Season' && styles.segmentTextActive,
                ]}
              >
                Club Season
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Venue (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Venue (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={venue}
            onChangeText={setVenue}
            placeholder="Enter game location"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Position Badge */}
      <View style={styles.positionSection}>
        <View style={styles.positionBadge}>
          <Ionicons name="person" size={16} color={colors.primary} />
          <Text style={styles.positionText}>Playing as {actualPosition}</Text>
        </View>
      </View>

      {/* Start Game Button */}
      <View style={styles.buttonSection}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !opponent && styles.startButtonDisabled,
            ]}
            onPress={handleStartPress}
            disabled={!opponent}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                !opponent
                  ? [colors.border, colors.border]
                  : [colors.success, '#059669']
              }
              style={styles.startButtonGradient}
            >
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.startButtonText}>Start Live Tracking</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.startButtonSubtext}>
          You can edit details and add final scores after the game
        </Text>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={gameDate}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setGameDate(selectedDate);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputRequired: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  requiredText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.text,
  },
  segmentTextActive: {
    color: colors.surface,
    fontFamily: fonts.medium,
  },
  positionSection: {
    alignItems: 'center',
    padding: spacing.md,
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  positionText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  buttonSection: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  startButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: 'white',
    marginLeft: spacing.sm,
  },
  startButtonSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PreGameSetupView;
