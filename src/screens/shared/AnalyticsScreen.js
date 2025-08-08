import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import {
  Surface,
  Text,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#0F0F23',
  primaryLight: '#1A1A3A',
  secondary: '#D4AF37',
  tertiary: '#8B5CF6',
  accent: '#06FFA5',
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
  gradient: {
    primary: ['#0F0F23', '#1A1A3A', '#2D1B69'],
    gold: ['#D4AF37', '#FFD700', '#FFA500'],
    purple: ['#8B5CF6', '#A855F7', '#C084FC'],
    success: ['#10B981', '#34D399', '#6EE7B7'],
    info: ['#3B82F6', '#60A5FA', '#93C5FD'],
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']
  }
};

export default function AnalyticsScreen({ navigation }) {
  const [scrollY] = useState(new Animated.Value(0));
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const periods = [
    { key: 'weekly', label: 'Week', icon: 'calendar-week' },
    { key: 'monthly', label: 'Month', icon: 'calendar-month' },
    { key: 'quarterly', label: 'Quarter', icon: 'calendar-range' },
    { key: 'yearly', label: 'Year', icon: 'calendar' },
  ];

  const metrics = [
    { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
    { key: 'cases', label: 'Cases', icon: 'briefcase-variant' },
    { key: 'clients', label: 'Clients', icon: 'account-group' },
    { key: 'revenue', label: 'Revenue', icon: 'currency-inr' },
  ];

  const analyticsData = {
    monthly: {
      totalCases: 24,
      wonCases: 23,
      lostCases: 1,
      pendingCases: 12,
      newClients: 8,
      totalRevenue: 240000,
      avgCaseValue: 10000,
      satisfactionScore: 4.9,
      efficiency: 96,
      productivity: 92,
    }
  };

  const casesByCategory = [
    { category: 'Corporate Law', cases: 8, percentage: 33, color: colors.primary },
    { category: 'Contract Law', cases: 6, percentage: 25, color: colors.info },
    { category: 'IP Law', cases: 4, percentage: 17, color: colors.secondary },
    { category: 'Securities Law', cases: 3, percentage: 12, color: colors.tertiary },
    { category: 'Employment Law', cases: 3, percentage: 13, color: colors.success },
  ];

  const performanceMetrics = [
    {
      title: 'Case Success Rate',
      value: '96%',
      change: '+4%',
      trend: 'up',
      description: '23 of 24 cases won',
      gradient: colors.gradient.success,
      icon: 'trophy-variant'
    },
    {
      title: 'Client Satisfaction',
      value: '4.9/5.0',
      change: '+0.2',
      trend: 'up',
      description: 'Average rating',
      gradient: colors.gradient.gold,
      icon: 'star'
    },
    {
      title: 'Avg Case Duration',
      value: '45 days',
      change: '-5 days',
      trend: 'up',
      description: 'Faster resolution',
      gradient: colors.gradient.info,
      icon: 'clock-fast'
    },
    {
      title: 'Revenue per Case',
      value: '₹10K',
      change: '+₹2K',
      trend: 'up',
      description: 'Average value',
      gradient: colors.gradient.purple,
      icon: 'trending-up'
    }
  ];

  const monthlyTrends = [
    { month: 'Aug', cases: 18, revenue: 180, satisfaction: 4.7 },
    { month: 'Sep', cases: 22, revenue: 220, satisfaction: 4.8 },
    { month: 'Oct', cases: 20, revenue: 200, satisfaction: 4.6 },
    { month: 'Nov', cases: 26, revenue: 260, satisfaction: 4.9 },
    { month: 'Dec', cases: 24, revenue: 240, satisfaction: 4.9 },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.backButtonGradient}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.headerTitleSection}>
              <Text style={styles.headerTitle}>Analytics Dashboard</Text>
              <Text style={styles.headerSubtitle}>Performance Insights</Text>
            </View>
            
            <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
              <LinearGradient
                colors={colors.gradient.gold}
                style={styles.exportButtonGradient}
              >
                <MaterialCommunityIcons name="download" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
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
        {/* Period Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name={period.icon} 
                  size={16} 
                  color={selectedPeriod === period.key ? colors.secondary : colors.textSecondary} 
                />
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            {performanceMetrics.map((metric, index) => (
              <TouchableOpacity key={index} activeOpacity={0.9} style={styles.metricCardWrapper}>
                <Surface style={styles.metricCard}>
                  <LinearGradient
                    colors={metric.gradient}
                    style={styles.metricGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.metricHeader}>
                      <MaterialCommunityIcons 
                        name={metric.icon} 
                        size={24} 
                        color="white" 
                      />
                      <View style={styles.trendContainer}>
                        <MaterialCommunityIcons 
                          name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                          size={12} 
                          color={colors.accent} 
                        />
                        <Text style={styles.changeText}>{metric.change}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricDescription}>{metric.description}</Text>
                  </LinearGradient>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cases by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cases by Practice Area</Text>
          <Surface style={styles.chartCard}>
            <View style={styles.chartContent}>
              <View style={styles.categoryList}>
                {casesByCategory.map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryCount}>{item.cases} cases</Text>
                    </View>
                    <View style={styles.categoryProgress}>
                      <ProgressBar
                        progress={item.percentage / 100}
                        color={item.color}
                        style={styles.categoryProgressBar}
                      />
                      <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Surface>
        </View>

        {/* Performance Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          <Surface style={styles.trendsCard}>
            <View style={styles.trendsHeader}>
              <Text style={styles.trendsTitle}>Monthly Overview</Text>
              <Chip 
                mode="flat"
                compact
                style={styles.trendsChip}
                textStyle={styles.trendsChipText}
              >
                Last 5 Months
              </Chip>
            </View>
            
            <View style={styles.trendsContent}>
              <View style={styles.trendsLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Cases</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
                  <Text style={styles.legendText}>Revenue (₹K)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.tertiary }]} />
                  <Text style={styles.legendText}>Satisfaction</Text>
                </View>
              </View>
              
              <View style={styles.trendsChart}>
                {monthlyTrends.map((trend, index) => (
                  <View key={index} style={styles.trendBar}>
                    <Text style={styles.trendMonth}>{trend.month}</Text>
                    <View style={styles.trendBars}>
                      <View style={styles.trendBarContainer}>
                        <View style={[
                          styles.trendBarFill,
                          { 
                            height: (trend.cases / 30) * 60,
                            backgroundColor: colors.primary 
                          }
                        ]} />
                      </View>
                      <View style={styles.trendBarContainer}>
                        <View style={[
                          styles.trendBarFill,
                          { 
                            height: (trend.revenue / 300) * 60,
                            backgroundColor: colors.secondary 
                          }
                        ]} />
                      </View>
                      <View style={styles.trendBarContainer}>
                        <View style={[
                          styles.trendBarFill,
                          { 
                            height: (trend.satisfaction / 5) * 60,
                            backgroundColor: colors.tertiary 
                          }
                        ]} />
                      </View>
                    </View>
                    <View style={styles.trendValues}>
                      <Text style={styles.trendValue}>{trend.cases}</Text>
                      <Text style={styles.trendValue}>{trend.revenue}</Text>
                      <Text style={styles.trendValue}>{trend.satisfaction}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Surface>
        </View>

        {/* Detailed Analytics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Insights</Text>
          
          <Surface style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
              style={styles.insightBackground}
            >
              <View style={styles.insightHeader}>
                <MaterialCommunityIcons name="lightbulb" size={24} color={colors.tertiary} />
                <Text style={styles.insightTitle}>Key Insights</Text>
              </View>
              
              <View style={styles.insightsList}>
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.insightText}>
                    Your case resolution time has improved by 15% this quarter
                  </Text>
                </View>
                
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="account-multiple" size={16} color={colors.info} />
                  <Text style={styles.insightText}>
                    Corporate Law cases generate 40% higher revenue on average
                  </Text>
                </View>
                
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="star" size={16} color={colors.secondary} />
                  <Text style={styles.insightText}>
                    Client satisfaction is highest for IP Law cases (4.9/5.0)
                  </Text>
                </View>
                
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color={colors.warning} />
                  <Text style={styles.insightText}>
                    December shows 20% increase in consultation bookings
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          
          <Surface style={styles.recommendationCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 255, 165, 0.1)']}
              style={styles.recommendationBackground}
            >
              <View style={styles.recommendationHeader}>
                <MaterialCommunityIcons name="robot-excited" size={24} color={colors.success} />
                <Text style={styles.recommendationTitle}>Growth Opportunities</Text>
              </View>
              
              <View style={styles.recommendationsList}>
                <TouchableOpacity style={styles.recommendationItem} activeOpacity={0.8}>
                  <View style={styles.recommendationIcon}>
                    <MaterialCommunityIcons name="trending-up" size={16} color={colors.success} />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationText}>
                      Focus on Corporate Law cases for higher revenue potential
                    </Text>
                    <Text style={styles.recommendationSubtext}>
                      40% higher average case value
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.recommendationItem} activeOpacity={0.8}>
                  <View style={styles.recommendationIcon}>
                    <MaterialCommunityIcons name="clock-fast" size={16} color={colors.info} />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationText}>
                      Optimize case workflow for faster resolution
                    </Text>
                    <Text style={styles.recommendationSubtext}>
                      Target: Reduce average duration by 10 days
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.recommendationItem} activeOpacity={0.8}>
                  <View style={styles.recommendationIcon}>
                    <MaterialCommunityIcons name="account-plus" size={16} color={colors.tertiary} />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationText}>
                      Increase client retention through follow-up services
                    </Text>
                    <Text style={styles.recommendationSubtext}>
                      Current retention rate: 78%
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  exportButton: {
    marginLeft: 16,
  },
  exportButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 6,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
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
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricCardWrapper: {
    width: (width - 64) / 2,
  },
  metricCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  metricGradient: {
    padding: 20,
    minHeight: 140,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 6,
    letterSpacing: -1,
  },
  metricTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  chartContent: {
    padding: 24,
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
    minWidth: 35,
  },
  trendsCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trendsChip: {
    backgroundColor: colors.primary + '15',
    height: 28,
  },
  trendsChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  trendsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  trendsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
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
  trendsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
  },
  trendMonth: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  trendBarContainer: {
    width: 8,
    height: 60,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderRadius: 4,
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  trendValues: {
    flexDirection: 'row',
    gap: 8,
  },
  trendValue: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 8,
    textAlign: 'center',
  },
  insightCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginBottom: 16,
  },
  insightBackground: {
    padding: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  recommendationCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  recommendationBackground: {
    padding: 24,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});