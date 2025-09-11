import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface SkillsDrillsModalProps {
  visible: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

export const SkillsDrillsModal: React.FC<SkillsDrillsModalProps> = ({
  visible,
  onClose,
  demoMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDrills, setSelectedDrills] = useState<string[]>([
    'reaction-saves',
  ]);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return { backgroundColor: theme.colors.success };
      case 'Intermediate':
        return { backgroundColor: theme.colors.warning };
      case 'Advanced':
        return { backgroundColor: theme.colors.error };
      default:
        return { backgroundColor: theme.colors.neutral400 };
    }
  };

  const steps = [
    {
      title: 'Choose Your Drills',
      description: 'Select training exercises to improve your skills',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Goalkeeper Drills</Text>

          {[
            {
              id: 'reaction-saves',
              name: 'Reaction Saves',
              description: 'Quick reflex training with tennis balls',
              difficulty: 'Intermediate',
              duration: '15 min',
              icon: 'flash',
            },
            {
              id: 'footwork',
              name: 'Footwork Ladder',
              description: 'Agility and positioning drills',
              difficulty: 'Beginner',
              duration: '10 min',
              icon: 'walk',
            },
            {
              id: 'clearing',
              name: 'Clearing Practice',
              description: 'Outlet passes and field awareness',
              difficulty: 'Advanced',
              duration: '20 min',
              icon: 'american-football',
            },
          ].map(drill => (
            <TouchableOpacity
              key={drill.id}
              style={[
                styles.drillCard,
                selectedDrills.includes(drill.id) && styles.drillCardSelected,
              ]}
              onPress={() => {
                if (selectedDrills.includes(drill.id)) {
                  setSelectedDrills(prev => prev.filter(id => id !== drill.id));
                } else {
                  setSelectedDrills(prev => [...prev, drill.id]);
                }
              }}
            >
              <View style={styles.drillIcon}>
                <Ionicons
                  name={drill.icon as any}
                  size={24}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.drillInfo}>
                <Text style={styles.drillName}>{drill.name}</Text>
                <Text style={styles.drillDescription}>{drill.description}</Text>
                <View style={styles.drillMeta}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      getDifficultyColor(drill.difficulty),
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {drill.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.drillDuration}>{drill.duration}</Text>
                </View>
              </View>
              {selectedDrills.includes(drill.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.success}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: 'Set Your Schedule',
      description: 'Plan when and how often to practice',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Training Schedule</Text>

          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleTitle}>Recommended Plan</Text>
            <Text style={styles.scheduleDescription}>
              Based on your selected drills, we recommend 3-4 sessions per week
            </Text>

            <View style={styles.weeklySchedule}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                (day, index) => {
                  const isActive = [1, 3, 5].includes(index); // Tue, Thu, Sat
                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayButton,
                        isActive && styles.dayButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isActive && styles.dayTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </View>

          <View style={styles.reminderSetting}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Practice Reminders</Text>
              <Text style={styles.reminderDescription}>
                Get notified when it's time to train
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{
                false: theme.colors.neutral300,
                true: theme.colors.primary,
              }}
            />
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={20} color={theme.colors.warning} />
            <Text style={styles.tipText}>
              Consistency is key! Short, regular sessions are more effective
              than long, infrequent ones.
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: 'Track Progress',
      description: 'Monitor your improvement over time',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Your Progress</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>This Week</Text>
              <Text style={styles.progressPercentage}>67%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '67%' }]} />
            </View>
            <Text style={styles.progressText}>2 of 3 sessions completed</Text>
          </View>

          <Text style={styles.sectionTitle}>Skill Metrics</Text>
          {[
            {
              skill: 'Reaction Time',
              current: 0.42,
              previous: 0.48,
              unit: 'sec',
              improved: true,
            },
            {
              skill: 'Save Percentage',
              current: 78,
              previous: 74,
              unit: '%',
              improved: true,
            },
            {
              skill: 'Clearing Accuracy',
              current: 85,
              previous: 87,
              unit: '%',
              improved: false,
            },
          ].map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{metric.skill}</Text>
                <View style={styles.metricValues}>
                  <Text style={styles.metricCurrent}>
                    {metric.current}
                    {metric.unit}
                  </Text>
                  <View
                    style={[
                      styles.metricChange,
                      metric.improved && styles.metricImproved,
                    ]}
                  >
                    <Ionicons
                      name={metric.improved ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={
                        metric.improved
                          ? theme.colors.success
                          : theme.colors.error
                      }
                    />
                    <Text
                      style={[
                        styles.metricChangeText,
                        metric.improved && styles.metricChangeImproved,
                      ]}
                    >
                      {Math.abs(metric.current - metric.previous).toFixed(2)}
                      {metric.unit}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Detailed Analytics</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.error, '#EF4444']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Skills & Drills</Text>
            <View style={styles.headerSpacer} />
          </View>

          {demoMode && (
            <View style={styles.demoIndicator}>
              <Text style={styles.demoText}>Demo Mode</Text>
            </View>
          )}
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{steps[currentStep]?.title}</Text>
            <Text style={styles.stepDescription}>
              {steps[currentStep]?.description}
            </Text>
          </View>

          {steps[currentStep]?.content}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.progressIndicator}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.previousButton}
              >
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={[theme.colors.error, '#EF4444']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  demoIndicator: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  stepContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  drillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  drillCardSelected: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  drillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  drillInfo: {
    flex: 1,
  },
  drillName: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  drillDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  drillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
  },
  drillDuration: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  scheduleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  weeklySchedule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  dayTextActive: {
    color: theme.colors.white,
  },
  reminderSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  reminderDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warning + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.neutral200,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  metricCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricName: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  metricValues: {
    alignItems: 'flex-end',
  },
  metricCurrent: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricImproved: {},
  metricChangeText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.error,
  },
  metricChangeImproved: {
    color: theme.colors.success,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  viewDetailsText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
    marginRight: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral300,
  },
  progressDotActive: {
    backgroundColor: theme.colors.error,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.error,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  previousButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
});
