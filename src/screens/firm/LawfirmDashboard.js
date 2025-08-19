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
  ActivityIndicator,
  Modal,
  TextInput,
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
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SCREEN_NAMES } from '../../utils/constants';
import { getUserCases } from '../../store/caseSlice';
import { getAllUsers } from '../../store/userSlice';
const { width, height } = Dimensions.get('window');

// Premium color palette with sophisticated gradients
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
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)'],
    crimson: ['#DC2626', '#EF4444', '#F87171'],
    emerald: ['#059669', '#10B981', '#34D399'],
    indigo: ['#4F46E5', '#6366F1', '#818CF8']
  }
};

export default function LawFirmDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('monthly');

  // Comprehensive firm metrics calculation
  const firmMetrics = useMemo(() => {
    if (!cases.length || !lawyers.length) return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeCases: 0,
      totalLawyers: 0,
      activeClients: 0,
      successRate: 0,
      utilizationRate: 0,
      avgCaseValue: 0,
      monthlyGrowth: 0,
      lawyerPerformance: [],
      practiceAreaBreakdown: {},
      revenueByPracticeArea: {},
      clientRetentionRate: 95
    };

    const totalRevenue = cases.reduce((total, c) => {
      const caseValue = parseFloat(String(c.value || "0").replace(/[₹,]/g, ""));
      return total + (isNaN(caseValue) ? 0 : caseValue);
    }, 0);

    const activeCases = cases.filter(c => c.status === 'active').length;
    
    const uniqueClients = new Set(
      cases.filter(c => c.client && c.client.trim()).map(c => c.client.trim())
    );
    const activeClients = uniqueClients.size;

    const allSubtasks = cases.flatMap(c => Array.isArray(c.subtasks) ? c.subtasks : []);
    const completedTasks = allSubtasks.filter(st => st.status === 'completed').length;
    const totalTasks = allSubtasks.length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const avgCaseValue = activeCases > 0 ? totalRevenue / activeCases : 0;

    // Practice area breakdown
    const practiceAreas = {};
    const revenueByArea = {};
    cases.forEach(c => {
      const area = c.practiceArea || 'General';
      practiceAreas[area] = (practiceAreas[area] || 0) + 1;
      const caseValue = parseFloat(String(c.value || "0").replace(/[₹,]/g, ""));
      revenueByArea[area] = (revenueByArea[area] || 0) + caseValue;
    });

    // Lawyer performance metrics
    const lawyerPerformance = lawyers.map(lawyer => {
      const lawyerCases = cases.filter(c => c.lawyerId === lawyer.uid);
      const lawyerRevenue = lawyerCases.reduce((total, c) => {
        const caseValue = parseFloat(String(c.value || "0").replace(/[₹,]/g, ""));
        return total + (isNaN(caseValue) ? 0 : caseValue);
      }, 0);
      
      const lawyerSubtasks = lawyerCases.flatMap(c => Array.isArray(c.subtasks) ? c.subtasks : []);
      const completedSubtasks = lawyerSubtasks.filter(st => st.status === 'completed').length;
      const lawyerSuccessRate = lawyerSubtasks.length > 0 ? 
        Math.round((completedSubtasks / lawyerSubtasks.length) * 100) : 0;

      return {
        ...lawyer,
        activeCases: lawyerCases.filter(c => c.status === 'active').length,
        totalRevenue: lawyerRevenue,
        successRate: lawyerSuccessRate,
        utilization: Math.min(100, (lawyerCases.length / 10) * 100) // Assuming 10 cases is 100% utilization
      };
    });

    return {
      totalRevenue,
      monthlyRevenue: totalRevenue / 12, // Simple monthly average
      activeCases,
      totalLawyers: lawyers.length,
      activeClients,
      successRate,
      utilizationRate: Math.round(lawyerPerformance.reduce((sum, l) => sum + l.utilization, 0) / lawyers.length),
      avgCaseValue,
      monthlyGrowth: 12.5, // Mock growth percentage
      lawyerPerformance,
      practiceAreaBreakdown: practiceAreas,
      revenueByPracticeArea: revenueByArea,
      clientRetentionRate: 94
    };
  }, [cases, lawyers, clients]);

  useEffect(() => {
    if (user?.uid && user?.role) {
      fetchFirmData();
    }
  }, [user]);

  const fetchFirmData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users to get lawyers and clients
      const allUsers = await dispatch(getAllUsers()).unwrap();
      const firmLawyers = allUsers.filter(u => u.role === 'lawyer' && u.firmId === user.firmId);
      const firmClients = allUsers.filter(u => u.role === 'client');
      
      setLawyers(firmLawyers || []);
      setClients(firmClients || []);

      // Fetch all cases for the firm
      const casesData = await dispatch(getUserCases({ 
        userId: user.uid, 
        userRole: 'firm' // Special role for firm-wide data
      })).unwrap();
      
      setCases(casesData || []);
      
    } catch (error) {
      console.error('Failed to fetch firm data:', error);
      setCases([]);
      setLawyers([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFirmData();
    setRefreshing(false);
  };
  

  // Enhanced firm statistics
  const firmStats = [
    { 
      label: 'Total Revenue', 
      value: `₹${(firmMetrics.totalRevenue / 10000000).toFixed(1)}Cr`, 
      change: `+${firmMetrics.monthlyGrowth}%`,
      trend: 'up',
      icon: 'currency-inr', 
      gradient: colors.gradient.gold,
      glowColor: colors.secondary,
      screen: SCREEN_NAMES.REVENUE,
      description: 'This year'
    },
    { 
      label: 'Active Cases', 
      value: firmMetrics.activeCases.toString(), 
      change: '+15',
      trend: 'up',
      icon: 'briefcase-variant', 
      gradient: colors.gradient.primary,
      glowColor: colors.primary,
      screen: SCREEN_NAMES.CASE_MANAGEMENT,
      description: 'Ongoing matters'
    },
    { 
      label: 'Success Rate', 
      value: `${firmMetrics.successRate}%`, 
      change: '+3%',
      trend: 'up',
      icon: 'trophy-variant', 
      gradient: colors.gradient.success,
      glowColor: colors.success,
      description: 'Case completion'
    },
    { 
      label: 'Active Lawyers', 
      value: firmMetrics.totalLawyers.toString(), 
      change: '+2',
      trend: 'up',
      icon: 'account-tie', 
      gradient: colors.gradient.info,
      glowColor: colors.info,
      screen: 'LawyerManagement',
      description: 'Legal team'
    },
    { 
      label: 'Client Base', 
      value: firmMetrics.activeClients.toString(), 
      change: '+8',
      trend: 'up',
      icon: 'account-group', 
      gradient: colors.gradient.purple,
      glowColor: colors.tertiary,
      screen: SCREEN_NAMES.MY_CONSULTATIONS,
      description: 'Active clients'
    },
    { 
      label: 'Utilization Rate', 
      value: `${firmMetrics.utilizationRate}%`, 
      change: '+5%',
      trend: 'up',
      icon: 'chart-line', 
      gradient: colors.gradient.emerald,
      glowColor: colors.success,
      description: 'Resource usage'
    },
  ];

  // Practice area performance data
  const practiceAreaData = useMemo(() => {
    return Object.entries(firmMetrics.practiceAreaBreakdown).map(([area, count]) => ({
      area,
      cases: count,
      revenue: firmMetrics.revenueByPracticeArea[area] || 0,
      percentage: Math.round((count / firmMetrics.activeCases) * 100) || 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [firmMetrics]);

  // Top performing lawyers
  const topLawyers = useMemo(() => {
    return firmMetrics.lawyerPerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [firmMetrics.lawyerPerformance]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

    const quickActions = [
    { 
        title: 'Add Lawyer', 
        icon: 'account-plus', 
        gradient: colors.gradient.primary,
        screen: SCREEN_NAMES.LAWYER_MANAGEMENT,
        description: 'Hire talent'
    },
    { 
        title: 'Analytics Hub', 
        icon: 'chart-box', 
        gradient: colors.gradient.info,
        screen: SCREEN_NAMES.REPORTS,
        description: 'Deep insights'
    },
    { 
        title: 'Case Oversight', 
        icon: 'eye-check', 
        gradient: colors.gradient.purple,
        screen: SCREEN_NAMES.CASE_OVERSIGHT,
        description: 'Monitor all'
    },
    { 
        title: 'Client Portal', 
        icon: 'account-heart', 
        gradient: colors.gradient.success,
        screen: SCREEN_NAMES.CLIENT_MANAGEMENT,
        description: 'Client relations'
    },
    { 
        title: 'Reports', 
        icon: 'file-chart', 
        gradient: colors.gradient.gold,
        screen: SCREEN_NAMES.REPORTS,
        description: 'Generate reports'
    },
    { 
        title: 'Settings', 
        icon: 'cog', 
        gradient: colors.gradient.crimson,
        screen: SCREEN_NAMES.FIRM_SETTINGS,
        description: 'Firm config'
    },
    ];

  const handleAction = (screenName) => {
    if (screenName) {
      navigation.navigate('InApp', { screen: screenName });
    }
  };

  const handleStatCardPress = (stat) => {
    if (stat.screen) {
      handleAction(stat.screen);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Lawyer Management Modal
  const LawyerManagementModal = () => {
    const [newLawyerEmail, setNewLawyerEmail] = useState('');
    const [newLawyerName, setNewLawyerName] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    
    const specializations = [
      'Corporate Law', 'Criminal Law', 'Family Law', 'Property Law', 
      'Tax Law', 'Intellectual Property', 'Labor Law', 'Environmental Law'
    ];

    const handleInviteLawyer = () => {
      // Dispatch action to invite lawyer
      console.log('Inviting lawyer:', { newLawyerEmail, newLawyerName, selectedSpecialization });
      
      // Reset form and close modal
      setNewLawyerEmail('');
      setNewLawyerName('');
      setSelectedSpecialization('');
      setShowLawyerModal(false);
    };

    return (
      <Modal
        visible={showLawyerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
        onRequestClose={() => setShowLawyerModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => setShowLawyerModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>Add New Lawyer</Text>
              
              <TouchableOpacity 
                onPress={handleInviteLawyer}
                style={styles.saveButton}
                disabled={!newLawyerEmail.trim() || !newLawyerName.trim()}
              >
                <Text style={[
                  styles.saveButtonText,
                  (!newLawyerEmail.trim() || !newLawyerName.trim()) && { opacity: 0.5 }
                ]}>
                  Invite
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Surface style={styles.formCard}>
              <Text style={styles.sectionTitle}>Lawyer Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newLawyerName}
                  onChangeText={setNewLawyerName}
                  placeholder="Enter lawyer's full name..."
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newLawyerEmail}
                  onChangeText={setNewLawyerEmail}
                  placeholder="Enter email address..."
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialization</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.specializationContainer}
                >
                  {specializations.map((spec) => (
                    <TouchableOpacity
                      key={spec}
                      style={[
                        styles.specializationChip,
                        selectedSpecialization === spec && styles.specializationChipActive
                      ]}
                      onPress={() => setSelectedSpecialization(spec)}
                    >
                      <Text style={[
                        styles.specializationChipText,
                        selectedSpecialization === spec && styles.specializationChipTextActive
                      ]}>
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Surface>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Enhanced Performance Chart for firm-wide data
  const FirmPerformanceChart = () => {
    const chartData = [
      { month: 'Jan', revenue: 45, cases: 12, lawyers: firmMetrics.totalLawyers },
      { month: 'Feb', revenue: 52, cases: 15, lawyers: firmMetrics.totalLawyers },
      { month: 'Mar', revenue: 38, cases: 10, lawyers: firmMetrics.totalLawyers },
      { month: 'Apr', revenue: 68, cases: 18, lawyers: firmMetrics.totalLawyers },
      { month: 'May', revenue: 75, cases: 22, lawyers: firmMetrics.totalLawyers },
      { month: 'Jun', revenue: 85, cases: 25, lawyers: firmMetrics.totalLawyers + 1 }
    ];

    const maxRevenue = Math.max(...chartData.map(d => d.revenue));
    const maxCases = Math.max(...chartData.map(d => d.cases));
    const chartHeight = 120;
    const chartWidth = width - 80;
    const pointSpacing = chartWidth / (chartData.length - 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Firm Performance Trend (6 Months)</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Revenue (₹Cr)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Cases</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.chart, { height: chartHeight, width: chartWidth, alignSelf: 'center' }]}>
          {/* Background Grid */}
          <View style={styles.gridContainer}>
            {[0.25, 0.5, 0.75, 1].map((fraction, index) => (
              <View
                key={`grid-${index}`}
                style={[
                  styles.gridLine,
                  { top: chartHeight * (1 - fraction), width: chartWidth }
                ]}
              />
            ))}
          </View>

          {/* Revenue Line */}
          {chartData.map((point, index) => {
            if (index === chartData.length - 1) return null;
            const nextPoint = chartData[index + 1];
            
            const x1 = index * pointSpacing;
            const y1 = chartHeight - ((point.revenue / maxRevenue) * (chartHeight - 20));
            const x2 = (index + 1) * pointSpacing;
            const y2 = chartHeight - ((nextPoint.revenue / maxRevenue) * (chartHeight - 20));
            
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
                  }
                ]}
              />
            );
          })}
          
          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - ((point.revenue / maxRevenue) * (chartHeight - 20));
            
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.chartPoint,
                  { left: x - 6, top: y - 6 }
                ]}
              >
                <View style={styles.pointValue}>
                  <Text style={styles.pointValueText}>₹{point.revenue}Cr</Text>
                </View>
              </View>
            );
          })}
          
          {/* Case Bars */}
          {chartData.map((point, index) => {
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
          {chartData.map((point, index) => (
            <View key={`label-${index}`} style={styles.chartLabelContainer}>
              <Text style={styles.chartLabel}>{point.month}</Text>
              <Text style={styles.chartSubLabel}>{point.cases} cases</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading firm dashboard...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Firm Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.particleContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
            <View style={[styles.particle, styles.particle4]} />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.firmSection}>
              <View style={styles.firmLogoContainer}>
                <LinearGradient
                  colors={colors.gradient.gold}
                  style={styles.firmLogoGradient}
                >
                  <MaterialCommunityIcons 
                    name="domain" 
                    size={32} 
                    color="white" 
                  />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              <View style={styles.firmDetails}>
                <Text style={styles.welcomeText}>{getGreeting()}</Text>
                <Text style={styles.firmName}>{user?.firmName || 'Law Associates'}</Text>
                <View style={styles.firmBadge}>
                  <MaterialCommunityIcons name="shield-star" size={12} color={colors.secondary} />
                  <Text style={styles.firmBadgeText}>Premium Firm</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
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
        
        {/* Enhanced Glass Summary for Firm */}
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
                      colors={colors.gradient.gold}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="currency-inr" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>
                    ₹{(firmMetrics.totalRevenue / 10000000).toFixed(1)}Cr
                  </Text>
                  <Text style={styles.summaryLabel}>Total Revenue</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="briefcase" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{firmMetrics.activeCases}</Text>
                  <Text style={styles.summaryLabel}>Active Cases</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.info}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="account-tie" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{firmMetrics.totalLawyers}</Text>
                  <Text style={styles.summaryLabel}>Lawyers</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.success}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="chart-line" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{firmMetrics.utilizationRate}%</Text>
                  <Text style={styles.summaryLabel}>Utilization</Text>
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {/* Firm Performance Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>Firm Analytics</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={width * 0.42}
          >
            {firmStats.map((stat, index) => (
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

        {/* Enhanced Performance Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Trends</Text>
            <TouchableOpacity style={styles.timeFrameSelector}>
              <Text style={styles.timeFrameText}>6 Months</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Surface style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.progressBackground}
            >
              <FirmPerformanceChart />
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{firmMetrics.successRate}%</Text>
                  <Text style={styles.metricLabel}>Success Rate</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{firmMetrics.clientRetentionRate}%</Text>
                  <Text style={styles.metricLabel}>Client Retention</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>₹{(firmMetrics.avgCaseValue / 100000).toFixed(1)}L</Text>
                  <Text style={styles.metricLabel}>Avg Case Value</Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Practice Areas Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Practice Areas</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.practiceAreasContainer}
          >
            {practiceAreaData.slice(0, 4).map((area, index) => (
              <Surface key={index} style={styles.practiceAreaCard}>
                <LinearGradient
                  colors={getPracticeAreaGradient(index)}
                  style={styles.practiceAreaGradient}
                >
                  <View style={styles.practiceAreaHeader}>
                    <MaterialCommunityIcons 
                      name={getPracticeAreaIcon(area.area)} 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.practiceAreaPercentage}>
                      {area.percentage}%
                    </Text>
                  </View>
                  
                  <Text style={styles.practiceAreaName}>{area.area}</Text>
                  <Text style={styles.practiceAreaCases}>{area.cases} Cases</Text>
                  <Text style={styles.practiceAreaRevenue}>
                    ₹{(area.revenue / 100000).toFixed(1)}L
                  </Text>
                </LinearGradient>
              </Surface>
            ))}
          </ScrollView>
        </View>

        {/* Top Performing Lawyers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <TouchableOpacity onPress={() => setShowLawyerModal(true)}>
              <Text style={styles.addLawyerText}>+ Add Lawyer</Text>
            </TouchableOpacity>
          </View>
          
          {topLawyers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-plus" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No lawyers found</Text>
              <Text style={styles.emptyStateSubtext}>Add lawyers to see performance metrics</Text>
            </View>
          ) : (
            topLawyers.map((lawyer, index) => (
              <TouchableOpacity key={lawyer.uid} activeOpacity={0.95}>
                <Surface style={styles.lawyerCard}>
                  <View style={styles.lawyerCardContent}>
                    <View style={styles.lawyerRankContainer}>
                      <LinearGradient
                        colors={getRankGradient(index)}
                        style={styles.rankBadge}
                      >
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.lawyerInfo}>
                      <Avatar.Text 
                        size={48} 
                        label={lawyer.displayName?.charAt(0) || 'L'} 
                        style={styles.lawyerAvatar}
                      />
                      
                      <View style={styles.lawyerDetails}>
                        <Text style={styles.lawyerName}>Adv. {lawyer.displayName}</Text>
                        <Text style={styles.lawyerSpecialization}>
                          {lawyer.specialization || 'General Practice'}
                        </Text>
                        
                        <View style={styles.lawyerMetrics}>
                          <View style={styles.lawyerMetric}>
                            <Text style={styles.metricLabel}>Cases</Text>
                            <Text style={styles.metricValue}>{lawyer.activeCases}</Text>
                          </View>
                          
                          <View style={styles.lawyerMetric}>
                            <Text style={styles.metricLabel}>Success</Text>
                            <Text style={styles.metricValue}>{lawyer.successRate}%</Text>
                          </View>
                          
                          <View style={styles.lawyerMetric}>
                            <Text style={styles.metricLabel}>Revenue</Text>
                            <Text style={styles.metricValue}>
                              ₹{(lawyer.totalRevenue / 100000).toFixed(1)}L
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.utilizationSection}>
                      <Text style={styles.utilizationLabel}>Utilization</Text>
                      <View style={styles.utilizationBarContainer}>
                        <ProgressBar 
                          progress={lawyer.utilization / 100} 
                          color={getUtilizationColor(lawyer.utilization)}
                          style={styles.utilizationBar}
                        />
                      </View>
                      <Text style={styles.utilizationValue}>{lawyer.utilization}%</Text>
                    </View>
                  </View>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="filter-variant" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Surface style={styles.activityCard}>
            {getRecentActivities().map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <LinearGradient
                    colors={getActivityGradient(activity.type)}
                    style={styles.activityIcon}
                  >
                    <MaterialCommunityIcons 
                      name={getActivityIcon(activity.type)} 
                      size={16} 
                      color="white" 
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                
                {activity.value && (
                  <View style={styles.activityValue}>
                    <Text style={styles.activityValueText}>{activity.value}</Text>
                  </View>
                )}
              </View>
            ))}
          </Surface>
        </View>

        {/* Enhanced Quick Actions for Firm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
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

        <LawyerManagementModal />
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

// Helper functions
const getPracticeAreaGradient = (index) => {
  const gradients = [
    colors.gradient.primary,
    colors.gradient.success,
    colors.gradient.info,
    colors.gradient.purple,
    colors.gradient.gold,
    colors.gradient.crimson
  ];
  return gradients[index % gradients.length];
};

const getPracticeAreaIcon = (area) => {
  const icons = {
    'Corporate Law': 'domain',
    'Criminal Law': 'gavel',
    'Family Law': 'home-heart',
    'Property Law': 'home-city',
    'Tax Law': 'calculator',
    'Intellectual Property': 'lightbulb',
    'Labor Law': 'account-hard-hat',
    'Environmental Law': 'leaf',
    'General': 'briefcase'
  };
  return icons[area] || 'briefcase';
};

const getRankGradient = (index) => {
  if (index === 0) return colors.gradient.gold;
  if (index === 1) return ['#C0C0C0', '#E5E7EB'];
  if (index === 2) return ['#CD7F32', '#F59E0B'];
  return colors.gradient.info;
};

const getUtilizationColor = (utilization) => {
  if (utilization >= 80) return colors.success;
  if (utilization >= 60) return colors.warning;
  return colors.error;
};

const getRecentActivities = () => [
  {
    type: 'case_won',
    title: 'Case Won',
    description: 'Adv. Sharma won landmark property case',
    time: '2 hours ago',
    value: '₹15L'
  },
  {
    type: 'new_client',
    title: 'New Client Onboarded',
    description: 'Tech Corp Ltd. signed retainer agreement',
    time: '5 hours ago',
    value: '₹50L'
  },
  {
    type: 'lawyer_joined',
    title: 'New Lawyer Joined',
    description: 'Adv. Priya Kumar joined as Senior Associate',
    time: '1 day ago'
  },
  {
    type: 'milestone',
    title: 'Revenue Milestone',
    description: 'Firm crossed ₹10Cr annual revenue',
    time: '2 days ago'
  }
];

const getActivityGradient = (type) => {
  switch (type) {
    case 'case_won': return colors.gradient.success;
    case 'new_client': return colors.gradient.info;
    case 'lawyer_joined': return colors.gradient.purple;
    case 'milestone': return colors.gradient.gold;
    default: return colors.gradient.primary;
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'case_won': return 'trophy';
    case 'new_client': return 'account-plus';
    case 'lawyer_joined': return 'account-tie';
    case 'milestone': return 'flag-checkered';
    default: return 'information';
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  particle1: {
    top: '15%',
    left: '10%',
  },
  particle2: {
    top: '70%',
    right: '15%',
  },
  particle3: {
    top: '35%',
    left: '75%',
  },
  particle4: {
    top: '55%',
    left: '25%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  firmSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  firmLogoContainer: {
    position: 'relative',
  },
  firmLogoGradient: {
    borderRadius: 28,
    padding: 2,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
  firmDetails: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  firmName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  firmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  firmBadgeText: {
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    marginHorizontal: 8,
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
  timeFrameSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeFrameText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  addLawyerText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
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
  practiceAreasContainer: {
    paddingRight: 24,
  },
  practiceAreaCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  practiceAreaGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  practiceAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceAreaPercentage: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  practiceAreaName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  practiceAreaCases: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  practiceAreaRevenue: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '700',
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
  lawyerCard: {
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
  lawyerCardContent: {
    padding: 20,
  },
  lawyerRankContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  lawyerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lawyerAvatar: {
    backgroundColor: colors.primary,
    marginRight: 16,
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lawyerSpecialization: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  lawyerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lawyerMetric: {
    alignItems: 'center',
    flex: 1,
  },
  utilizationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  utilizationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  utilizationBarContainer: {
    marginBottom: 4,
  },
  utilizationBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  utilizationValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.1)',
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  activityValue: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activityValueText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '800',
  },
  quickActionsGrid: {
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + 20 || 44,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  specializationContainer: {
    paddingRight: 24,
    gap: 12,
  },
  specializationChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  specializationChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  specializationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  specializationChipTextActive: {
    color: colors.primary,
  },
});