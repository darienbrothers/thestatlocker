import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';

interface DemoModalManagerProps {
  visible: boolean;
  onClose: () => void;
  demoType: 'game_tracking' | 'recruiting' | 'profile' | 'skills' | null;
  children: React.ReactNode;
}

const DemoModalManager: React.FC<DemoModalManagerProps> = ({
  visible,
  onClose,
  demoType,
  children,
}) => {
  const getDemoDescription = () => {
    switch (demoType) {
      case 'game_tracking':
        return 'See how game tracking works';
      case 'recruiting':
        return 'Explore recruiting tools';
      case 'profile':
        return 'Tour profile features';
      case 'skills':
        return 'Discover training system';
      default:
        return 'Exploring features';
    }
  };

  if (!visible || !demoType) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Demo Header Banner */}
        <LinearGradient
          colors={[colors.info, '#3B82F6']}
          style={styles.demoHeader}
        >
          <View style={styles.demoHeaderContent}>
            <View style={styles.demoIndicator}>
              <Ionicons name="eye" size={20} color={colors.surface} />
              <Text style={styles.demoTitle}>👀 Preview Mode</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.demoDescription}>{getDemoDescription()}</Text>
        </LinearGradient>

        {/* Demo Content */}
        <View style={styles.content}>{children}</View>

        {/* Demo Footer with CTAs */}
        <View style={styles.demoFooter}>
          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Explore More</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Start Your Own</Text>
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
    backgroundColor: colors.background,
  },
  demoHeader: {
    paddingTop: 60,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
  },
  demoHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  demoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
    marginLeft: spacing.s,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.surface,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  demoFooter: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    padding: spacing.l,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
  },
});

export default DemoModalManager;
