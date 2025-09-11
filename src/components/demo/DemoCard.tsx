import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface DemoCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  onPress: () => void;
  completed?: boolean | undefined;
}

export const DemoCard: React.FC<DemoCardProps> = ({
  title,
  subtitle,
  icon,
  gradientColors,
  onPress,
  completed = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          completed
            ? [theme.colors.neutral200, theme.colors.neutral300]
            : gradientColors
        }
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={completed ? 'checkmark-circle' : icon}
              size={32}
              color={completed ? theme.colors.success : theme.colors.white}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, completed && styles.titleCompleted]}>
              {title}
            </Text>
            <Text
              style={[styles.subtitle, completed && styles.subtitleCompleted]}
            >
              {completed ? 'Completed' : subtitle}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                completed ? theme.colors.textSecondary : theme.colors.white
              }
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
    marginBottom: 4,
  },
  titleCompleted: {
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.white,
    opacity: 0.9,
  },
  subtitleCompleted: {
    color: theme.colors.textSecondary,
  },
  arrowContainer: {
    marginLeft: 12,
  },
});
