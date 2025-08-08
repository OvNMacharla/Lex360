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

export default function ChatScreen() {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Sample chat data
  const chatData = [
    {
      id: 1,
      name: 'Adv. Rajesh Kumar',
      role: 'Criminal Defense Lawyer',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Thank you for the case consultation. I\'ll review the documents and get back to you by tomorrow.',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      verified: true,
      type: 'professional'
    },
    {
      id: 2,
      name: 'Priya Malhotra',
      role: 'Corporate Legal Consultant',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'The contract review is complete. Found a few clauses that need attention. Can we schedule a call?',
      timestamp: '15 min ago',
      unreadCount: 0,
      isOnline: false,
      verified: true,
      type: 'professional'
    },
    {
      id: 3,
      name: 'Legal Support Team',
      role: 'Customer Support',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Your premium subscription has been activated. You now have access to all features.',
      timestamp: '1 hour ago',
      unreadCount: 1,
      isOnline: true,
      verified: true,
      type: 'support'
    },
    {
      id: 4,
      name: 'Adv. Vikram Singh',
      role: 'Constitutional Lawyer',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'Great presentation at the legal conference yesterday! Would love to collaborate on similar cases.',
      timestamp: '2 hours ago',
      unreadCount: 0,
      isOnline: false,
      verified: true,
      type: 'professional'
    },
    {
      id: 5,
      name: 'Mumbai Legal Forum',
      role: 'Professional Group',
      avatar: 'https://via.placeholder.com/50',
      lastMessage: 'New discussion: Recent changes in corporate compliance requirements',
      timestamp: '4 hours ago',
      unreadCount: 5,
      isOnline: true,
      verified: false,
      type: 'group'
    }
  ];

  const filterOptions = [
    { key: 'all', label: 'All', count: chatData.length },
    { key: 'unread', label: 'Unread', count: chatData.filter(chat => chat.unreadCount > 0).length },
    { key: 'professional', label: 'Professional', count: chatData.filter(chat => chat.type === 'professional').length },
    { key: 'group', label: 'Groups', count: chatData.filter(chat => chat.type === 'group').length }
  ];

  const getFilteredChats = () => {
    switch (activeFilter) {
      case 'unread':
        return chatData.filter(chat => chat.unreadCount > 0);
      case 'professional':
        return chatData.filter(chat => chat.type === 'professional');
      case 'group':
        return chatData.filter(chat => chat.type === 'group');
      default:
        return chatData;
    }
  };

  const HeaderComponent = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.linkedin}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {chatData.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.newChatButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages, lawyers, firms..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );

  const FilterBar = () => (
    <View style={styles.filterBar}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.activeFilterChip
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View style={[
                styles.filterBadge,
                activeFilter === filter.key && styles.activeFilterBadge
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  activeFilter === filter.key && styles.activeFilterBadgeText
                ]}>
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ChatItem = ({ chat }) => (
    <TouchableOpacity style={styles.chatItem} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.isOnline && <View style={styles.onlineIndicator} />}
        {chat.type === 'group' && (
          <View style={styles.groupBadge}>
            <MaterialCommunityIcons name="account-group" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
            <Text style={[
              styles.chatName,
              chat.unreadCount > 0 && styles.unreadName
            ]}>
              {chat.name}
            </Text>
            {chat.verified && (
              <MaterialCommunityIcons name="check-decagram" size={14} color={colors.linkedin} />
            )}
          </View>
          <Text style={styles.timestamp}>{chat.timestamp}</Text>
        </View>
        
        <Text style={styles.role}>{chat.role}</Text>
        
        <View style={styles.messageRow}>
          <Text style={[
            styles.lastMessage,
            chat.unreadCount > 0 && styles.unreadMessage
                      ]}>
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {HeaderComponent()}
      {FilterBar()}
      <FlatList
        data={getFilteredChats().filter(chat =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChatItem chat={item} />}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF'
  },
  unreadBadge: {
    backgroundColor: colors.error,
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  newChatButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: '#FFF',
    fontSize: 14
  },
  filterBar: {
    backgroundColor: colors.surface,
    paddingVertical: 8
  },
  filterContainer: {
    paddingHorizontal: 8,
    alignItems: 'center'
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4
  },
  activeFilterChip: {
    backgroundColor: colors.linkedin,
    borderColor: colors.linkedin
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '600'
  },
  filterBadge: {
    backgroundColor: colors.textTertiary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6
  },
  activeFilterBadge: {
    backgroundColor: '#FFF'
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#FFF'
  },
  activeFilterBadgeText: {
    color: colors.linkedin
  },
  chatList: {
    paddingVertical: 8
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.success,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface
  },
  groupBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.linkedin,
    borderRadius: 8,
    padding: 2
  },
  chatContent: {
    flex: 1
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text
  },
  unreadName: {
    fontWeight: 'bold'
  },
  timestamp: {
    fontSize: 12,
    color: colors.textTertiary
  },
  role: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary
  },
  unreadMessage: {
    fontWeight: '600',
    color: colors.text
  },
  unreadCountBadge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6
  },
  unreadCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
