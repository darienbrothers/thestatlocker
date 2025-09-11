import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSizes, fonts, tokens, borderRadius } from '@shared/theme';
import { useAuthStore } from '@shared/stores/authStore';
import { useGameStore } from '@shared/stores/gameStore';
import { useProgressStore } from '@shared/stores/progressStore';
import GameTrackingModal from '@shared/components/GameTrackingModal';
import DrawerMenu from '@shared/components/DrawerMenu';
import { SmartDemoSystem } from '@/components/demo/SmartDemoSystem';
import { useSmartDemo } from '@/hooks/useSmartDemo';
import { DemoCard } from '@/components/demo/DemoCard';
import { CollegePipelineModal } from '@/components/demo/CollegePipelineModal';
import { ProfileFeaturesModal } from '@/components/demo/ProfileFeaturesModal';
import { SkillsDrillsModal } from '@/components/demo/SkillsDrillsModal';

interface LockerHomeScreenProps {
  onboardingData?: any;
}

const LockerHomeScreen: React.FC<LockerHomeScreenProps> = ({
  onboardingData,
}) => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { games, initializeChecklists, fetchUserGames } = useGameStore();
  const { progress, initializeProgress, markTaskCompleted, incrementTaskView } =
    useProgressStore();

  const [showLogGameModal, setShowLogGameModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'school' | 'club'>(
    'school',
  );
  const [image, setImage] = useState<string | null>(
    user?.photoURL || user?.profilePicture || null,
  );
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);
  const [showCollegePipelineModal, setShowCollegePipelineModal] =
    useState(false);
  const [showProfileFeaturesModal, setShowProfileFeaturesModal] =
    useState(false);
  const [showSkillsDrillsModal, setShowSkillsDrillsModal] = useState(false);
  const [showTutorialSelection, setShowTutorialSelection] = useState(false);

  // Smart Demo System
  const { activeDemoType, completeDemoType, closeDemoType } = useSmartDemo();

  useEffect(() => {
    // Initialize progress tracking
    initializeProgress(user?.uid);

    console.log('=== LockerHomeScreen Debug ===');
    console.log('User object exists:', !!user);
    console.log('User UID:', user?.uid);
    console.log('User email:', user?.email);
    console.log('User firstName:', user?.firstName);
    console.log('User lastName:', user?.lastName);
    console.log('User position:', user?.position);
    console.log('User graduationYear:', user?.graduationYear);
    console.log('User goals:', user?.goals);
    console.log('User highSchool:', user?.highSchool);
    console.log('User club:', user?.club);
    console.log('Onboarding data received:', !!onboardingData);
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('=== End Debug ===');

    if (user?.uid) {
      console.log('LockerHomeScreen - User UID:', user.uid);
      console.log(
        'LockerHomeScreen - Full User Data:',
        JSON.stringify(user, null, 2),
      );
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
    if (filteredGames.length === 0) {
      return '0.0';
    }
    const avg = getTotalSaves() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getAverageShotsFaced = () => {
    if (filteredGames.length === 0) {
      return '0.0';
    }
    const avg = getShotsFaced() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getAverageGoalsAgainst = () => {
    if (filteredGames.length === 0) {
      return '0.0';
    }
    const avg = getGoalsAgainst() / filteredGames.length;
    return avg.toFixed(1);
  };

  const getSavePercentage = () => {
    const saves = getTotalSaves();
    const shots = getShotsFaced();
    return shots > 0 ? Math.round((saves / shots) * 100) : 0;
  };

  // Get tasks from progress store with completion status
  const tasks = progress.tasks;

  // Render Season Goals based on user's onboarding goals
  const renderSeasonGoals = () => {
    if (!user?.goals || !Array.isArray(user.goals) || user.goals.length === 0) {
      return (
        <View style={styles.noGoalsContainer}>
          <Text style={styles.noGoalsText}>No season goals set yet</Text>
          <Text style={styles.noGoalsSubtext}>
            Complete onboarding to set your goals
          </Text>
        </View>
      );
    }

    return user.goals.map((goal: any, index: number) => {
      const currentValue = getCurrentStatValue(goal);
      const targetValue = goal.target || 0;
      const progress =
        targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

      return (
        <View key={index} style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>{goal.title}</Text>
            <Text style={styles.goalProgress}>
              {formatGoalValue(currentValue, goal)} /{' '}
              {formatGoalValue(targetValue, goal)}
            </Text>
          </View>
          <View style={styles.goalProgressBar}>
            <View
              style={[styles.goalProgressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.goalSubtext}>
            {progress >= 100
              ? '🎉 Goal achieved!'
              : `${Math.round(progress)}% complete`}
          </Text>
        </View>
      );
    });
  };

  // Get current stat value for a goal
  const getCurrentStatValue = (goal: any) => {
    if (!goal.category) {
      return 0;
    }

    switch (goal.category) {
      case 'saves':
        return getTotalSaves();
      case 'goals':
        return getTotalGoals();
      case 'assists':
        return getTotalAssists();
      case 'defense':
      case 'ground_balls':
        return getTotalGroundBalls();
      case 'accuracy':
        return getSavePercentage();
      default:
        return 0;
    }
  };

  // Format goal values based on category
  const formatGoalValue = (value: number, goal: any) => {
    if (goal.category === 'accuracy') {
      return `${value}%`;
    }
    return Math.round(value).toString();
  };

  // Helper functions for goal calculations
  const getTotalGoals = () => {
    return games.reduce((total, game) => {
      const stats = game.stats;
      return total + (stats?.goals || 0);
    }, 0);
  };

  const getTotalAssists = () => {
    return games.reduce((total, game) => {
      const stats = game.stats;
      return total + (stats?.assists || 0);
    }, 0);
  };

  const getTotalGroundBalls = () => {
    return games.reduce((total, game) => {
      const stats = game.stats;
      return total + (stats?.groundBalls || 0);
    }, 0);
  };

  const pickImage = async () => {
    Alert.alert('Select Profile Picture', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Sorry, we need camera permissions to take a photo!');
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled && result.assets && result.assets[0]) {
            setImage(result.assets[0].uri);
            // TODO: Upload to Firebase and update user profile
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert(
              'Sorry, we need photo library permissions to select a photo!',
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled && result.assets && result.assets[0]) {
            setImage(result.assets[0].uri);
            // TODO: Upload to Firebase and update user profile
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleDrawerNavigation = (screen: string) => {
    switch (screen) {
      case 'tutorials':
        setShowTutorialSelection(true);
        break;
      default:
        console.log(`Navigating to: ${screen}`);
        Alert.alert('Navigation', `${screen} screen coming soon!`);
        break;
    }
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

  const handleTaskAction = async (action: string) => {
    // Track task view
    await incrementTaskView(action);

    switch (action) {
      case 'DEMO_GAME_TRACKING':
        setShowLogGameModal(true);
        break;
      case 'DEMO_RECRUITING':
        setShowCollegePipelineModal(true);
        break;
      case 'DEMO_PROFILE':
        setShowProfileFeaturesModal(true);
        break;
      case 'DEMO_SKILLS':
        setShowSkillsDrillsModal(true);
        break;
      default:
        break;
    }
  };

  const handleGameLogged = async (gameData: any) => {
    if (!user?.uid) {
      return;
    }

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
        <TouchableOpacity
          style={styles.hamburgerMenu}
          onPress={() => setShowDrawerMenu(true)}
        >
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.tabTitle}>Home</Text>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerMenu
        visible={showDrawerMenu}
        onClose={() => setShowDrawerMenu(false)}
        onNavigate={handleDrawerNavigation}
        onSignOut={handleSignOut}
        showTutorials={tasks.filter(t => t.completed).length === tasks.length}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Header Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={pickImage}
            >
              {image || user?.photoURL || user?.profilePicture ? (
                <Image
                  source={{
                    uri: (image || user?.photoURL || user?.profilePicture)!,
                  }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons
                    name="person"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <Text style={styles.playerName}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName
                      ? user.firstName
                      : user?.email
                        ? user.email.split('@')[0]
                        : 'Player Name'}
                </Text>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>
                    {user?.sport || 'Lacrosse'}
                  </Text>
                </View>
              </View>
              <Text style={styles.playerDetails}>
                {user?.graduationYear
                  ? `Class of ${user.graduationYear}`
                  : 'Class of 2027'}{' '}
                • {user?.position || 'Position'}
              </Text>

              {/* Stats Row */}
              <View style={styles.playerStatsRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>
                    {user?.height || '5\' 11"'}
                  </Text>
                  <Text style={styles.playerStatLabel}>HT</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>
                    {user?.gpa ? `${user.gpa} / 4.00` : 'Not Set'}
                  </Text>
                  <Text style={styles.playerStatLabel}>GPA</Text>
                </View>
              </View>

              {/* Location Row */}
              <View style={styles.playerLocationRow}>
                <View style={styles.playerLocationItem}>
                  <Text style={styles.playerLocationValue}>
                    {selectedSeason === 'school'
                      ? user?.highSchool?.name || 'High School'
                      : user?.club?.name || 'Club Team'}
                  </Text>
                  <Text style={styles.playerLocationLabel}>
                    {selectedSeason === 'school' ? 'SCHOOL' : 'CLUB'}
                  </Text>
                </View>
                <View style={styles.playerLocationItem}>
                  <Text style={styles.playerLocationValue}>
                    {selectedSeason === 'school'
                      ? `${user?.highSchool?.city || 'City'}, ${user?.highSchool?.state || 'State'}`
                      : `${user?.club?.city || 'City'}, ${user?.club?.state || 'State'}`}
                  </Text>
                  <Text style={styles.playerLocationLabel}>HOMETOWN</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Season Toggle */}
          <View style={styles.seasonToggle}>
            <TouchableOpacity
              style={[
                styles.seasonButton,
                selectedSeason === 'school' && styles.seasonButtonActive,
              ]}
              onPress={() => setSelectedSeason('school')}
            >
              <Text
                style={[
                  styles.seasonButtonText,
                  selectedSeason === 'school' && styles.seasonButtonTextActive,
                ]}
              >
                High School
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.seasonButton,
                selectedSeason === 'club' && styles.seasonButtonActive,
              ]}
              onPress={() => setSelectedSeason('club')}
            >
              <Text
                style={[
                  styles.seasonButtonText,
                  selectedSeason === 'club' && styles.seasonButtonTextActive,
                ]}
              >
                Club
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Get Started Section - Show for new users who haven't completed all demos */}
        {filteredGames.length === 0 &&
          tasks.filter(t => t.completed).length < tasks.length && (
            <View style={styles.getStartedSection}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.getStartedHeader}
              >
                <View style={styles.getStartedHeaderContent}>
                  <Text style={styles.getStartedTitle}>
                    🚀 Welcome to StatLocker!
                  </Text>
                  <Text style={styles.getStartedSubtitle}>
                    Complete these 4 steps to unlock your full potential
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {tasks.filter(t => t.completed).length} of {tasks.length}{' '}
                      completed
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.tasksContainer}>
                <DemoCard
                  title="Game Tracking"
                  subtitle="Learn to track your performance"
                  icon="stats-chart"
                  gradientColors={[colors.primary, colors.primaryDark]}
                  onPress={() => handleTaskAction('DEMO_GAME_TRACKING')}
                  completed={
                    tasks.find(t => t.action === 'DEMO_GAME_TRACKING')
                      ?.completed || false
                  }
                />
                <DemoCard
                  title="College Pipeline"
                  subtitle="Connect with college coaches"
                  icon="school"
                  gradientColors={[colors.success, '#10B981']}
                  onPress={() => handleTaskAction('DEMO_RECRUITING')}
                  completed={
                    tasks.find(t => t.action === 'DEMO_RECRUITING')
                      ?.completed || false
                  }
                />
                <DemoCard
                  title="Profile Features"
                  subtitle="Showcase your achievements"
                  icon="person-circle"
                  gradientColors={[colors.warning, '#F59E0B']}
                  onPress={() => handleTaskAction('DEMO_PROFILE')}
                  completed={
                    tasks.find(t => t.action === 'DEMO_PROFILE')?.completed ||
                    false
                  }
                />
                <DemoCard
                  title="Skills & Drills"
                  subtitle="Improve your game"
                  icon="fitness"
                  gradientColors={[colors.error, '#EF4444']}
                  onPress={() => handleTaskAction('DEMO_SKILLS')}
                  completed={
                    tasks.find(t => t.action === 'DEMO_SKILLS')?.completed ||
                    false
                  }
                />
              </View>
            </View>
          )}

        {/* Show stat cards when all demos are completed or user has games */}
        {(filteredGames.length > 0 ||
          tasks.filter(t => t.completed).length === tasks.length) && (
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
        )}

        {/* Per Game Averages */}
        {(filteredGames.length > 0 ||
          tasks.filter(t => t.completed).length === tasks.length) && (
          <View style={styles.averagesSection}>
            <Text style={styles.sectionTitle}>Per Game Averages</Text>
            <Text style={styles.sectionSubtitle}>
              ({filteredGames.length} Games)
            </Text>

            <View style={styles.averagesGrid}>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>{getAverageSaves()}</Text>
                <Text style={styles.averageLabel}>Saves</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {getAverageShotsFaced()}
                </Text>
                <Text style={styles.averageLabel}>Shots Faced</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {getAverageGoalsAgainst()}
                </Text>
                <Text style={styles.averageLabel}>Goals Against</Text>
              </View>
            </View>
          </View>
        )}

        {/* Season Goals */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Season Goals</Text>
          {renderSeasonGoals()}
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
                Log 3 games to unlock personalized AI insights and performance
                analysis
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

          {filteredGames
            .slice(-3)
            .reverse()
            .map((game: any, index: number) => (
              <View key={index} style={styles.recentGameItem}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameOpponent}>
                    <Text style={styles.opponentName}>
                      {game.isHome ? 'vs.' : '@'}{' '}
                      {game.opponent || 'Unknown Opponent'}
                    </Text>
                    <Text style={styles.gameDate}>
                      {new Date(game.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.gameResult}>
                    <Text style={styles.scoreText}>
                      {game.teamScore || 0} - {game.opponentScore || 0}
                    </Text>
                    <Text
                      style={[
                        styles.resultText,
                        (game.teamScore || 0) > (game.opponentScore || 0)
                          ? styles.winText
                          : styles.lossText,
                      ]}
                    >
                      {(game.teamScore || 0) > (game.opponentScore || 0)
                        ? 'W'
                        : 'L'}
                    </Text>
                  </View>
                </View>

                <View style={styles.gameStats}>
                  <View style={styles.gameStatItem}>
                    <Text style={styles.gameStatValue}>
                      {game.stats?.saves || 0}
                    </Text>
                    <Text style={styles.gameStatLabel}>Saves</Text>
                  </View>
                  <View style={styles.gameStatItem}>
                    <Text style={styles.gameStatValue}>
                      {game.stats?.shots || 0}
                    </Text>
                    <Text style={styles.gameStatLabel}>Shots</Text>
                  </View>
                  <View style={styles.gameStatItem}>
                    <Text style={styles.gameStatValue}>
                      {game.stats?.goalsAgainst || 0}
                    </Text>
                    <Text style={styles.gameStatLabel}>GA</Text>
                  </View>
                  <View style={styles.gameStatItem}>
                    <Text style={styles.gameStatValue}>
                      {game.stats?.shots > 0
                        ? (
                            ((game.stats?.saves || 0) / game.stats.shots) *
                            100
                          ).toFixed(1) + '%'
                        : '0.0%'}
                    </Text>
                    <Text style={styles.gameStatLabel}>Save %</Text>
                  </View>
                </View>
              </View>
            ))}

          {filteredGames.length === 0 && (
            <View style={styles.noGamesContainer}>
              <Text style={styles.noGamesText}>No games logged yet</Text>
              <Text style={styles.noGamesSubtext}>
                Tap the + button to log your first game
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <GameTrackingModal
        visible={showLogGameModal}
        onClose={async () => {
          setShowLogGameModal(false);
          await markTaskCompleted('DEMO_GAME_TRACKING');
        }}
        initialMode="setup"
        onGameLogged={handleGameLogged}
        demoMode={true}
      />

      <CollegePipelineModal
        visible={showCollegePipelineModal}
        onClose={async () => {
          setShowCollegePipelineModal(false);
          await markTaskCompleted('DEMO_RECRUITING');
        }}
      />

      <ProfileFeaturesModal
        visible={showProfileFeaturesModal}
        onClose={async () => {
          setShowProfileFeaturesModal(false);
          await markTaskCompleted('DEMO_PROFILE');
        }}
      />

      <SkillsDrillsModal
        visible={showSkillsDrillsModal}
        onClose={async () => {
          setShowSkillsDrillsModal(false);
          await markTaskCompleted('DEMO_SKILLS');
        }}
      />

      {/* Tutorial Selection Modal */}
      <Modal
        visible={showTutorialSelection}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTutorialSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialSelectionModal}>
            <View style={styles.tutorialModalHeader}>
              <Text style={styles.tutorialModalTitle}>Choose Tutorial</Text>
              <TouchableOpacity
                onPress={() => setShowTutorialSelection(false)}
                style={styles.tutorialCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.tutorialOptionsContainer}>
              <TouchableOpacity
                style={styles.tutorialOption}
                onPress={() => {
                  setShowTutorialSelection(false);
                  setShowLogGameModal(true);
                }}
              >
                <View style={styles.tutorialOptionIcon}>
                  <Ionicons
                    name="stats-chart"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.tutorialOptionTitle}>Game Tracking</Text>
                <Text style={styles.tutorialOptionSubtitle}>
                  Learn to track your performance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tutorialOption}
                onPress={() => {
                  setShowTutorialSelection(false);
                  setShowCollegePipelineModal(true);
                }}
              >
                <View style={styles.tutorialOptionIcon}>
                  <Ionicons name="school" size={24} color={colors.primary} />
                </View>
                <Text style={styles.tutorialOptionTitle}>College Pipeline</Text>
                <Text style={styles.tutorialOptionSubtitle}>
                  Connect with college coaches
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tutorialOption}
                onPress={() => {
                  setShowTutorialSelection(false);
                  setShowProfileFeaturesModal(true);
                }}
              >
                <View style={styles.tutorialOptionIcon}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <Text style={styles.tutorialOptionTitle}>Profile Features</Text>
                <Text style={styles.tutorialOptionSubtitle}>
                  Showcase your achievements
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tutorialOption}
                onPress={() => {
                  setShowTutorialSelection(false);
                  setShowSkillsDrillsModal(true);
                }}
              >
                <View style={styles.tutorialOptionIcon}>
                  <Ionicons name="fitness" size={24} color={colors.primary} />
                </View>
                <Text style={styles.tutorialOptionTitle}>Skills & Drills</Text>
                <Text style={styles.tutorialOptionSubtitle}>
                  Improve your game
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Smart Demo System */}
      <SmartDemoSystem
        visible={activeDemoType !== null}
        demoType={activeDemoType || 'game_tracking'}
        onClose={closeDemoType}
        onComplete={async () => {
          if (activeDemoType) {
            await completeDemoType(activeDemoType);
            await markTaskCompleted(
              `DEMO_${activeDemoType.toUpperCase().replace('_', '_')}`,
            );
          }
        }}
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
  getStartedWelcomeTitle: {
    fontSize: tokens.typography.h2.size,
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  getStartedWelcomeSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: tokens.spacing.l,
    marginBottom: tokens.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.s,
    gap: tokens.spacing.s,
  },
  taskProgressBar: {
    flex: 1,
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
    minWidth: 70,
    textAlign: 'right',
  },
  taskChevron: {
    marginLeft: tokens.spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedHeaderContent: {
    padding: tokens.spacing.l,
  },
  getStartedTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.anton,
    color: colors.surface,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  getStartedSubtitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.surface,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: tokens.spacing.m,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: tokens.spacing.s,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.surface,
    opacity: 0.9,
  },
  tasksContainer: {
    padding: tokens.spacing.m,
  },
  taskCardHighlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.l,
  },
  taskNumberText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
    color: colors.surface,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  taskTime: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.success,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  taskFooter: {
    marginTop: tokens.spacing.s,
  },
  taskStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: tokens.spacing.xs,
  },
  motivationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: tokens.spacing.m,
    marginHorizontal: tokens.spacing.m,
    marginBottom: tokens.spacing.m,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.s,
  },
  progressTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  progressPercentage: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: tokens.spacing.s,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.neutral200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  taskCardCompleted: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.success,
  },
  taskNumberCompleted: {
    backgroundColor: colors.success,
  },
  taskTitleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskDescriptionCompleted: {
    color: colors.textTertiary,
  },
  taskViewCount: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textTertiary,
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  completedBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.surface,
  },
  motivationText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  noGoalsContainer: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    padding: tokens.spacing.l,
    alignItems: 'center',
    marginBottom: tokens.spacing.m,
  },
  noGoalsText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noGoalsSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textTertiary,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialSelectionModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: tokens.spacing.l,
    maxHeight: '80%',
    width: '90%',
  },
  tutorialModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  tutorialModalTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
  },
  tutorialCloseButton: {
    padding: tokens.spacing.xs,
  },
  tutorialOptionsContainer: {
    padding: tokens.spacing.l,
  },
  tutorialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.m,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: tokens.spacing.m,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  tutorialOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.m,
  },
  tutorialOptionTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tutorialOptionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
});

export default LockerHomeScreen;
