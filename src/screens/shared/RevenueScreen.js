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

export default function RevenueScreen({ navigation }) {
  const [scrollY] = useState(new Animated.Value(0));
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedView, setSelectedView] = useState('overview');

  const periods = [
    { key: 'weekly', label: 'Week', icon: 'calendar-week' },
    { key: 'monthly', label: 'Month', icon: 'calendar-month' },
    { key: 'quarterly', label: 'Quarter', icon: 'calendar-range' },
    { key: 'yearly', label: 'Year', icon: 'calendar' },
  ];

  const revenueMetrics = [
    {
      title: 'Total Revenue',
      value: '₹2,40,000',
      change: '+₹28,000',
      trend: 'up',
      description: 'This month',
      gradient: colors.gradient.gold,
      icon: 'currency-inr',
      percentage: 13.2
    },
    {
      title: 'Avg Case Value',
      value: '₹10,000',
      change: '+₹2,000',
      trend: 'up',
      description: 'Per case',
      gradient: colors.gradient.success,
      icon: 'trending-up',
      percentage: 25.0
    },
    {
      title: 'Collection Rate',
      value: '94%',
      change: '+2%',
      trend: 'up',
      description: 'Payment success',
      gradient: colors.gradient.info,
      icon: 'check-circle',
      percentage: 2.2
    },
    {
      title: 'Outstanding',
      value: '₹15,000',
      change: '-₹5,000',
      trend: 'up',
      description: 'Pending payments',
      gradient: colors.gradient.primary,
      icon: 'clock-outline',
      percentage: -25.0
    }
  ];

  const monthlyRevenue = [
    { month: 'Aug', revenue: 180000, target: 200000, cases: 18, avgValue: 10000 },
    { month: 'Sep', revenue: 220000, target: 220000, cases: 22, avgValue: 10000 },
    { month: 'Oct', revenue: 200000, target: 210000, cases: 20, avgValue: 10000 },
    { month: 'Nov', revenue: 260000, target: 240000, cases: 26, avgValue: 10000 },
    { month: 'Dec', revenue: 240000, target: 250000, cases: 24, avgValue: 10000 },
  ];

  const revenueByCategory = [
    { category: 'Corporate Law', revenue: 96000, percentage: 40, cases: 8, avgValue: 12000, color: colors.primary },
    { category: 'Contract Law', revenue: 60000, percentage: 25, cases: 6, avgValue: 10000, color: colors.info },
    { category: 'IP Law', revenue: 48000, percentage: 20, cases: 4, avgValue: 12000, color: colors.secondary },
    { category: 'Securities Law', revenue: 24000, percentage: 10, cases: 3, avgValue: 8000, color: colors.tertiary },
    { category: 'Employment Law', revenue: 12000, percentage: 5, cases: 3, avgValue: 4000, color: colors.success },
  ];

  const topClients = [
    { name: 'Reliance Industries Ltd.', revenue: 45000, cases: 3, status: 'active', growth: 15 },
    { name: 'TechCorp Acquisition', revenue: 32000, cases: 2, status: 'active', growth: 8 },
    { name: 'Global Tech Inc.', revenue: 28000, cases: 4, status: 'active', growth: 12 },
    { name: 'StartupX Ltd.', revenue: 15000, cases: 2, status: 'pending', growth: -5 },
    { name: 'Innovation Labs', revenue: 12000, cases: 1, status: 'active', growth: 25 },
  ];

  const paymentInsights = [
    {
      title: 'Average Payment Time',
      value: '12 days',
      change: '-3 days',
      trend: 'up',
      icon: 'clock-fast',
      color: colors.success
    },
    {
      title: 'Overdue Amount',
      value: '₹8,500',
      change: '-₹2,500',
      trend: 'up',
      icon: 'alert-circle',
      color: colors.warning
    },
    {
      title: 'Payment Methods',
      value: '4 Active',
      change: '+1',
      trend: 'up',
      icon: 'credit-card',
      color: colors.info
    }
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
          colors={colors.gradient.gold}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.particleContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
          </View>
          
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.backButtonGradient}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.headerTitleSection}>
              <Text style={styles.headerTitle}>Revenue Analytics</Text>
              <Text style={styles.headerSubtitle}>Financial Performance</Text>
            </View>
            
            <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.exportButtonGradient}
              >
                <MaterialCommunityIcons name="file-export" size={18} color="white" />
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

        {/* Revenue Metrics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.metricsGrid}>
            {revenueMetrics.map((metric, index) => (
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
                    
                    <View style={styles.percentageContainer}>
                      <Text style={styles.percentageText}>
                        {metric.percentage > 0 ? '+' : ''}{metric.percentage}%
                      </Text>
                    </View>
                  </LinearGradient>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Monthly Revenue Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <Surface style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Monthly Performance</Text>
              <Chip 
                mode="flat"
                compact
                style={styles.trendChip}
                textStyle={styles.trendChipText}
              >
                Last 5 Months
              </Chip>
            </View>
            
            <View style={styles.trendContent}>
              <View style={styles.trendChart}>
                {monthlyRevenue.map((data, index) => (
                  <View key={index} style={styles.monthContainer}>
                    <Text style={styles.monthLabel}>{data.month}</Text>
                    
                    <View style={styles.barContainer}>
                      <View style={styles.targetBar}>
                        <View style={[
                          styles.revenueBar,
                          { 
                            height: (data.revenue / 300000) * 100,
                            backgroundColor: data.revenue >= data.target ? colors.success : colors.warning
                          }
                        ]} />
                      </View>
                      <View style={[
                        styles.targetLine,
                        { bottom: (data.target / 300000) * 100 }
                      ]} />
                    </View>
                    
                    <View style={styles.monthStats}>
                      <Text style={styles.revenueAmount}>₹{(data.revenue / 1000)}K</Text>
                      <Text style={styles.targetAmount}>Target: ₹{(data.target / 1000)}K</Text>
                      <Text style={styles.caseCount}>{data.cases} cases</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Surface>
        </View>

        {/* Revenue by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Practice Area</Text>
          <Surface style={styles.categoryCard}>
            <View style={styles.categoryContent}>
              {revenueByCategory.map((category, index) => (
                <TouchableOpacity key={index} activeOpacity={0.8} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={styles.categoryName}>{category.category}</Text>
                    </View>
                    <Text style={styles.categoryRevenue}>₹{(category.revenue / 1000)}K</Text>
                  </View>
                  
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryStats}>
                      {category.cases} cases • Avg ₹{(category.avgValue / 1000)}K
                    </Text>
                    <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                  </View>
                  
                  <View style={styles.categoryProgress}>
                    <ProgressBar
                      progress={category.percentage / 100}
                      color={category.color}
                      style={styles.categoryProgressBar}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        </View>

        {/* Top Revenue Clients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Revenue Clients</Text>
          <Surface style={styles.clientsCard}>
            <View style={styles.clientsContent}>
              {topClients.map((client, index) => (
                <TouchableOpacity key={index} activeOpacity={0.8} style={styles.clientItem}>
                  <View style={styles.clientRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientStats}>
                      {client.cases} cases • ₹{(client.revenue / client.cases / 1000)}K avg
                    </Text>
                  </View>
                  
                  <View style={styles.clientMetrics}>
                    <Text style={styles.clientRevenue}>₹{(client.revenue / 1000)}K</Text>
                    <View style={styles.clientGrowth}>
                      <MaterialCommunityIcons 
                        name={client.growth > 0 ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={client.growth > 0 ? colors.success : colors.error} 
                      />
                      <Text style={[
                        styles.growthText,
                        { color: client.growth > 0 ? colors.success : colors.error }
                      ]}>
                        {client.growth > 0 ? '+' : ''}{client.growth}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.clientStatus,
                    { backgroundColor: client.status === 'active' ? colors.success : colors.warning }
                  ]}>
                    <Text style={styles.statusText}>
                      {client.status === 'active' ? 'Active' : 'Pending'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        </View>

        {/* Payment Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Analytics</Text>
          <View style={styles.paymentInsights}>
            {paymentInsights.map((insight, index) => (
              <Surface key={index} style={styles.insightCard}>
                <View style={styles.insightContent}>
                  <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                    <MaterialCommunityIcons 
                      name={insight.icon} 
                      size={20} 
                      color={insight.color} 
                    />
                  </View>
                  
                  <View style={styles.insightDetails}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightValue}>{insight.value}</Text>
                    
                    <View style={styles.insightChange}>
                      <MaterialCommunityIcons 
                        name={insight.trend === 'up' ? 'trending-up' : 'trending-down'}
                        size={12} 
                        color={colors.success} 
                      />
                      <Text style={styles.insightChangeText}>{insight.change}</Text>
                    </View>
                  </View>
                </View>
              </Surface>
            ))}
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <Surface style={styles.summaryCard}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.1)', 'rgba(255, 215, 0, 0.1)']}
              style={styles.summaryBackground}
            >
              <View style={styles.summaryHeader}>
                <MaterialCommunityIcons name="chart-line" size={24} color={colors.secondary} />
                <Text style={styles.summaryTitle}>December 2024 Summary</Text>
              </View>
              
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Revenue</Text>
                  <Text style={styles.summaryValue}>₹2,40,000</Text>
                  <Text style={styles.summarySubtext}>96% of target</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net Profit</Text>
                  <Text style={styles.summaryValue}>₹1,92,000</Text>
                  <Text style={styles.summarySubtext}>80% margin</Text>
                </View>
              </View>
              
              <View style={styles.summaryActions}>
                <TouchableOpacity style={styles.summaryButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradient.primary}
                    style={styles.summaryButtonGradient}
                  >
                    <MaterialCommunityIcons name="file-document" size={16} color="white" />
                    <Text style={styles.summaryButtonText}>Generate Report</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.summaryButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradient.gold}
                    style={styles.summaryButtonGradient}
                  >
                    <MaterialCommunityIcons name="share" size={16} color="white" />
                    <Text style={styles.summaryButtonText}>Share Summary</Text>
                  </LinearGradient>
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle1: {
    top: '25%',
    left: '20%',
  },
  particle2: {
    top: '55%',
    right: '25%',
  },
  particle3: {
    top: '35%',
    left: '75%',
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    minHeight: 160,
    position: 'relative',
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
  percentageContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  percentageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  trendCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trendChip: {
    backgroundColor: colors.secondary + '15',
    height: 28,
  },
  trendChipText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
  trendContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    height: 160,
  },
  monthContainer: {
    alignItems: 'center',
    flex: 1,
  },
  monthLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  barContainer: {
    height: 100,
    width: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderRadius: 10,
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  revenueBar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 8,
  },
  targetLine: {
    position: 'absolute',
    left: -4,
    right: -4,
    height: 2,
    backgroundColor: colors.error,
    borderRadius: 1,
  },
  monthStats: {
    alignItems: 'center',
    gap: 2,
  },
  revenueAmount: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '700',
  },
  targetAmount: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  caseCount: {
    fontSize: 8,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  categoryCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  categoryContent: {
    padding: 24,
    gap: 20,
  },
  categoryItem: {
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryStats: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  categoryProgress: {
    marginTop: 4,
  },
  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  clientsCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  clientsContent: {
    padding: 24,
    gap: 16,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  clientRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  clientStats: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  clientMetrics: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  clientRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  clientGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  clientStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  paymentInsights: {
    gap: 16,
  },
  insightCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightDetails: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  insightChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightChangeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  summaryBackground: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    marginHorizontal: 20,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryButton: {
    flex: 1,
  },
  summaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  summaryButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 40,
  },
});