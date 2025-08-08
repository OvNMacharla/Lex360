import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Badge,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../styles/colors';
import { SCREEN_NAMES } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function ClientDashboard() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions = [
    {
      title: 'Find Lawyers',
      icon: 'account-search',
      description: 'Browse verified lawyers',
      screen: SCREEN_NAMES.FIND_LAWYERS,
      color: '#4285F4',
      gradient: ['#4285F4', '#34A853'],
    },
    {
      title: 'AI Assistant',
      icon: 'robot',
      description: 'Get instant legal help',
      screen: SCREEN_NAMES.AI_CHAT,
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FFE66D'],
    },
    {
      title: 'Consultations',
      icon: 'calendar-check',
      description: 'View appointments',
      screen: SCREEN_NAMES.MY_CONSULTATIONS,
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      title: 'Documents',
      icon: 'file-document',
      description: 'Manage documents',
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
      color: '#9B59B6',
      gradient: ['#9B59B6', '#8E44AD'],
    },
    {
      title: 'Case Status',
      icon: 'gavel',
      description: 'Track your cases',
      screen: SCREEN_NAMES.CASE_STATUS,
      color: '#E67E22',
      gradient: ['#E67E22', '#D35400'],
    },
    {
      title: 'Legal News',
      icon: 'newspaper',
      description: 'Stay updated',
      screen: SCREEN_NAMES.LEGAL_NEWS,
      color: '#3498DB',
      gradient: ['#3498DB', '#2980B9'],
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'consultation',
      title: 'Consultation with Adv. Sharma',
      subtitle: 'Property Law Discussion',
      time: '2 hours ago',
      status: 'completed',
      icon: 'account-tie',
      priority: 'high',
    },
    {
      id: 2,
      type: 'question',
      title: 'Property dispute query answered',
      subtitle: 'AI Assistant Response',
      time: '1 day ago',
      status: 'answered',
      icon: 'chat-question',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'document',
      title: 'Rental agreement uploaded',
      subtitle: 'Document Review Pending',
      time: '3 days ago',
      status: 'reviewed',
      icon: 'file-upload',
      priority: 'low',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Consultation fee processed',
      subtitle: '₹2,500 paid to Adv. Sharma',
      time: '5 days ago',
      status: 'completed',
      icon: 'credit-card',
      priority: 'low',
    },
  ];

  const legalTips = [
    {
      title: 'Contract Reading',
      content: 'Always read the fine print before signing any contract. Pay special attention to termination clauses and penalty terms.',
      category: 'Contracts',
    },
    {
      title: 'Property Rights',
      content: 'Verify property documents thoroughly before making any purchase. Check for clear titles and pending litigation.',
      category: 'Property',
    },
    {
      title: 'Employment Law',
      content: 'Keep records of all workplace communications and incidents. Documentation is crucial for employment disputes.',
      category: 'Employment',
    },
  ];

  const [currentTip, setCurrentTip] = useState(0);

  const handleAction = (screenName) => {
    if (screenName) {
      navigation.navigate('InApp', { screen: screenName });
    }
  };

  const WelcomeHeader = () => {
    const currentHour = new Date().getHours();
    const getGreeting = () => {
      if (currentHour < 12) return 'Good morning';
      if (currentHour < 17) return 'Good afternoon';
      return 'Good evening';
    };

    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={50}
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.name || 'User'}!</Text>
                <Text style={styles.tagline}>How can we help you today?</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <MaterialCommunityIcons name="bell" size={24} color="#fff" />
              <Badge size={10} style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Active Cases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const QuickActions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScroll}
      >
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => handleAction(action.screen)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={28}
                color="#fff"
              />
            </LinearGradient>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const CustomProgressBar = ({ progress, color, width: barWidth }) => (
    <View style={[styles.progressBarContainer, { width: barWidth }]}>
      <View style={[styles.progressBarFill, { 
        width: `${progress * 100}%`, 
        backgroundColor: color 
      }]} />
    </View>
  );

  const ProgressSection = () => (
    <Surface style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
        <Text style={styles.progressTitle}>Your Progress</Text>
      </View>
      
      <View style={styles.progressItem}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Case Resolution</Text>
          <Text style={styles.progressPercent}>75%</Text>
        </View>
        <CustomProgressBar 
          progress={0.75} 
          width={width - 80} 
          color={colors.primary}
        />
      </View>

      <View style={styles.progressItem}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Document Completion</Text>
          <Text style={styles.progressPercent}>60%</Text>
        </View>
        <CustomProgressBar 
          progress={0.6} 
          width={width - 80} 
          color="#4CAF50"
        />
      </View>
    </Surface>
  );

  const RecentActivity = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentActivity.map((activity, index) => (
        <TouchableOpacity key={activity.id} style={styles.activityCard} activeOpacity={0.7}>
          <View style={styles.activityLeft}>
            <View style={[styles.activityIcon, { backgroundColor: getStatusColor(activity.status) + '15' }]}>
              <MaterialCommunityIcons
                name={activity.icon}
                size={20}
                color={getStatusColor(activity.status)}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
          
          <View style={styles.activityRight}>
            <Badge 
              size={8} 
              style={[styles.priorityBadge, { backgroundColor: getPriorityColor(activity.priority) }]} 
            />
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const LegalTipCard = () => {
    const tip = legalTips[currentTip];
    
    return (
      <Surface style={styles.tipCard}>
        <LinearGradient
          colors={['#FF6B6B15', '#4ECDC415']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tipGradient}
        >
          <View style={styles.tipHeader}>
            <View style={styles.tipIconContainer}>
              <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
            </View>
            <View style={styles.tipHeaderText}>
              <Text style={styles.tipTitle}>Legal Tip</Text>
              <Text style={styles.tipCategory}>{tip.category}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setCurrentTip((prev) => (prev + 1) % legalTips.length)}
              style={styles.nextTipBtn}
            >
              <MaterialCommunityIcons name="refresh" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tipContent}>{tip.content}</Text>
          
          <View style={styles.tipFooter}>
            <TouchableOpacity style={styles.tipAction}>
              <Text style={styles.tipActionText}>Learn More</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WelcomeHeader />
        <QuickActions />
        <ProgressSection />
        <RecentActivity />
        <LegalTipCard />
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </Animated.View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return '#4CAF50';
    case 'answered': return '#2196F3';
    case 'reviewed': return '#FF9800';
    default: return '#757575';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#F44336';
    case 'medium': return '#FF9800';
    case 'low': return '#4CAF50';
    default: return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header Styles
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  greetingContainer: {
    marginLeft: 15,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4444',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Section Styles
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Quick Actions
  actionsScroll: {
    paddingRight: 20,
  },
  actionCard: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  actionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Progress Section
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1A1A1A',
  },
  progressItem: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Recent Activity
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    marginRight: 8,
  },

  // Legal Tip Card
  tipCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  tipCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  nextTipBtn: {
    padding: 8,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A4A4A',
    marginBottom: 15,
  },
  tipFooter: {
    alignItems: 'flex-start',
  },
  tipAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipActionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },

  // Progress Bar Styles
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },

  bottomPadding: {
    height: 30,
  },
});