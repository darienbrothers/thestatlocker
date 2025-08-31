import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useGamificationStore } from '../stores/gamificationStore';
import LogGameModal from '../components/LogGameModal';
import { COLORS, FONTS, fontSizes } from '../constants/theme';
import { MainTabParamList } from '../types';

interface PositionStrengthsData {
  [key: string]: string[];
}

interface GenderStrengths {
  boys: PositionStrengthsData;
  girls: PositionStrengthsData;
}

const Tab = createBottomTabNavigator<MainTabParamList>();

// Enhanced Home Screen with Dashboard
function HomeScreen() {
  const { user } = useAuthStore();
  const { totalXP, currentLevel, xpToNextLevel } = useGamificationStore((state) => ({
    totalXP: state.totalXP,
    currentLevel: state.currentLevel,
    xpToNextLevel: state.xpToNextLevel
  }));
  
  const { 
    games, 
    onboardingChecklists, 
    getTotalGames, 
    getRecentGames, 
    getPendingChecklists,
    initializeChecklists,
    fetchUserGames
  } = useGameStore();

  const [showLogGameModal, setShowLogGameModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'school' | 'club'>('school');

  // Debug logging to understand user data
  useEffect(() => {
    if (user) {
      console.log('User data:', {
        highSchool: user.highSchool,
        club: user.club,
        position: user.position,
        graduationYear: user.graduationYear
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      initializeChecklists(user.uid);
      fetchUserGames(user.uid);
    }
  }, [user?.uid]);

  const pendingChecklists = getPendingChecklists();
  const recentGames = getRecentGames(3);
  const totalGames = getTotalGames();

  // Calculate position-specific stats filtered by season type
  const getPositionStats = () => {
    // Filter games by selected season type
    const seasonTypeFilter = selectedSeason === 'school' ? 'School Season' : 'Club Season';
    const filteredGames = games?.filter((game: any) => game.seasonType === seasonTypeFilter) || [];

    if (!filteredGames || filteredGames.length === 0) {
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
    filteredGames.forEach((game: any) => {
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
      
      filteredGames.forEach((game: any) => {
        totalStat3 += game.stats?.saves || 0;
        totalStat4 += game.stats?.goalsAgainst || 0;
      });
    } else if (position === 'Attack') {
      // Keep default Goals/Assists for Attack
      filteredGames.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.assists || 0;
      });
    } else if (position === 'Midfield') {
      stat3Label = 'Goals';
      stat4Label = 'Ground Balls';
      stat4Icon = '🏃';
      
      filteredGames.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.groundBalls || 0;
      });
    } else if (position === 'Defense') {
      stat3Label = 'Caused TOs';
      stat4Label = 'Ground Balls';
      stat3Icon = '🛡️';
      stat4Icon = '🏃';
      
      filteredGames.forEach((game: any) => {
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
      
      filteredGames.forEach((game: any) => {
        totalFOWins += game.stats?.faceoffWins || 0;
        totalFOAttempts += (game.stats?.faceoffWins || 0) + (game.stats?.faceoffLosses || 0);
      });
      
      totalStat3 = totalFOWins;
      totalStat4 = totalFOAttempts > 0 ? Math.round((totalFOWins / totalFOAttempts) * 100) : 0;
    } else {
      // Default to Goals/Assists for any other position
      filteredGames.forEach((game: any) => {
        totalStat3 += game.stats?.goals || 0;
        totalStat4 += game.stats?.assists || 0;
      });
    }

    return {
      stat1: { icon: '🏆', value: filteredGames.length.toString(), label: 'Games' },
      stat2: { icon: '📊', value: `${wins}-${losses}`, label: 'W-L' },
      stat3: { icon: stat3Icon, value: totalStat3.toString(), label: stat3Label },
      stat4: { icon: stat4Icon, value: position === 'FOGO' && stat4Label === 'FO %' ? `${totalStat4}%` : totalStat4.toString(), label: stat4Label }
    };
  };

  const stats = getPositionStats();
  const progress = xpToNextLevel > 0 ? (totalXP % 100) / xpToNextLevel : 0;

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNavBar}>
        <TouchableOpacity style={styles.hamburgerMenu}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.tabTitle}>Home</Text>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
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
              ) : user?.photoURL ? (
                <Image 
                  source={{ uri: user.photoURL }} 
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={32} color={COLORS.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.athleteInfo}>
              <Text style={styles.athleteName}>
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Player Name"}
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

        {/* Onboarding Checklists Section */}
        {pendingChecklists.length > 0 && (
          <View style={styles.checklistSection}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Get Started</Text>
              <Text style={styles.sectionSubtitle}>Complete these steps to unlock your full potential</Text>
            </View>
            
            {pendingChecklists.map((item: any) => (
              <TouchableOpacity key={item.id} style={styles.checklistCard}>
                <View style={styles.checklistIcon}>
                  <Text style={styles.checklistEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.checklistContent}>
                  <Text style={styles.checklistTitle}>{item.title}</Text>
                  <Text style={styles.checklistDescription}>{item.description}</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+{item.xpReward} XP</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Games Section */}
        {recentGames.length > 0 && (
          <View style={styles.gamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Games</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentGames.map((game: any) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameOpponent}>vs {game.opponent}</Text>
                  <Text style={styles.gameDate}>
                    {new Date(game.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.gameStats}>
                  <Text style={styles.gameStatText}>
                    {game.stats.goals}G • {game.stats.assists}A • {game.stats.shots}S
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing for tab navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowLogGameModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Log Game Modal */}
      <LogGameModal
        visible={showLogGameModal}
        onClose={() => setShowLogGameModal(false)}
        userPosition={user?.position || 'Attack'}
      />
    </SafeAreaView>
  );
}

function StatsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>📊 Stats</Text>
      <Text style={styles.placeholderSubtext}>Track your performance</Text>
    </View>
  );
}

function RecruitingScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>🎯 Recruiting</Text>
      <Text style={styles.placeholderSubtext}>Connect with colleges</Text>
    </View>
  );
}

function GoalsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>🏆 Goals</Text>
      <Text style={styles.placeholderSubtext}>Set and achieve your targets</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 85 + insets.bottom,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: fontSizes.xs,
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Recruiting') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen 
        name="Recruiting" 
        component={RecruitingScreen}
        options={{ tabBarLabel: 'Recruiting' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ tabBarLabel: 'Goals' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  hamburgerMenu: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: fontSizes.lg,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  athleteCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePictureContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: fontSizes.xl,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 4,
  },
  athleteClass: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  playerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  tagSeparator: {
    fontSize: fontSizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: fontSizes.lg,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  checklistSection: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  checklistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checklistIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistEmoji: {
    fontSize: 20,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  checklistDescription: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  xpBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: FONTS.body,
    color: 'white',
  },
  gamesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameCard: {
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameOpponent: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  gameDate: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  gameStats: {
    marginTop: 4,
  },
  gameStatText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.primary,
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  placeholderText: {
    fontSize: fontSizes.lg,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  seasonToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  selectedToggle: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  selectedToggleText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
});
