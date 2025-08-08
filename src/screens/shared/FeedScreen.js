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
  RefreshControl
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import {USER_ROLES} from '../../utils/constants';
import {SCREEN_NAMES} from '../../utils/constants';
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
  }
};

// ----------------------
// Custom Drawer Component
// ----------------------
function CustomDrawerContent(props) {
  const { user } = useSelector((state) => state.auth);

  const handleProfilePress = () => {
    if (user?.role === USER_ROLES.LAWYER) {
      props.navigation.navigate('InApp', { screen: SCREEN_NAMES.LAWYER_DASHBOARD });
    } else {
      props.navigation.navigate('InApp', { screen: SCREEN_NAMES.CLIENT_DASHBOARD });
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={drawerStyles.profileSection}>
        <TouchableOpacity onPress={handleProfilePress} style={drawerStyles.profileRow}>
          <Image 
              source={{ uri: user?.avatar || 'https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Free-File-Download.png' }}
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
            />
          <View style={drawerStyles.info}>
            <Text style={drawerStyles.name}>{user?.name || 'User Name'}</Text>
            <Text style={drawerStyles.headline}>{user?.headline || 'Your Headline'}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 10
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15
  },
  info: {
    flexDirection: 'column'
  },
  name: {
    fontSize: 16,
    fontWeight: '700'
  },
  headline: {
    fontSize: 14,
    color: '#64748B'
  }
});

// ----------------------
// Main Feed Screen
// ----------------------
function FeedScreen() {
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const feedPosts = [
    {
      id: 1,
      author: {
        name: 'Adv. Priya Sharma',
        role: 'Senior Corporate Lawyer',
        firm: 'Mumbai High Court',
        avatar: 'https://via.placeholder.com/50',
        verified: true
      },
      content: 'Just won a landmark case in corporate restructuring! Grateful to my team and clients who trusted us. The legal landscape is evolving, and we must adapt with innovation and integrity. #CorporateLaw #Victory #Mumbai',
      timestamp: '2h',
      likes: 247,
      comments: 34,
      shares: 12,
      image: 'https://via.placeholder.com/400x200',
      type: 'achievement'
    },
    {
      id: 2,
      author: {
        name: 'Rohit Mehta',
        role: 'Legal Consultant',
        firm: 'Tech Startups',
        avatar: 'https://via.placeholder.com/50',
        verified: false
      },
      content: 'Looking for experienced lawyers specializing in IP law for a fintech startup. We need experts who understand both traditional legal frameworks and emerging tech regulations. Please reach out if interested! #IPLaw #Fintech #Hiring',
      timestamp: '4h',
      likes: 89,
      comments: 23,
      shares: 8,
      type: 'opportunity'
    },
    {
      id: 3,
      author: {
        name: 'Legal News India',
        role: 'News Organization',
        firm: 'Legal Updates',
        avatar: 'https://via.placeholder.com/50',
        verified: true
      },
      content: 'Supreme Court delivers historic judgment on digital privacy rights. This decision will reshape how companies handle user data across India. Read our detailed analysis in the comments. #Privacy #SupremeCourt #DigitalRights',
      timestamp: '6h',
      likes: 1205,
      comments: 156,
      shares: 234,
      image: 'https://via.placeholder.com/400x250',
      type: 'news'
    }
  ];

  const HeaderComponent = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.linkedin}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.headerContent}>
          {/* Profile Icon to Open Drawer */}
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Image 
              source={{ uri: user?.avatar || 'https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Free-File-Download.png' }}
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
            />
          </TouchableOpacity>

          
            <TouchableOpacity onPress={() => navigation.navigate('InApp',{screen:SCREEN_NAMES.SEARCH})}>
          <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
              <Text style={styles.searchPlaceholder}>Search legal professionals, cases...</Text>
            
          </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={() => navigation.navigate('InApp',{screen:SCREEN_NAMES.CHAT})}>
            <MaterialCommunityIcons name="message-outline" size={24} color="#FFFFFF" />
            <View style={styles.messageBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const PostCard = ({ post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            {post.author.verified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.linkedin} />
            )}
          </View>
          <Text style={styles.authorRole}>{post.author.role} • {post.author.firm}</Text>
          <Text style={styles.postTime}>{post.timestamp}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>
      {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="thumb-up-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.likes} Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.comments} Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="share-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.shares} Shares</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CreatePostCard = () => (
    <View style={styles.createPostCard}>
      <View style={styles.createPostHeader}>
        <Image 
          source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
          style={styles.userAvatar} 
        />
        <TouchableOpacity style={styles.createPostInput}>
          <Text style={styles.createPostPlaceholder}>
            Share your legal insights, achievements, or opportunities...
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.createPostActions}>
        <TouchableOpacity style={styles.createAction}>
          <MaterialCommunityIcons name="image-outline" size={20} color={colors.linkedin} />
          <Text style={styles.createActionText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createAction}>
          <MaterialCommunityIcons name="video-outline" size={20} color={colors.success} />
          <Text style={styles.createActionText}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createAction}>
          <MaterialCommunityIcons name="briefcase-outline" size={20} color={colors.warning} />
          <Text style={styles.createActionText}>Case</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createAction}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.error} />
          <Text style={styles.createActionText}>Article</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderComponent />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <CreatePostCard />
        {feedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

// Drawer Navigator wrapping FeedScreen
const Drawer = createDrawerNavigator();

export default function FeedWithDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#FFFFFF', width: 280 },
        sceneContainerStyle: { backgroundColor: '#FAFBFF' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Feed" component={FeedScreen} />
    </Drawer.Navigator>
  );
}


// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    borderRadius: 28,
    padding: 2,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: 'white',
  },
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: StatusBar.currentHeight || 44 },
  headerGradient: { paddingHorizontal: 20, paddingVertical: 15 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
  },
  searchPlaceholder: { color: 'rgba(255, 255, 255, 0.8)', marginLeft: 10, fontSize: 14, fontWeight: '500' },
  messageButton: { position: 'relative', padding: 8 },
  messageBadge: {
    position: 'absolute', top: 2, right: 2, backgroundColor: colors.error, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  scrollView: { flex: 1 },
  createPostCard: {
    backgroundColor: colors.surface, marginHorizontal: 15, marginTop: 15, borderRadius: 15, padding: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  createPostHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  createPostInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  createPostPlaceholder: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  createPostActions: { flexDirection: 'row', justifyContent: 'space-around' },
  createAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  createActionText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  postCard: {
    backgroundColor: colors.surface, marginHorizontal: 15, marginTop: 15, borderRadius: 15, padding: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  postHeader: { flexDirection: 'row', marginBottom: 15 },
  authorAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  authorInfo: { flex: 1 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 6 },
  authorRole: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  postTime: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  moreButton: { padding: 5 },
  postContent: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 15, fontWeight: '400' },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 15, resizeMode: 'cover' },
  postActions: {
    flexDirection: 'row', justifyContent: 'space-around', paddingTop: 15,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  actionText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  bottomSpacing: { height: 100 },
});
