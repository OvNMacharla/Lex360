import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Switch,
  Avatar,
  Divider,
  Badge,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { logout } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { colors } from '../../styles/colors';
import { USER_ROLES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
  };

  const quickActions = [
    {
      title: 'Edit Profile',
      icon: 'account-edit-outline',
      color: '#4285F4',
      onPress: () => navigation.navigate('InApp', { screen: 'EditProfile' }),
    },
    {
      title: 'Settings',
      icon: 'cog-outline',
      color: '#34A853',
      onPress: () => navigation.navigate('InApp', { screen: 'SettingsScreen' }),
    },
    {
      title: 'Help',
      icon: 'help-circle-outline',
      color: '#FF9800',
      onPress: () => navigation.navigate('InApp', { screen: 'HelpScreen' }),
    },
    {
      title: 'About',
      icon: 'information-outline',
      color: '#9C27B0',
      onPress: () => navigation.navigate('InApp', { screen: 'AboutScreen' }),
    },
  ];

  const menuOptions = [
    {
      title: 'Feedback & Support',
      subtitle: 'Send suggestions or report issues',
      icon: 'message-text-outline',
      rightIcon: 'chevron-right',
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      title: 'Privacy Settings',
      subtitle: 'Manage your data and privacy preferences',
      icon: 'shield-account-outline',
      rightIcon: 'chevron-right',
      onPress: () => navigation.navigate('InApp', { screen: 'PrivacyScreen' }),
    },
    {
      title: 'Notifications',
      subtitle: 'Customize your notification preferences',
      icon: 'bell-outline',
      rightIcon: 'chevron-right',
      onPress: () => navigation.navigate('InApp', { screen: 'NotificationSettings' }),
    },
  ];

  const lawyerStats = user?.role === USER_ROLES.LAWYER ? [
    { label: 'Cases Won', value: '42', icon: 'trophy', color: '#FFD700' },
    { label: 'Rating', value: '4.8', icon: 'star', color: '#FF9800' },
    { label: 'Experience', value: '8 Yrs', icon: 'clock', color: '#2196F3' },
    { label: 'Clients', value: '156', icon: 'account-group', color: '#4CAF50' },
  ] : [
    { label: 'Cases Filed', value: '12', icon: 'file-document', color: '#2196F3' },
    { label: 'Consultations', value: '28', icon: 'chat', color: '#4CAF50' },
    { label: 'Documents', value: '45', icon: 'folder', color: '#FF9800' },
  ];

  const ProfileHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Floating particles effect background */}
                  <View style={styles.particleContainer}>
                    <View style={[styles.particle, styles.particle1]} />
                    <View style={[styles.particle, styles.particle2]} />
                    <View style={[styles.particle, styles.particle3]} />
                  </View>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={90}
              label={user?.name?.charAt(0) || 'U'}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <View style={styles.roleContainer}>
              <Badge size={20} style={styles.roleBadge}>
                {user?.role === USER_ROLES.LAWYER ? 'Lawyer' : 'Client'}
              </Badge>
              {user?.role === USER_ROLES.LAWYER && (
                <MaterialCommunityIcons 
                  name="check-decagram" 
                  size={18} 
                  color="#4CAF50" 
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.role === USER_ROLES.LAWYER && (
              <Text style={styles.specialization}>Civil Law Specialist</Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const QuickActions = () => (
    <Surface style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
              <MaterialCommunityIcons name={action.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const StatsSection = () => (
    <Surface style={styles.statsContainer}>
      <View style={styles.statsTitleContainer}>
        <Text style={styles.sectionTitle}>
          {user?.role === USER_ROLES.LAWYER ? 'Professional Stats' : 'Your Activity'}
        </Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="chart-line" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        {lawyerStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons 
                name={stat.icon} 
                size={20} 
                color={stat.color} 
              />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </Surface>
  );

  const SettingsSection = () => (
    <Surface style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIconBg, { backgroundColor: '#FF9800' }]}>
            <MaterialCommunityIcons name="bell" size={20} color="#fff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Get updates about your cases</Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
          trackColor={{ false: '#767577', true: colors.primary + '40' }}
        />
      </View>

      <Divider style={styles.settingDivider} />

      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIconBg, { backgroundColor: '#673AB7' }]}>
            <MaterialCommunityIcons name="theme-light-dark" size={20} color="#fff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingSubtitle}>Switch to dark theme</Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={() => dispatch(toggleTheme())}
          thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
          trackColor={{ false: '#767577', true: colors.primary + '40' }}
        />
      </View>
    </Surface>
  );

  const MenuSection = () => (
    <Surface style={styles.menuContainer}>
      <Text style={styles.sectionTitle}>More Options</Text>
      {menuOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={option.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons 
                name={option.icon} 
                size={20} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{option.title}</Text>
              <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
            </View>
          </View>
          <MaterialCommunityIcons 
            name={option.rightIcon} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      ))}
    </Surface>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <ProfileHeader />
      <QuickActions />
      <StatsSection />
      <SettingsSection />
      <MenuSection />

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutContainer}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: colors.primary,
  },
    particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '20%',
  },
  particle3: {
    top: '40%',
    left: '70%',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },

  // Quick Actions
  quickActionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Stats Section
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  statsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Settings Section
  settingsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingDivider: {
    marginVertical: 12,
    backgroundColor: colors.border || '#E0E0E0',
  },

  // Menu Section
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Common Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Logout Button
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  bottomPadding: {
    height: 40,
  },
});