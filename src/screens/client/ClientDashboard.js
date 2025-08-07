import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Paragraph,
  Avatar,
  Chip,
  Title,
  Surface
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../styles/colors';
import { SCREEN_NAMES } from '../../utils/constants';

export default function ClientDashboard() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);

  const quickActions = [
    {
      title: 'Find Lawyers',
      icon: 'account-search',
      description: 'Browse verified lawyers by expertise',
      screen: SCREEN_NAMES.FIND_LAWYERS,
    },
    {
      title: 'Ask AI Assistant',
      icon: 'robot',
      description: 'Get instant legal guidance',
      screen: SCREEN_NAMES.AI_CHAT,
    },
    {
      title: 'My Consultations',
      icon: 'calendar-check',
      description: 'View scheduled appointments',
      screen: SCREEN_NAMES.MY_CONSULTATIONS,
    },
    {
      title: 'Legal Documents',
      icon: 'file-document',
      description: 'Access your legal documents',
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
    }
  ];

  const recentActivity = [
    {
      type: 'consultation',
      title: 'Consultation with Adv. Sharma',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      type: 'question',
      title: 'Property dispute query answered',
      time: '1 day ago',
      status: 'answered'
    },
    {
      type: 'document',
      title: 'Rental agreement uploaded',
      time: '3 days ago',
      status: 'reviewed'
    }
  ];

  const handleAction = (screenName) => {
    if (screenName) {
      navigation.navigate('InApp', { screen: screenName });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <Surface style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Avatar.Text
            size={60}
            label={user?.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Welcome back, {user?.name || 'User'}!
            </Text>
            <Paragraph style={styles.welcomeSubtitle}>
              How can we help you today?
            </Paragraph>
          </View>
        </View>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              style={styles.actionCard}
              onPress={() => handleAction(action.screen)}
            >
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons
                  name={action.icon}
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity, index) => (
          <Card key={index} style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    { borderColor: getStatusColor(activity.status) }
                  ]}
                  textStyle={{ color: getStatusColor(activity.status) }}
                >
                  {activity.status}
                </Chip>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Legal Tip of the Day */}
      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons
              name="lightbulb"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.tipTitle}>Legal Tip of the Day</Text>
          </View>
          <Paragraph style={styles.tipText}>
            Always read the fine print before signing any contract. Pay special
            attention to termination clauses and penalty terms.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return colors.success;
    case 'answered': return colors.info;
    case 'reviewed': return colors.primary;
    default: return colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.text,
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    color: colors.text,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    color: colors.textSecondary,
  },
  activityCard: {
    marginBottom: 8,
    elevation: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    color: colors.text,
  },
  statusChip: {
    height: 24,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tipCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    marginLeft: 8,
    color: colors.text,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
