import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@shared/theme';
import { User } from '@/shared/stores/authStore';
import XPStrip from './XPStrip';

interface ProfilePreviewProps {
  user: Partial<User>;
  currentXP: number;
  isSticky?: boolean;
}

export default function ProfilePreview({ user, currentXP, isSticky = false }: ProfilePreviewProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getCompletionPercentage = () => {
    const fields = [
      user.firstName,
      user.position,
      user.graduationYear,
      user.highSchool?.name,
      user.goals && Array.isArray(user.goals) && user.goals.length > 0 ? 1 : 0,
    ];
    const completed = fields.filter(field => field && field !== 0).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <View style={[styles.container, isSticky && styles.stickyContainer]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials(user.firstName || undefined, user.lastName || undefined)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {user.firstName ? `${user.firstName}'s Profile` : 'Your Profile'}
          </Text>
          <Text style={styles.completion}>
            {getCompletionPercentage()}% Complete
          </Text>
        </View>
      </View>

      {/* XP Progress */}
      <XPStrip currentXP={currentXP} compact showLabel={false} />

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {user.position && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Position</Text>
            <Text style={styles.statValue}>{user.position}</Text>
          </View>
        )}
        {user.graduationYear && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Grad Year</Text>
            <Text style={styles.statValue}>{user.graduationYear}</Text>
          </View>
        )}
        {user.highSchool?.name && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>School</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {user.highSchool.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.neutral900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stickyContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 200,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
  },
  completion: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  statsContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});
