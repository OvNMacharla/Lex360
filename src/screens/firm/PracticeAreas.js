// Path: src/screens/firm/PracticeAreas.js

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { 
  Text,
  Surface,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#0F0F23',
  secondary: '#D4AF37',
  tertiary: '#8B5CF6',
  accent: '#06FFA5',
  background: '#FAFBFF',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  cardShadow: 'rgba(15, 15, 35, 0.12)',
  gradient: {
    primary: ['#0F0F23', '#1A1A3A'],
    gold: ['#D4AF37', '#FFD700'],
    purple: ['#8B5CF6', '#A855F7'],
    success: ['#10B981', '#34D399'],
    info: ['#3B82F6', '#60A5FA'],
    crimson: ['#DC2626', '#EF4444'],
    emerald: ['#059669', '#10B981'],
    indigo: ['#4F46E5', '#6366F1']
  }
};

export default function PracticeAreas() {
  const navigation = useNavigation();
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const mockPracticeAreas = [
    {
      id: '1',
      name: 'Corporate Law',
      description: 'Business formations, mergers, acquisitions, and corporate governance',
      icon: 'domain',
      gradient: colors.gradient.primary,
      activeCases: 25,
      totalCases: 78,
      revenue: 8500000,
      successRate: 94,
      avgCaseValue: 450000,
      lawyers: ['Adv. Priya Sharma', 'Adv. Arjun Singh'],
      clientTypes: ['Corporate', 'Startups', 'SMEs'],
      growthRate: 15.5,
      utilization: 85
    },
    {
      id: '2',
      name: 'Criminal Law',
      description: 'Criminal defense, white-collar crime, and bail proceedings',
      icon: 'gavel',
      gradient: colors.gradient.crimson,
      activeCases: 18,
      totalCases: 65,
      revenue: 3200000,
      successRate: 89,
      avgCaseValue: 180000,
      lawyers: ['Adv. Rahul Mehta'],
      clientTypes: ['Individual', 'Corporate'],
      growthRate: 8.2,
      utilization: 75
    },
    {
      id: '3',
      name: 'Family Law',
      description: 'Divorce, child custody, matrimonial disputes, and adoption',
      icon: 'home-heart',
      gradient: colors.gradient.success,
      activeCases: 22,
      totalCases: 89,
      revenue: 2800000,
      successRate: 88,
      avgCaseValue: 125000,
      lawyers: ['Adv. Sneha Patel'],
      clientTypes: ['Individual'],
      growthRate: 12.1,
      utilization: 80
    },
    {
      id: '4',
      name: 'Property Law',
      description: 'Real estate transactions, property disputes, and land acquisition',
      icon: 'home-city',
      gradient: colors.gradient.info,
      activeCases: 15,
      totalCases: 45,
      revenue: 4200000,
      successRate: 91,
      avgCaseValue: 350000,
      lawyers: ['Adv. Arjun Singh'],
      clientTypes: ['Individual', 'Corporate', 'Developers'],
      growthRate: 18.7,
      utilization: 70
    },
    {
      id: '5',
      name: 'Intellectual Property',
      description: 'Patent filing, trademark registration, and IP litigation',
      icon: 'lightbulb',
      gradient: colors.gradient.purple,
      activeCases: 12,
      totalCases: 28,
      revenue: 2100000,
      successRate: 85,
      avgCaseValue: 175000,
      lawyers: ['Adv. Kavya Reddy'],
      clientTypes: ['Startups', 'Tech Companies', 'Individual Inventors'],
      growthRate: 22.3,
      utilization: 65
    },
    {
      id: '6',
      name: 'Tax Law',
      description: 'Tax planning, compliance, and dispute resolution',
      icon: 'calculator',
      gradient: colors.gradient.gold,
      activeCases: 8,
      totalCases: 24,
      revenue: 1800000,
      successRate: 92,
      avgCaseValue: 225000,
      lawyers: ['Adv. Priya Sharma'],
      clientTypes: ['Corporate', 'HNIs', 'SMEs'],
      growthRate: 6.5,
      utilization: 60
    }
  ];

  useEffect(() => {
    fetchPracticeAreas();
  }, []);

  const fetchPracticeAreas = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPracticeAreas(mockPracticeAreas);
    } catch (error) {
      console.error('Error fetching practice areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPracticeAreas();
    setRefreshing(false);
  };

  const totalRevenue = practiceAreas.reduce((sum, area) => sum + area.revenue, 0);
  const totalCases = practiceAreas.reduce((sum, area) => sum + area.activeCases, 0);
  const avgSuccessRate = practiceAreas.reduce((sum, area) => sum + area.successRate, 0) / practiceAreas.length;

  const chartData = practiceAreas.map((area, index) => ({
    name: area.name.split(' ')[0],
    population: area.revenue,
    color: area.gradient[0],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const PracticeAreaCard = ({ area }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToPracticeAreaDetails(area)}>
      <Surface style={styles.practiceAreaCard}>
        <LinearGradient
          colors={area.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={area.icon} 
                size={32} 
                color="white" 
              />
            </View>
            
            <View style={styles.growthIndicator}>
              <MaterialCommunityIcons 
                name="trending-up" 
                size={16} 
                color={colors.accent} 
              />
              <Text style={styles.growthText}>+{area.growthRate}%</Text>
            </View>
          </View>

          <Text style={styles.areaTitle}>{area.name}</Text>
          <Text style={styles.areaDescription}>{area.description}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{area.activeCases}</Text>
              <Text style={styles.metricLabel}>Active Cases</Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{area.successRate}%</Text>
              <Text style={styles.metricLabel}>Success Rate</Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricValue}>₹{(area.revenue / 1000000).toFixed(1)}M</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>
          </View>

          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationLabel}>Team Utilization</Text>
              <Text style={styles.utilizationValue}>{area.utilization}%</Text>
            </View>
            <ProgressBar 
              progress={area.utilization / 100} 
              color="rgba(255, 255, 255, 0.9)"
              style={styles.utilizationBar}
            />
          </View>
        </LinearGradient>

        <View style={styles.cardFooter}>
          <View style={styles.lawyersSection}>
            <Text style={styles.lawyersLabel}>Assigned Lawyers</Text>
            <Text style={styles.lawyersText}>
              {area.lawyers.join(', ')}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.detailsButton}>
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const navigateToPracticeAreaDetails = (area) => {
    navigation.navigate('PracticeAreaDetails', { area });
  };

  const PerformanceChart = () => {
    const barData = {
      labels: practiceAreas.slice(0, 4).map(area => area.name.split(' ')[0]),
      datasets: [{
        data: practiceAreas.slice(0, 4).map(area => area.revenue / 1000000)
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue by Practice Area (₹M)</Text>
        <BarChart
          data={barData}
          width={width - 48}
          height={200}
          yAxisLabel="₹"
          yAxisSuffix="M"
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.text,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: colors.primary
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
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
          <Text style={styles.loadingText}>Loading practice areas...</Text>
        </LinearGradient>
      </View>
    );
  }

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
          
          <Text style={styles.headerTitle}>Practice Areas</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="chart-box" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{practiceAreas.length}</Text>
            <Text style={styles.summaryLabel}>Total Areas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalCases}</Text>
            <Text style={styles.summaryLabel}>Active Cases</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>₹{(totalRevenue / 10000000).toFixed(1)}Cr</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgSuccessRate.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Avg Success</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <PerformanceChart />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Practice Areas Overview</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {practiceAreas.map((area) => (
          <PracticeAreaCard key={area.id} area={area} />
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate('AddPracticeArea')}
      />
    </View>
  );
}

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
  header: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  practiceAreaCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  areaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  areaDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },
  utilizationContainer: {
    marginBottom: 8,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  utilizationValue: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  utilizationBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
  },
  lawyersSection: {
    flex: 1,
  },
  lawyersLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  lawyersText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  detailsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    elevation: 8,
  },
});