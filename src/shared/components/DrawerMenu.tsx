import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@shared/theme';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onSignOut?: () => void;
}

const { width } = Dimensions.get('window');

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, onClose, onNavigate, onSignOut }) => {
  const menuItems = [
    { id: 'ai-insights', title: 'AI Insights', icon: 'sparkles', description: 'Get personalized insights' },
    { id: 'skills', title: 'Skills', icon: 'fitness', description: 'Track your development' },
    { id: 'messages', title: 'Messages', icon: 'chatbubbles', description: 'Connect with coaches' },
    { id: 'profile', title: 'Profile', icon: 'person', description: 'Manage your profile' },
    { id: 'settings', title: 'Settings', icon: 'settings', description: 'App preferences' },
  ];

  const handleItemPress = (itemId: string) => {
    onNavigate(itemId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawerContainer}>
          <SafeAreaView style={styles.drawer}>
            {/* Header */}
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.header}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>StatLocker</Text>
              <Text style={styles.headerSubtitle}>Your lacrosse journey</Text>
            </LinearGradient>

            {/* Menu Items */}
            <View style={styles.menuContent}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Sign Out Button */}
            {onSignOut && (
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  onSignOut();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.signOutIconContainer}>
                  <Ionicons 
                    name="log-out-outline" 
                    size={24} 
                    color={theme.colors.error} 
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.signOutTitle}>Sign Out</Text>
                  <Text style={styles.menuDescription}>Return to welcome screen</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: width * 0.8,
    maxWidth: 320,
  },
  drawer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fonts.jakarta.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.jakarta.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContent: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral200,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
  },
  footerText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
    marginTop: 'auto',
  },
  signOutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  signOutTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.error,
    marginBottom: 2,
  },
});

export default DrawerMenu;
