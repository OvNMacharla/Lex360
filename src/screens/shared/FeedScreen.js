import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform
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
            <Text style={drawerStyles.name}>{user?.displayName || 'User Name'}</Text>
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
// Create Post Modal
// ----------------------
function CreatePostModal({ visible, onClose, onSubmit, user }) {
  const [postText, setPostText] = useState('');
  const [selectedType, setSelectedType] = useState('text');
  const [selectedImage, setSelectedImage] = useState(null);

  const postTypes = [
    { id: 'text', label: 'Text Post', icon: 'text', color: colors.primary },
    { id: 'photo', label: 'Photo', icon: 'image-outline', color: colors.linkedin },
    { id: 'video', label: 'Video', icon: 'video-outline', color: colors.success },
    { id: 'case', label: 'Case Update', icon: 'briefcase-outline', color: colors.warning },
    { id: 'article', label: 'Article', icon: 'file-document-outline', color: colors.error }
  ];

  const handleSubmit = () => {
    if (!postText.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    const newPost = {
      id: Date.now(),
      author: {
        name: user?.displayName || 'User Name',
        role: user?.role === USER_ROLES.LAWYER ? 'Lawyer' : 'Client',
        firm: user?.firm || 'Legal Professional',
        avatar: user?.avatar || 'https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Free-File-Download.png',
        verified: false
      },
      content: postText,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      type: selectedType,
      image: selectedImage,
      likedBy: [],
      commentsList: []
    };

    onSubmit(newPost);
    setPostText('');
    setSelectedImage(null);
    setSelectedType('text');
    onClose();
  };

  const selectImage = () => {
    // Simulate image selection
    const sampleImages = [
      'https://via.placeholder.com/400x200',
      'https://via.placeholder.com/400x250',
      'https://via.placeholder.com/400x180'
    ];
    setSelectedImage(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.modalContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Post</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.authorSection}>
            <Image 
              source={{ uri: user?.avatar || 'https://via.placeholder.com/50' }} 
              style={styles.modalAvatar} 
            />
            <View>
              <Text style={styles.modalAuthorName}>{user?.displayName || 'User Name'}</Text>
              <Text style={styles.modalAuthorRole}>
                {user?.role === USER_ROLES.LAWYER ? 'Lawyer' : 'Client'}
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.postInput}
            multiline
            placeholder="What's on your mind? Share your legal insights, achievements, or opportunities..."
            placeholderTextColor={colors.textSecondary}
            value={postText}
            onChangeText={setPostText}
            textAlignVertical="top"
          />

          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Post Type</Text>
          <View style={styles.postTypesContainer}>
            {postTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.postTypeButton,
                  selectedType === type.id && { backgroundColor: type.color + '20' }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <MaterialCommunityIcons 
                  name={type.icon} 
                  size={20} 
                  color={selectedType === type.id ? type.color : colors.textSecondary} 
                />
                <Text style={[
                  styles.postTypeText,
                  selectedType === type.id && { color: type.color }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addMediaButton} onPress={selectImage}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.linkedin} />
            <Text style={styles.addMediaText}>Add Photo/Video</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ----------------------
// Comments Modal
// ----------------------
function CommentsModal({ visible, onClose, post, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const { user } = useSelector((state) => state.auth);

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: {
        name: user?.displayName || 'User Name',
        avatar: user?.avatar || 'https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Free-File-Download.png'
      },
      content: commentText,
      timestamp: 'now',
      likes: 0
    };

    onAddComment(post.id, newComment);
    setCommentText('');
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.author.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{item.author.name}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{item.timestamp}</Text>
          <TouchableOpacity style={styles.commentLike}>
            <MaterialCommunityIcons name="thumb-up-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.commentLikeText}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={post?.commentsList || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyComments}>
              <MaterialCommunityIcons name="comment-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
            </View>
          )}
        />

        <View style={styles.commentInputContainer}>
          <Image 
            source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.commentInputAvatar} 
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={handleAddComment}
            style={[styles.commentSendButton, !commentText.trim() && { opacity: 0.5 }]}
            disabled={!commentText.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color={colors.linkedin} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ----------------------
// Main Feed Screen
// ----------------------
function FeedScreen() {
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigation = useNavigation();

  const [feedPosts, setFeedPosts] = useState([
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
      type: 'achievement',
      likedBy: [],
      commentsList: [
        {
          id: 1,
          author: { name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
          content: 'Congratulations! This is truly inspiring.',
          timestamp: '1h',
          likes: 5
        },
        {
          id: 2,
          author: { name: 'Sarah Wilson', avatar: 'https://via.placeholder.com/40' },
          content: 'Amazing work! The legal community needs more professionals like you.',
          timestamp: '45m',
          likes: 12
        }
      ]
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
      type: 'opportunity',
      likedBy: [],
      commentsList: []
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
      type: 'news',
      likedBy: [],
      commentsList: []
    }
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleCreatePost = (newPost) => {
    setFeedPosts([newPost, ...feedPosts]);
  };

  const handleLike = (postId) => {
    const userId = user?.id || 'current_user';
    setFeedPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(userId);
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== userId)
              : [...post.likedBy, userId]
          };
        }
        return post;
      })
    );
  };

  const handleComment = (postId) => {
    const post = feedPosts.find(p => p.id === postId);
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleAddComment = (postId, comment) => {
    setFeedPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...post.commentsList, comment]
          };
        }
        return post;
      })
    );
  };

  const handleShare = (postId) => {
    setFeedPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, shares: post.shares + 1 };
        }
        return post;
      })
    );
    Alert.alert('Shared!', 'Post has been shared successfully');
  };

  const HeaderComponent = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.linkedin}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.headerContent}>
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

  const PostCard = ({ post }) => {
    const isLiked = post.likedBy.includes(user?.id || 'current_user');
    
    return (
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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <MaterialCommunityIcons 
              name={isLiked ? "thumb-up" : "thumb-up-outline"} 
              size={18} 
              color={isLiked ? colors.linkedin : colors.textSecondary} 
            />
            <Text style={[styles.actionText, isLiked && { color: colors.linkedin }]}>
              {post.likes} Likes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(post.id)}
          >
            <MaterialCommunityIcons name="comment-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionText}>{post.comments} Comments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(post.id)}
          >
            <MaterialCommunityIcons name="share-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.actionText}>{post.shares} Shares</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const CreatePostCard = () => (
    <View style={styles.createPostCard}>
      <View style={styles.createPostHeader}>
        <Image 
          source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
          style={styles.userAvatar} 
        />
        <TouchableOpacity 
          style={styles.createPostInput}
          onPress={() => setShowCreatePost(true)}
        >
          <Text style={styles.createPostPlaceholder}>
            Share your legal insights, achievements, or opportunities...
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.createPostActions}>
        <TouchableOpacity 
          style={styles.createAction}
          onPress={() => setShowCreatePost(true)}
        >
          <MaterialCommunityIcons name="image-outline" size={20} color={colors.linkedin} />
          <Text style={styles.createActionText}>Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createAction}
          onPress={() => setShowCreatePost(true)}
        >
          <MaterialCommunityIcons name="video-outline" size={20} color={colors.success} />
          <Text style={styles.createActionText}>Video</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createAction}
          onPress={() => setShowCreatePost(true)}
        >
          <MaterialCommunityIcons name="briefcase-outline" size={20} color={colors.warning} />
          <Text style={styles.createActionText}>Case</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createAction}
          onPress={() => setShowCreatePost(true)}
        >
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

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        user={user}
      />

      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        post={selectedPost}
        onAddComment={handleAddComment}
      />
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
  // ... existing styles ...
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  postButton: {
    backgroundColor: colors.linkedin,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  modalAuthorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalAuthorRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  postTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postTypeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: colors.linkedin,
    borderStyle: 'dashed',
  },
  addMediaText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.linkedin,
  },

  // Comments Modal Styles
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: colors.textTertiary,
    marginRight: 15,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentSendButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});