import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@shared/theme';
import { RootStackParamList } from '@/types';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 0,
    title: 'Welcome to StatLocker',
    subtitle: 'Track faster. Improve smarter.',
    description: 'Your all-in-one athletic performance platform.',
    image: require('../../assets/logos/logoBlack.png'),
  },
  {
    id: 1,
    title: 'Track Every Stat',
    subtitle: 'Own Every Rep',
    description:
      'Log games and practices with position-specific stats that matter to your performance.',
    image: require('../../assets/images/trackStats.png'),
  },
  {
    id: 2,
    title: 'AI Insights',
    subtitle: 'Level Up Your Game',
    description:
      'Get personalized recommendations and performance analysis powered by advanced AI.',
    image: require('../../assets/images/aiInsights.png'),
  },
  {
    id: 3,
    title: 'Stay Organized',
    subtitle: 'Build Your Profile',
    description:
      'Recruiting tools to stay organized and maintain a clean athletic profile.',
    image: require('../../assets/images/planOrganize.png'),
  },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values for background effects
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation for background elements
    const createFloatingAnimation = (
      animValue: Animated.Value,
      duration: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    // Pulse animation for glow effects
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );

    createFloatingAnimation(floatingAnim1, 4000).start();
    createFloatingAnimation(floatingAnim2, 6000).start();
    pulseAnimation.start();
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  return (
    <View style={styles.container}>
      {/* Premium Background */}
      <LinearGradient
        colors={['#FAFAFA', '#F8F9FA', '#F5F6F8', '#F2F4F6']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.backgroundGradient}
      />

      {/* Floating Background Elements */}
      <Animated.View
        style={[
          styles.floatingElement1,
          {
            transform: [
              {
                translateY: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 20],
                }),
              },
              {
                translateX: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 10],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.floatingElement2,
          {
            transform: [
              {
                translateY: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [15, -15],
                }),
              },
              {
                translateX: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, -8],
                }),
              },
            ],
          },
        ]}
      />

      {/* Pulsing Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Grid Pattern Overlay */}
      <View style={styles.gridPattern} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map(slide => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.imageContainer}>
                <Image
                  source={slide.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dotContainer}
              onPress={() => goToSlide(index)}
            >
              <View
                style={[
                  styles.dot,
                  {
                    width: currentSlide === index ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      currentSlide === index
                        ? colors.primary
                        : colors.neutral300,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('NameEntry')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + 'DD']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.boldText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement1: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral200,
  },
  floatingElement2: {
    position: 'absolute',
    top: 200,
    left: 200,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral200,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral100,
    opacity: 0.1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    maxHeight: 300,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  dotContainer: {
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
  },
  linkButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.medium,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
