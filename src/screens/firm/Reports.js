// Path: src/screens/firm/Reports.js

import React, { useState, useEffect } from 'react';
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
  Chip,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#0F0F23',
  secondary: '#D4AF37',
  tertiary: '#8B5CF6',
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
    gold: ['#D4AF37', '#FFD700'],
    success: ['#10B981', '#34D399'],
    info: ['#3B82F6', '#60A5FA'],
  }
};

export default function Reports() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportTypes = [
    { key: 'overview', label: 'Overview', icon: 'chart-line' },
    { key: 'revenue', label: 'Revenue', icon: 'currency-inr' },
    { key: 'cases', label: 'Cases', icon: 'briefcase' },
    { key: 'lawyers', label: 'Lawyers', icon: 'account-tie' },
    { key: 'clients', label: 'Clients', icon: 'account-group' },
    { key: 'practice', label: 'Practice Areas', icon: 'domain' },
  ];

  const timePeriods = ['1month', '3months', '6months', '1year', 'custom'];

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [45, 52, 38, 68, 75, 85],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
    }]
  };

  const practiceAreaData = [
    { name: 'Corporate', population: 45, color: '#0F0F23', legendFontColor: colors.text, legendFontSize: 12 },
    { name: 'Criminal', population: 25, color: '#DC2626', legendFontColor: colors.text, legendFontSize: 12 },
    { name: 'Family', population: 20, color: '#10B981', legendFontColor: colors.text, legendFontSize: 12 },
    { name: 'Property', population: 10, color: '#3B82F6', legendFontColor: colors.text, legendFontSize: 12 },
  ];

  const caseStatusData = {
    labels: ['Active', 'Completed', 'On Hold', 'Critical'],
    datasets: [{
      data: [45, 78, 12, 8]
    }]
  };

  const ReportCard = ({ title, subtitle, value, trend, icon, gradient, onPress }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Surface style={styles.reportCard}>
        <LinearGradient
          colors={gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={icon} size={28} color="white" />
            </View>
            {trend && (
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons 
                  name={trend > 0 ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={trend > 0 ? "#06FFA5" : "#EF4444"} 
                />
                <Text style={[styles.trendText, { color: trend > 0 ? "#06FFA5" : "#EF4444" }]}>
                  {Math.abs(trend)}%
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.cardValue}>{value}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </Surface>
    </TouchableOpacity>
  );

  const QuickReports = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Reports</Text>
      <View style={styles.reportCardsGrid}>
        <ReportCard
          title="Total Revenue"
          subtitle="Last 6 months"
          value="₹12.5Cr"
          trend={15.5}
          icon="currency-inr"
          gradient={colors.gradient.gold}
          onPress={() => generateReport('revenue')}
        />
        
        <ReportCard
          title="Active Cases"
          subtitle="Currently ongoing"
          value="68"
          trend={8.2}
          icon="briefcase"
          gradient={colors.gradient.primary}
          onPress={() => generateReport('cases')}
        />
        
        <ReportCard
          title="Success Rate"
          subtitle="Overall performance"
          value="91%"
          trend={3.1}
          icon="trophy"
          gradient={colors.gradient.success}
          onPress={() => generateReport('performance')}
        />
        
        <ReportCard
          title="Client Satisfaction"
          subtitle="Average rating"
          value="4.7"
          trend={2.5}
          icon="star"
          gradient={colors.gradient.info}
          onPress={() => generateReport('satisfaction')}
        />
      </View>
    </View>
  );

  const RevenueChart = () => (
    <Surface style={styles.chartCard}>
      <Text style={styles.chartTitle}>Revenue Trend (₹Cr)</Text>
      <LineChart
        data={revenueData}
        width={width - 48}
        height={220}
        yAxisLabel="₹"
        yAxisSuffix="Cr"
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => colors.secondary,
          labelColor: (opacity = 1) => colors.text,
          style: { borderRadius: 16 },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.secondary
          }
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </Surface>
  );

  const PracticeAreaChart = () => (
    <Surface style={styles.chartCard}>
      <Text style={styles.chartTitle}>Cases by Practice Area</Text>
      <View style={styles.pieChartContainer}>
        <PieChart
          data={practiceAreaData}
          width={width - 48}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    </Surface>
  );

  const CaseStatusChart = () => (
    <Surface style={styles.chartCard}>
      <Text style={styles.chartTitle}>Case Status Distribution</Text>
      <BarChart
        data={caseStatusData}
        width={width - 48}
        height={220}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          labelColor: (opacity = 1) => colors.text,
          style: { borderRadius: 16 },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </Surface>
  );

  const ReportActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Generate Reports</Text>
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          icon="file-pdf-box"
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => generatePDFReport()}
        >
          PDF Report
        </Button>
        
        <Button
          mode="contained"
          icon="microsoft-excel"
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => generateExcelReport()}
        >
          Excel Report
        </Button>
        
        <Button
          mode="contained"
          icon="email"
          style={[styles.actionButton, { backgroundColor: colors.info }]}
          onPress={() => emailReport()}
        >
          Email Report
        </Button>
        
        <Button
          mode="contained"
          icon="calendar"
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={() => scheduleReport()}
        >
          Schedule Report
        </Button>
      </View>
    </View>
  );

  const generateReport = (type) => {
    console.log('Generating report:', type);
    // Implementation for generating specific reports
  };

  const generatePDFReport = () => {
    console.log('Generating PDF report');
    // Implementation for PDF generation
  };

  const generateExcelReport = () => {
    console.log('Generating Excel report');
    // Implementation for Excel generation
  };

  const emailReport = () => {
    console.log('Emailing report');
    // Implementation for email functionality
  };

  const scheduleReport = () => {
    console.log('Scheduling report');
    // Implementation for scheduling reports
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh data logic
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
          
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="download" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timePeriods.map((period) => (
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
                  {period.replace('months', 'M').replace('month', 'M').replace('year', 'Y')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        <QuickReports />
        
        <RevenueChart />
        
        <View style={styles.chartsRow}>
          <PracticeAreaChart />
          <CaseStatusChart />
        </View>
        
        <ReportActions />
        
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
    
  },
  periodChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  reportCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  reportCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: 'rgba(15, 15, 35, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardGradient: {
    padding: 16,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: 'rgba(15, 15, 35, 0.12)',
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
  pieChartContainer: {
    alignItems: 'center',
  },
  chartsRow: {
    gap: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 64) / 2,
  },
  bottomSpacing: {
    height: 40,
  },
});