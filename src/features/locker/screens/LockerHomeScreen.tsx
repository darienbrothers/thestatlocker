import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSizes, fonts, tokens, borderRadius } from '@shared/theme';
import { useAuthStore } from '@shared/stores/authStore';
import { useGameStore } from '@shared/stores/gameStore';
import LogGameModal from '@shared/components/LogGameModal';
import DrawerMenu from '@shared/components/DrawerMenu';

const LockerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { games, initializeChecklists, fetchUserGames } = useGameStore();

  const [showLogGameModal, setShowLogGameModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'school' | 'club'>('school');
  const [image, setImage] = useState<string | null>(user?.photoURL || user?.profilePicture || null);
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
  }, [games]);

  const filteredGames = games.filter((game: any) => game.userId === user?.uid);

  useEffect(() => {
    console.log('LockerHomeScreen - Filtered games:', filteredGames);
  }, [filteredGames]);


  const getTotalSaves = () => {
    return filteredGames.reduce((total, game) => {
      return total + (game.stats?.saves || 0);
    }, 0);
  };

  const getShotsFaced = () => {
    return filteredGames.reduce((total, game) => {
      return total + (game.stats?.shots || 0);
    }, 0);
  };

  const getGoalsAgainst = () => {
    return filteredGames.reduce((total, game) => {
      return total + (game.stats?.goalsAgainst || 0);
    }, 0);
  };

  const getAverageSaves = () => {
    if (filteredGames.length === 0) return '0.0';
    const avg = getTotalSaves() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getAverageShotsFaced = () => {
    if (filteredGames.length === 0) return '0.0';
    const avg = getShotsFaced() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getAverageGoalsAgainst = () => {
    if (filteredGames.length === 0) return '0.0';
    const avg = getGoalsAgainst() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getSavePercentage = () => {
    const saves = getTotalSaves();
    const shots = getShotsFaced();
    return shots > 0 ? Math.round((saves / shots) * 100) : 0;
  };


  // Tasks for new users
  const tasks = [
    {
      icon: '🥍',
      title: 'Log Your First Game',
      description: 'Track your performance and start building your stats',
      action: 'LOG_GAME',
      xpReward: 50
    },
    {
      icon: '🎯',
      title: 'Add Target Colleges',
      description: 'Build your recruiting pipeline',
      action: 'ADD_COLLEGES',
      xpReward: 30
    },
    {
      icon: '📝',
      title: 'Complete Your Profile',
      description: 'Add photos and detailed information',
      action: 'COMPLETE_PROFILE',
      xpReward: 100
    }
  ];



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
              mediaTypes: ['images'],
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
              mediaTypes: ['images'],
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


  const handleDrawerNavigation = (screen: string) => {
    console.log(`Navigating to: ${screen}`);
    Alert.alert('Navigation', `${screen} screen coming soon!`);
  };

  const handleSignOut = async () => {
    try {
      console.log('LockerHomeScreen - Starting sign out process');
      const { signOut } = useAuthStore.getState();
      await signOut();
      console.log('LockerHomeScreen - Sign out successful');
      
      // Navigate to Welcome screen after successful sign out
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' as never }],
      });
    } catch (error) {
      console.error('LockerHomeScreen - Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleTaskAction = (action: string) => {
    switch (action) {
      case 'LOG_GAME':
        setShowLogGameModal(true);
        break;
      case 'ADD_COLLEGES':
        Alert.alert('Coming Soon', 'College recruiting features will be available soon!');
        break;
      case 'COMPLETE_PROFILE':
        Alert.alert('Coming Soon', 'Profile completion features will be available soon!');
        break;
      default:
        console.log('Unknown task action:', action);
    }
  };


  const handleGameLogged = async (gameData: any) => {
    if (!user?.uid) return;
    
    try {
      // Game logged successfully - could add gamification logic here later
      console.log('Game logged:', gameData);
      fetchUserGames(user.uid);
    } catch (error) {
      console.error('Error processing gamification events:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNavBar}>
        <TouchableOpacity style={styles.hamburgerMenu} onPress={() => setShowDrawerMenu(true)}>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.tabTitle}>Home</Text>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerMenu 
        visible={showDrawerMenu} 
        onClose={() => setShowDrawerMenu(false)}
        onNavigate={handleDrawerNavigation}
        onSignOut={handleSignOut}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Header Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
              {(image || user?.photoURL || user?.profilePicture) ? (
                <Image 
                  source={{ uri: (image || user?.photoURL || user?.profilePicture)! }} 
                  style={styles.profilePicture as any}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={24} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <Text style={styles.playerName}>
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 
                   user?.firstName ? user.firstName : 
                   user?.email ? user.email.split('@')[0] : "Player Name"}
                </Text>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{user?.sport || 'Lacrosse'}</Text>
                </View>
              </View>
              <Text style={styles.playerDetails}>
                {user?.graduationYear ? `Class of ${user.graduationYear}` : 'Class of 2027'} • {user?.position || 'Position'}
              </Text>
              
              {/* Stats Row */}
              <View style={styles.playerStatsRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{user?.height || "5' 11\""}</Text>
                  <Text style={styles.playerStatLabel}>HT</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{user?.gpa || '3.85'} / 4.00</Text>
                  <Text style={styles.playerStatLabel}>GPA</Text>
                </View>
              </View>
              
              {/* Location Row */}
              <View style={styles.playerLocationRow}>
                <View style={styles.playerLocationItem}>
                  <Text style={styles.playerLocationValue}>
                    {selectedSeason === 'school' ? 
                      user?.highSchool?.name || 'High School' :
                      user?.club?.name || 'Club Team'
                    }
                  </Text>
                  <Text style={styles.playerLocationLabel}>{selectedSeason === 'school' ? 'SCHOOL' : 'CLUB'}</Text>
                </View>
                <View style={styles.playerLocationItem}>
                  <Text style={styles.playerLocationValue}>
                    {selectedSeason === 'school' ? 
                      `${user?.highSchool?.city || 'City'}, ${user?.highSchool?.state || 'State'}` :
                      `${user?.club?.city || 'City'}, ${user?.club?.state || 'State'}`
                    }
                  </Text>
                  <Text style={styles.playerLocationLabel}>HOMETOWN</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Season Toggle */}
          <View style={styles.seasonToggle}>
            <TouchableOpacity 
              style={[styles.seasonButton, selectedSeason === 'school' && styles.seasonButtonActive]}
              onPress={() => setSelectedSeason('school')}
            >
              <Text style={[styles.seasonButtonText, selectedSeason === 'school' && styles.seasonButtonTextActive]}>
                High School
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.seasonButton, selectedSeason === 'club' && styles.seasonButtonActive]}
              onPress={() => setSelectedSeason('club')}
            >
              <Text style={[styles.seasonButtonText, selectedSeason === 'club' && styles.seasonButtonTextActive]}>
                Club
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Get Started Section - Show for new users */}
        {filteredGames.length === 0 && (
          <View style={styles.getStartedSection}>
            <Text style={styles.sectionTitle}>🚀 Get Started - Unlock Your Full Potential</Text>
            <Text style={styles.getStartedSubtitle}>Complete these steps to maximize your StatLocker experience</Text>
            
            {tasks.map((item, index) => (
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
                      <View style={styles.taskProgressBar}>
                        <View style={[styles.taskProgressFill, { width: '0%' }]} />
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
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Main Stats Grid - 2x2 layout */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTotalSaves()}</Text>
            <Text style={styles.statLabel}>Total Saves</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getSavePercentage()}%</Text>
            <Text style={styles.statLabel}>Save %</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getShotsFaced()}</Text>
            <Text style={styles.statLabel}>Shots Faced</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getGoalsAgainst()}</Text>
            <Text style={styles.statLabel}>Goals Against</Text>
          </View>
        </View>


        {/* Per Game Averages */}
        <View style={styles.averagesSection}>
          <Text style={styles.sectionTitle}>Per Game Averages</Text>
          <Text style={styles.sectionSubtitle}>({filteredGames.length} Games)</Text>
          
          <View style={styles.averagesGrid}>
            <View style={styles.averageItem}>
              <Text style={styles.averageValue}>{getAverageSaves()}</Text>
              <Text style={styles.averageLabel}>Saves</Text>
            </View>
            <View style={styles.averageItem}>
              <Text style={styles.averageValue}>{getAverageShotsFaced()}</Text>
              <Text style={styles.averageLabel}>Shots Faced</Text>
            </View>
            <View style={styles.averageItem}>
              <Text style={styles.averageValue}>{getAverageGoalsAgainst()}</Text>
              <Text style={styles.averageLabel}>Goals Against</Text>
            </View>
          </View>
        </View>

        {/* Season Goals */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Season Goals</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>Save % Goal</Text>
              <Text style={styles.goalProgress}>0% / 0%</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.goalSubtext}>Set your goals in profile</Text>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>Total Saves Goal</Text>
              <Text style={styles.goalProgress}>0 / 0</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.goalSubtext}>Set your goals in profile</Text>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalLabel}>Goals Against Goal</Text>
              <Text style={styles.goalProgress}>0 / 0</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.goalSubtext}>Set your goals in profile</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          
          <View style={styles.lockedInsight}>
            <View style={styles.lockIcon}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
            <View style={styles.lockedContent}>
              <Text style={styles.lockedTitle}>AI Insights Locked</Text>
              <Text style={styles.lockedSubtext}>
                Log 3 games to unlock personalized AI insights and performance analysis
              </Text>
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsEmoji}>📅</Text>
            <Text style={styles.noEventsTitle}>No Upcoming Events</Text>
            <Text style={styles.noEventsSubtext}>
              Upload your schedule or add practice times to see upcoming events
            </Text>
          </View>
        </View>

        {/* Recent Games */}
        <View style={styles.recentGamesSection}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          
          {filteredGames.slice(-3).reverse().map((game: any, index: number) => (
            <View key={index} style={styles.recentGameItem}>
              <View style={styles.gameHeader}>
                <View style={styles.gameOpponent}>
                  <Text style={styles.opponentName}>
                    {game.isHome ? 'vs.' : '@'} {game.opponent || 'Unknown Opponent'}
                  </Text>
                  <Text style={styles.gameDate}>
                    {new Date(game.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.gameResult}>
                  <Text style={styles.scoreText}>
                    {game.teamScore || 0} - {game.opponentScore || 0}
                  </Text>
                  <Text style={[
                    styles.resultText,
                    (game.teamScore || 0) > (game.opponentScore || 0) 
                      ? styles.winText 
                      : styles.lossText
                  ]}>
                    {(game.teamScore || 0) > (game.opponentScore || 0) ? 'W' : 'L'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.gameStats}>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatValue}>{game.stats?.saves || 0}</Text>
                  <Text style={styles.gameStatLabel}>Saves</Text>
                </View>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatValue}>{game.stats?.shots || 0}</Text>
                  <Text style={styles.gameStatLabel}>Shots</Text>
                </View>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatValue}>{game.stats?.goalsAgainst || 0}</Text>
                  <Text style={styles.gameStatLabel}>GA</Text>
                </View>
                <View style={styles.gameStatItem}>
                  <Text style={styles.gameStatValue}>
                    {game.stats?.shots > 0 
                      ? ((game.stats?.saves || 0) / game.stats.shots * 100).toFixed(1) + '%'
                      : '0.0%'
                    }
                  </Text>
                  <Text style={styles.gameStatLabel}>Save %</Text>
                </View>
              </View>
            </View>
          ))}
          
          {filteredGames.length === 0 && (
            <View style={styles.noGamesContainer}>
              <Text style={styles.noGamesText}>No games logged yet</Text>
              <Text style={styles.noGamesSubtext}>Tap the + button to log your first game</Text>
            </View>
          )}
        </View>


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
        onGameLogged={handleGameLogged}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.s,
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.neutral200,
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
    fontFamily: fonts.anton,
    color: colors.textPrimary,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  athleteClass: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: tokens.spacing.s,
  },
  playerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.s,
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
  },
  tagSeparator: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginHorizontal: tokens.spacing.s,
  },
  // New Dashboard Styles
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  playerInfo: {
    flex: 1,
    marginLeft: tokens.spacing.m,
  },
  playerName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  playerDetails: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playerLocation: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // New Player Card Styles
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  sportBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  sportBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.white,
    fontWeight: '600',
  },
  playerStatsRow: {
    flexDirection: 'row',
    marginTop: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
    gap: tokens.spacing.xl,
  },
  playerStatItem: {
    alignItems: 'flex-start',
  },
  playerStatValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 24,
  },
  playerStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  playerLocationRow: {
    flexDirection: 'row',
    gap: tokens.spacing.xl,
  },
  playerLocationItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  playerLocationValue: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  playerLocationLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  seasonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.m,
    gap: tokens.spacing.l,
  },
  seasonButton: {
    backgroundColor: colors.background,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  seasonButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seasonButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  seasonButtonTextActive: {
    color: colors.white,
  },
  gamesPlayedBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.xs,
    borderRadius: borderRadius.md,
  },
  gamesPlayedText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.m,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    width: '48%',
    minHeight: 80,
    marginBottom: tokens.spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statHeader: {
    marginBottom: tokens.spacing.s,
  },
  statPercentage: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statChange: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statChangePositive: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.success,
    marginTop: 2,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: tokens.spacing.m,
    marginBottom: tokens.spacing.l,
  },
  secondaryStatItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.m,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryStatIcon: {
    fontSize: 24,
    marginBottom: tokens.spacing.xs,
  },
  secondaryStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  secondaryStatValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryStatSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  averagesSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: tokens.spacing.m,
  },
  averagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  averageItem: {
    alignItems: 'center',
  },
  averageValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  averageLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  goalsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalItem: {
    marginBottom: tokens.spacing.m,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  goalLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: colors.neutral200,
    borderRadius: 3,
    marginBottom: tokens.spacing.xs,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  goalSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  insightsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.m,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.m,
  },
  insightEmoji: {
    fontSize: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  // Locked Insight Styles
  lockedInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.m,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textSecondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.m,
  },
  lockEmoji: {
    fontSize: 20,
  },
  lockedContent: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  lockedSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  // Events Section Styles
  eventsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  eventDate: {
    width: 50,
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  eventMonth: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  eventDay: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  eventType: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs,
    borderRadius: borderRadius.sm,
  },
  eventTypeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.primary,
    fontWeight: '600',
  },
  // No Events Styles
  noEventsContainer: {
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  noEventsEmoji: {
    fontSize: 48,
    marginBottom: tokens.spacing.m,
  },
  noEventsTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.s,
  },
  noEventsSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Recent Games Section Styles
  recentGamesSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentGameItem: {
    paddingVertical: tokens.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.s,
  },
  gameOpponent: {
    flex: 1,
  },
  opponentName: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  gameDate: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gameResult: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  resultText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    fontWeight: '600',
    marginTop: 2,
  },
  winText: {
    color: colors.success,
  },
  lossText: {
    color: colors.error,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: tokens.spacing.s,
  },
  gameStatItem: {
    alignItems: 'center',
  },
  gameStatValue: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  gameStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noGamesContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  noGamesText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: tokens.spacing.xs,
  },
  noGamesSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  toggle: {
    backgroundColor: colors.background,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral200,
    borderWidth: 1,
  },
  selectedToggle: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    borderRadius: borderRadius.md,
  },
  toggleText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  selectedToggleText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
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
  getStartedSection: {
    marginBottom: tokens.spacing.l,
  },
  getStartedHeader: {
    marginBottom: tokens.spacing.m,
  },
  getStartedTitle: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  getStartedSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: tokens.spacing.m,
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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  taskEmoji: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  taskDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.s,
  },
  taskProgressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background,
  },
  taskProgressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  taskStatus: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadgeGradient: {
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.xs,
    borderRadius: borderRadius.sm,
  },
  xpBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.surface,
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
