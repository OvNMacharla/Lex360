// Path: src/screens/firm/LawyerManagement.js

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
  Alert,
  RefreshControl,
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
  FAB,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Premium color palette
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

export default function LawyerManagement() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  
  // State management
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, active, pending, on-leave
  const [sortBy, setSortBy] = useState('performance'); // performance, name, cases, revenue
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock lawyer data
  const mockLawyers = [
    {
      id: '1',
      name: 'Adv. Priya Sharma',
      email: 'priya.sharma@lawfirm.com',
      phone: '+91 98765 43210',
      specialization: 'Corporate Law',
      experience: 8,
      status: 'active',
      avatar: 'PS',
      activeCases: 15,
      completedCases: 45,
      successRate: 92,
      totalRevenue: 2500000,
      monthlyRevenue: 450000,
      utilization: 85,
      rating: 4.8,
      joinDate: '2020-03-15',
      lastActive: '2024-08-17T10:30:00Z',
      skills: ['Contract Law', 'Mergers & Acquisitions', 'Corporate Governance'],
      education: 'LLM from NLSIU, Bangalore',
      barCouncilId: 'BCI/2015/12345'
    },
    {
      id: '2',
      name: 'Adv. Rahul Mehta',
      email: 'rahul.mehta@lawfirm.com',
      phone: '+91 87654 32109',
      specialization: 'Criminal Law',
      experience: 12,
      status: 'active',
      avatar: 'RM',
      activeCases: 8,
      completedCases: 78,
      successRate: 89,
      totalRevenue: 1800000,
      monthlyRevenue: 320000,
      utilization: 75,
      rating: 4.7,
      joinDate: '2018-07-20',
      lastActive: '2024-08-17T14:15:00Z',
      skills: ['Criminal Defense', 'White Collar Crime', 'Bail Matters'],
      education: 'LLB from Government Law College, Mumbai',
      barCouncilId: 'BCI/2012/67890'
    },
    {
      id: '3',
      name: 'Adv. Sneha Patel',
      email: 'sneha.patel@lawfirm.com',
      phone: '+91 76543 21098',
      specialization: 'Family Law',
      experience: 6,
      status: 'active',
      avatar: 'SP',
      activeCases: 12,
      completedCases: 32,
      successRate: 88,
      totalRevenue: 1200000,
      monthlyRevenue: 280000,
      utilization: 80,
      rating: 4.6,
      joinDate: '2021-11-10',
      lastActive: '2024-08-17T09:45:00Z',
      skills: ['Divorce Proceedings', 'Child Custody', 'Matrimonial Law'],
      education: 'LLB from Gujarat National Law University',
      barCouncilId: 'BCI/2018/54321'
    },
    {
      id: '4',
      name: 'Adv. Arjun Singh',
      email: 'arjun.singh@lawfirm.com',
      phone: '+91 65432 10987',
      specialization: 'Property Law',
      experience: 10,
      status: 'on-leave',
      avatar: 'AS',
      activeCases: 5,
      completedCases: 55,
      successRate: 91,
      totalRevenue: 2100000,
      monthlyRevenue: 0,
      utilization: 0,
      rating: 4.9,
      joinDate: '2019-01-25',
      lastActive: '2024-08-10T16:20:00Z',
      skills: ['Real Estate', 'Land Acquisition', 'Property Disputes'],
      education: 'LLM from Rajiv Gandhi School of IP Law',
      barCouncilId: 'BCI/2014/98765'
    },
    {
      id: '5',
      name: 'Adv. Kavya Reddy',
      email: 'kavya.reddy@lawfirm.com',
      phone: '+91 54321 09876',
      specialization: 'Intellectual Property',
      experience: 5,
      status: 'pending',
      avatar: 'KR',
      activeCases: 0,
      completedCases: 18,
      successRate: 85,
      totalRevenue: 800000,
      monthlyRevenue: 150000,
      utilization: 45,
      rating: 4.5,
      joinDate: '2023-06-01',
      lastActive: '2024-08-16T12:30:00Z',
      skills: ['Patent Law', 'Trademark Registration', 'Copyright Law'],
      education: 'LLM in IP Law from IIT Kharagpur',
      barCouncilId: 'BCI/2020/13579'
    }
  ];

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLawyers(mockLawyers);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLawyers();
    setRefreshing(false);
  };

  // Filter and sort lawyers
  const filteredAndSortedLawyers = useMemo(() => {
    let filtered = lawyers.filter(lawyer => {
      const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lawyer.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lawyer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || lawyer.status === filterBy;
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cases':
          return b.activeCases - a.activeCases;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'performance':
        default:
          return (b.successRate * b.utilization) - (a.successRate * a.utilization);
      }
    });
  }, [lawyers, searchQuery, filterBy, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'on-leave': return colors.warning;
      case 'pending': return colors.info;
      default: return colors.textTertiary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'on-leave': return 'clock-outline';
      case 'pending': return 'progress-clock';
      default: return 'help-circle';
    }
  };

  const getPerformanceGradient = (rating) => {
    if (rating >= 4.7) return colors.gradient.gold;
    if (rating >= 4.5) return colors.gradient.success;
    if (rating >= 4.0) return colors.gradient.info;
    return colors.gradient.crimson;
  };

  const LawyerCard = ({ lawyer }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToLawyerDetails(lawyer)}>
      <Surface style={styles.lawyerCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 249, 254, 0.8)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarSection}>
              <Avatar.Text 
                size={56} 
                label={lawyer.avatar} 
                style={[styles.avatar, { backgroundColor: colors.primary }]}
                labelStyle={{ color: 'white', fontWeight: '700', fontSize: 20 }}
              />
              
              <View style={styles.statusIndicator}>
                <LinearGradient
                  colors={getPerformanceGradient(lawyer.rating)}
                  style={styles.statusBadge}
                >
                  <MaterialCommunityIcons 
                    name={getStatusIcon(lawyer.status)} 
                    size={12} 
                    color="white" 
                  />
                </LinearGradient>
              </View>
            </View>

            <View style={styles.lawyerInfo}>
              <Text style={styles.lawyerName}>{lawyer.name}</Text>
              <Text style={styles.specialization}>{lawyer.specialization}</Text>
              
              <View style={styles.experienceRow}>
                <MaterialCommunityIcons name="briefcase" size={12} color={colors.textSecondary} />
                <Text style={styles.experienceText}>{lawyer.experience} years experience</Text>
              </View>

              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
                <Text style={styles.ratingText}>{lawyer.rating}</Text>
                <Text style={styles.ratingCount}>({lawyer.completedCases + lawyer.activeCases} cases)</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.menuButton}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{lawyer.activeCases}</Text>
                <Text style={styles.metricLabel}>Active Cases</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{lawyer.successRate}%</Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>₹{(lawyer.monthlyRevenue / 100000).toFixed(1)}L</Text>
                <Text style={styles.metricLabel}>Monthly Revenue</Text>
              </View>
            </View>

            <View style={styles.utilizationSection}>
              <View style={styles.utilizationHeader}>
                <Text style={styles.utilizationLabel}>Utilization Rate</Text>
                <Text style={styles.utilizationValue}>{lawyer.utilization}%</Text>
              </View>
              <ProgressBar 
                progress={lawyer.utilization / 100} 
                color={getUtilizationColor(lawyer.utilization)}
                style={styles.utilizationBar}
              />
            </View>

            <View style={styles.skillsSection}>
              <Text style={styles.skillsLabel}>Key Skills</Text>
              <View style={styles.skillsContainer}>
                {lawyer.skills.slice(0, 2).map((skill, index) => (
                  <Chip 
                    key={index}
                    style={styles.skillChip}
                    textStyle={styles.skillChipText}
                  >
                    {skill}
                  </Chip>
                ))}
                {lawyer.skills.length > 2 && (
                  <Chip style={styles.moreChip} textStyle={styles.moreChipText}>
                    +{lawyer.skills.length - 2} more
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    </TouchableOpacity>
  );

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return colors.success;
    if (utilization >= 60) return colors.warning;
    return colors.error;
  };

  const navigateToLawyerDetails = (lawyer) => {
    navigation.navigate('LawyerDetails', { lawyer });
  };

  const FilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'active', 'pending', 'on-leave'].map((filter) => (
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
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const SortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'performance', label: 'Performance' },
          { key: 'name', label: 'Name' },
          { key: 'cases', label: 'Active Cases' },
          { key: 'revenue', label: 'Revenue' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortChip,
              sortBy === option.key && styles.sortChipActive
            ]}
            onPress={() => setSortBy(option.key)}
          >
            <Text style={[
              styles.sortChipText,
              sortBy === option.key && styles.sortChipTextActive
            ]}>
              {option.label}
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
          <Text style={styles.loadingText}>Loading lawyers...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
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
          
          <Text style={styles.headerTitle}>Lawyer Management</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="account-plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lawyers.length}</Text>
            <Text style={styles.statLabel}>Total Lawyers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lawyers.filter(l => l.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(lawyers.reduce((sum, l) => sum + l.utilization, 0) / lawyers.length)}%
            </Text>
            <Text style={styles.statLabel}>Avg. Utilization</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search lawyers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.textSecondary}
        />
        
        <FilterChips />
        <SortOptions />
      </View>

      {/* Lawyers List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredAndSortedLawyers.map((lawyer) => (
          <LawyerCard key={lawyer.id} lawyer={lawyer} />
        ))}
        
        {filteredAndSortedLawyers.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No lawyers found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Add lawyers to get started'}
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        icon="plus"
        color="white"
        onPress={() => setShowAddModal(true)}
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  searchSection: {
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  sortChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: colors.secondary + '15',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  lawyerCard: {
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
    marginBottom: 20,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  lawyerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  lawyerName: {
    fontSize: 18,
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
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    backgroundColor: 'rgba(248, 249, 254, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  utilizationSection: {
    marginBottom: 16,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  utilizationValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  utilizationBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  skillsSection: {
    
  },
  skillsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: colors.primary + '10',
    height: 28,
  },
  skillChipText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  moreChip: {
    backgroundColor: colors.textTertiary + '20',
    height: 28,
  },
  moreChipText: {
    fontSize: 10,
    color: colors.textTertiary,
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
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    elevation: 8,
  },
});