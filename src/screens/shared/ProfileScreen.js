import React, { useState, useEffect } from 'react';
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
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Share,
  Linking,
  Image
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
  Portal,
  Dialog,
  IconButton,
  List,
  Menu,
  Searchbar,
  Switch
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { USER_ROLES } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

// Enhanced color palette
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
    error: ['#EF4444', '#DC2626', '#B91C1C']
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { profileType, profileId, isOwnProfile = true } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Enhanced mock profile data
  const mockProfileData = {
    client: {
      id: '1',
      name: 'Reliance Industries Ltd.',
      title: 'Multinational Conglomerate Corporation',
      avatar: 'R',
      verified: true,
      coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1000',
      email: 'legal@reliance.com',
      phone: '+91 98765 43210',
      website: 'https://www.ril.com',
      linkedin: 'https://linkedin.com/company/reliance-industries',
      location: 'Mumbai, Maharashtra, India',
      established: '1973',
      industry: 'Oil & Gas, Petrochemicals, Telecommunications',
      employeeCount: '236,000+',
      revenue: '₹7,92,756 Cr (2023)',
      description: 'Leading Indian multinational conglomerate with diverse business interests. Pioneer in digital transformation and sustainable energy solutions.',
      status: 'active',
      clientSince: '2020-03-15',
      totalCases: 15,
      activeCases: 5,
      totalValue: 15000000,
      lastActivity: '2025-08-15',
      priority: 'high',
      rating: 4.8,
      followers: 12500,
      following: 340,
      connections: 1200,
      posts: 89,
      tags: ['Corporate Law', 'M&A', 'Compliance', 'IPR', 'Contract Law'],
      latestPost: {
        id: 'p1',
        content: 'Excited to announce our latest green energy initiative. Partnering with leading law firms to ensure compliance with environmental regulations. This marks a significant step towards our carbon-neutral goals. #GreenEnergy #Sustainability #LegalCompliance',
        timestamp: '2025-08-17T10:30:00Z',
        likes: 340,
        comments: 45,
        shares: 28,
        hasLiked: false,
        images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'],
        author: {
          name: 'Reliance Industries Ltd.',
          avatar: 'R',
          verified: true
        }
      }
    },
    lawyer: {
      id: 'l1',
      name: 'Adv. Priya Sharma',
      title: 'Senior Partner - Corporate Law',
      avatar: 'PS',
      verified: true,
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000',
      email: 'priya.sharma@lawfirm.com',
      phone: '+91 98765 54321',
      linkedin: 'https://linkedin.com/in/priya-sharma-lawyer',
      location: 'Delhi, India',
      barCouncilId: 'D/12345/2010',
      experience: '15 years',
      education: 'LLM - Harvard Law School, LLB - Delhi University',
      firm: 'Sharma & Associates',
      specializations: ['Corporate Law', 'M&A', 'Securities Law', 'Banking Law'],
      languages: ['English', 'Hindi', 'Punjabi'],
      description: 'Passionate about corporate law and digital transformation in legal services. Helping businesses navigate complex legal landscapes with innovation and expertise.',
      status: 'available',
      joinedFirm: '2015-06-01',
      totalCases: 284,
      activeCases: 12,
      successRate: 94.5,
      clientRating: 4.9,
      hourlyRate: 15000,
      followers: 3400,
      following: 890,
      connections: 2100,
      posts: 156,
      latestPost: {
        id: 'p1',
        content: 'Landmark judgment in the corporate liability case! Proud to have represented our client successfully. This sets a new precedent for corporate governance in India. The judgment emphasizes the importance of transparent board decisions and fiduciary duties. #CorporateLaw #LegalVictory #Precedent #GovernanceLaw',
        timestamp: '2025-08-16T09:15:00Z',
        likes: 127,
        comments: 23,
        shares: 15,
        hasLiked: false,
        author: {
          name: 'Adv. Priya Sharma',
          avatar: 'PS',
          verified: true
        }
      }
    },
    firm: {
      id: 'f1',
      name: 'Sharma & Associates',
      title: 'Leading Corporate Law Firm',
      avatar: 'SA',
      verified: true,
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000',
      email: 'contact@sharmaassociates.com',
      phone: '+91 11 4567 8900',
      website: 'https://www.sharmaassociates.com',
      linkedin: 'https://linkedin.com/company/sharma-associates',
      location: 'Delhi, India',
      established: '1995',
      firmSize: '50-100 lawyers',
      practiceAreas: ['Corporate Law', 'M&A', 'Banking', 'Real Estate', 'IPR', 'Litigation'],
      description: 'Premier full-service law firm specializing in corporate law, mergers & acquisitions, and regulatory compliance. Serving Fortune 500 companies and emerging startups with excellence.',
      status: 'active',
      followers: 8900,
      following: 450,
      connections: 3400,
      posts: 234,
      partners: [
        { name: 'Adv. Priya Sharma', id: 'l1', position: 'Senior Partner', avatar: 'PS' },
        { name: 'Adv. Rajesh Kumar', id: 'l2', position: 'Managing Partner', avatar: 'RK' },
        { name: 'Adv. Meera Patel', id: 'l3', position: 'Partner', avatar: 'MP' }
      ],
      latestPost: {
        id: 'p1',
        content: '🏆 Proud to announce that our team successfully closed a ₹2,500 Cr M&A deal this quarter! Our expertise in regulatory compliance and due diligence made all the difference. Grateful to our clients for their trust in our capabilities. #MergerSuccess #CorporateLaw #LegalExcellence #ClientSuccess',
        timestamp: '2025-08-17T11:00:00Z',
        likes: 456,
        comments: 78,
        shares: 45,
        hasLiked: false,
        images: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400'],
        author: {
          name: 'Sharma & Associates',
          avatar: 'SA',
          verified: true
        }
      }
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [profileId, profileType]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isOwnProfile) {
        // Use current user data for own profile
        const ownProfileData = {
          ...user,
          avatar: user?.displayName?.charAt(0) || 'U',
          followers: 234,
          following: 156,
          connections: 89,
          posts: 12,
          description: user?.role === USER_ROLES.LAWYER 
            ? 'Experienced legal professional specializing in civil law and corporate matters.'
            : 'Seeking reliable legal services for business and personal matters.',
          latestPost: {
            id: 'own_p1',
            content: user?.role === USER_ROLES.LAWYER 
              ? 'Successfully resolved another complex corporate dispute today. Every case teaches us something new about the evolving landscape of business law. Grateful for the opportunity to serve justice. #LegalPractice #CorporateLaw #Justice'
              : 'Thanks to my excellent legal team for their guidance through our recent contract negotiations. Professional service makes all the difference in business success! #LegalServices #Business #Gratitude',
            timestamp: '2025-08-17T14:30:00Z',
            likes: 45,
            comments: 8,
            shares: 3,
            hasLiked: false,
            author: {
              name: user?.displayName || 'User',
              avatar: user?.displayName?.charAt(0) || 'U',
              verified: user?.role === USER_ROLES.LAWYER
            }
          }
        };
        setProfile(ownProfileData);
      } else {
        const data = mockProfileData[profileType] || mockProfileData.lawyer;
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleConnect = () => {
    setIsConnected(!isConnected);
    Alert.alert(
      isConnected ? 'Disconnected' : 'Connection Sent',
      isConnected ? 'You are no longer connected.' : 'Connection request sent successfully!'
    );
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { 
      profileId: profile.id, 
      profileName: profile.displayName,
      profileType 
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile.displayName}'s profile on LegalConnect`,
        url: `https://legalconnect.app/profile/${profileType}/${profile.id}`
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'available': case 'online': return colors.success;
      case 'busy': case 'pending': return colors.warning;
      case 'offline': case 'inactive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const coverOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.coverImageContainer, { opacity: coverOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.coverImage}
        >
          <BlurView intensity={20} tint="dark" style={styles.coverOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.headerRightActions}>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="share-variant" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setShowSettingsModal(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons 
                    name={isOwnProfile ? "cog" : "dots-vertical"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Floating particles effect */}
            <View style={styles.particleContainer}>
              <View style={[styles.particle, styles.particle1]} />
              <View style={[styles.particle, styles.particle2]} />
              <View style={[styles.particle, styles.particle3]} />
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
      
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={80} tint="light" style={styles.floatingHeaderBlur}>
          <View style={styles.floatingHeaderContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.floatingHeaderInfo}>
              <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                {profile?.displayName}
              </Text>
              {profile?.verified && (
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.info} />
              )}
            </View>
            <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
              <MaterialCommunityIcons 
                name={isOwnProfile ? "cog" : "dots-vertical"} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );

  const renderProfileInfo = () => (
    <Surface style={styles.profileCard}>
      <View style={styles.profileContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={colors.gradient.gold}
              style={styles.avatarGradient}
            >
              <Avatar.Text
                size={80}
                label={profile?.avatar}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            </LinearGradient>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(profile?.status) }
            ]} />
            {isOwnProfile && (
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>{profile?.displayName}</Text>
              {profile?.verified && (
                <MaterialCommunityIcons name="check-decagram" size={20} color={colors.info} />
              )}
            </View>
            <Text style={styles.profileTitle}>{profile?.title}</Text>
            
            {profile?.firm && !isOwnProfile && (
              <TouchableOpacity style={styles.firmContainer} activeOpacity={0.8}>
                <MaterialCommunityIcons name="office-building" size={16} color={colors.textSecondary} />
                <Text style={styles.firmText}>{profile.firm}</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.profileMeta}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={styles.profileMetaText}>{profile?.location}</Text>
            </View>
          </View>
        </View>
        
        {/* Professional Stats */}
        <View style={styles.socialStats}>
          <TouchableOpacity style={styles.socialStatItem} activeOpacity={0.8}>
            <Text style={styles.socialStatNumber}>{formatNumber(profile?.followers || 0)}</Text>
            <Text style={styles.socialStatLabel}>Followers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialStatItem} 
            onPress={() => setShowConnectionsModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.socialStatNumber}>{formatNumber(profile?.connections || 0)}</Text>
            <Text style={styles.socialStatLabel}>Connections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialStatItem} activeOpacity={0.8}>
            <Text style={styles.socialStatNumber}>{profile?.posts || 0}</Text>
            <Text style={styles.socialStatLabel}>Posts</Text>
          </TouchableOpacity>
        </View>
        
        {profile?.description && (
          <Text style={styles.profileDescription}>{profile?.description}</Text>
        )}
        
        {/* Action Buttons - Only show for other profiles */}
        {!isOwnProfile && (
          <View style={styles.profileActions}>
            <TouchableOpacity 
              style={[styles.actionButton, isConnected && styles.connectedButton]}
              onPress={handleConnect}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isConnected ? colors.gradient.success : colors.gradient.info}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons 
                  name={isConnected ? "account-check" : "account-plus"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {isConnected ? 'Connected' : 'Connect'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradient.purple}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons name="message-text" size={20} color="white" />
                <Text style={styles.actionButtonText}>Message</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={handleFollow}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name={isFollowing ? "heart" : "heart-outline"} 
                size={20} 
                color={isFollowing ? colors.error : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Surface>
  );

  const renderQuickStats = () => {
    const stats = profileType === 'client' || (isOwnProfile && user?.role === USER_ROLES.CLIENT) ? [
      { label: 'Total Cases', value: profile?.totalCases || 12, icon: 'briefcase', color: colors.info },
      { label: 'Active Cases', value: profile?.activeCases || 3, icon: 'clock', color: colors.warning },
      { label: 'Consultations', value: 28, icon: 'chat', color: colors.success },
      { label: 'Documents', value: 45, icon: 'folder', color: colors.tertiary }
    ] : profileType === 'lawyer' || (isOwnProfile && user?.role === USER_ROLES.LAWYER) ? [
      { label: 'Cases Won', value: profile?.totalCases || 42, icon: 'trophy', color: colors.warning },
      { label: 'Success Rate', value: `${profile?.successRate || 94}%`, icon: 'trending-up', color: colors.success },
      { label: 'Client Rating', value: `${profile?.clientRating || 4.8}/5`, icon: 'star', color: colors.secondary },
      { label: 'Experience', value: profile?.experience || '8 Yrs', icon: 'school', color: colors.info }
    ] : [
      { label: 'Team Size', value: profile?.firmSize?.split('-')[0] || '50+', icon: 'account-group', color: colors.info },
      { label: 'Established', value: profile?.established || '1995', icon: 'calendar', color: colors.warning },
      { label: 'Practice Areas', value: profile?.practiceAreas?.length || 6, icon: 'briefcase', color: colors.success },
      { label: 'Clients', value: '500+', icon: 'domain', color: colors.tertiary }
    ];

    return (
      <Surface style={styles.statsCard}>
        <Text style={styles.cardTitle}>Professional Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statItem} activeOpacity={0.8}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>
    );
  };

  const renderLatestPost = () => {
    if (!profile?.latestPost) return null;

    const post = profile.latestPost;
    
    return (
      <Surface style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={styles.cardTitle}>Latest Activity</Text>
          <TouchableOpacity 
            onPress={() => {
              setSelectedPost(post);
              setShowPostModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.viewPostText}>View Full</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.postContent}>
          <View style={styles.postAuthorInfo}>
            <Avatar.Text
              size={44}
              label={post.author.avatar}
              style={styles.postAvatar}
              labelStyle={styles.postAvatarLabel}
            />
            <View style={styles.postAuthorDetails}>
              <View style={styles.postAuthorName}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.verified && (
                  <MaterialCommunityIcons name="check-decagram" size={14} color={colors.info} />
                )}
              </View>
              <Text style={styles.postTimestamp}>
                {new Date(post.timestamp).toLocaleDateString()} • 
                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          
          <Text style={styles.postText} numberOfLines={3}>
            {post.content}
          </Text>
          
          {post.images && post.images.length > 0 && (
            <TouchableOpacity 
              style={styles.postImageContainer}
              onPress={() => {
                setSelectedPost(post);
                setShowPostModal(true);
              }}
              activeOpacity={0.9}
            >
              <Image source={{ uri: post.images[0] }} style={styles.postImage} />
              <View style={styles.postImageOverlay}>
                <MaterialCommunityIcons name="fullscreen" size={24} color="white" />
              </View>
            </TouchableOpacity>
          )}
          
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postActionButton} activeOpacity={0.8}>
              <MaterialCommunityIcons 
                name={post.hasLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={post.hasLiked ? colors.error : colors.textSecondary} 
              />
              <Text style={styles.postActionText}>{formatNumber(post.likes)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.postActionButton} activeOpacity={0.8}>
              <MaterialCommunityIcons name="comment-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.postActionText}>{formatNumber(post.comments)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.postActionButton} activeOpacity={0.8}>
              <MaterialCommunityIcons name="share-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.postActionText}>{formatNumber(post.shares)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    );
  };

  const renderProfessionalDetails = () => (
    <Surface style={styles.detailsCard}>
      <Text style={styles.cardTitle}>Professional Details</Text>
      
      <View style={styles.detailsList}>
        {profile?.email && (
          <TouchableOpacity 
            style={styles.detailItem}
            onPress={() => Linking.openURL(`mailto:${profile.email}`)}
            activeOpacity={0.8}
          >
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="email" size={20} color={colors.info} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{profile.email}</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {profile?.phone && (
          <TouchableOpacity 
            style={styles.detailItem}
            onPress={() => Linking.openURL(`tel:${profile.phone}`)}
            activeOpacity={0.8}
          >
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="phone" size={20} color={colors.success} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{profile.phone}</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {(profile?.website || profile?.linkedin) && (
          <TouchableOpacity 
            style={styles.detailItem}
            onPress={() => Linking.openURL(profile.website || profile.linkedin)}
            activeOpacity={0.8}
          >
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="web" size={20} color={colors.tertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Website</Text>
              <Text style={styles.detailValue}>{profile.website || profile.linkedin}</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {profileType === 'lawyer' && profile?.barCouncilId && (
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="certificate" size={20} color={colors.warning} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Bar Council ID</Text>
              <Text style={styles.detailValue}>{profile.barCouncilId}</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Specializations/Tags */}
      {(profile?.specializations || profile?.practiceAreas || profile?.tags) && (
        <View style={styles.specializationsSection}>
          <Text style={styles.sectionSubtitle}>
            {profileType === 'lawyer' ? 'Specializations' : 
             profileType === 'firm' ? 'Practice Areas' : 'Expertise'}
          </Text>
          <View style={styles.tagsContainer}>
            {(profile.specializations || profile.practiceAreas || profile.tags || []).map((item, index) => (
              <TouchableOpacity key={index} activeOpacity={0.8}>
                <Chip
                  mode="flat"
                  style={styles.tagChip}
                  textStyle={styles.tagText}
                  onPress={() => navigation.navigate('Search', { query: item })}
                >
                  {item}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Surface>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity 
              onPress={() => setShowSettingsModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {isOwnProfile ? 'Settings & Preferences' : 'Profile Options'}
            </Text>
            
            <View style={styles.modalPlaceholder} />
          </View>
        </LinearGradient>
        
        <ScrollView style={styles.modalContent}>
          {isOwnProfile ? (
            <>
              {/* Quick Actions for Own Profile */}
              <Surface style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsList}>
                  <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
                    <View style={styles.quickActionIcon}>
                      <MaterialCommunityIcons name="account-edit" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Edit Profile</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
                    <View style={styles.quickActionIcon}>
                      <MaterialCommunityIcons name="post" size={24} color={colors.info} />
                    </View>
                    <Text style={styles.quickActionText}>Create Post</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.8}>
                    <View style={styles.quickActionIcon}>
                      <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.quickActionText}>View Analytics</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Surface>
              
              {/* Settings for Own Profile */}
              <Surface style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Preferences</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBg, { backgroundColor: colors.warning }]}>
                      <MaterialCommunityIcons name="bell" size={20} color="white" />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Push Notifications</Text>
                      <Text style={styles.settingSubtitle}>Get updates about your cases</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: colors.primary + '40' }}
                  />
                </View>

                <Divider style={styles.settingDivider} />

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBg, { backgroundColor: colors.tertiary }]}>
                      <MaterialCommunityIcons name="theme-light-dark" size={20} color="white" />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Dark Mode</Text>
                      <Text style={styles.settingSubtitle}>Switch to dark theme</Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={() => dispatch(toggleTheme())}
                    thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: colors.primary + '40' }}
                  />
                </View>
              </Surface>
              
              {/* More Options */}
              <Surface style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>More Options</Text>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="shield-account" size={20} color={colors.info} />
                    </View>
                    <Text style={styles.menuTitle}>Privacy Settings</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="help-circle" size={20} color={colors.success} />
                    </View>
                    <Text style={styles.menuTitle}>Help & Support</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="information" size={20} color={colors.tertiary} />
                    </View>
                    <Text style={styles.menuTitle}>About App</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </Surface>
              
              {/* Sign Out */}
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradient.error}
                  style={styles.signOutGradient}
                >
                  <MaterialCommunityIcons name="logout" size={20} color="white" />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Options for Other Profiles */}
              <Surface style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Profile Actions</Text>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="bookmark" size={20} color={colors.info} />
                    </View>
                    <Text style={styles.menuTitle}>Save Profile</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="link" size={20} color={colors.success} />
                    </View>
                    <Text style={styles.menuTitle}>Copy Profile Link</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="flag" size={20} color={colors.warning} />
                    </View>
                    <Text style={styles.menuTitle}>Report Profile</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconContainer}>
                      <MaterialCommunityIcons name="block-helper" size={20} color={colors.error} />
                    </View>
                    <Text style={styles.menuTitle}>Block User</Text>
                  </View>
                </TouchableOpacity>
              </Surface>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPostModal = () => (
    <Modal
      visible={showPostModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPostModal(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity 
              onPress={() => setShowPostModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Post Details</Text>
            
            <TouchableOpacity style={styles.modalActionButton} activeOpacity={0.8}>
              <MaterialCommunityIcons name="share" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {selectedPost && (
          <ScrollView style={styles.modalContent}>
            <Surface style={styles.fullPostCard}>
              <View style={styles.postAuthorInfo}>
                <Avatar.Text
                  size={50}
                  label={selectedPost.author.avatar}
                  style={styles.postAvatar}
                  labelStyle={styles.postAvatarLabel}
                />
                <View style={styles.postAuthorDetails}>
                  <View style={styles.postAuthorName}>
                    <Text style={styles.authorName}>{selectedPost.author.name}</Text>
                    {selectedPost.author.verified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color={colors.info} />
                    )}
                  </View>
                  <Text style={styles.postTimestamp}>
                    {new Date(selectedPost.timestamp).toLocaleDateString()} • 
                    {new Date(selectedPost.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.fullPostText}>{selectedPost.content}</Text>
              
              {selectedPost.images && selectedPost.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postImagesContainer}>
                  {selectedPost.images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.fullPostImage} />
                  ))}
                </ScrollView>
              )}
              
              <View style={styles.postEngagement}>
                <Text style={styles.engagementText}>
                  {formatNumber(selectedPost.likes)} likes • {formatNumber(selectedPost.comments)} comments • {formatNumber(selectedPost.shares)} shares
                </Text>
              </View>
              
              <Divider style={styles.postDivider} />
              
              <View style={styles.postActionButtons}>
                <TouchableOpacity style={styles.fullPostActionButton} activeOpacity={0.8}>
                  <MaterialCommunityIcons 
                    name={selectedPost.hasLiked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={selectedPost.hasLiked ? colors.error : colors.textSecondary} 
                  />
                  <Text style={styles.fullPostActionText}>Like</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.fullPostActionButton} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="comment-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.fullPostActionText}>Comment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.fullPostActionButton} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="share-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.fullPostActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </Surface>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Profile Not Found</Text>
        <Text style={styles.errorSubtitle}>The requested profile could not be loaded</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderProfileInfo()}
        {renderQuickStats()}
        {renderLatestPost()}
        {renderProfessionalDetails()}
      </Animated.ScrollView>
      
      {renderSettingsModal()}
      {renderPostModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Loading & Error States
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
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: colors.primary,
  },

  // Header Styles
  headerContainer: {
    position: 'relative',
    height: 130
  },
  coverImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  coverImage: {
    flex: 1,
  },
  coverOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
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
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '20%',
  },
  particle3: {
    top: '40%',
    left: '70%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBar.currentHeight || 44,
    zIndex: 1000,
  },
  floatingHeaderBlur: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  floatingHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Profile Card
  profileCard: {
    marginTop: -10,
    marginHorizontal: 24,
    borderRadius: 24,
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    borderRadius: 40,
    padding: 3,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 32,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  profileTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  firmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.info + '10',
    borderRadius: 12,
  },
  firmText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: '600',
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceVariant,
    marginVertical: 20,
  },
  socialStatItem: {
    alignItems: 'center',
  },
  socialStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  socialStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  profileDescription: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  connectedButton: {
    opacity: 0.8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Card
  statsCard: {
    margin: 24,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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

  // Post Card
  postCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  viewPostText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  postContent: {
    padding: 20,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    backgroundColor: colors.primary + '20',
    marginRight: 12,
  },
  postAvatarLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  postAuthorDetails: {
    flex: 1,
  },
  postAuthorName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  postTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  postText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },
  postImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postActionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Details Card
  detailsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  detailsList: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  specializationsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.tertiary + '20',
    borderColor: colors.tertiary + '40',
  },
  tagText: {
    fontSize: 12,
    color: colors.tertiary,
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  modalPlaceholder: {
    width: 44,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },

  // Quick Actions
  quickActionsList: {
    gap: 8,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  settingDivider: {
    marginVertical: 12,
    backgroundColor: colors.surfaceVariant,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  // Sign Out Button
  signOutButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Full Post Modal
  fullPostCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  fullPostText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImagesContainer: {
    marginBottom: 16,
  },
  fullPostImage: {
    width: width - 88,
    height: 250,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: colors.surfaceVariant,
  },
  postEngagement: {
    paddingVertical: 12,
  },
  engagementText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  postDivider: {
    backgroundColor: colors.surfaceVariant,
    marginVertical: 12,
  },
  postActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fullPostActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.surfaceVariant,
  },
  fullPostActionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});