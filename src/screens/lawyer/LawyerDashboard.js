import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar, 
  Chip,
  Text,
  Surface,
  ProgressBar,
  Badge,
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SCREEN_NAMES } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

// Ultra-premium color palette with sophisticated gradients
const colors = {
  primary: '#0F0F23',
  primaryLight: '#1A1A3A',
  secondary: '#D4AF37', // Gold accent
  tertiary: '#8B5CF6', // Purple accent
  accent: '#06FFA5', // Neon green
  background: '#FAFBFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FE',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  cardShadow: 'rgba(15, 15, 35, 0.12)',
  glassMorphism: 'rgba(255, 255, 255, 0.85)',
  gradient: {
    primary: ['#0F0F23', '#1A1A3A', '#2D1B69'],
    gold: ['#D4AF37', '#FFD700', '#FFA500'],
    purple: ['#8B5CF6', '#A855F7', '#C084FC'],
    success: ['#10B981', '#34D399', '#6EE7B7'],
    info: ['#3B82F6', '#60A5FA', '#93C5FD'],
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']
  }
};

export default function LawyerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [goalPeriod, setGoalPeriod] = useState('monthly');

  const handleAddCase = (caseData) => {
    // Handle the new case data
    console.log('New case created:', caseData);
    setShowAddCaseModal(false);
  };

  const stats = [
    { 
      label: 'Active Cases', 
      value: '12', 
      change: '+2',
      trend: 'up',
      icon: 'briefcase-variant', 
      gradient: colors.gradient.primary,
      glowColor: colors.primary,
      screen: SCREEN_NAMES.CASE_MANAGEMENT,
      description: 'This month'
    },
    { 
      label: 'Consultations', 
      value: '8', 
      change: '+3',
      trend: 'up',
      icon: 'calendar-star', 
      gradient: colors.gradient.info,
      glowColor: colors.info,
      screen: SCREEN_NAMES.MY_CONSULTATIONS,
      description: 'Scheduled'
    },
    { 
      label: 'Success Rate', 
      value: '96%', 
      change: '+4%',
      trend: 'up',
      icon: 'trophy-variant', 
      gradient: colors.gradient.success,
      glowColor: colors.success,
      description: 'Win ratio'
    },
    { 
      label: 'Revenue', 
      value: '₹2.4L', 
      change: '+12%',
      trend: 'up',
      icon: 'diamond', 
      gradient: colors.gradient.gold,
      screen: SCREEN_NAMES.REVENUE,
      glowColor: colors.secondary,
      description: 'This month'
    },
  ];

  const allTasks = [
    {
      id: 1,
      title: 'Supreme Court Filing',
      client: 'Reliance Industries Ltd.',
      deadline: '2 hours',
      priority: 'critical',
      category: 'Corporate Law',
      progress: 85,
      urgency: 'high',
      value: '₹15L',
      type: 'filing'
    },
    {
      id: 2,
      title: 'M&A Due Diligence Review',
      client: 'TechCorp Acquisition',
      deadline: '4:30 PM Today',
      priority: 'high',
      category: 'Corporate Law',
      progress: 60,
      urgency: 'medium',
      value: '₹8L',
      type: 'review'
    },
    {
      id: 3,
      title: 'IPO Compliance Audit',
      client: 'StartupX Ltd.',
      deadline: 'Tomorrow 9 AM',
      priority: 'medium',
      category: 'Securities Law',
      progress: 30,
      urgency: 'low',
      value: '₹5L',
      type: 'audit'
    },
    {
      id: 4,
      title: 'Contract Negotiation',
      client: 'Global Tech Inc.',
      deadline: '3 days',
      priority: 'high',
      category: 'Contract Law',
      progress: 75,
      urgency: 'high',
      value: '₹12L',
      type: 'negotiation'
    },
    {
      id: 5,
      title: 'Patent Application',
      client: 'Innovation Labs',
      deadline: '1 week',
      priority: 'low',
      category: 'IP Law',
      progress: 20,
      urgency: 'low',
      value: '₹3L',
      type: 'application'
    }
  ];

  const filterButtons = [
    { key: 'all', label: 'All Tasks', icon: 'view-grid', count: allTasks.length },
    { key: 'critical', label: 'Critical', icon: 'alert-circle', count: allTasks.filter(t => t.priority === 'critical').length },
    { key: 'high', label: 'High Priority', icon: 'flag', count: allTasks.filter(t => t.priority === 'high').length },
    { key: 'today', label: 'Due Today', icon: 'clock-alert', count: allTasks.filter(t => t.deadline.includes('Today') || t.deadline.includes('hours')).length },
  ];

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'critical':
        return allTasks.filter(task => task.priority === 'critical');
      case 'high':
        return allTasks.filter(task => task.priority === 'high');
      case 'today':
        return allTasks.filter(task => task.deadline.includes('Today') || task.deadline.includes('hours'));
      default:
        return allTasks;
    }
  };

  const goalPeriods = [
    { key: 'weekly', label: 'Week', icon: 'calendar-week' },
    { key: 'monthly', label: 'Month', icon: 'calendar-month' },
    { key: 'quarterly', label: 'Quarter', icon: 'calendar-range' },
    { key: 'yearly', label: 'Year', icon: 'calendar' },
  ];

  const getGoalData = () => {
    const data = {
      weekly: {
        period: 'This Week',
        casesWon: { current: 6, target: 7, percentage: 86 },
        revenue: { current: '₹65K', target: '₹75K', percentage: 87 },
        satisfaction: { current: 4.8, target: 5.0, percentage: 96 }
      },
      monthly: {
        period: 'December Performance',
        casesWon: { current: 24, target: 25, percentage: 96 },
        revenue: { current: '₹2.4L', target: '₹2.5L', percentage: 96 },
        satisfaction: { current: 4.9, target: 5.0, percentage: 98 }
      },
      quarterly: {
        period: 'Q4 2024',
        casesWon: { current: 68, target: 75, percentage: 91 },
        revenue: { current: '₹7.2L', target: '₹8L', percentage: 90 },
        satisfaction: { current: 4.7, target: 5.0, percentage: 94 }
      },
      yearly: {
        period: '2024 Annual',
        casesWon: { current: 285, target: 300, percentage: 95 },
        revenue: { current: '₹28L', target: '₹30L', percentage: 93 },
        satisfaction: { current: 4.8, target: 5.0, percentage: 96 }
      }
    };
    return data[goalPeriod];
  };

  const quickActions = [
    { 
      title: 'New Case', 
      icon: 'briefcase-plus', 
      gradient: colors.gradient.primary,
      description: 'Create case'
    },
    { 
      title: 'AI Research', 
      icon: 'robot-excited', 
      gradient: colors.gradient.purple,
      screen: SCREEN_NAMES.AI_CHAT,
      description: 'Legal AI'
    },
    { 
      title: 'Documents', 
      icon: 'file-document-multiple', 
      gradient: colors.gradient.info,
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
      description: 'Manage files'
    },
    { 
      title: 'Analytics', 
      icon: 'chart-line-variant', 
      gradient: colors.gradient.success,
      screen: SCREEN_NAMES.ANALYTICS,
      description: 'View insights'
    },
  ];

  const handleAction = (screenName) => {
      navigation.navigate('InApp', { screen: screenName });
  };

  const handleStatCardPress = (stat) => {
      handleAction(stat.screen);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const currentGoalData = getGoalData();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header with Glass Morphism */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating particles effect background */}
          <View style={styles.particleContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={colors.gradient.gold}
                  style={styles.avatarGradient}
                >
                  <Avatar.Text 
                    size={56} 
                    label={user?.name?.charAt(0) || 'A'} 
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                  />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Good Morning ☀️</Text>
                <Text style={styles.userName}>Adv. {user?.name || 'Arjun Sharma'}</Text>
                <View style={styles.expertiseBadge}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                  <Text style={styles.expertiseText}>Senior Partner</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="bell" size={20} color="white" />
                  <Badge size={8} style={styles.notificationBadge} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        {/* Premium Glass Summary Card */}
        <View style={styles.summaryCardContainer}>
          <BlurView intensity={95} tint="light" style={styles.glassSummary}>
            <LinearGradient
              colors={colors.gradient.glass}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="clipboard-check" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>3</Text>
                  <Text style={styles.summaryLabel}>Priority Tasks</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.gold}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="currency-inr" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>₹28L</Text>
                  <Text style={styles.summaryLabel}>Active Value</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.success}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="account-group" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>47</Text>
                  <Text style={styles.summaryLabel}>Active Clients</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Premium Statistics without View Details button */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={width * 0.42}
          >
            {stats.map((stat, index) => (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => handleStatCardPress(stat)}>
                <View style={styles.statCardContainer}>
                  <LinearGradient
                    colors={stat.gradient}
                    style={styles.statCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.statGlow} />
                    
                    <View style={styles.statHeader}>
                      <View style={styles.statIconContainer}>
                        <MaterialCommunityIcons 
                          name={stat.icon} 
                          size={24} 
                          color="rgba(255,255,255,0.9)" 
                        />
                      </View>
                      
                      <View style={styles.trendContainer}>
                        <MaterialCommunityIcons 
                          name="trending-up" 
                          size={12} 
                          color={colors.accent} 
                        />
                        <Text style={styles.changeText}>{stat.change}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Text style={styles.statDescription}>{stat.description}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Enhanced Goal Progression Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goal Progression</Text>
            <View style={styles.goalPeriodToggle}>
              {goalPeriods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodButton,
                    goalPeriod === period.key && styles.periodButtonActive
                  ]}
                  onPress={() => setGoalPeriod(period.key)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons 
                    name={period.icon} 
                    size={14} 
                    color={goalPeriod === period.key ? colors.secondary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.periodButtonText,
                    goalPeriod === period.key && styles.periodButtonTextActive
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Surface style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.progressBackground}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{currentGoalData.period}</Text>
                <View style={styles.performanceIndicator}>
                  <Text style={styles.performanceText}>
                    {currentGoalData.casesWon.percentage >= 95 ? 'Excellent' : 
                     currentGoalData.casesWon.percentage >= 85 ? 'Good' : 'Average'}
                  </Text>
                  <MaterialCommunityIcons name="star" size={16} color={colors.secondary} />
                </View>
              </View>
              
              <View style={styles.progressGrid}>
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Cases Won</Text>
                    <Text style={styles.progressValue}>
                      {currentGoalData.casesWon.current}/{currentGoalData.casesWon.target}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <ProgressBar 
                      progress={currentGoalData.casesWon.percentage / 100} 
                      color={colors.success}
                      style={styles.modernProgressBar}
                    />
                    <Text style={styles.progressPercent}>{currentGoalData.casesWon.percentage}%</Text>
                  </View>
                </View>
                
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Revenue Target</Text>
                    <Text style={styles.progressValue}>
                      {currentGoalData.revenue.current}/{currentGoalData.revenue.target}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <ProgressBar 
                      progress={currentGoalData.revenue.percentage / 100} 
                      color={colors.secondary}
                      style={styles.modernProgressBar}
                    />
                    <Text style={styles.progressPercent}>{currentGoalData.revenue.percentage}%</Text>
                  </View>
                </View>
                
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Client Satisfaction</Text>
                    <Text style={styles.progressValue}>
                      {currentGoalData.satisfaction.current}/5.0
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <ProgressBar 
                      progress={currentGoalData.satisfaction.percentage / 100} 
                      color={colors.tertiary}
                      style={styles.modernProgressBar}
                    />
                    <Text style={styles.progressPercent}>{currentGoalData.satisfaction.percentage}%</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Enhanced Task Filter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>High-Priority Matters</Text>
          </View>
          
          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScrollView}
          >
            {filterButtons.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  activeFilter === filter.key && styles.filterChipActive
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={activeFilter === filter.key ? colors.gradient.primary : ['transparent', 'transparent']}
                  style={styles.filterChipGradient}
                >
                  <MaterialCommunityIcons 
                    name={filter.icon} 
                    size={16} 
                    color={activeFilter === filter.key ? 'white' : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    activeFilter === filter.key && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {filter.count > 0 && (
                    <View style={[
                      styles.filterBadge,
                      activeFilter === filter.key && styles.filterBadgeActive
                    ]}>
                      <Text style={[
                        styles.filterBadgeText,
                        activeFilter === filter.key && styles.filterBadgeTextActive
                      ]}>
                        {filter.count}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Filtered Tasks */}
          {getFilteredTasks().map((task, index) => (
            <TouchableOpacity key={task.id} activeOpacity={0.95}>
              <Surface style={styles.premiumTaskCard}>
                <View style={styles.taskCardContent}>
                  <View style={styles.taskMainInfo}>
                    <View style={styles.taskIconSection}>
                      <LinearGradient
                        colors={getPriorityGradient(task.priority)}
                        style={styles.taskIconContainer}
                      >
                        <MaterialCommunityIcons 
                          name={getTaskIcon(task.type)} 
                          size={20} 
                          color="white" 
                        />
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.taskDetails}>
                      <View style={styles.taskTitleRow}>
                        <Text style={styles.premiumTaskTitle}>{task.title}</Text>
                        <View style={styles.taskValueContainer}>
                          <Text style={styles.taskValue}>{task.value}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.taskClient}>{task.client}</Text>
                      
                      <View style={styles.taskMetaRow}>
                        <Chip 
                          mode="flat"
                          compact
                          style={[
                            styles.categoryChip,
                            { backgroundColor: colors.primary + '10' }
                          ]}
                          textStyle={styles.categoryChipText}
                        >
                          {task.category}
                        </Chip>
                        
                        <View style={styles.urgencyIndicator}>
                          <View style={[
                            styles.urgencyDot,
                            { backgroundColor: getUrgencyColor(task.urgency) }
                          ]} />
                          <Text style={styles.urgencyText}>{task.urgency}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.taskFooter}>
                    <View style={styles.deadlineSection}>
                      <MaterialCommunityIcons 
                        name="clock-outline" 
                        size={14} 
                        color={colors.textSecondary} 
                      />
                      <Text style={styles.deadlineText}>Due in {task.deadline}</Text>
                    </View>
                    
                    <View style={styles.progressSection}>
                      <Text style={styles.progressLabel}>{task.progress}% Complete</Text>
                      <View style={styles.miniProgressContainer}>
                        <ProgressBar 
                          progress={task.progress / 100} 
                          color={colors.primary}
                          style={styles.miniProgressBar}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        {/* Futuristic Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionWrapper}
                onPress={() => handleAction(action.screen)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionGlow} />
                  
                  <MaterialCommunityIcons 
                    name={action.icon} 
                    size={28} 
                    color="white" 
                  />
                  
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

// Helper functions
const getPriorityGradient = (priority) => {
  switch (priority) {
    case 'critical': return ['#EF4444', '#DC2626'];
    case 'high': return ['#F59E0B', '#D97706'];
    case 'medium': return ['#3B82F6', '#2563EB'];
    case 'low': return ['#10B981', '#059669'];
    default: return colors.gradient.primary;
  }
};

const getTaskIcon = (type) => {
  switch (type) {
    case 'filing': return 'file-document-edit';
    case 'review': return 'magnify-scan';
    case 'audit': return 'shield-check';
    case 'negotiation': return 'handshake';
    case 'application': return 'file-document-edit-outline'; // valid icon name
    default: return 'briefcase';
  }
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
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
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    borderRadius: 28,
    padding: 2,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  expertiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  expertiseText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    position: 'relative',
  },
  actionButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(3, 3, 3, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
  },
  summaryCardContainer: {
    marginHorizontal: 24,
    marginTop: -12,
  },
  glassSummary: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(11, 10, 10, 0.2)',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderSimple: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  goalPeriodToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  periodButtonActive: {
    backgroundColor: colors.secondary,
    elevation: 2,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  periodButtonText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  filterScrollView: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingRight: 24,
    gap: 12,
  },
  filterChip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.textTertiary,
  },
  filterChipActive: {
    borderColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: colors.textTertiary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  filterBadgeTextActive: {
    color: 'white',
  },
  statsContainer: {
    paddingRight: 24,
  },
  statCardContainer: {
    width: width * 0.4,
    marginRight: 16,
    position: 'relative',
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  statGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  progressCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  progressBackground: {
    padding: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  performanceText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  progressGrid: {
    gap: 20,
  },
  progressItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    marginLeft: 12,
    minWidth: 35,
  },
  premiumTaskCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  taskCardContent: {
    padding: 20,
  },
  taskMainInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskIconSection: {
    marginRight: 16,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  premiumTaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  taskValueContainer: {
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskValue: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '800',
  },
  taskClient: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 28,
    backgroundColor: colors.primary + '10',
  },
  categoryChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  miniProgressContainer: {
    width: 60,
    marginTop: 4,
  },
  miniProgressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionWrapper: {
    width: (width - 64) / 2,
  },
  quickActionCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});