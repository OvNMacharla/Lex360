// Path: src/screens/firm/UtilizationRate.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { 
  Text,
  Surface,
  ProgressBar,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

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
    success: ['#10B981', '#34D399'],
    warning: ['#F59E0B', '#FCD34D'],
    error: ['#EF4444', '#F87171'],
  }
};

export default function UtilizationRate() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const utilizationData = [
    {
      id: '1',
      lawyer: 'Adv. Priya Sharma',
      specialization: 'Corporate Law',
      utilization: 85,
      billableHours: 168,
      targetHours: 198,
      activeCases: 12,
      trend: 5,
      efficiency: 'High',
      status: 'optimal'
    },
    {
      id: '2',
      lawyer: 'Adv. Rahul Mehta',
      specialization: 'Criminal Law',
      utilization: 75,
      billableHours: 140,
      targetHours: 187,
      activeCases: 8,
      trend: -2,
      efficiency: 'Good',
      status: 'good'
    },
    {
      id: '3',
      lawyer: 'Adv. Sneha Patel',
      specialization: 'Family Law',
      utilization: 92,
      billableHours: 184,
      targetHours: 200,
      activeCases: 15,
      trend: 8,
      efficiency: 'Excellent',
      status: 'overutilized'
    },
    {
      id: '4',
      lawyer: 'Adv. Arjun Singh',
      specialization: 'Property Law',
      utilization: 45,
      billableHours: 90,
      targetHours: 200,
      activeCases: 3,
      trend: -15,
      efficiency: 'Below Average',
      status: 'underutilized'
    },
    {
      id: '5',
      lawyer: 'Adv. Kavya Reddy',
      specialization: 'IP Law',
      utilization: 68,
      billableHours: 136,
      targetHours: 200,
      activeCases: 6,
      trend: 12,
      efficiency: 'Good',
      status: 'good'
    }
  ];

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return colors.error;
    if (utilization >= 75) return colors.success;
    if (utilization >= 60) return colors.warning;
    return colors.error;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return colors.success;
      case 'good': return colors.info;
      case 'overutilized': return colors.error;
      case 'underutilized': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const UtilizationCard = ({ data }) => (
    <Surface style={styles.utilizationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.lawyerInfo}>
          <Avatar.Text 
            size={48} 
            label={data.lawyer.split(' ')[1]?.charAt(0) || 'L'} 
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            labelStyle={{ color: 'white', fontWeight: '700' }}
          />
          <View style={styles.lawyerDetails}>
            <Text style={styles.lawyerName}>{data.lawyer}</Text>
            <Text style={styles.specialization}>{data.specialization}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(data.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
                {data.efficiency}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.trendContainer}>
          <MaterialCommunityIcons 
            name={data.trend > 0 ? "trending-up" : "trending-down"} 
            size={16} 
            color={data.trend > 0 ? colors.success : colors.error} 
          />
          <Text style={[styles.trendText, { color: data.trend > 0 ? colors.success : colors.error }]}>
            {data.trend > 0 ? '+' : ''}{data.trend}%
          </Text>
        </View>
      </View>

      <View style={styles.utilizationSection}>
        <View style={styles.utilizationHeader}>
          <Text style={styles.utilizationLabel}>Utilization Rate</Text>
          <Text style={styles.utilizationValue}>{data.utilization}%</Text>
        </View>
        
        <ProgressBar 
          progress={data.utilization / 100} 
          color={getUtilizationColor(data.utilization)}
          style={styles.utilizationBar}
        />

        <View style={styles.hoursInfo}>
          <Text style={styles.hoursText}>
            {data.billableHours}h / {data.targetHours}h target
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <MaterialCommunityIcons name="briefcase" size={20} color={colors.info} />
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{data.activeCases}</Text>
            <Text style={styles.metricLabel}>Active Cases</Text>
          </View>
        </View>

        <View style={styles.metric}>
          <MaterialCommunityIcons name="clock" size={20} color={colors.warning} />
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{data.billableHours}h</Text>
            <Text style={styles.metricLabel}>Billable Hours</Text>
          </View>
        </View>

        <View style={styles.metric}>
          <MaterialCommunityIcons name="target" size={20} color={colors.secondary} />
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{Math.round((data.billableHours / data.targetHours) * 100)}%</Text>
            <Text style={styles.metricLabel}>Target Met</Text>
          </View>
        </View>
      </View>
    </Surface>
  );

  const OverallStats = () => {
    const avgUtilization = utilizationData.reduce((sum, item) => sum + item.utilization, 0) / utilizationData.length;
    const totalBillableHours = utilizationData.reduce((sum, item) => sum + item.billableHours, 0);
    const optimalCount = utilizationData.filter(item => item.status === 'optimal' || item.status === 'good').length;
    
    return (
      <Surface style={styles.statsCard}>
        <Text style={styles.statsTitle}>Overall Utilization</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.statIconContainer}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statValue}>{avgUtilization.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Average Rate</Text>
          </View>

          <View style={styles.statItem}>
            <LinearGradient
              colors={colors.gradient.success}
              style={styles.statIconContainer}
            >
              <MaterialCommunityIcons name="clock" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statValue}>{totalBillableHours}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>

          <View style={styles.statItem}>
            <LinearGradient
              colors={colors.gradient.warning}
              style={styles.statIconContainer}
            >
              <MaterialCommunityIcons name="account-check" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statValue}>{optimalCount}/{utilizationData.length}</Text>
            <Text style={styles.statLabel}>Optimal Range</Text>
          </View>
        </View>
      </Surface>
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
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
          
          <Text style={styles.headerTitle}>Utilization Rate</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="export" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.periodChipActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
        <OverallStats />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Performance</Text>
          {utilizationData.map((data) => (
            <UtilizationCard key={data.id} data={data} />
          ))}
        </View>

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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  periodChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: 'rgba(15, 15, 35, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  utilizationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: 'rgba(15, 15, 35, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  lawyerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
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
  specialization: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  utilizationSection: {
    marginBottom: 20,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  utilizationValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  utilizationBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    marginBottom: 8,
  },
  hoursInfo: {
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  metricContent: {
    marginLeft: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});