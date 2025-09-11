import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';
import { DEMO_PROFILE } from '@shared/data/mockData';
import DemoModalManager from './DemoModalManager';

interface ProfilePreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  visible,
  onClose,
}) => {
  const { basicInfo, stats, achievements, highlights, academics } =
    DEMO_PROFILE;

  return (
    <DemoModalManager visible={visible} onClose={onClose} demoType="profile">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.headerGradient}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {basicInfo.firstName[0]}
                    {basicInfo.lastName[0]}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="camera" size={16} color={colors.surface} />
                </TouchableOpacity>
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>
                  {basicInfo.firstName} {basicInfo.lastName}
                </Text>
                <Text style={styles.playerPosition}>
                  {basicInfo.position} • #{basicInfo.jerseyNumber}
                </Text>
                <Text style={styles.playerSchool}>
                  {basicInfo.school} • Class of {basicInfo.graduationYear}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.goals}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.assists}</Text>
            <Text style={styles.statLabel}>Assists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{basicInfo.bio}</Text>
            <TouchableOpacity style={styles.editLink}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.editLinkText}>Edit Bio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Physical Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>
          <View style={styles.physicalStats}>
            <View style={styles.physicalStatItem}>
              <Text style={styles.physicalStatLabel}>Height</Text>
              <Text style={styles.physicalStatValue}>{basicInfo.height}</Text>
            </View>
            <View style={styles.physicalStatItem}>
              <Text style={styles.physicalStatLabel}>Weight</Text>
              <Text style={styles.physicalStatValue}>{basicInfo.weight}</Text>
            </View>
            <View style={styles.physicalStatItem}>
              <Text style={styles.physicalStatLabel}>Dominant Hand</Text>
              <Text style={styles.physicalStatValue}>
                {basicInfo.dominantHand}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={20} color={colors.warning} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDate}>{achievement.year}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Season Stats Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Season Performance</Text>
          <View style={styles.seasonStats}>
            <View style={styles.seasonStatCard}>
              <Text style={styles.seasonStatTitle}>Shooting</Text>
              <Text style={styles.seasonStatValue}>
                {stats.shootingPercentage}%
              </Text>
              <Text style={styles.seasonStatDetail}>
                {stats.goals}/{stats.shots} shots
              </Text>
            </View>
            <View style={styles.seasonStatCard}>
              <Text style={styles.seasonStatTitle}>Face-offs</Text>
              <Text style={styles.seasonStatValue}>
                {stats.faceoffPercentage}%
              </Text>
              <Text style={styles.seasonStatDetail}>
                {stats.faceoffWins}/{stats.faceoffAttempts} won
              </Text>
            </View>
            <View style={styles.seasonStatCard}>
              <Text style={styles.seasonStatTitle}>Ground Balls</Text>
              <Text style={styles.seasonStatValue}>{stats.groundBalls}</Text>
              <Text style={styles.seasonStatDetail}>
                {(stats.groundBalls / stats.gamesPlayed).toFixed(1)} per game
              </Text>
            </View>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎥 Highlight Reel</Text>
          <View style={styles.highlightsList}>
            {highlights.map((highlight, index) => (
              <TouchableOpacity key={index} style={styles.highlightItem}>
                <View style={styles.highlightThumbnail}>
                  <Ionicons
                    name="play-circle"
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightDate}>{highlight.date}</Text>
                  <Text style={styles.highlightViews}>
                    {highlight.views} views
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addHighlightButton}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.addHighlightGradient}
            >
              <Ionicons name="add" size={20} color={colors.surface} />
              <Text style={styles.addHighlightText}>Add New Highlight</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Academics</Text>
          <View style={styles.academicCard}>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>GPA</Text>
              <Text style={styles.academicValue}>{academics.gpa}</Text>
            </View>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>SAT Score</Text>
              <Text style={styles.academicValue}>{academics.satScore}</Text>
            </View>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>Intended Major</Text>
              <Text style={styles.academicValue}>
                {academics.intendedMajor}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{basicInfo.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{basicInfo.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{basicInfo.location}</Text>
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
  profileHeader: {
    marginBottom: spacing.m,
  },
  headerGradient: {
    padding: spacing.l,
    paddingTop: spacing.xl,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface + '40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarText: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.surface + 'E0',
    marginBottom: 2,
  },
  playerSchool: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.surface + 'C0',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.m,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    marginBottom: spacing.m,
    elevation: 2,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: spacing.m,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  bioCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
  },
  bioText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.s,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  physicalStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
  },
  physicalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  physicalStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  physicalStatValue: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
  },
  achievementsList: {
    gap: spacing.s,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    gap: spacing.s,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  achievementDate: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seasonStats: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  seasonStatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    alignItems: 'center',
  },
  seasonStatTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  seasonStatValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.primary,
  },
  seasonStatDetail: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  highlightsList: {
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    gap: spacing.s,
  },
  highlightThumbnail: {
    width: 60,
    height: 40,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  highlightDate: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  highlightViews: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  addHighlightButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  addHighlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    gap: spacing.s,
  },
  addHighlightText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
  },
  academicCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
  },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  academicLabel: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  academicValue: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    gap: spacing.s,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  contactText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
  },
});

export default ProfilePreviewModal;
