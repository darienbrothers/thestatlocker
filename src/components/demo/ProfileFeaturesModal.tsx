import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface ProfileFeaturesModalProps {
  visible: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

export const ProfileFeaturesModal: React.FC<ProfileFeaturesModalProps> = ({
  visible,
  onClose,
  demoMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    bio: 'Dedicated goalie with 4 years varsity experience...',
    achievements: ['All-Conference Team 2023', 'Team Captain'],
    highlights: ['Game Winner vs. Rivals', 'Championship Save'],
  });

  const steps = [
    {
      title: 'Complete Your Profile',
      description: 'Add personal information and athletic background',
      content: (
        <View style={styles.stepContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons
                  name="person"
                  size={40}
                  color={theme.colors.textSecondary}
                />
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Player Bio</Text>
            <TextInput
              style={styles.bioInput}
              multiline
              numberOfLines={4}
              placeholder="Tell coaches about your playing style, goals, and what makes you unique..."
              value={profileData.bio}
              onChangeText={text =>
                setProfileData(prev => ({ ...prev, bio: text }))
              }
            />

            <Text style={styles.fieldLabel}>Position Details</Text>
            <View style={styles.positionCard}>
              <Text style={styles.positionTitle}>Goalkeeper</Text>
              <Text style={styles.positionDescription}>
                Primary position with 4+ years experience
              </Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Add Achievements',
      description: 'Showcase your awards and accomplishments',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>

          {profileData.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Ionicons name="trophy" size={20} color={theme.colors.warning} />
              <Text style={styles.achievementText}>{achievement}</Text>
              <TouchableOpacity>
                <Ionicons
                  name="pencil"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add Achievement</Text>
          </TouchableOpacity>

          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={20} color={theme.colors.warning} />
            <Text style={styles.tipText}>
              Include team awards, individual honors, academic achievements, and
              leadership roles.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Academic Info</Text>
          <View style={styles.academicCard}>
            <View style={styles.academicItem}>
              <Text style={styles.academicLabel}>GPA</Text>
              <Text style={styles.academicValue}>3.8</Text>
            </View>
            <View style={styles.academicItem}>
              <Text style={styles.academicLabel}>SAT Score</Text>
              <Text style={styles.academicValue}>1420</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Upload Highlights',
      description: 'Add videos and photos to showcase your skills',
      content: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Highlight Videos</Text>

          {profileData.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <View style={styles.videoThumbnail}>
                <Ionicons name="play" size={24} color={theme.colors.white} />
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightTitle}>{highlight}</Text>
                <Text style={styles.highlightDuration}>0:45</Text>
              </View>
              <TouchableOpacity>
                <Ionicons
                  name="ellipsis-vertical"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.uploadButton}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.uploadButtonGradient}
            >
              <Ionicons
                name="cloud-upload"
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.uploadTips}>
            <Text style={styles.tipsTitle}>Video Tips:</Text>
            <Text style={styles.tipItem}>• Keep videos under 2 minutes</Text>
            <Text style={styles.tipItem}>
              • Show different skills and situations
            </Text>
            <Text style={styles.tipItem}>
              • Include game footage when possible
            </Text>
            <Text style={styles.tipItem}>• Add descriptive titles</Text>
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
          colors={[theme.colors.warning, '#F59E0B']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile Features</Text>
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
                colors={[theme.colors.warning, '#F59E0B']}
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
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '100%',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    backgroundColor: theme.colors.white,
    textAlignVertical: 'top',
    minHeight: 100,
    width: '100%',
    marginBottom: 20,
  },
  positionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
  },
  positionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  positionDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  achievementText: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
    marginLeft: 8,
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
  academicCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  academicItem: {
    alignItems: 'center',
  },
  academicLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  academicValue: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  videoThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral800,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  highlightDuration: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
    marginLeft: 8,
  },
  uploadTips: {
    backgroundColor: theme.colors.neutral50,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
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
    backgroundColor: theme.colors.warning,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.warning,
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
