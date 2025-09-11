import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';
import { DEMO_COLLEGES } from '@shared/data/mockData';
import DemoModalManager from './DemoModalManager';

interface CollegePreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const CollegePreviewModal: React.FC<CollegePreviewModalProps> = ({
  visible,
  onClose,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer Received':
        return colors.success;
      case 'Applied':
        return colors.warning;
      case 'Contacted':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getInterestIcon = (level: string) => {
    switch (level) {
      case 'High':
        return 'heart';
      case 'Medium':
        return 'heart-half';
      case 'Low':
        return 'heart-outline';
      default:
        return 'heart-outline';
    }
  };

  return (
    <DemoModalManager visible={visible} onClose={onClose} demoType="recruiting">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsHeader}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Target Schools</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Add School</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Ionicons name="mail" size={24} color={colors.success} />
              </View>
              <Text style={styles.actionText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.warning + '20' },
                ]}
              >
                <Ionicons name="calendar" size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionText}>Schedule Visit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.info + '20' },
                ]}
              >
                <Ionicons name="document-text" size={24} color={colors.info} />
              </View>
              <Text style={styles.actionText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* College Pipeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your College Pipeline</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>All Schools</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {DEMO_COLLEGES.map(college => (
            <View key={college.id} style={styles.collegeCard}>
              <View style={styles.collegeHeader}>
                <View style={styles.collegeInfo}>
                  <Text style={styles.collegeName}>{college.name}</Text>
                  <View style={styles.collegeDetails}>
                    <Text style={styles.division}>{college.division}</Text>
                    <Text style={styles.location}>{college.location}</Text>
                  </View>
                </View>
                <View style={styles.collegeActions}>
                  <View style={styles.interestLevel}>
                    <Ionicons
                      name={getInterestIcon(college.interestLevel)}
                      size={16}
                      color={colors.error}
                    />
                    <Text style={styles.interestText}>
                      {college.interestLevel}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(college.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(college.status) },
                    ]}
                  >
                    {college.status}
                  </Text>
                </View>
                <Text style={styles.lastContact}>
                  Last contact: {college.lastContact.toLocaleDateString()}
                </Text>
              </View>

              {college.notes && (
                <Text style={styles.collegeNotes}>{college.notes}</Text>
              )}

              <View style={styles.collegeFooter}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="document-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Communication Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineIcon,
                  { backgroundColor: colors.success },
                ]}
              >
                <Ionicons name="checkmark" size={16} color={colors.surface} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Offer received from Salisbury University
                </Text>
                <Text style={styles.timelineDate}>2 days ago</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineIcon, { backgroundColor: colors.info }]}
              >
                <Ionicons name="mail" size={16} color={colors.surface} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Sent highlight video to Duke University
                </Text>
                <Text style={styles.timelineDate}>1 week ago</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineIcon,
                  { backgroundColor: colors.warning },
                ]}
              >
                <Ionicons name="document" size={16} color={colors.surface} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Application submitted to UVA
                </Text>
                <Text style={styles.timelineDate}>2 weeks ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </DemoModalManager>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsHeader: {
    flexDirection: 'row',
    padding: spacing.m,
    gap: spacing.s,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  filterText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  collegeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  collegeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  collegeInfo: {
    flex: 1,
  },
  collegeName: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  collegeDetails: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  division: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  location: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  collegeActions: {
    alignItems: 'flex-end',
  },
  interestLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interestText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.bold,
  },
  lastContact: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  collegeNotes: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.s,
    fontStyle: 'italic',
  },
  collegeFooter: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  actionButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  timeline: {
    gap: spacing.m,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
});

export default CollegePreviewModal;
