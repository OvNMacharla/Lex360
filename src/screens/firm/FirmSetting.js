// Path: src/screens/firm/FirmSettings.js

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { 
  Text,
  Surface,
  Avatar,
  Button,
  TextInput,
  List,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const colors = {
  primary: '#0F0F23',
  secondary: '#D4AF37',
  background: '#FAFBFF',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gradient: {
    primary: ['#0F0F23', '#1A1A3A'],
  }
};

export default function FirmSettings() {
  const navigation = useNavigation();
  const [firmName, setFirmName] = useState('Kumar & Associates');
  const [firmEmail, setFirmEmail] = useState('info@kumarassociates.com');
  const [firmPhone, setFirmPhone] = useState('+91 98765 43210');
  const [firmAddress, setFirmAddress] = useState('123 Law Street, Hyderabad, Telangana');
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [caseUpdates, setCaseUpdates] = useState(true);
  const [clientUpdates, setClientUpdates] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Surface style={styles.sectionCard}>
        {children}
      </Surface>
    </View>
  );

  const SettingsItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const SwitchItem = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.textSecondary + '30', true: colors.primary + '30' }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );

  const handleSave = () => {
    Alert.alert(
      'Settings Saved',
      'Your firm settings have been updated successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Implement logout logic
          console.log('Logging out...');
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Firm Settings</Text>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Firm Profile */}
        <SettingsSection title="Firm Profile">
          <View style={styles.profileSection}>
            <Avatar.Text 
              size={80} 
              label="KA" 
              style={[styles.firmAvatar, { backgroundColor: colors.primary }]}
              labelStyle={{ color: 'white', fontWeight: '700', fontSize: 24 }}
            />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Logo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Firm Name</Text>
            <TextInput
              value={firmName}
              onChangeText={setFirmName}
              style={styles.textInput}
              mode="outlined"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={firmEmail}
              onChangeText={setFirmEmail}
              style={styles.textInput}
              mode="outlined"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={firmPhone}
              onChangeText={setFirmPhone}
              style={styles.textInput}
              mode="outlined"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              value={firmAddress}
              onChangeText={setFirmAddress}
              style={styles.textInput}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </View>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notifications">
          <SwitchItem
            icon="email"
            title="Email Notifications"
            subtitle="Receive updates via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
          <Divider style={styles.divider} />
          
          <SwitchItem
            icon="bell"
            title="Push Notifications"
            subtitle="Get real-time alerts on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <Divider style={styles.divider} />
          
          <SwitchItem
            icon="message"
            title="SMS Notifications"
            subtitle="Receive important updates via SMS"
            value={smsNotifications}
            onValueChange={setSmsNotifications}
          />
          <Divider style={styles.divider} />
          
          <SwitchItem
            icon="briefcase"
            title="Case Updates"
            subtitle="Notifications for case status changes"
            value={caseUpdates}
            onValueChange={setCaseUpdates}
          />
          <Divider style={styles.divider} />
          
          <SwitchItem
            icon="account-group"
            title="Client Updates"
            subtitle="New client registrations and updates"
            value={clientUpdates}
            onValueChange={setClientUpdates}
          />
          <Divider style={styles.divider} />
          
          <SwitchItem
            icon="credit-card"
            title="Payment Alerts"
            subtitle="Payment confirmations and reminders"
            value={paymentAlerts}
            onValueChange={setPaymentAlerts}
          />
        </SettingsSection>

        {/* Account Settings */}
        <SettingsSection title="Account & Security">
          <SettingsItem
            icon="key"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="two-factor-authentication"
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            onPress={() => navigation.navigate('TwoFactorAuth')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="account-multiple"
            title="User Management"
            subtitle="Manage firm users and permissions"
            onPress={() => navigation.navigate('UserManagement')}
          />
        </SettingsSection>

        {/* System Settings */}
        <SettingsSection title="System & Preferences">
          <SettingsItem
            icon="backup-restore"
            title="Data Backup"
            subtitle="Backup and restore firm data"
            onPress={() => navigation.navigate('DataBackup')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="file-export"
            title="Export Data"
            subtitle="Export cases, clients, and reports"
            onPress={() => navigation.navigate('ExportData')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="cog"
            title="System Preferences"
            subtitle="App behavior and display settings"
            onPress={() => navigation.navigate('SystemPreferences')}
          />
        </SettingsSection>

        {/* Support & Legal */}
        <SettingsSection title="Support & Legal">
          <SettingsItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => navigation.navigate('Support')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="file-document"
            title="Terms of Service"
            subtitle="View our terms and conditions"
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="shield-check"
            title="Privacy Policy"
            subtitle="Learn about our privacy practices"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <Divider style={styles.divider} />
          
          <SettingsItem
            icon="information"
            title="About"
            subtitle="App version and information"
            onPress={() => navigation.navigate('About')}
          />
        </SettingsSection>

        {/* Logout */}
        <Surface style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Surface>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: 'rgba(15, 15, 35, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  firmAvatar: {
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.surface,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: colors.textSecondary + '20',
  },
  logoutSection: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});