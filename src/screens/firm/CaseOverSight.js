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
  Searchbar,
  Chip,
  Avatar,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#0F0F23',
  secondary: '#D4AF37',
  tertiary: '#8B5CF6',
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
    success: ['#10B981', '#34D399'],
    info: ['#3B82F6', '#60A5FA'],
    crimson: ['#DC2626', '#EF4444'],
  }
};

export default function CaseOversight() {
  const navigation = useNavigation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedView, setSelectedView] = useState('list'); // list, kanban

  const mockCases = [
    {
      id: '1',
      title: 'TechCorp Merger Agreement',
      client: 'TechCorp Solutions',
      lawyer: 'Adv. Priya Sharma',
      practiceArea: 'Corporate Law',
      status: 'active',
      priority: 'high',
      progress: 75,
      value: 5500000,
      startDate: '2024-06-01',
      expectedEndDate: '2024-09-15',
      lastUpdate: '2024-08-17T10:30:00Z',
      tasks: 12,
      completedTasks: 9,
      milestones: ['Due Diligence', 'Contract Review', 'Regulatory Approval'],
      nextHearing: '2024-08-25',
      riskLevel: 'medium',
      billableHours: 240,
      team: ['Priya Sharma', 'Junior Associate']
    },
    {
      id: '2',
      title: 'Kumar Family Divorce Case',
      client: 'Rajesh Kumar',
      lawyer: 'Adv. Sneha Patel',
      practiceArea: 'Family Law',
      status: 'active',
      priority: 'medium',
      progress: 45,
      value: 250000,
      startDate: '2024-03-20',
      expectedEndDate: '2024-10-30',
      lastUpdate: '2024-08-16T14:15:00Z',
      tasks: 8,
      completedTasks: 4,
      milestones: ['Mediation', 'Asset Division', 'Final Hearing'],
      nextHearing: '2024-09-05',
      riskLevel: 'low',
      billableHours: 85,
      team: ['Sneha Patel']
    },
    {
      id: '3',
      title: 'Global Industries Contract Dispute',
      client: 'Global Industries Ltd',
      lawyer: 'Adv. Rahul Mehta',
      practiceArea: 'Commercial Law',
      status: 'critical',
      priority: 'high',
      progress: 20,
      value: 3200000,
      startDate: '2024-07-15',
      expectedEndDate: '2024-12-20',
      lastUpdate: '2024-08-15T09:45:00Z',
      tasks: 15,
      completedTasks: 3,
      milestones: ['Evidence Collection', 'Expert Testimony', 'Settlement Negotiation'],
      nextHearing: '2024-08-22',
      riskLevel: 'high',
      billableHours: 45,
      team: ['Rahul Mehta', 'Senior Associate', 'Paralegal']
    },
    {
      id: '4',
      title: 'Property Acquisition - Bangalore',
      client: 'Priya Patel',
      lawyer: 'Adv. Arjun Singh',
      practiceArea: 'Property Law',
      status: 'completed',
      priority: 'low',
      progress: 100,
      value: 150000,
      startDate: '2024-01-05',
      expectedEndDate: '2024-07-20',
      lastUpdate: '2024-07-20T16:20:00Z',
      tasks: 6,
      completedTasks: 6,
      milestones: ['Title Verification', 'Documentation', 'Registration'],
      nextHearing: null,
      riskLevel: 'low',
      billableHours: 28,
      team: ['Arjun Singh']
    },
    {
      id: '5',
      title: 'Startup IP Registration',
      client: 'StartupVentures Pvt Ltd',
      lawyer: 'Adv. Kavya Reddy',
      practiceArea: 'Intellectual Property',
      status: 'on-hold',
      priority: 'medium',
      progress: 60,
      value: 180000,
      startDate: '2024-08-10',
      expectedEndDate: '2024-11-15',
      lastUpdate: '2024-08-10T12:30:00Z',
      tasks: 10,
      completedTasks: 6,
      milestones: ['Patent Search', 'Application Filing', 'Examination Response'],
      nextHearing: null,
      riskLevel: 'medium',
      billableHours: 35,
      team: ['Kavya Reddy', 'IP Specialist']
    }
  ];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCases(mockCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  };

  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      const matchesSearch = caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           caseItem.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           caseItem.lawyer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           caseItem.status === filterBy || 
                           caseItem.priority === filterBy ||
                           caseItem.practiceArea.toLowerCase().includes(filterBy.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });
  }, [cases, searchQuery, filterBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'critical': return colors.error;
      case 'on-hold': return colors.warning;
      case 'completed': return colors.info;
      default: return colors.textTertiary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textTertiary;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textTertiary;
    }
  };

  const CaseCard = ({ caseItem }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToCaseDetails(caseItem)}>
      <Surface style={styles.caseCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.caseTitle}>{caseItem.title}</Text>
            <Text style={styles.practiceArea}>{caseItem.practiceArea}</Text>
          </View>
          
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseItem.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}>
                {caseItem.status.toUpperCase()}
              </Text>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(caseItem.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(caseItem.priority) }]}>
                {caseItem.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.clientLawyerRow}>
          <View style={styles.clientInfo}>
            <MaterialCommunityIcons name="account" size={16} color={colors.textSecondary} />
            <Text style={styles.clientText}>{caseItem.client}</Text>
          </View>
          
          <View style={styles.lawyerInfo}>
            <MaterialCommunityIcons name="account-tie" size={16} color={colors.textSecondary} />
            <Text style={styles.lawyerText}>{caseItem.lawyer}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Case Progress</Text>
            <Text style={styles.progressValue}>{caseItem.progress}%</Text>
          </View>
          <ProgressBar 
            progress={caseItem.progress / 100} 
            color={getStatusColor(caseItem.status)}
            style={styles.progressBar}
          />
          
          <View style={styles.tasksSummary}>
            <Text style={styles.tasksText}>
              {caseItem.completedTasks}/{caseItem.tasks} tasks completed
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="currency-inr" size={16} color={colors.secondary} />
            <Text style={styles.metricValue}>₹{(caseItem.value / 100000).toFixed(1)}L</Text>
          </View>
          
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.info} />
            <Text style={styles.metricValue}>{caseItem.billableHours}h</Text>
          </View>
          
          <View style={styles.metricItem}>
            <MaterialCommunityIcons name="shield-alert" size={16} color={getRiskColor(caseItem.riskLevel)} />
            <Text style={[styles.metricValue, { color: getRiskColor(caseItem.riskLevel) }]}>
              {caseItem.riskLevel.toUpperCase()}
            </Text>
          </View>
          
          {caseItem.nextHearing && (
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="gavel" size={16} color={colors.warning} />
              <Text style={styles.metricValue}>
                {new Date(caseItem.nextHearing).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.teamSection}>
          <Text style={styles.teamLabel}>Team:</Text>
          <View style={styles.teamMembers}>
            {caseItem.team.map((member, index) => (
              <Chip key={index} style={styles.teamChip} textStyle={styles.teamChipText}>
                {member}
              </Chip>
            ))}
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const navigateToCaseDetails = (caseItem) => {
    navigation.navigate('CaseDetails', { case: caseItem });
  };

  const FilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'active', 'critical', 'on-hold', 'completed', 'high', 'medium', 'low'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              filterBy === filter && styles.filterChipActive
            ]}
            onPress={() => setFilterBy(filter)}
          >
            <Text style={[
              styles.filterChipText,
              filterBy === filter && styles.filterChipTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading cases...</Text>
        </LinearGradient>
      </View>
    );
  }

  const activeCases = cases.filter(c => c.status === 'active').length;
  const criticalCases = cases.filter(c => c.status === 'critical').length;
  const totalValue = cases.reduce((sum, c) => sum + c.value, 0);
  const avgProgress = cases.reduce((sum, c) => sum + c.progress, 0) / cases.length;

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
          
          <Text style={styles.headerTitle}>Case Oversight</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="filter-variant" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{cases.length}</Text>
            <Text style={styles.summaryLabel}>Total Cases</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{activeCases}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{criticalCases}</Text>
            <Text style={styles.summaryLabel}>Critical</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgProgress.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Avg Progress</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.controlsSection}>
        <Searchbar
          placeholder="Search cases..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
        
        <FilterChips />

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, selectedView === 'list' && styles.viewButtonActive]}
            onPress={() => setSelectedView('list')}
          >
            <MaterialCommunityIcons 
              name="view-list" 
              size={20} 
              color={selectedView === 'list' ? 'white' : colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewButton, selectedView === 'kanban' && styles.viewButtonActive]}
            onPress={() => setSelectedView('kanban')}
          >
            <MaterialCommunityIcons 
              name="view-column" 
              size={20} 
              color={selectedView === 'kanban' ? 'white' : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredCases.map((caseItem) => (
          <CaseCard key={caseItem.id} caseItem={caseItem} />
        ))}
        
        {filteredCases.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-search" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No cases found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No cases match the selected filters'}
            </Text>
          </View>
        )}
        
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
  controlsSection: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  searchBar: {
    elevation: 2,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 4,
    alignSelf: 'flex-end',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewButtonActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  caseCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  practiceArea: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  clientLawyerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  lawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lawyerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  tasksSummary: {
    marginTop: 6,
  },
  tasksText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  teamSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
    paddingTop: 16,
  },
  teamLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  teamMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  teamChip: {
    backgroundColor: colors.primary + '10',
    height: 28,
  },
  teamChipText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});