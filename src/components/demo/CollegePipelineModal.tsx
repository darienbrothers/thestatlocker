import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface CollegePipelineModalProps {
  visible: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

export const CollegePipelineModal: React.FC<CollegePipelineModalProps> = ({
  visible,
  onClose,
  demoMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    division: 'D1',
    region: 'Northeast',
    academicFocus: '',
    notificationsEnabled: true,
  });

  const steps = [
    {
      title: 'Set Your Preferences',
      description: "Tell us what you're looking for in a college program",
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.fieldLabel}>Preferred Division</Text>
          <View style={styles.divisionButtons}>
            {['D1', 'D2', 'D3', 'NAIA'].map(div => (
              <TouchableOpacity
                key={div}
                style={[
                  styles.divisionButton,
                  preferences.division === div && styles.divisionButtonActive,
                ]}
                onPress={() =>
                  setPreferences(prev => ({ ...prev, division: div }))
                }
              >
                <Text
                  style={[
                    styles.divisionButtonText,
                    preferences.division === div &&
                      styles.divisionButtonTextActive,
                  ]}
                >
                  {div}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Preferred Region</Text>
          <View style={styles.regionButtons}>
            {['Northeast', 'Southeast', 'Midwest', 'West Coast'].map(region => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionButton,
                  preferences.region === region && styles.regionButtonActive,
                ]}
                onPress={() => setPreferences(prev => ({ ...prev, region }))}
              >
                <Text
                  style={[
                    styles.regionButtonText,
                    preferences.region === region &&
                      styles.regionButtonTextActive,
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Academic Interest</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Business, Engineering, Sports Management"
            value={preferences.academicFocus}
            onChangeText={text =>
              setPreferences(prev => ({ ...prev, academicFocus: text }))
            }
          />
        </View>
      ),
    },
    {
      title: 'Connect with Coaches',
      description: 'Learn how to reach out and build relationships',
      content: (
        <View style={styles.stepContent}>
          <View style={styles.coachCard}>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>Coach Sarah Johnson</Text>
              <Text style={styles.collegeName}>Boston University</Text>
              <Text style={styles.coachTitle}>Head Coach • D1</Text>
            </View>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={20} color={theme.colors.warning} />
            <Text style={styles.tipText}>
              Tip: Personalize your message by mentioning specific achievements
              and why you're interested in their program.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Message Template</Text>
          <View style={styles.messageTemplate}>
            <Text style={styles.templateText}>
              "Hi Coach Johnson, I'm a junior goalie from Massachusetts with a
              3.8 GPA. I'm interested in BU's strong academic program and
              competitive lacrosse team. I'd love to discuss opportunities..."
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: 'Track Your Pipeline',
      description: 'Monitor your recruitment progress',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Your College Pipeline</Text>
          {[
            {
              name: 'Boston University',
              status: 'Interested',
              color: theme.colors.success,
            },
            {
              name: 'Northeastern',
              status: 'Contacted',
              color: theme.colors.info,
            },
            {
              name: 'UMass Amherst',
              status: 'Watching',
              color: theme.colors.warning,
            },
          ].map((college, index) => (
            <View key={index} style={styles.pipelineItem}>
              <View style={styles.pipelineInfo}>
                <Text style={styles.pipelineName}>{college.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: college.color },
                  ]}
                >
                  <Text style={styles.statusText}>{college.status}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          ))}

          <View style={styles.notificationSetting}>
            <Text style={styles.fieldLabel}>Recruitment Notifications</Text>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={value =>
                setPreferences(prev => ({
                  ...prev,
                  notificationsEnabled: value,
                }))
              }
              trackColor={{
                false: theme.colors.neutral300,
                true: theme.colors.primary,
              }}
            />
          </View>
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
          colors={[theme.colors.success, '#10B981']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>College Pipeline</Text>
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
                colors={[theme.colors.success, '#10B981']}
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
  fieldLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  divisionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  divisionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: theme.colors.neutral100,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
  },
  divisionButtonActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  divisionButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  divisionButtonTextActive: {
    color: theme.colors.white,
  },
  regionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  regionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral100,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
  },
  regionButtonActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  regionButtonText: {
    fontSize: 13,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  regionButtonTextActive: {
    color: theme.colors.white,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    backgroundColor: theme.colors.white,
  },
  coachCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.success,
    marginBottom: 2,
  },
  coachTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  connectButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warning + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  messageTemplate: {
    backgroundColor: theme.colors.neutral50,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  templateText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  pipelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pipelineInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pipelineName: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
  },
  notificationSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
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
    backgroundColor: theme.colors.success,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.success,
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
