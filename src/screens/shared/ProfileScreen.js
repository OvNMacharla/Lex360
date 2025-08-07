import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  Paragraph, 
  Button, 
  Avatar, 
  List,
  Title,
  Surface,
  Divider,
  Switch
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { logout } from '../../store/authSlice';
import { colors } from '../../styles/colors';
import { USER_ROLES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { toggleTheme } from '../../store/themeSlice';

export default function ProfileScreen() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    dispatch(logout());
  };

  const profileOptions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: 'account-edit',
      onPress: () => navigation.navigate('InApp', { screen: 'EditProfile' })
    },
    {
      title: 'Feedback',
      description: 'Send suggestions or report issues',
      icon: 'message-text',
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      title: 'Settings',
      description: 'App preferences and privacy',
      icon: 'cog',
      onPress: () => navigation.navigate('InApp', { screen: 'SettingsScreen' })
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: 'help-circle',
      onPress: () => navigation.navigate('InApp', { screen: 'HelpScreen' })
    },
    {
      title: 'About',
      description: 'App version and legal information',
      icon: 'information',
      onPress: () => navigation.navigate('InApp', { screen: 'AboutScreen' })
    }
  ];

  const lawyerStats = user?.role === USER_ROLES.LAWYER ? [
    { label: 'Cases Completed', value: '45' },
    { label: 'Client Rating', value: '4.8/5' },
    { label: 'Years of Experience', value: '8' },
    { label: 'Specialization', value: 'Civil Law' }
  ] : null;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'User Name'}</Text>
            <Paragraph style={styles.email}>{user?.email}</Paragraph>
            <Text style={styles.role}>
              {user?.role === USER_ROLES.LAWYER ? 'Lawyer' : 'Client'}
            </Text>
          </View>
        </View>
        
        <Button 
          mode="outlined" 
          icon="account-edit"
          style={styles.editButton}
          onPress={() => navigation.navigate('InApp', { screen: 'EditProfile' })}
        >
          Edit Profile
        </Button>
      </Surface>

      {/* Lawyer Statistics */}
      {lawyerStats && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>Professional Summary</Text>
            <View style={styles.statsGrid}>
              {lawyerStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Quick Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons 
                name="bell" 
                size={24} 
                color={colors.primary} 
              />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates about your cases and messages
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Dark Mode"
            description="Switch to dark theme"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={() => dispatch(toggleTheme())}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Menu Options */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>More Options</Text>
          {profileOptions.map((option, index) => (
            <List.Item
              key={index}
              title={option.title}
              description={option.description}
              left={props => <List.Icon {...props} icon={option.icon} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={option.onPress}
              style={styles.menuItem}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="contained"
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={colors.error}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    color: colors.textSecondary,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  editButton: {
    borderColor: colors.primary,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    color: colors.textSecondary,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    marginVertical: 8,
  },
  menuItem: {
    paddingVertical: 4,
  },
  logoutButton: {
    margin: 16,
    paddingVertical: 8,
  },
});