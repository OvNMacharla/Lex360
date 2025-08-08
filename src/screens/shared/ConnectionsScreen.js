import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  TextInput,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

// Premium color palette
const colors = {
  primary: '#0F0F23',
  linkedin: '#0A66C2',
  background: '#FAFBFF',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gradient: {
    linkedin: ['#0A66C2', '#004182'],
    primary: ['#0F0F23', '#1A1A3A'],
    success: ['#10B981', '#34D399'],
  }
};

export default function ConnectionsScreen() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const connectionRequests = [
    {
      id: 1,
      name: 'Adv. Rajesh Kumar',
      role: 'Criminal Defense Lawyer',
      firm: 'Delhi High Court',
      avatar: 'https://via.placeholder.com/60',
      mutualConnections: 12,
      experience: '15+ years',
      verified: true
    },
    {
      id: 2,
      name: 'Priya Malhotra',
      role: 'Corporate Legal Consultant',
      firm: 'Bangalore Legal Services',
      avatar: 'https://via.placeholder.com/60',
      mutualConnections: 8,
      experience: '10+ years',
      verified: false
    }
  ];

  const suggestions = [
    {
      id: 1,
      name: 'Adv. Vikram Singh',
      role: 'Constitutional Lawyer',
      firm: 'Supreme Court of India',
      avatar: 'https://via.placeholder.com/60',
      mutualConnections: 23,
      experience: '20+ years',
      verified: true,
      specialization: 'Constitutional Law'
    },
    {
      id: 2,
      name: 'Meera Sharma',
      role: 'Intellectual Property Lawyer',
      firm: 'IP Associates',
      avatar: 'https://via.placeholder.com/60',
      mutualConnections: 15,
      experience: '12+ years',
      verified: true,
      specialization: 'IP Law'
    },
    {
      id: 3,
      name: 'Arjun Patel',
      role: 'Family Law Specialist',
      firm: 'Mumbai Family Court',
      avatar: 'https://via.placeholder.com/60',
      mutualConnections: 7,
      experience: '8+ years',
      verified: false,
      specialization: 'Family Law'
    }
  ];

  const myConnections = [
    {
      id: 1,
      name: 'Adv. Sanjay Gupta',
      role: 'Senior Advocate',
      firm: 'Supreme Court',
      avatar: 'https://via.placeholder.com/60',
      lastActive: '2 hours ago',
      verified: true,
      status: 'Available'
    },
    {
      id: 2,
      name: 'Kavya Reddy',
      role: 'Tax Consultant',
      firm: 'Tax Solutions Ltd',
      avatar: 'https://via.placeholder.com/60',
      lastActive: '1 day ago',
      verified: false,
      status: 'Busy'
    }
  ];

  const tabs = [
    { key: 'requests', label: 'Requests', count: connectionRequests.length },
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
    { key: 'connections', label: 'My Network', count: 247 }
  ];

  const HeaderComponent = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.linkedin}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Network</Text>
          <View style={styles.headerStats}>
            <Text style={styles.statsText}>247 connections</Text>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lawyers, firms, specializations..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );

  const TabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                activeTab === tab.key && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.key && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const RequestCard = ({ request }) => (
    <View style={styles.connectionCard}>
      <Image source={{ uri: request.avatar }} style={styles.avatar} />
      
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{request.name}</Text>
          {request.verified && (
            <MaterialCommunityIcons name="check-decagram" size={16} color={colors.linkedin} />
          )}
        </View>
        
        <Text style={styles.role}>{request.role}</Text>
        <Text style={styles.firm}>{request.firm}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{request.mutualConnections} mutual</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="briefcase" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{request.experience}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const SuggestionCard = ({ suggestion }) => (
    <View style={styles.connectionCard}>
      <Image source={{ uri: suggestion.avatar }} style={styles.avatar} />
      
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{suggestion.name}</Text>
          {suggestion.verified && (
            <MaterialCommunityIcons name="check-decagram" size={16} color={colors.linkedin} />
          )}
        </View>
        
        <Text style={styles.role}>{suggestion.role}</Text>
        <Text style={styles.firm}>{suggestion.firm}</Text>
        
        <View style={styles.specializationBadge}>
          <Text style={styles.specializationText}>{suggestion.specialization}</Text>
        </View>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{suggestion.mutualConnections} mutual connections</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.connectButton}>
        <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  const ConnectionCard = ({ connection }) => (
    <View style={styles.connectionCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: connection.avatar }} style={styles.avatar} />
        <View style={[
          styles.statusIndicator,
          { backgroundColor: connection.status === 'Available' ? colors.success : colors.warning }
        ]} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{connection.name}</Text>
          {connection.verified && (
            <MaterialCommunityIcons name="check-decagram" size={16} color={colors.linkedin} />
          )}
        </View>
        
        <Text style={styles.role}>{connection.role}</Text>
        <Text style={styles.firm}>{connection.firm}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Active {connection.lastActive}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.messageButton}>
        <MaterialCommunityIcons name="message-outline" size={20} color={colors.linkedin} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <View style={styles.content}>
            {connectionRequests.length > 0 ? (
              connectionRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-plus" size={60} color={colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>No pending requests</Text>
                <Text style={styles.emptyStateText}>
                  Connection requests will appear here when lawyers want to connect with you.
                </Text>
              </View>
            )}
          </View>
        );
      
      case 'suggestions':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lawyers you may know</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </View>
        );
      
      case 'connections':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your connections</Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="sort-variant" size={20} color={colors.linkedin} />
              </TouchableOpacity>
            </View>
            
            {myConnections.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <TabBar />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
    paddingTop: StatusBar.currentHeight || 44,
  },
  
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
  },
  
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  
  headerStats: {
    alignItems: 'flex-end',
  },
  
  statsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    marginRight: 10,
  },
  
  tabBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  tabContainer: {
    paddingHorizontal: 20,
  },
  
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  activeTab: {
    borderBottomColor: colors.linkedin,
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  activeTabText: {
    color: colors.linkedin,
    fontWeight: '700',
  },
  
  tabBadge: {
    backgroundColor: colors.textTertiary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  
  activeTabBadge: {
    backgroundColor: colors.linkedin,
  },
  
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.linkedin,
  },
  
  connectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  cardContent: {
    flex: 1,
  },
  
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  
  role: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  firm: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  
  specializationBadge: {
    backgroundColor: colors.linkedin + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  
  specializationText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.linkedin,
  },
  
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 4,
  },
  
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  actionButtons: {
    alignItems: 'center',
  },
  
  acceptButton: {
    backgroundColor: colors.linkedin,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  rejectButton: {
    padding: 8,
  },
  
  connectButton: {
    backgroundColor: colors.linkedin,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  
  messageButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.linkedin,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  
  bottomSpacing: {
    height: 100,
  },
});