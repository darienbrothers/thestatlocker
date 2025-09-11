import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import { theme, COLORS, FONTS } from '@shared/theme';

type PaywallScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Paywall'
>;
type PaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface Props {
  navigation: PaywallScreenNavigationProp;
  route: PaywallScreenRouteProp;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'family',
    name: 'Family Premium',
    monthlyPrice: 29.99,
    yearlyPrice: 324,
    features: [
      'Premium for up to 4 athletes',
      'Parent read-only access',
      'Cross-sport support',
      'Early feature access',
      'All Premium features included',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 19.99,
    yearlyPrice: 216,
    badge: 'Most Popular',
    isPopular: true,
    features: [
      'AI Insights & Analytics',
      'Coach ChatBot (unlimited)',
      'Recruiting Updates',
      'Unlimited Skills & Plans',
      'Priority Support',
      'All Basic features',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 9.99,
    yearlyPrice: 108,
    features: [
      'Stat tracking',
      'Goals & Progress',
      'Basic charts',
      'PDF/CSV export',
      'Recruiting CRM',
      'Limited Skills (10 drills)',
    ],
  },
];

const faqData = [
  {
    question: 'How does billing work?',
    answer:
      "You'll be charged after your 7-day free trial ends. You can cancel anytime before then with no charge.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes! Cancel anytime from your account settings. Your subscription will remain active until the end of your billing period.',
  },
  {
    question: "What's your refund policy?",
    answer:
      "We offer a full refund within 30 days of purchase if you're not satisfied with StatLocker.",
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely! You can upgrade or downgrade your plan anytime from your account settings.',
  },
];

export default function PaywallScreen({ navigation, route }: Props) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleStartTrial = () => {
    // TODO: Integrate with subscription service
    console.log('Starting trial with plan:', selectedPlan);
    navigation.navigate('MainTabs', {
      onboardingData: route.params?.onboardingData,
    });
  };

  const handleSwitchToBasic = () => {
    setSelectedPlan('basic');
    // TODO: Integrate with subscription service
    console.log('Switching to Basic plan');
    navigation.navigate('MainTabs', {
      onboardingData: route.params?.onboardingData,
    });
  };

  const renderPricingCard = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id;
    const monthlyPrice = isAnnual ? plan.yearlyPrice / 12 : plan.monthlyPrice;
    const savings = isAnnual
      ? Math.round(
          ((plan.monthlyPrice * 12 - plan.yearlyPrice) /
            (plan.monthlyPrice * 12)) *
            100,
        )
      : 0;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.pricingCard,
          isSelected && styles.pricingCardSelected,
          plan.isPopular && styles.pricingCardPopular,
        ]}
        onPress={() => setSelectedPlan(plan.id)}
      >
        {plan.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}

        <Text style={styles.planName}>{plan.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${monthlyPrice.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>/month</Text>
        </View>

        {isAnnual && savings > 0 && (
          <Text style={styles.savings}>Save {savings}% annually</Text>
        )}

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFAQModal = () => (
    <Modal
      visible={showFAQ}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.faqContainer}>
        <View style={styles.faqHeader}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity onPress={() => setShowFAQ(false)}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.faqContent}>
          {faqData.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() =>
                setExpandedFAQ(expandedFAQ === index ? null : index)
              }
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heroHeadline}>
            Stat tracking made easy.{'\n'}Progress made visible.
          </Text>
        </View>

        {/* Trial Ribbon */}
        <View style={styles.trialRibbon}>
          <Text style={styles.trialText}>
            7‑day free trial • Card required • Cancel anytime
          </Text>
        </View>

        {/* Annual Toggle */}
        <View style={styles.toggleContainer}>
          <Text
            style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}
          >
            Monthly
          </Text>
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setIsAnnual(!isAnnual)}
          >
            <View
              style={[styles.toggleTrack, isAnnual && styles.toggleTrackActive]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  isAnnual && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.annualContainer}>
            <Text
              style={[styles.toggleText, isAnnual && styles.toggleTextActive]}
            >
              Annual
            </Text>
            {isAnnual && <Text style={styles.savingsText}>Save 10%</Text>}
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {plans.map(renderPricingCard)}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleStartTrial}
          >
            <LinearGradient
              colors={[COLORS.primary, theme.colors.primaryDark]}
              style={styles.primaryCTAGradient}
            >
              <Text style={styles.primaryCTAText}>
                Start 7‑day Free Trial (
                {plans.find(p => p.id === selectedPlan)?.name})
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCTA}
            onPress={handleSwitchToBasic}
          >
            <Text style={styles.secondaryCTAText}>Switch to Basic</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Link */}
        <TouchableOpacity
          style={styles.faqLink}
          onPress={() => setShowFAQ(true)}
        >
          <Text style={styles.faqLinkText}>Questions? View FAQ</Text>
        </TouchableOpacity>

        {/* Temporary Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() =>
            navigation.navigate('MainTabs', {
              onboardingData: route.params?.onboardingData,
            })
          }
        >
          <Text style={styles.skipButtonText}>
            Skip to Dashboard (Temporary)
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {renderFAQModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  heroHeadline: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  trialRibbon: {
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  trialText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.text,
  },
  toggle: {
    marginHorizontal: 16,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.neutral200,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  annualContainer: {
    alignItems: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: theme.colors.success,
    marginTop: 2,
  },
  pricingContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: COLORS.primary,
  },
  pricingCardPopular: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  planName: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  priceUnit: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: theme.colors.success,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  primaryCTA: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  primaryCTAGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryCTAText: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: 'white',
  },
  secondaryCTA: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryCTAText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  faqLink: {
    alignItems: 'center',
    paddingTop: 24,
  },
  faqLinkText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  faqContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral200,
  },
  faqTitle: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  faqContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral200,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  skipButton: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
