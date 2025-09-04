import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import { BadgeCard } from './BadgeCard';
import { badgeService, type Badge, type UserBadge, BadgeCategory } from '../../services/BadgeService';

interface BadgesListProps {
  userId: string;
  userPosition: string;
}

export const BadgesList: React.FC<BadgesListProps> = ({ userId, userPosition }) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId, userPosition]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [userBadgesData, availableBadgesData] = await Promise.all([
        badgeService.getUserBadges(userId),
        badgeService.getAvailableBadges(userPosition)
      ]);
      
      setUserBadges(userBadgesData);
      setAvailableBadges(availableBadgesData);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
  
  const filteredBadges = availableBadges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const unlockedCount = userBadges.length;
  const totalCount = availableBadges.length;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.progress}>
          {unlockedCount} / {totalCount}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        style={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategory]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}>
            All
          </Text>
        </TouchableOpacity>
        
        {Object.values(BadgeCategory).map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {formatCategoryName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.badgesContainer} showsVerticalScrollIndicator={false}>
        {filteredBadges.map(badge => {
          const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={isUnlocked}
              unlockedAt={userBadge?.unlockedAt}
            />
          );
        })}
        
        {filteredBadges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No badges in this category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const formatCategoryName = (category: BadgeCategory): string => {
  switch (category) {
    case BadgeCategory.MILESTONES:
      return 'Milestones';
    case BadgeCategory.PERFORMANCE:
      return 'Performance';
    case BadgeCategory.CONSISTENCY:
      return 'Consistency';
    case BadgeCategory.SPECIAL:
      return 'Special';
    default:
      return category;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  badgesContainer: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
