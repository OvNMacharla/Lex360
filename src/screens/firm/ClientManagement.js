// Path: src/screens/firm/ClientManagement.js

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { 
  Card, 
  Text,
  Surface,
  Avatar,
  Chip,
  FAB,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
    crimson: ['#DC2626', '#EF4444', '#F87171'],
  }
};

export default function ClientManagement() {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const mockClients = [
    {
      id: '1',
      name: 'TechCorp Solutions Pvt Ltd',
      email: 'legal@techcorp.com',
      phone: '+91 98765 43210',
      type: 'corporate',
      status: 'active',
      avatar: 'TC',
      totalCases: 12,
      activeCases: 3,
      totalValue: 5500000,
      joinDate: '2023-01-15',
      lastActivity: '2024-08-17T10:30:00Z',
      assignedLawyer: 'Adv. Priya Sharma',
      industry: 'Technology',
      location: 'Hyderabad',
      satisfaction: 4.8,
      paymentStatus: 'current'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@gmail.com',
      phone: '+91 87654 32109',
      type: 'individual',
      status: 'active',
      avatar: 'RK',
      totalCases: 2,
      activeCases: 1,
      totalValue: 250000,
      joinDate: '2024-03-20',
      lastActivity: '2024-08-16T14:15:00Z',
      assignedLawyer: 'Adv. Sneha Patel',
      caseType: 'Family Law',
      location: 'Mumbai',
      satisfaction: 4.5,
      paymentStatus: 'current'
    },
    {
      id: '3',
      name: 'Global Industries Ltd',
      email: 'contracts@globalind.com',
      phone: '+91 76543 21098',
      type: 'corporate',
      status: 'active',
      avatar: 'GI',
      totalCases: 8,
      activeCases: 2,
      totalValue: 3200000,
      joinDate: '2022-09-10',
      lastActivity: '2024-08-15T09:45:00Z',
      assignedLawyer: 'Adv. Rahul Mehta',
      industry: 'Manufacturing',
      location: 'Delhi',
      satisfaction: 4.7,
      paymentStatus: 'overdue'
    },
    {
      id: '4',
      name: 'Priya Patel',
      email: 'priya.patel@outlook.com',
      phone: '+91 65432 10987',
      type: 'individual',
      status: 'inactive',
      avatar: 'PP',
      totalCases: 1,
      activeCases: 0,
      totalValue: 150000,
      joinDate: '2024-01-05',
      lastActivity: '2024-07-20T16:20:00Z',
      assignedLawyer: 'Adv. Arjun Singh',
      caseType: 'Property Law',
      location: 'Bangalore',
      satisfaction: 4.2,
      paymentStatus: 'paid'
    },
    {
      id: '5',
      name: 'StartupVentures Pvt Ltd',
      email: 'legal@startupventures.in',
      phone: '+91 54321 09876',
      type: 'corporate',
      status: 'pending',
      avatar: 'SV',
      totalCases: 0,
      activeCases: 0,
      totalValue: 0,
      joinDate: '2024-08-10',
      lastActivity: '2024-08-10T12:30:00Z',
      assignedLawyer: 'Adv. Kavya Reddy',
      industry: 'Startup',
      location: 'Pune',
      satisfaction: 0,
      paymentStatus: 'pending'
    }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClients(mockClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.assignedLawyer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || client.status === filterBy || client.type === filterBy;
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          return b.totalValue - a.totalValue;
        case 'cases':
          return b.totalCases - a.totalCases;
        case 'recent':
        default:
          return new Date(b.lastActivity) - new Date(a.lastActivity);
      }
    });
  }, [clients, searchQuery, filterBy, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.textTertiary;
      case 'pending': return colors.warning;
      default: return colors.textTertiary;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current': return colors.success;
      case 'overdue': return colors.error;
      case 'pending': return colors.warning;
      case 'paid': return colors.info;
      default: return colors.textTertiary;
    }
  };

  const ClientCard = ({ client }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToClientDetails(client)}>
      <Surface style={styles.clientCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 249, 254, 0.8)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.clientInfo}>
              <Avatar.Text 
                size={48} 
                label={client.avatar} 
                style={[styles.avatar, { backgroundColor: client.type === 'corporate' ? colors.primary : colors.tertiary }]}
                labelStyle={{ color: 'white', fontWeight: '700' }}
              />
              
              <View style={styles.clientDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <MaterialCommunityIcons 
                    name={client.type === 'corporate' ? 'domain' : 'account'} 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                </View>
                
                <Text style={styles.assignedLawyer}>{client.assignedLawyer}</Text>
                
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker" size={12} color={colors.textSecondary} />
                  <Text style={styles.location}>{client.location}</Text>
                  {client.type === 'corporate' && (
                    <>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.industry}>{client.industry}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.statusSection}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                  {client.status.toUpperCase()}
                </Text>
              </View>
              
              <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(client.paymentStatus) + '20' }]}>
                <Text style={[styles.paymentText, { color: getPaymentStatusColor(client.paymentStatus) }]}>
                  {client.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{client.totalCases}</Text>
                <Text style={styles.metricLabel}>Total Cases</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{client.activeCases}</Text>
                <Text style={styles.metricLabel}>Active Cases</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>₹{(client.totalValue / 100000).toFixed(1)}L</Text>
                <Text style={styles.metricLabel}>Total Value</Text>
              </View>

              {client.satisfaction > 0 && (
                <View style={styles.metricItem}>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                    <Text style={styles.metricValue}>{client.satisfaction}</Text>
                  </View>
                  <Text style={styles.metricLabel}>Rating</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="phone" size={16} color={colors.info} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="email" size={16} color={colors.success} />
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="briefcase-plus" size={16} color={colors.secondary} />
              <Text style={styles.actionText}>New Case</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moreButton}>
              <MaterialCommunityIcons name="dots-horizontal" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Surface>
    </TouchableOpacity>
  );

  const navigateToClientDetails = (client) => {
    navigation.navigate('ClientDetails', { client });
  };

  const FilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'active', 'inactive', 'pending', 'corporate', 'individual'].map((filter) => (
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
          <Text style={styles.loadingText}>Loading clients...</Text>
        </LinearGradient>
      </View>
    );
  }

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);
  const avgSatisfaction = clients.filter(c => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) / clients.filter(c => c.satisfaction > 0).length;

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
          
          <Text style={styles.headerTitle}>Client Management</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="account-plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeClients}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{(totalValue / 10000000).toFixed(1)}Cr</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgSatisfaction.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
        
        <FilterChips />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredAndSortedClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
        
        {filteredAndSortedClients.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No clients found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Add clients to get started'}
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate('AddClient')}
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
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  clientCard: {
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
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
    elevation: 4,
  },
  clientDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  assignedLawyer: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  industry: {
    fontSize: 12,
    color: colors.textSecondary,
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
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricsContainer: {
    backgroundColor: 'rgba(248, 249, 254, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
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