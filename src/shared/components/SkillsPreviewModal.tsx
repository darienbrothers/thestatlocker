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
import { DEMO_SKILLS_DATA } from '@shared/data/mockData';
import DemoModalManager from './DemoModalManager';

interface SkillsPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const SkillsPreviewModal: React.FC<SkillsPreviewModalProps> = ({
  visible,
  onClose,
}) => {
  const { stats, categories, drills, weeklyPlan, progress } = DEMO_SKILLS_DATA;

  return (
    <DemoModalManager visible={visible} onClose={onClose} demoType="skills">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.drillsCompleted}</Text>
            <Text style={styles.statLabel}>Drills Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Streak (Days)</Text>
          </View>
        </View>

        {/* Skill Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.drillCount} drills
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity style={[styles.filterTab, styles.activeTab]}>
            <Text style={[styles.filterText, styles.activeFilterText]}>
              Recommended
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Drill Cards */}
        <View style={styles.section}>
          {drills.map(drill => (
            <View key={drill.id} style={styles.drillCard}>
              <View style={styles.drillHeader}>
                <View style={styles.drillInfo}>
                  <Text style={styles.drillTitle}>{drill.title}</Text>
                  <Text style={styles.drillCategory}>{drill.category}</Text>
                </View>
                <View style={styles.drillMeta}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      drill.difficulty === 'Beginner'
                        ? styles.beginnerBadge
                        : drill.difficulty === 'Intermediate'
                          ? styles.intermediateBadge
                          : styles.advancedBadge,
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {drill.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.duration}>{drill.duration} min</Text>
                </View>
              </View>

              <Text style={styles.drillDescription}>{drill.description}</Text>

              <View style={styles.drillFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.rating}>{drill.rating}</Text>
                </View>
                <TouchableOpacity style={styles.startButton}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>Start Drill</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Training Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Weekly Training Plan</Text>
          <View style={styles.weeklyPlan}>
            {weeklyPlan.map((day, index) => (
              <View key={index} style={styles.dayCard}>
                <Text style={styles.dayName}>{day.day}</Text>
                {day.drills.map((drill, drillIndex) => (
                  <Text
                    key={drillIndex}
                    style={[
                      styles.dayDrill,
                      day.completed && styles.completedDrill,
                    ]}
                  >
                    {drill}
                  </Text>
                ))}
                {day.completed && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Progress Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Progress Tracking</Text>
          {progress.map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressSkill}>{item.skill}</Text>
                <Text style={styles.progressChange}>{item.change}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${item.current}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.current}% / {item.target}%
                </Text>
              </View>
            </View>
          ))}
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
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    gap: spacing.s,
  },
  filterTab: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral100,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.surface,
  },
  drillCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  drillInfo: {
    flex: 1,
  },
  drillTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
  },
  drillCategory: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  drillMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  beginnerBadge: {
    backgroundColor: colors.success + '20',
  },
  intermediateBadge: {
    backgroundColor: colors.warning + '20',
  },
  advancedBadge: {
    backgroundColor: colors.error + '20',
  },
  difficultyText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  duration: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  drillDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.m,
  },
  drillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  startButton: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  startButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
  },
  weeklyPlan: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  dayCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.s,
    alignItems: 'center',
  },
  dayName: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dayDrill: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  completedDrill: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  progressItem: {
    marginBottom: spacing.m,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  progressSkill: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  progressChange: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
    color: colors.success,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    minWidth: 60,
  },
});

export default SkillsPreviewModal;
