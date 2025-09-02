import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { tokens, colors, fonts, fontSizes } from '@/constants/theme';
import { useAuthStore } from '@shared/stores/authStore';
import { useGameStore } from '@shared/stores/gameStore';
import LogGameModal from '@shared/components/LogGameModal';
import DrawerMenu from '@shared/components/DrawerMenu';

const LockerHomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { games, getPendingChecklists, initializeChecklists, fetchUserGames } = useGameStore();

  const [showLogGameModal, setShowLogGameModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'school' | 'club'>('school');
  const [image, setImage] = useState<string | null>(null);
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);

  useEffect(() => {
    console.log('=== LockerHomeScreen Debug ===');
    console.log('User object exists:', !!user);
    console.log('User UID:', user?.uid);
    console.log('User email:', user?.email);
    console.log('User firstName:', user?.firstName);
    console.log('User lastName:', user?.lastName);
    console.log('User position:', user?.position);
    console.log('User graduationYear:', user?.graduationYear);
    console.log('User highSchool:', user?.highSchool);
    console.log('User club:', user?.club);
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('=== End Debug ===');
    
    if (user?.uid) {
      console.log('LockerHomeScreen - User UID:', user.uid);
      console.log('LockerHomeScreen - Full User Data:', JSON.stringify(user, null, 2));
      initializeChecklists(user.uid);
      fetchUserGames(user.uid);
    } else {
      console.log('LockerHomeScreen - No user UID found');
    }
  }, [user]);

  useEffect(() => {
    console.log('LockerHomeScreen - Games data:', games);
    console.log('LockerHomeScreen - Filtered games:', filteredGames);
  }, [games, filteredGames]);

  const pendingChecklists = getPendingChecklists();
  const filteredGames = games.filter((game: any) => game.userId === user?.uid);

  // Calculate position-specific stats filtered by season type
  const getPositionStats = () => {
    // Filter games by selected season type
    const seasonTypeFilter = selectedSeason === 'school' ? 'School Season' : 'Club Season';
    const filteredGamesBySeason = filteredGames.filter((game: any) => game.seasonType === seasonTypeFilter) || [];

    if (!filteredGamesBySeason || filteredGamesBySeason.length === 0) {
      return {
        stat1: { icon: '🏆', value: '0', label: 'Games' },
        stat2: { icon: '📊', value: '0-0', label: 'W-L' },
        stat3: { icon: '⚽', value: '0', label: 'Goals' },
        stat4: { icon: '🎯', value: '0', label: 'Assists' },
      };
    }

    const position = user?.position; // Make sure we're getting position from user
    let wins = 0;
    let losses = 0;
    let totalStat3 = 0;
    let totalStat4 = 0;
    let stat3Label = 'Goals';
    let stat4Label = 'Assists';
    let stat3Icon = '⚽';
    let stat4Icon = '🎯';

    // Calculate W-L record
    filteredGamesBySeason.forEach((game: any) => {
      if (game.teamScore && game.opponentScore) {
        if (game.teamScore > game.opponentScore) {
          wins++;
        } else {
          losses++;
        }
      }
    });

    // Calculate position-specific stats
    if (position === 'Goalie') {
      stat3Label = 'Saves';
      stat4Label = 'Goals Against';
      stat3Icon = '🥅';
      stat4Icon = '🚫';
      
      filteredGamesBySeason.forEach((game: any) => {
        totalStat3 += game.stats?.saves || 0;
        totalStat4 += game.stats?.goalsAgainst || 0;
      });
    } else if (position === 'Attack') {
      // Keep default Goals/Assists for Attack
      filteredGamesBySeason.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.assists || 0;
      });
    } else if (position === 'Midfield') {
      stat3Label = 'Goals';
      stat4Label = 'Ground Balls';
      stat4Icon = '🏃';
      
      filteredGamesBySeason.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.groundBalls || 0;
      });
    } else if (position === 'Defense') {
      stat3Label = 'Caused TOs';
      stat4Label = 'Ground Balls';
      stat3Icon = '🛡️';
      stat4Icon = '🏃';
      
      filteredGamesBySeason.forEach((game: any) => {
        totalStat3 += game.stats?.causedTurnovers || 0;
        totalStat4 += game.stats?.groundBalls || 0;
      });
    } else if (position === 'FOGO') {
      stat3Label = 'FO Wins';
      stat4Label = 'FO %';
      stat3Icon = '⚡';
      stat4Icon = '📈';
      
      let totalFOWins = 0;
      let totalFOAttempts = 0;
      
      filteredGamesBySeason.forEach((game: any) => {
        totalFOWins += game.stats?.faceoffWins || 0;
        totalFOAttempts += (game.stats?.faceoffWins || 0) + (game.stats?.faceoffLosses || 0);
      });
      
      totalStat3 = totalFOWins;
      totalStat4 = totalFOAttempts > 0 ? Math.round((totalFOWins / totalFOAttempts) * 100) : 0;
    } else {
      // Default to Goals/Assists for any other position
      filteredGamesBySeason.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.assists || 0;
      });
    }

    return {
      stat1: { icon: '🏆', value: filteredGamesBySeason.length.toString(), label: 'Games' },
      stat2: { icon: '📊', value: `${wins}-${losses}`, label: 'W-L' },
      stat3: { icon: stat3Icon, value: totalStat3.toString(), label: stat3Label },
      stat4: { icon: stat4Icon, value: position === 'FOGO' && stat4Label === 'FO %' ? `${totalStat4}%` : totalStat4.toString(), label: stat4Label }
    };
  };

  const stats = getPositionStats();

  const pickImage = async () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry, we need camera permissions to take a photo!');
              return;
            }
            
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              setImage(result.assets[0].uri);
              // TODO: Upload to Firebase and update user profile
            }
          }
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry, we need photo library permissions to select a photo!');
              return;
            }
            
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              setImage(result.assets[0].uri);
              // TODO: Upload to Firebase and update user profile
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const checklistsToShow = pendingChecklists.slice(0, 3);

  const handleDrawerNavigation = (screen: string) => {
    console.log(`Navigating to: ${screen}`);
    Alert.alert('Navigation', `${screen} screen coming soon!`);
  };

  const handleTaskAction = (action: string) => {
    switch (action) {
      case 'LOG_GAME':
        setShowLogGameModal(true);
        break;
      case 'ADD_COLLEGES':
        Alert.alert('Add Colleges', 'College selection feature coming soon!');
        break;
      case 'COMPLETE_PROFILE':
        Alert.alert('Complete Profile', 'Profile completion feature coming soon!');
        break;
      default:
        Alert.alert('Task', 'This feature is coming soon!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNavBar}>
        <TouchableOpacity style={styles.hamburgerMenu} onPress={() => setShowDrawerMenu(true)}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.tabTitle}>Home</Text>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerMenu 
        visible={showDrawerMenu} 
        onClose={() => setShowDrawerMenu(false)}
        onNavigate={handleDrawerNavigation}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Athlete Profile Card */}
        <View style={styles.athleteCard}>
          <View style={styles.athleteHeader}>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={32} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.athleteInfo}>
              <Text style={styles.athleteName}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
                 user?.firstName ? user.firstName : 
                 user?.email ? user.email.split('@')[0] : "Player Name"}
              </Text>
              <Text style={styles.athleteClass}>
                {user?.graduationYear ? `Class of ${user.graduationYear}` : 'Class of ----'}
              </Text>
              <View style={styles.playerTags}>
                <Text style={styles.tagText}>{user?.position || 'Position not set'}</Text>
                <Text style={styles.tagSeparator}>|</Text>
                <Text style={styles.tagText}>{selectedSeason === 'school' ? 'High School' : 'Club'}</Text>
              </View>
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolText}>
                  {selectedSeason === 'school' ? (
                    `🏫 ${user?.highSchool?.name || 'No high school set'}`
                  ) : (
                    `🥍 ${user?.club?.name || 'No club team set'}`
                  )}
                </Text>
              </View>
              {/* Debug info - remove after fixing */}
              <Text style={styles.debugText}>
                UID: {user?.uid || 'No UID'} | Email: {user?.email || 'No email'}
              </Text>
            </View>
          </View>
          <View style={styles.seasonToggle}>
            <TouchableOpacity 
              style={selectedSeason === 'school' ? styles.selectedToggle : styles.toggle}
              onPress={() => setSelectedSeason('school')}
            >
              <Text style={selectedSeason === 'school' ? styles.selectedToggleText : styles.toggleText}>High School</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={selectedSeason === 'club' ? styles.selectedToggle : styles.toggle}
              onPress={() => setSelectedSeason('club')}
            >
              <Text style={selectedSeason === 'club' ? styles.selectedToggleText : styles.toggleText}>Club</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>{stats.stat1.icon}</Text>
              <Text style={styles.statValue}>{stats.stat1.value}</Text>
              <Text style={styles.statLabel}>{stats.stat1.label}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>{stats.stat2.icon}</Text>
              <Text style={styles.statValue}>{stats.stat2.value}</Text>
              <Text style={styles.statLabel}>{stats.stat2.label}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>{stats.stat3.icon}</Text>
              <Text style={styles.statValue}>{stats.stat3.value}</Text>
              <Text style={styles.statLabel}>{stats.stat3.label}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>{stats.stat4.icon}</Text>
              <Text style={styles.statValue}>{stats.stat4.value}</Text>
              <Text style={styles.statLabel}>{stats.stat4.label}</Text>
            </View>
          </View>
        </View>

        {/* Get Started Section */}
        {checklistsToShow.length > 0 && (
          <View style={styles.getStartedSection}>
            <View style={styles.getStartedHeader}>
              <Text style={styles.getStartedTitle}>🚀 Get Started</Text>
              <Text style={styles.getStartedSubtitle}>Complete these steps to unlock your full potential</Text>
            </View>
            
            {checklistsToShow.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.taskCard}
                onPress={() => handleTaskAction(item.action)}
                activeOpacity={0.7}
              >
                <View style={styles.taskCardContent}>
                  <View style={styles.taskIconContainer}>
                    <Text style={styles.taskEmoji}>{item.icon}</Text>
                  </View>
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <Text style={styles.taskDescription}>{item.description}</Text>
                    <View style={styles.taskProgress}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '0%' }]} />
                      </View>
                      <Text style={styles.taskStatus}>Not Started</Text>
                    </View>
                  </View>
                  <View style={styles.taskReward}>
                    <LinearGradient
                      colors={[colors.success, '#059669']}
                      style={styles.xpBadgeGradient}
                    >
                      <Text style={styles.xpBadgeText}>+{item.xpReward} XP</Text>
                    </LinearGradient>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowLogGameModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient 
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      <LogGameModal 
        visible={showLogGameModal}
        onClose={() => setShowLogGameModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.s,
    backgroundColor: tokens.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.colors.border,
  },
  hamburgerMenu: {
    padding: tokens.spacing.s,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: tokens.typography.h1.size,
    fontFamily: fonts.heading,
    color: tokens.colors.text,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.m,
  },
  iconButton: {
    padding: tokens.spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.m,
  },
  athleteCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  profilePictureContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: tokens.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profilePicturePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tokens.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.heading,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  athleteClass: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.s,
  },
  playerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.s,
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: tokens.colors.text,
  },
  tagSeparator: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
    marginHorizontal: tokens.spacing.s,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  debugText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  seasonToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
    gap: tokens.spacing.m,
  },
  toggle: {
    backgroundColor: tokens.colors.background,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: tokens.radius.m,
    borderColor: tokens.colors.border,
    borderWidth: 1,
  },
  selectedToggle: {
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: tokens.radius.m,
  },
  toggleText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  selectedToggleText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: tokens.spacing.xs,
  },
  statValue: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.heading,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  getStartedSection: {
    marginBottom: tokens.spacing.l,
  },
  getStartedHeader: {
    marginBottom: tokens.spacing.m,
  },
  getStartedTitle: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.heading,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  getStartedSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  taskCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.m,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  taskEmoji: {
    fontSize: 24,
    color: tokens.colors.text,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.medium,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  taskDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.s,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.background,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.primary,
  },
  taskStatus: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: tokens.colors.textSecondary,
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadgeGradient: {
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.s,
  },
  xpBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: tokens.colors.surface,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LockerHomeScreen;
