import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator
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
  Divider,
  Modal,
  Portal,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SCREEN_NAMES } from '../../utils/constants';
import { getUserCases } from '../../store/caseSlice';
import ClientDashboardComponents from './ClientDashboardComponents';

const { width, height } = Dimensions.get('window');

// Ultra-premium color palette with sophisticated gradients - matching lawyer dashboard
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

export default function ClientDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const [showFindLawyersModal, setShowFindLawyersModal] = useState(false);
  const [showCaseStatusModal, setShowCaseStatusModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [cases, setCases] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic dashboard metrics - calculated from real data
  const dashboardMetrics = useMemo(() => {
    const activeCases = cases.filter(c => c.status === "active");
    const completedCases = cases.filter(c => c.status === "completed");
    
    const totalSpent = cases.reduce((total, c) => {
      const caseValue = parseFloat(String(c.value || "0").replace(/[₹,]/g, ""));
      return total + (isNaN(caseValue) ? 0 : caseValue);
    }, 0);

    const completedConsultations = consultations.filter(c => c.status === 'completed').length;
    const avgRating = consultations.length > 0 ? 
      consultations.reduce((sum, c) => sum + (c.rating || 4.5), 0) / consultations.length : 4.8;

    return {
      activeCasesCount: activeCases.length,
      completedCasesCount: completedCases.length,
      totalSpent: totalSpent / 100000, // Convert to lakhs
      completedConsultations,
      avgRating: avgRating.toFixed(1),
      successRate: cases.length > 0 ? Math.round((completedCases.length / cases.length) * 100) : 0
    };
  }, [cases, consultations]);

  // Sample data for initial load - will be replaced with real API data
  useEffect(() => {
    if (user?.uid && user?.role) {
      fetchClientData();
    } else {
      // Load sample data for demo
      loadSampleData();
    }
  }, [user]);

  const loadSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      setCases([
        {
          id: 'CS001',
          title: 'Property Dispute Resolution',
          status: 'active',
          value: '2500000', // 25L
          lawyer: 'Adv. Priya Sharma',
          lawyerId: 'lawyer1',
          progress: 65,
          priority: 'high',
          category: 'property',
          createdAt: new Date('2024-12-15').toISOString(),
          nextHearing: '2025-01-20'
        },
        {
          id: 'CS002', 
          title: 'Employment Contract Review',
          status: 'active',
          value: '150000', // 1.5L
          lawyer: 'Adv. Rajesh Kumar',
          lawyerId: 'lawyer2',
          progress: 30,
          priority: 'medium',
          category: 'employment',
          createdAt: new Date('2024-12-20').toISOString(),
          nextHearing: '2025-01-25'
        },
        {
          id: 'CS003',
          title: 'Consumer Rights Case',
          status: 'completed',
          value: '80000', // 0.8L
          lawyer: 'Adv. Meera Patel',
          lawyerId: 'lawyer3',
          progress: 100,
          priority: 'low',
          category: 'consumer',
          createdAt: new Date('2024-11-10').toISOString(),
          nextHearing: null
        }
      ]);

      setConsultations([
        {
          id: 'CON001',
          title: 'Property Law Consultation',
          lawyer: 'Adv. Priya Sharma',
          status: 'completed',
          date: new Date('2024-12-10').toISOString(),
          rating: 5.0,
          fee: 2500
        },
        {
          id: 'CON002',
          title: 'Legal Document Review',
          lawyer: 'Adv. Rajesh Kumar', 
          status: 'completed',
          date: new Date('2024-12-05').toISOString(),
          rating: 4.8,
          fee: 1800
        }
      ]);
      
      setLoading(false);
    }, 1500);
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const casesData = await dispatch(getUserCases({ 
        userId: user.uid, 
        userRole: user.role 
      })).unwrap();
      
      setCases(casesData || []);
      // In real implementation, also fetch consultations data
      setConsultations([]);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      loadSampleData(); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) {
      await fetchClientData();
    } else {
      loadSampleData();
    }
    setRefreshing(false);
  };

  // Dynamic stats based on real data
  const stats = useMemo(() => [
    { 
      label: 'Active Cases', 
      value: dashboardMetrics.activeCasesCount.toString(), 
      change: '+1',
      trend: 'up',
      icon: 'gavel', 
      gradient: colors.gradient.primary,
      glowColor: colors.primary,
      screen: SCREEN_NAMES.CASE_MANAGEMENT,
      description: 'Ongoing matters'
    },
    { 
      label: 'Success Rate', 
      value: `${dashboardMetrics.successRate}%`, 
      change: '+5%',
      trend: 'up',
      icon: 'trophy-award', 
      gradient: colors.gradient.success,
      glowColor: colors.success,
      description: 'Case resolution'
    },
    { 
      label: 'Total Spent', 
      value: `₹${dashboardMetrics.totalSpent.toFixed(1)}L`, 
      change: '+8%',
      trend: 'up',
      icon: 'currency-inr', 
      gradient: colors.gradient.gold,
      screen: SCREEN_NAMES.BILLING,
      glowColor: colors.secondary,
      description: 'Legal expenses'
    }
  ], [dashboardMetrics]);

    const [notifications] = useState([
      {
        id: 1,
        title: 'Case Update',
        message: 'Your property dispute case has a new hearing date',
        time: '2 hours ago',
        type: 'case',
        unread: true,
        icon: 'gavel'
      },
      {
        id: 2,
        title: 'Consultation Reminder',
        message: 'You have a consultation with Adv. Sharma tomorrow at 2 PM',
        time: '1 day ago',
        type: 'consultation',
        unread: true,
        icon: 'calendar'
      },
      {
        id: 3,
        title: 'Document Ready',
        message: 'Your rental agreement review is completed',
        time: '2 days ago',
        type: 'document',
        unread: false,
        icon: 'file-document'
      }
    ]);

  // Chart data generation
  const chartData = useMemo(() => {
    if (!cases.length && !consultations.length) return [];

    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize last 5 months
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        cases: 0,
        spent: 0,
        consultations: 0,
        satisfaction: 0
      };
    }

    // Populate with case data
    cases.forEach(caseItem => {
      const caseDate = caseItem.createdAt ? new Date(caseItem.createdAt) : new Date();
      const monthKey = `${caseDate.getFullYear()}-${String(caseDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].cases += 1;
        monthlyData[monthKey].spent += parseFloat(String(caseItem.value || "0").replace(/[₹,]/g, "")) / 100000;
      }
    });

    // Populate with consultation data
    consultations.forEach(consultation => {
      const consDate = consultation.date ? new Date(consultation.date) : new Date();
      const monthKey = `${consDate.getFullYear()}-${String(consDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].consultations += 1;
        monthlyData[monthKey].satisfaction = consultation.rating || 4.5;
      }
    });

    return Object.values(monthlyData);
  }, [cases, consultations]);

  // Recent activities based on cases and consultations
  const recentActivities = useMemo(() => {
    const activities = [];

    // Add recent cases
    cases.slice(0, 3).forEach(caseItem => {
      activities.push({
        id: `case-${caseItem.id}`,
        type: 'case',
        title: caseItem.title,
        subtitle: `Handled by ${caseItem.lawyer}`,
        // time: caseItem.createdAt ? getTimeAgo(new Date(caseItem.createdAt)) : '1 day ago',
        time : '1 Day Ago',
        status: caseItem.status,
        icon: 'gavel',
        priority: caseItem.priority,
        value: `₹${(parseFloat(String(caseItem.value || "0").replace(/[₹,]/g, "")) / 100000).toFixed(1)}L`,
        progress: caseItem.progress || 0
      });
    });

    // Add recent consultations
    consultations.slice(0, 2).forEach(consultation => {
      activities.push({
        id: `consultation-${consultation.id}`,
        type: 'consultation',
        title: consultation.title,
        subtitle: `With ${consultation.lawyer}`,
        // time: consultation.date ? getTimeAgo(new Date(consultation.date)) : '2 days ago',
        time: '2 Days Ago',
        status: consultation.status,
        icon: 'account-tie',
        priority: 'medium',
        value: `₹${consultation.fee?.toLocaleString() || '2,500'}`,
        progress: consultation.status === 'completed' ? 100 : 50
      });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [cases, consultations]);

  const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date); // safer conversion
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

  const quickActions = [
    { 
      title: 'Find Lawyers', 
      icon: 'account-search', 
      gradient: colors.gradient.primary,
      description: 'Browse experts',
      onPress: () => setShowFindLawyersModal(true)
    },
    { 
      title: 'AI Assistant', 
      icon: 'robot-excited', 
      gradient: colors.gradient.purple,
      screen: SCREEN_NAMES.AI_CHAT,
      description: 'Legal AI help'
    },
    { 
      title: 'Case Status', 
      icon: 'clipboard-check', 
      gradient: colors.gradient.info,
      description: 'Track progress',
      onPress: () => setShowCaseStatusModal(true)
    },
    { 
      title: 'Documents', 
      icon: 'file-document-multiple', 
      gradient: colors.gradient.success,
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
      description: 'Manage files'
    },
  ];
  const [caseStatusData, setCaseStatusData] = useState([
    {
      id: 'CS001',
      title: 'Property Dispute - Sector 18',
      lawyer: 'Adv. Priya Sharma',
      status: 'in_progress',
      progress: 65,
      nextHearing: '2025-01-15',
      priority: 'high',
      value: '₹25,000',
      description: 'Boundary dispute with neighbor regarding property lines'
    },
    {
      id: 'CS002',
      title: 'Employment Termination Case',
      lawyer: 'Adv. Rajesh Kumar',
      status: 'review',
      progress: 30,
      nextHearing: '2025-01-22',
      priority: 'medium',
      value: '₹18,000',
      description: 'Wrongful termination compensation claim'
    },
    {
      id: 'CS003',
      title: 'Consumer Complaint - Banking',
      lawyer: 'Adv. Meera Patel',
      status: 'completed',
      progress: 100,
      nextHearing: null,
      priority: 'low',
      value: '₹8,000',
      description: 'Banking service charges dispute resolved'
    }
  ]);
  const [featuredLawyers] = useState([
    {
      id: 1,
      name: 'Adv. Priya Sharma',
      specialization: 'Property Law',
      experience: '12 years',
      rating: 4.9,
      reviews: 234,
      fee: '₹2,500/hr',
      verified: true,
      availability: 'Available Today'
    },
    {
      id: 2,
      name: 'Adv. Rajesh Kumar',
      specialization: 'Corporate Law',
      experience: '15 years',
      rating: 4.8,
      reviews: 189,
      fee: '₹3,000/hr',
      verified: true,
      availability: 'Available Tomorrow'
    },
    {
      id: 3,
      name: 'Adv. Meera Patel',
      specialization: 'Family Law',
      experience: '8 years',
      rating: 4.7,
      reviews: 156,
      fee: '₹2,000/hr',
      verified: true,
      availability: 'Available Today'
    }
  ]);

  const handleAction = (screenName, customAction) => {
    if (customAction) {
      customAction();
    } else if (screenName) {
      navigation.navigate('InApp', { screen: screenName });
    }
  };

  const handleStatCardPress = (stat) => {
    if (stat.screen) {
      handleAction(stat.screen);
    } else if (stat.label === 'Active Cases') {
      setShowCaseStatusModal(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const filteredLawyers = featuredLawyers.filter(lawyer =>
    lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lawyer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mini Chart Component - matching lawyer dashboard
  const MiniChart = ({ data, type = 'line' }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>No data available</Text>
        </View>
      );
    }

    const maxSpent = Math.max(...data.map(d => d.spent || 0), 1);
    const maxCases = Math.max(...data.map(d => d.cases || 0), 1);
    const chartHeight = 100;
    const chartWidth = width - 80;
    const pointSpacing = chartWidth / (data.length);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Your Legal Journey (Last 5 Months)</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Spent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Cases</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.chart, { height: chartHeight, width: chartWidth, alignSelf: 'center' }]}>
          {/* Background Grid Lines */}
          <View style={styles.gridContainer}>
            {[0.25, 0.5, 0.75, 1].map((fraction, index) => (
              <View
                key={`grid-${index}`}
                style={[
                  styles.gridLine,
                  {
                    top: chartHeight * (1 - fraction),
                    width: chartWidth,
                  }
                ]}
              />
            ))}
          </View>

          {/* Spent Line Path */}
          {data.map((point, index) => {
            if (index === data.length - 1) return null;
            const nextPoint = data[index + 1];
            
            const x1 = index * pointSpacing;
            const y1 = chartHeight - ((point.spent / maxSpent) * (chartHeight - 20));
            const x2 = (index + 1) * pointSpacing;
            const y2 = chartHeight - ((nextPoint.spent / maxSpent) * (chartHeight - 20));
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.chartLine,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 50%',
                  }
                ]}
              />
            );
          })}
          
          {/* Spent Data Points */}
          {data.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - ((point.spent / maxSpent) * (chartHeight - 20));
            
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.chartPoint,
                  {
                    left: x - 6,
                    top: y - 6,
                  }
                ]}
              >
                <View style={styles.pointValue}>
                  <Text style={styles.pointValueText}>₹{point.spent.toFixed(1)}L</Text>
                </View>
              </View>
            );
          })}
          
          {/* Cases Bars */}
          {data.map((point, index) => {
            const barHeight = (point.cases / maxCases) * (chartHeight * 0.4);
            const x = index * pointSpacing;
            
            return (
              <View
                key={`bar-${index}`}
                style={[
                  styles.chartBar,
                  {
                    left: x - 12,
                    bottom: 0,
                    height: barHeight,
                    width: 24,
                  }
                ]}
              />
            );
          })}
        </View>
        
        <View style={[styles.chartLabels, { width: chartWidth, alignSelf: 'center' }]}>
          {data.map((point, index) => (
            <View key={`label-${index}`} style={styles.chartLabelContainer}>
              <Text style={styles.chartLabel}>{point.month}</Text>
              <Text style={styles.chartSubLabel}>{point.cases} cases</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

    // Notifications Modal
    const NotificationsModal = () => (
      <Portal>
        <Modal
          visible={showNotificationsModal}
          onDismiss={() => setShowNotificationsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                  <View style={styles.notificationIcon}>
                    <LinearGradient
                      colors={notification.unread ? colors.gradient.primary : [colors.textTertiary, colors.textTertiary]}
                      style={styles.notificationIconGradient}
                    >
                      <MaterialCommunityIcons
                        name={notification.icon}
                        size={20}
                        color="white"
                      />
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      notification.unread && { fontWeight: '700' }
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {notification.time}
                    </Text>
                  </View>
                  
                  {notification.unread && (
                    <View style={styles.unreadIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    );
  
    // Search Modal
    const SearchModal = () => (
      <Portal>
        <Modal
          visible={showSearchModal}
          onDismiss={() => setShowSearchModal(false)}
          contentContainerStyle={styles.fullScreenModal}
        >
          <Surface style={styles.searchModalSurface}>
            <View style={styles.searchModalHeader}>
              <Searchbar
                placeholder="Search lawyers, cases, documents..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.fullScreenSearchBar}
                autoFocus={true}
              />
              <TouchableOpacity 
                onPress={() => setShowSearchModal(false)}
                style={styles.searchCloseButton}
              >
                <Text style={styles.searchCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.searchResults}>
              <Text style={styles.searchSectionTitle}>Lawyers</Text>
              {filteredLawyers.map((lawyer) => (
                <TouchableOpacity key={lawyer.id} style={styles.searchResultItem}>
                  <MaterialCommunityIcons name="account-tie" size={20} color={colors.primary} />
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>{lawyer.name}</Text>
                    <Text style={styles.searchResultSubtitle}>{lawyer.specialization}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <Text style={styles.searchSectionTitle}>Cases</Text>
              {caseStatusData.map((caseItem) => (
                <TouchableOpacity key={caseItem.id} style={styles.searchResultItem}>
                  <MaterialCommunityIcons name="gavel" size={20} color={colors.info} />
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>{caseItem.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{caseItem.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    );

  // Find Lawyers Modal
  const FindLawyersModal = () => (
    <Portal>
      <Modal
        visible={showFindLawyersModal}
        onDismiss={() => setShowFindLawyersModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Find Expert Lawyers</Text>
            <TouchableOpacity onPress={() => setShowFindLawyersModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {featuredLawyers.map((lawyer) => (
              <TouchableOpacity key={lawyer.id} style={styles.lawyerCard} activeOpacity={0.9}>
                <View style={styles.lawyerInfo}>
                  <View style={styles.lawyerAvatar}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.avatarGradientLawyer}
                    >
                      <Avatar.Text
                        size={50}
                        label={lawyer.name.split(' ')[1]?.charAt(0) || 'L'}
                        style={styles.lawyerAvatarText}
                        labelStyle={styles.lawyerAvatarLabel}
                      />
                    </LinearGradient>
                    {lawyer.verified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.lawyerDetails}>
                    <Text style={styles.lawyerName}>{lawyer.name}</Text>
                    <Text style={styles.lawyerSpecialization}>{lawyer.specialization}</Text>
                    
                    <View style={styles.lawyerMeta}>
                      <View style={styles.ratingContainer}>
                        <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{lawyer.rating}</Text>
                        <Text style={styles.reviewsText}>({lawyer.reviews})</Text>
                      </View>
                      
                      <View style={styles.experienceContainer}>
                        <MaterialCommunityIcons name="briefcase" size={14} color={colors.textSecondary} />
                        <Text style={styles.experienceText}>{lawyer.experience}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.lawyerFooter}>
                      <Text style={styles.feeText}>{lawyer.fee}</Text>
                      <Chip
                        mode="flat"
                        compact
                        style={[styles.availabilityChip, { backgroundColor: colors.success + '20' }]}
                        textStyle={[styles.availabilityText, { color: colors.success }]}
                      >
                        {lawyer.availability}
                      </Chip>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.consultButtonContainer}
                  onPress={() => {
                    setSelectedLawyer(lawyer);
                    setShowConsultationModal(true);
                  }}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={colors.gradient.primary}
                    style={styles.consultButton}
                  >
                    <MaterialCommunityIcons name="calendar-plus" size={16} color="white" />
                    <Text style={styles.consultButtonText}>Book Consultation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Case Status Modal
  const CaseStatusModal = () => (
    <Portal>
      <Modal
        visible={showCaseStatusModal}
        onDismiss={() => setShowCaseStatusModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Cases</Text>
            <TouchableOpacity onPress={() => setShowCaseStatusModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {cases.map((caseItem) => (
              <Surface key={caseItem.id} style={styles.caseCard}>
                <View style={styles.caseHeader}>
                  <View style={styles.caseIdContainer}>
                    <Text style={styles.caseId}>#{caseItem.id}</Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(caseItem.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(caseItem.status) }
                      ]}>
                        {caseItem.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.caseValue}>
                    <Text style={styles.caseValueText}>
                      ₹{(parseFloat(String(caseItem.value || "0").replace(/[₹,]/g, "")) / 100000).toFixed(1)}L
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.caseTitle}>{caseItem.title}</Text>
                
                <View style={styles.caseMeta}>
                  <View style={styles.lawyerInfoCase}>
                    <MaterialCommunityIcons name="account-tie" size={16} color={colors.textSecondary} />
                    <Text style={styles.lawyerNameCase}>{caseItem.lawyer}</Text>
                  </View>
                  
                  {caseItem.nextHearing && (
                    <View style={styles.hearingInfo}>
                      <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={styles.hearingDate}>
                        Next: {new Date(caseItem.nextHearing).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>{caseItem.progress}%</Text>
                  </View>
                  <ProgressBar
                    progress={caseItem.progress / 100}
                    color={getStatusColor(caseItem.status)}
                    style={styles.progressBar}
                  />
                </View>
              </Surface>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Consultation Modal
  const ConsultationModal = () => (
    <Portal>
      <Modal
        visible={showConsultationModal}
        onDismiss={() => setShowConsultationModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            <TouchableOpacity onPress={() => setShowConsultationModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedLawyer && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.selectedLawyerInfo}>
                <LinearGradient
                  colors={colors.gradient.primary}
                  style={styles.selectedLawyerAvatarContainer}
                >
                  <Avatar.Text
                    size={60}
                    label={selectedLawyer.name.split(' ')[1]?.charAt(0) || 'L'}
                    style={styles.selectedLawyerAvatar}
                    labelStyle={styles.selectedLawyerAvatarLabel}
                  />
                </LinearGradient>
                <View style={styles.selectedLawyerDetails}>
                  <Text style={styles.selectedLawyerName}>{selectedLawyer.name}</Text>
                  <Text style={styles.selectedLawyerSpec}>{selectedLawyer.specialization}</Text>
                  <Text style={styles.selectedLawyerFee}>{selectedLawyer.fee}</Text>
                </View>
              </View>
              
              <View style={styles.consultationForm}>
                <Text style={styles.formSectionTitle}>Select Date & Time</Text>
                
                <View style={styles.timeSlots}>
                  {['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Tomorrow 4:00 PM', 'Day After 11:00 AM'].map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={styles.timeSlot}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={colors.gradient.info}
                        style={styles.timeSlotGradient}
                      >
                        <Text style={styles.timeSlotText}>{slot}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.bookConsultationButton}
                  activeOpacity={0.9}
                  onPress={() => {
                    alert(`Consultation booked with ${selectedLawyer.name}!`);
                    setShowConsultationModal(false);
                    setSelectedLawyer(null);
                    setShowFindLawyersModal(false);
                  }}
                >
                  <LinearGradient
                    colors={colors.gradient.primary}
                    style={styles.bookConsultationGradient}
                  >
                    <MaterialCommunityIcons name="calendar-check" size={20} color="white" />
                    <Text style={styles.bookConsultationText}>Confirm Booking - {selectedLawyer.fee}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Surface>
      </Modal>
    </Portal>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'active': return colors.info;
      case 'in_progress': return colors.warning;
      case 'pending': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </LinearGradient>
      </View>
    );
  }

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
                    label={user?.displayName?.charAt(0) || user?.name?.charAt(0) || 'C'} 
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                  />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.displayName || user?.name || 'Valued Client'}</Text>
                <View style={styles.expertiseBadge}>
                  <MaterialCommunityIcons name="shield-check" size={12} color={colors.accent} />
                  <Text style={styles.expertiseText}>Verified Client</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => setShowSearchModal(true)}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={() => setShowNotificationsModal(true)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="bell" size={20} color="white" />
                  <Badge size={8} style={styles.notificationBadge} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={handleRefresh}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons 
                    name="refresh" 
                    size={20} 
                    color="white" 
                  />
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
                <TouchableOpacity style={styles.summaryItem} onPress={() => setShowCaseStatusModal(true)}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="gavel" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{dashboardMetrics.activeCasesCount}</Text>
                  <Text style={styles.summaryLabel}>Active Cases</Text>
                </TouchableOpacity>
                
                <View style={styles.summaryDivider} />
                
                <TouchableOpacity style={styles.summaryItem} onPress={() => setShowFindLawyersModal(true)}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.gold}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="currency-inr" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>
                    ₹{dashboardMetrics.totalSpent.toFixed(1)}L
                  </Text>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                </TouchableOpacity>
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionWrapper}
                onPress={action.onPress || (() => handleAction(action.screen))}
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

         {/* Dynamic Performance Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Legal Spending Trends</Text>
          </View>
          
          <Surface style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.progressBackground}
            >
              <MiniChart data={chartData} type="line" />
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{dashboardMetrics.successRate}%</Text>
                  <Text style={styles.metricLabel}>Success Rate</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{dashboardMetrics.activeCasesCount}/{cases.length}</Text>
                  <Text style={styles.metricLabel}>Active Cases</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>₹{dashboardMetrics.totalSpent.toFixed(1)}L</Text>
                  <Text style={styles.metricLabel}>Total Spent</Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        <ClientDashboardComponents />


        {/* Premium Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>Your Legal Journey</Text>
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

       

        

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowCaseStatusModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {recentActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your legal activities will appear here</Text>
            </View>
          ) : (
            recentActivities.map((activity, index) => (
              <TouchableOpacity key={activity.id} activeOpacity={0.95}>
                <Surface style={styles.premiumActivityCard}>
                  <View style={styles.activityCardContent}>
                    <View style={styles.activityMainInfo}>
                      <View style={styles.activityIconSection}>
                        <LinearGradient
                          colors={getPriorityGradient(activity.priority)}
                          style={styles.activityIconContainer}
                        >
                          <MaterialCommunityIcons 
                            name={activity.icon} 
                            size={20} 
                            color="white" 
                          />
                        </LinearGradient>
                      </View>
                      
                      <View style={styles.activityDetails}>
                        <View style={styles.activityTitleRow}>
                          <Text style={styles.premiumActivityTitle}>{activity.title}</Text>
                          <View style={styles.activityValueContainer}>
                            <Text style={styles.activityValue}>{activity.value}</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                        
                        <View style={styles.activityMetaRow}>
                          <View style={styles.timeContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.activityTime}>{activity.time}</Text>
                          </View>
                          
                          <View style={styles.priorityIndicator}>
                            <View style={[
                              styles.priorityDot,
                              { backgroundColor: getPriorityColor(activity.priority) }
                            ]} />
                            <Text style={styles.priorityText}>{activity.priority}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    {activity.progress < 100 && (
                      <View style={styles.activityFooter}>
                        <View style={styles.progressSection}>
                          <Text style={styles.progressLabel}>Progress: {activity.progress}%</Text>
                          <View style={styles.miniProgressContainer}>
                            <ProgressBar 
                              progress={activity.progress / 100} 
                              color={getStatusColor(activity.status)}
                              style={styles.miniProgressBar}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <NotificationsModal />
      <SearchModal />
      <FindLawyersModal />
      <CaseStatusModal />
      <ConsultationModal />
    </View>
  );
}

// Helper functions
const getPriorityGradient = (priority) => {
  switch (priority) {
    case 'high': return ['#EF4444', '#DC2626'];
    case 'medium': return ['#F59E0B', '#D97706'];
    case 'low': return ['#10B981', '#059669'];
    default: return ['#64748B', '#475569'];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
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
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  expertiseText: {
    color: colors.accent,
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent,
  },
  summaryCardContainer: {
    marginHorizontal: 24,
    marginTop: -12,
  },
  glassSummary: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
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
  chartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chart: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  chartLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.secondary,
    borderRadius: 1.5,
    elevation: 1,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginLeft: 35,
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginLeft: 35,
  },
  pointValue: {
    position: 'absolute',
    top: -24,
    left: -15,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  pointValueText: {
    fontSize: 8,
    color: 'white',
    fontWeight: '700',
  },
  chartBar: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderRadius: 6,
    opacity: 0.8,
    elevation: 1,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginLeft: 35,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  chartLabelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartSubLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 16,
    borderRadius: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumActivityCard: {
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
  activityCardContent: {
    padding: 20,
  },
  activityMainInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIconSection: {
    marginRight: 16,
  },
  activityIconContainer: {
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
  activityDetails: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  premiumActivityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  activityValueContainer: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityValue: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '800',
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  activityMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activityFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  progressSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniProgressContainer: {
    width: 60,
    marginTop: 4,
  },
  miniProgressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  bottomSpacing: {
    height: 40,
  },

    notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    position: 'relative',
  },
  notificationIcon: {
    marginRight: 16,
  },
  notificationIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  
  // Find Lawyers Modal Styles
  lawyerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  lawyerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lawyerAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lawyerSpecialization: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  lawyerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  lawyerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  availabilityChip: {
    height: 24,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  consultButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  consultButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },

  fullScreenModal: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      flex: 1,
      margin: 0,
    },
    searchModalSurface: {
      backgroundColor: colors.surface,
      flex: 1,
      paddingTop: StatusBar.currentHeight || 44,
    },
    searchModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    fullScreenSearchBar: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
      elevation: 0,
    },
    searchCloseButton: {
      marginLeft: 16,
      paddingVertical: 8,
    },
    searchCloseText: {
      color: colors.primary,
      fontWeight: '600',
    },
    searchResults: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 20,
      marginBottom: 16,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      marginBottom: 8,
    },
    searchResultContent: {
      marginLeft: 12,
      flex: 1,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    searchResultSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    

  // Modal Styles
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalSurface: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  // Find Lawyers Modal Styles
  lawyerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  lawyerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lawyerAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradientLawyer: {
    borderRadius: 25,
    padding: 2,
  },
  lawyerAvatarText: {
    backgroundColor: 'transparent',
  },
  lawyerAvatarLabel: {
    color: 'white',
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lawyerSpecialization: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  lawyerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  lawyerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  availabilityChip: {
    height: 24,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  consultButtonContainer: {
    marginTop: 8,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  consultButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    marginLeft: 6,
  },

  // Consultation Modal Styles
  selectedLawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  selectedLawyerAvatarContainer: {
    borderRadius: 30,
    padding: 2,
  },
  selectedLawyerAvatar: {
    backgroundColor: 'transparent',
  },
  selectedLawyerAvatarLabel: {
    color: 'white',
    fontWeight: '700',
  },
  selectedLawyerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  selectedLawyerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  selectedLawyerSpec: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  selectedLawyerFee: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 4,
  },
  consultationForm: {
    flex: 1,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  timeSlot: {
    flex: 0.48,
    marginBottom: 8,
  },
  timeSlotGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  bookConsultationButton: {
    marginTop: 8,
  },
  bookConsultationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookConsultationText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
  },

  // Case Status Modal Styles
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 12,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  caseValue: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caseValueText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  caseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lawyerInfoCase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lawyerNameCase: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  hearingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hearingDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});