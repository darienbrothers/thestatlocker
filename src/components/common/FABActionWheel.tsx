import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

const { height: screenHeight } = Dimensions.get('window');

interface ActionWheelOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface FABActionWheelProps {
  visible: boolean;
  onClose: () => void;
  fabPosition: { x: number; y: number };
  onLiveTrack?: () => void;
  onPostGame?: () => void;
}

export const FABActionWheel: React.FC<FABActionWheelProps> = ({
  visible,
  onClose,
  fabPosition,
  onLiveTrack,
  onPostGame,
}) => {
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [optionsScale] = useState(new Animated.Value(0));
  const [optionsRotation] = useState(new Animated.Value(0));

  const options: ActionWheelOption[] = [
    {
      id: 'live-track',
      icon: 'play-circle',
      label: 'Live Track',
      color: theme.colors.success,
      onPress: () => {
        onLiveTrack?.();
        handleOptionPress();
      },
    },
    {
      id: 'post-game',
      icon: 'stats-chart',
      label: 'Post Game',
      color: theme.colors.info,
      onPress: () => {
        onPostGame?.();
        handleOptionPress();
      },
    },
  ];

  const handleOptionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeWheel();
  };

  const openWheel = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(optionsScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(optionsRotation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeWheel = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(optionsScale, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openWheel();
    } else {
      optionsScale.setValue(0);
      overlayOpacity.setValue(0);
      optionsRotation.setValue(0);
    }
  }, [visible]);

  const getOptionPosition = (index: number, total: number) => {
    const spacing = 80;
    const startX = -(spacing * (total - 1)) / 2;

    return {
      x: startX + index * spacing,
      y: -80, // Position all options above the FAB
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeWheel}
    >
      <TouchableWithoutFeedback onPress={closeWheel}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.overlayBackground,
              {
                opacity: overlayOpacity,
              },
            ]}
          />

          <View
            style={[
              styles.wheelContainer,
              {
                left: fabPosition.x - 32, // Center on FAB
                bottom: screenHeight - fabPosition.y + 20, // Position well above FAB
              },
            ]}
          >
            {options.map((option, index) => {
              const position = getOptionPosition(index, options.length);

              return (
                <Animated.View
                  key={option.id}
                  style={[
                    styles.optionContainer,
                    {
                      transform: [
                        { translateX: position.x },
                        { translateY: position.y },
                        { scale: optionsScale },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      { backgroundColor: option.color },
                    ]}
                    onPress={option.onPress}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={option.icon}
                      size={28}
                      color={theme.colors.white}
                    />
                  </TouchableOpacity>
                  <View style={styles.labelContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  wheelContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  labelContainer: {
    position: 'absolute',
    top: -30,
    minWidth: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
    textAlign: 'center',
  },
});
