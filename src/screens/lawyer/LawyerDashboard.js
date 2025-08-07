import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar, 
  Chip,
  Text,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { colors } from '../../styles/colors';

export default function LawyerDashboard() {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    { label: 'Cases This Month', value: '12', icon: 'briefcase', color: colors.primary },
    { label: 'Consultations', value: '8', icon: 'calendar', color: colors.info },
    { label: 'Questions Answered', value: '24', icon: 'help-circle', color: colors.success },
    { label: 'Rating', value: '4.8', icon: 'star', color: colors.secondary },
  ];

  const pendingTasks = [
    {
      title: 'Review property agreement for Mr. Kumar',
      deadline: 'Due in 2 hours',
      priority: 'high'
    },
    {
      title: 'Consultation with Ms. Patel at 3 PM',
      deadline: 'Today',
      priority: 'medium'
    },
    {
      title: 'Submit court filing for Shah vs. Gupta',
      deadline: 'Tomorrow',
      priority: 'high'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <Surface style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Avatar.Text 
            size={60} 
            label={user?.name?.charAt(0) || 'L'} 
            style={styles.avatar}
          />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Good morning, Adv. {user?.name || 'Lawyer'}
            </Text>
            <Paragraph style={styles.welcomeSubtitle}>
              You have 3 pending tasks today
            </Paragraph>
          </View>
        </View>
      </Surface>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons 
                  name={stat.icon} 
                  size={24} 
                  color={stat.color} 
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Monthly Progress */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text style={styles.progressTitle}>Monthly Goal Progress</Text>
          <View style={styles.progressItem}>
            <Text>Cases Completed (12/15)</Text>
            <ProgressBar progress={0.8} color={colors.primary} style={styles.progressBar} />
          </View>
          <View style={styles.progressItem}>
            <Text>Revenue Target (₹85k/₹100k)</Text>
            <ProgressBar progress={0.85} color={colors.success} style={styles.progressBar} />
          </View>
        </Card.Content>
      </Card>

      {/* Pending Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Tasks</Text>
        {pendingTasks.map((task, index) => (
          <Card key={index} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Chip 
                  mode="outlined" 
                  compact
                  style={[
                    styles.priorityChip,
                    { borderColor: getPriorityColor(task.priority) }
                  ]}
                  textStyle={{ color: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </Chip>
              </View>
              <Text style={styles.taskDeadline}>{task.deadline}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button 
            mode="contained" 
            icon="plus"
            style={styles.actionButton}
            onPress={() => console.log('Add new case')}
          >
            New Case
          </Button>
          <Button 
            mode="outlined" 
            icon="calendar-plus"
            style={styles.actionButton}
            onPress={() => console.log('Schedule consultation')}
          >
            Schedule
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return colors.error;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
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
    backgroundColor: colors.legal.navy,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    color: colors.textSecondary,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressBar: {
    marginTop: 4,
    height: 8,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
    color: colors.text,
  },
  priorityChip: {
    height: 24,
  },
  taskDeadline: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});