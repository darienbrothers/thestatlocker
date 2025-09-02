import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@shared/theme';
import type { LacrosseInsight } from '@shared/services/LacrosseAIService';

interface AIInsightCardProps {
  insight: LacrosseInsight;
  onPress?: () => void;
  onActionPress?: () => void;
  showActions?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onPress,
  onActionPress,
  showActions = true,
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: theme.colors.error.main,
          backgroundColor: theme.colors.error.light,
          icon: 'flash' as const,
        };
      case 'medium':
        return {
          color: theme.colors.warning.main,
          backgroundColor: theme.colors.warning.light,
          icon: 'trending-up' as const,
        };
      case 'low':
        return {
          color: theme.colors.info.main,
          backgroundColor: theme.colors.info.light,
          icon: 'information-circle' as const,
        };
      default:
        return {
          color: theme.colors.neutral[500],
          backgroundColor: theme.colors.neutral[100],
          icon: 'bulb' as const,
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      Performance: 'stats-chart',
      Development: 'fitness',
      Analytics: 'analytics',
      Goals: 'flag',
    };
    return iconMap[category] || 'bulb';
  };

  const priorityConfig = getPriorityConfig(insight.priority);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surface.main, theme.colors.neutral[50]]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={[styles.categoryIcon, { backgroundColor: priorityConfig.backgroundColor }]}>
              <Ionicons
                name={getCategoryIcon(insight.category)}
                size={16}
                color={priorityConfig.color}
              />
            </View>
            <View style={styles.titleText}>
              <Text style={styles.title}>{insight.title}</Text>
              <Text style={styles.category}>{insight.category}</Text>
            </View>
          </View>
          
          <View style={styles.priorityBadge}>
            <Ionicons
              name={priorityConfig.icon}
              size={12}
              color={priorityConfig.color}
            />
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {insight.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content}>{insight.content}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.metadata}>
            <Ionicons
              name="person"
              size={12}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.position}>{insight.playerPosition}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timestamp}>
              {insight.generatedAt.toLocaleDateString()}
            </Text>
          </View>

          {showActions && insight.actionable && (
            <Pressable
              onPress={onActionPress}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>Take Action</Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={theme.colors.primary.main}
              />
            </Pressable>
          )}
        </View>

        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <LinearGradient
            colors={[theme.colors.primary.main, theme.colors.primary.dark]}
            style={styles.aiBadgeGradient}
          >
            <Ionicons name="sparkles" size={10} color={theme.colors.surface.main} />
            <Text style={styles.aiText}>AI</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  gradient: {
    padding: theme.spacing.md,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  category: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    marginLeft: 4,
  },
  content: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  position: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  dot: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.radius.md,
  },
  actionText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary.main,
    marginRight: 4,
  },
  aiBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  aiBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  aiText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.surface.main,
    marginLeft: 2,
  },
});
