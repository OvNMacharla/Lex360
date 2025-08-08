import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  StatusBar,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const LegalDocuments = () => {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Mock data - replace with actual data from your state management
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Employment Contract.pdf',
      type: 'Contract',
      size: '2.4 MB',
      uploadDate: '2024-03-15',
      status: 'Reviewed',
      pages: 12,
      tags: ['Employment', 'Contract'],
    },
    {
      id: '2',
      name: 'Non-Disclosure Agreement.pdf',
      type: 'Agreement',
      size: '1.8 MB',
      uploadDate: '2024-03-10',
      status: 'Pending Review',
      pages: 8,
      tags: ['NDA', 'Confidentiality'],
    },
    {
      id: '3',
      name: 'Property Lease Agreement.pdf',
      type: 'Lease',
      size: '3.2 MB',
      uploadDate: '2024-03-08',
      status: 'Approved',
      pages: 15,
      tags: ['Property', 'Lease', 'Residential'],
    },
    {
      id: '4',
      name: 'Business Partnership Agreement.pdf',
      type: 'Partnership',
      size: '4.1 MB',
      uploadDate: '2024-03-05',
      status: 'Under Review',
      pages: 22,
      tags: ['Business', 'Partnership'],
    },
    {
      id: '5',
      name: 'Intellectual Property License.pdf',
      type: 'License',
      size: '2.9 MB',
      uploadDate: '2024-03-01',
      status: 'Completed',
      pages: 18,
      tags: ['IP', 'License', 'Technology'],
    },
  ]);

  const documentTypes = ['All', 'Contract', 'Agreement', 'Lease', 'Partnership', 'License'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return '#34C759';
      case 'Under Review':
      case 'Pending Review':
        return '#FF9500';
      case 'Reviewed':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'Contract':
        return 'file-document-outline';
      case 'Agreement':
        return 'handshake-outline';
      case 'Lease':
        return 'home-outline';
      case 'Partnership':
        return 'account-group-outline';
      case 'License':
        return 'license';
      default:
        return 'file-outline';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'All' || doc.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUpload = (uploadType) => {
    setShowUploadModal(false);
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Handle different upload types
    Alert.alert('Upload Document', `${uploadType} functionality would be implemented here.`);
  };

  const handleDocumentPress = (document) => {
    setSelectedDocument(document);
    Alert.alert(
      document.name,
      `Type: ${document.type}\nSize: ${document.size}\nPages: ${document.pages}\nStatus: ${document.status}`,
      [
        { text: 'View', onPress: () => console.log('View document') },
        { text: 'Share', onPress: () => console.log('Share document') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `#007AFF20` }]}>
        <MaterialCommunityIcons
          name="file-document-plus-outline"
          size={64}
          color="#007AFF"
        />
      </View>
      <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
        No Documents Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
        Upload your first legal document to get started
      </Text>
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: '#007AFF' }]}
        onPress={() => setShowUploadModal(true)}
      >
        <Feather name="upload" size={20} color="#FFFFFF" />
        <Text style={styles.uploadButtonText}>Upload Document</Text>
      </TouchableOpacity>
    </View>
  );

  const DocumentCard = ({ item, index }) => (
    <Animated.View
      style={[
        viewMode === 'grid' ? styles.documentCard : styles.documentListItem,
        {
          backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
          borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleDocumentPress(item)}
        style={styles.documentContent}
        activeOpacity={0.7}
      >
        {/* Document Icon & Type */}
        <View style={styles.documentHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `#007AFF20` }]}>
            <MaterialCommunityIcons
              name={getDocumentIcon(item.type)}
              size={viewMode === 'grid' ? 28 : 24}
              color="#007AFF"
            />
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) }
              ]}
            />
          </View>
        </View>

        {/* Document Info */}
        <View style={styles.documentInfo}>
          <Text
            style={[
              styles.documentName,
              { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
            ]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.documentType,
              { color: isDarkMode ? '#8E8E93' : '#86868B' }
            ]}
          >
            {item.type} • {item.size}
          </Text>
          <Text
            style={[
              styles.documentDate,
              { color: isDarkMode ? '#8E8E93' : '#86868B' }
            ]}
          >
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, viewMode === 'grid' ? 2 : 3).map((tag, tagIndex) => (
            <View
              key={tagIndex}
              style={[
                styles.tag,
                { backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7' }
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}
          >
            {item.status}
          </Text>
          <Text
            style={[
              styles.pagesText,
              { color: isDarkMode ? '#8E8E93' : '#86868B' }
            ]}
          >
            {item.pages} pages
          </Text>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="eye" size={16} color={isDarkMode ? '#8E8E93' : '#86868B'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share" size={16} color={isDarkMode ? '#8E8E93' : '#86868B'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="more-horizontal" size={16} color={isDarkMode ? '#8E8E93' : '#86868B'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const FilterChip = ({ title, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected
            ? '#007AFF'
            : isDarkMode ? '#2C2C2E' : '#F2F2F7',
          borderColor: isSelected
            ? '#007AFF'
            : isDarkMode ? '#3A3A3C' : '#E5E5EA',
        }
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: isSelected
              ? '#FFFFFF'
              : isDarkMode ? '#FFFFFF' : '#1D1D1F'
          }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const UploadModal = () => (
    <Modal
      visible={showUploadModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowUploadModal(false)}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={isDarkMode
              ? ['#2C2C2E', '#1C1C1E']
              : ['#FFFFFF', '#F8F9FA']
            }
            style={styles.modalContent}
          >
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
              Upload Document
            </Text>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => handleUpload('Camera')}
              >
                <Feather name="camera" size={32} color="#007AFF" />
                <Text style={[styles.uploadOptionText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => handleUpload('Gallery')}
              >
                <Feather name="image" size={32} color="#34C759" />
                <Text style={[styles.uploadOptionText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  From Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => handleUpload('Files')}
              >
                <Feather name="file" size={32} color="#FF9500" />
                <Text style={[styles.uploadOptionText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  Browse Files
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => handleUpload('Scan')}
              >
                <MaterialCommunityIcons name="scanner" size={32} color="#FF3B30" />
                <Text style={[styles.uploadOptionText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  Scan Document
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7' }]}
              onPress={() => setShowUploadModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F2F2F7' }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#F2F2F7'}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
              Legal Documents
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
              {documents.length} documents
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.viewToggle, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Feather
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={20}
                color={isDarkMode ? '#FFFFFF' : '#1D1D1F'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
          <Feather name="search" size={20} color={isDarkMode ? '#8E8E93' : '#86868B'} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}
            placeholder="Search documents..."
            placeholderTextColor={isDarkMode ? '#8E8E93' : '#86868B'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={isDarkMode ? '#8E8E93' : '#86868B'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={documentTypes}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <FilterChip
              title={item}
              isSelected={selectedFilter === item}
              onPress={() => setSelectedFilter(item)}
            />
          )}
        />
      </View>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.documentsContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <DocumentCard item={item} index={index} />}
        />
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setShowUploadModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#007AFF', '#0056CC']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="plus" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <UploadModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '400',
  },
  filterContainer: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentsContainer: {
    padding: 16,
  },
  documentCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  documentListItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  documentContent: {
    flex: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  documentInfo: {
    marginBottom: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pagesText: {
    fontSize: 12,
    fontWeight: '400',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  uploadOption: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LegalDocuments;