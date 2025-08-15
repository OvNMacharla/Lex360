import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Platform,
  Text as RNText,
  RefreshControl
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
  Snackbar,
  Menu,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';

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
    error: ['#EF4444', '#F87171', '#FCA5A5'],
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)'],
    modal: ['rgba(255, 255, 255, 0.98)', 'rgba(248, 249, 254, 0.95)']
  }
};

const documentStatuses = [
  { id: 'pending', label: 'Pending Review', color: colors.warning, icon: 'clock-outline' },
  { id: 'reviewed', label: 'Reviewed', color: colors.info, icon: 'eye-check' },
  { id: 'approved', label: 'Approved', color: colors.success, icon: 'check-circle' },
  { id: 'rejected', label: 'Rejected', color: colors.error, icon: 'close-circle' },
  { id: 'draft', label: 'Draft', color: colors.textSecondary, icon: 'file-edit-outline' }
];

const documentTypes = [
  { id: 'contract', label: 'Contract', icon: 'file-document-outline', color: colors.info },
  { id: 'agreement', label: 'Agreement', icon: 'handshake-outline', color: colors.success },
  { id: 'lease', label: 'Lease', icon: 'home-outline', color: colors.warning },
  { id: 'partnership', label: 'Partnership', icon: 'account-group-outline', color: colors.tertiary },
  { id: 'license', label: 'License', icon: 'license', color: colors.secondary },
  { id: 'legal-notice', label: 'Legal Notice', icon: 'alert-outline', color: colors.error },
  { id: 'invoice', label: 'Invoice', icon: 'receipt', color: colors.accent },
  { id: 'certificate', label: 'Certificate', icon: 'certificate', color: colors.primary }
];

const priorityOptions = [
  { id: 'urgent', label: 'Urgent', color: colors.error },
  { id: 'high', label: 'High', color: colors.warning },
  { id: 'medium', label: 'Medium', color: colors.info },
  { id: 'low', label: 'Low', color: colors.success }
];

const uploadMethods = [
  { id: 'camera', label: 'Take Photo', icon: 'camera', color: colors.info },
  { id: 'gallery', label: 'From Gallery', icon: 'image', color: colors.success },
  { id: 'files', label: 'Browse Files', icon: 'file', color: colors.warning },
  { id: 'scan', label: 'Scan Document', icon: 'scanner', color: colors.error }
];

export default function LegalDocuments({ navigation }) {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, text: '' });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [menuVisibleFor, setMenuVisibleFor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Form states
  const emptyForm = {
    name: '',
    type: 'contract',
    description: '',
    priority: 'medium',
    tags: [],
    notes: '',
    category: '',
    version: '1.0',
    expiryDate: '',
    associatedCase: '',
    client: ''
  };
  
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);
  const [newTag, setNewTag] = useState('');

  // Enhanced mock data
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Employment Contract.pdf',
      type: 'contract',
      description: 'Standard employment agreement for senior developer position',
      size: '2.4 MB',
      uploadDate: '2024-03-15',
      lastModified: '2024-03-16',
      status: 'reviewed',
      pages: 12,
      priority: 'high',
      tags: ['Employment', 'Contract', 'Senior'],
      notes: 'Contains standard clauses with additional remote work provisions',
      category: 'HR Documents',
      version: '2.1',
      downloadCount: 5,
      sharedWith: ['hr@company.com', 'legal@company.com'],
      expiryDate: '2025-03-15',
      associatedCase: 'EMP-2024-001',
      client: 'TechCorp Inc.',
      fileUrl: 'https://example.com/docs/employment-contract.pdf',
      thumbnail: 'https://via.placeholder.com/100x130/3B82F6/FFFFFF?text=PDF',
      createdBy: 'Sarah Johnson',
      approvedBy: 'Michael Chen',
      canEdit: true,
      canDelete: true,
      canShare: true,
      isConfidential: true
    },
    {
      id: '2',
      name: 'Non-Disclosure Agreement.pdf',
      type: 'agreement',
      description: 'Mutual NDA for technology partnership discussions',
      size: '1.8 MB',
      uploadDate: '2024-03-10',
      lastModified: '2024-03-12',
      status: 'approved',
      pages: 8,
      priority: 'medium',
      tags: ['NDA', 'Confidentiality', 'Partnership'],
      notes: 'Mutual agreement with 5-year confidentiality period',
      category: 'Partnership Documents',
      version: '1.3',
      downloadCount: 12,
      sharedWith: ['partner@techfirm.com'],
      expiryDate: '2029-03-10',
      associatedCase: 'PART-2024-003',
      client: 'Innovation Partners LLC',
      fileUrl: 'https://example.com/docs/nda.pdf',
      thumbnail: 'https://via.placeholder.com/100x130/10B981/FFFFFF?text=PDF',
      createdBy: 'Emily Rodriguez',
      approvedBy: 'David Kim',
      canEdit: false,
      canDelete: false,
      canShare: true,
      isConfidential: true
    },
    {
      id: '3',
      name: 'Property Lease Agreement.pdf',
      type: 'lease',
      description: 'Commercial property lease for office space downtown',
      size: '3.2 MB',
      uploadDate: '2024-03-08',
      lastModified: '2024-03-09',
      status: 'pending',
      pages: 15,
      priority: 'urgent',
      tags: ['Property', 'Lease', 'Commercial', 'Downtown'],
      notes: 'Annual lease with option to extend for additional 2 years',
      category: 'Real Estate',
      version: '1.0',
      downloadCount: 3,
      sharedWith: ['landlord@properties.com'],
      expiryDate: '2025-03-08',
      associatedCase: 'RE-2024-007',
      client: 'Metro Properties',
      fileUrl: 'https://example.com/docs/lease.pdf',
      thumbnail: 'https://via.placeholder.com/100x130/F59E0B/FFFFFF?text=PDF',
      createdBy: 'Alex Thompson',
      approvedBy: null,
      canEdit: true,
      canDelete: true,
      canShare: false,
      isConfidential: false
    },
    {
      id: '4',
      name: 'Business Partnership Agreement.pdf',
      type: 'partnership',
      description: 'Strategic partnership agreement for joint venture',
      size: '4.1 MB',
      uploadDate: '2024-03-05',
      lastModified: '2024-03-07',
      status: 'draft',
      pages: 22,
      priority: 'high',
      tags: ['Business', 'Partnership', 'Joint Venture'],
      notes: 'Draft version pending final review from both parties',
      category: 'Business Development',
      version: '0.9',
      downloadCount: 8,
      sharedWith: [],
      expiryDate: '',
      associatedCase: 'BUS-2024-012',
      client: 'Strategic Partners Inc.',
      fileUrl: 'https://example.com/docs/partnership.pdf',
      thumbnail: 'https://via.placeholder.com/100x130/8B5CF6/FFFFFF?text=PDF',
      createdBy: 'Maria Garcia',
      approvedBy: null,
      canEdit: true,
      canDelete: true,
      canShare: false,
      isConfidential: true
    },
    {
      id: '5',
      name: 'Intellectual Property License.pdf',
      type: 'license',
      description: 'Software licensing agreement for proprietary technology',
      size: '2.9 MB',
      uploadDate: '2024-03-01',
      lastModified: '2024-03-03',
      status: 'approved',
      pages: 18,
      priority: 'medium',
      tags: ['IP', 'License', 'Technology', 'Software'],
      notes: 'Exclusive licensing agreement with royalty structure',
      category: 'Intellectual Property',
      version: '2.0',
      downloadCount: 15,
      sharedWith: ['licensing@techcorp.com', 'legal@startup.com'],
      expiryDate: '2027-03-01',
      associatedCase: 'IP-2024-005',
      client: 'InnovateTech Solutions',
      fileUrl: 'https://example.com/docs/ip-license.pdf',
      thumbnail: 'https://via.placeholder.com/100x130/D4AF37/FFFFFF?text=PDF',
      createdBy: 'Robert Wilson',
      approvedBy: 'Jennifer Lee',
      canEdit: false,
      canDelete: false,
      canShare: true,
      isConfidential: true
    }
  ]);

  const filteredDocuments = documents
    .filter((document) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        document.name.toLowerCase().includes(q) ||
        document.description.toLowerCase().includes(q) ||
        document.tags.some(tag => tag.toLowerCase().includes(q)) ||
        document.client.toLowerCase().includes(q);

      const matchesFilters =
        selectedFilters.length === 0 ||
        selectedFilters.includes(document.status) ||
        selectedFilters.includes(document.type) ||
        selectedFilters.includes(document.priority);

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      if (sortBy === 'size') {
        const aSize = parseFloat(a.size.replace(/[^0-9.]/g, '')) || 0;
        const bSize = parseFloat(b.size.replace(/[^0-9.]/g, '')) || 0;
        return bSize - aSize;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: 'clamp'
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  function getDocumentStatusInfo(status) {
    return documentStatuses.find((s) => s.id === status) || documentStatuses[0];
  }

  function getDocumentTypeInfo(type) {
    return documentTypes.find((t) => t.id === type) || documentTypes[0];
  }

  function getPriorityColor(priority) {
    const priorityInfo = priorityOptions.find(p => p.id === priority);
    return priorityInfo ? priorityInfo.color : colors.textSecondary;
  }

  function handleBack() {
    if (navigation && navigation.goBack) {
      navigation.goBack();
      return;
    }
    Alert.alert('Back', 'Back pressed (no navigation provided)');
  }

  function openMenuFor(documentId) {
    setMenuVisibleFor(documentId);
  }

  function closeMenu() {
    setMenuVisibleFor(null);
  }

  function handleViewDetails(document) {
    setSelectedDocument(document);
    setShowDetailsModal(true);
    closeMenu();
  }

  function handleEdit(document) {
    setSelectedDocument(document);
    setEditForm({
      name: document.name.replace('.pdf', ''),
      type: document.type,
      description: document.description,
      priority: document.priority,
      tags: [...document.tags],
      notes: document.notes,
      category: document.category,
      version: document.version,
      expiryDate: document.expiryDate,
      associatedCase: document.associatedCase,
      client: document.client
    });
    setShowEditModal(true);
    closeMenu();
  }

  function handleDelete(document) {
    closeMenu();
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments((prev) => prev.filter((d) => d.id !== document.id));
            setLastDeleted(document);
            setSnackbar({ visible: true, text: 'Document deleted successfully' });
          }
        }
      ]
    );
  }

  function handleDownload(document) {
    setSnackbar({ visible: true, text: `Downloading ${document.name}...` });
    // Here you would implement actual download logic
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, downloadCount: doc.downloadCount + 1 }
          : doc
      )
    );
  }

  function handleShare(document) {
    Alert.alert(
      'Share Document',
      `Share "${document.name}" with others?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            setSnackbar({ visible: true, text: 'Sharing options opened...' });
            // Here you would implement sharing logic
          }
        },
      ]
    );
  }

  function handleUpload(uploadType) {
    setShowUploadModal(false);
    setSnackbar({ visible: true, text: `${uploadType} upload initiated...` });
    // Here you would implement actual upload logic
  }

  function undoDelete() {
    if (lastDeleted) {
      setDocuments((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);
      setSnackbar({ visible: true, text: 'Document restored successfully' });
    }
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function addTag() {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  }

  function removeTag(tagToRemove) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  }

  function handleAddDocument() {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Please enter document name');
      return;
    }

    const newDocument = {
      id: Date.now().toString(),
      name: form.name + '.pdf',
      type: form.type,
      description: form.description,
      size: '1.2 MB', // Mock size
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft',
      pages: Math.floor(Math.random() * 20) + 1,
      priority: form.priority,
      tags: form.tags,
      notes: form.notes,
      category: form.category,
      version: form.version,
      downloadCount: 0,
      sharedWith: [],
      expiryDate: form.expiryDate,
      associatedCase: form.associatedCase,
      client: form.client,
      fileUrl: '',
      thumbnail: `https://via.placeholder.com/100x130/${getDocumentTypeInfo(form.type).color.slice(1)}/FFFFFF?text=PDF`,
      createdBy: 'Current User',
      approvedBy: null,
      canEdit: true,
      canDelete: true,
      canShare: true,
      isConfidential: false
    };

    setDocuments((prev) => [newDocument, ...prev]);
    resetForm();
    setShowAddModal(false);
    setSnackbar({ visible: true, text: 'Document added successfully' });
  }

  function handleSaveEdit() {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      Alert.alert('Validation Error', 'Please enter document name');
      return;
    }

    setDocuments((prev) => prev.map((d) => 
      d.id === selectedDocument.id 
        ? {
            ...d,
            name: editForm.name + '.pdf',
            type: editForm.type,
            description: editForm.description,
            priority: editForm.priority,
            tags: editForm.tags,
            notes: editForm.notes,
            category: editForm.category,
            version: editForm.version,
            expiryDate: editForm.expiryDate,
            associatedCase: editForm.associatedCase,
            client: editForm.client,
            lastModified: new Date().toISOString().split('T')[0]
          }
        : d
    ));
    setShowEditModal(false);
    setEditForm(null);
    setSnackbar({ visible: true, text: 'Document updated successfully' });
  }

  function onRefresh() {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      setSnackbar({ visible: true, text: 'Documents refreshed' });
    }, 2000);
  }

  // Enhanced Document Details Modal
  function DocumentDetailsModal() {
    const [activeTab, setActiveTab] = useState('overview');

    if (!selectedDocument) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: 'information-outline' },
      { id: 'details', label: 'Details', icon: 'file-document-outline' },
      { id: 'sharing', label: 'Sharing', icon: 'share-variant-outline' },
      { id: 'history', label: 'History', icon: 'history' }
    ];

    return (
      <Modal visible={showDetailsModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <LinearGradient colors={colors.gradient.modal} style={styles.modalGradient}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowDetailsModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderCenter}>
                  <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                    {selectedDocument.name}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {getDocumentTypeInfo(selectedDocument.type).label} • {selectedDocument.size}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.modalEditButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    setTimeout(() => handleEdit(selectedDocument), 300);
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Tab Bar */}
              <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.tab,
                        activeTab === tab.id && styles.tabActive
                      ]}
                      onPress={() => setActiveTab(tab.id)}
                    >
                      <MaterialCommunityIcons 
                        name={tab.icon} 
                        size={20} 
                        color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
                      />
                      <Text style={[
                        styles.tabText,
                        activeTab === tab.id && styles.tabTextActive
                      ]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'overview' && (
                <View style={styles.tabContent}>
                  {/* Status Cards */}
                  <View style={styles.statusRow}>
                    <Surface style={[styles.statusCard, { flex: 1, marginRight: 8 }]}>
                      <View style={styles.statusCardContent}>
                        <View style={[styles.statusIcon, { backgroundColor: getDocumentStatusInfo(selectedDocument.status).color + '15' }]}>
                          <MaterialCommunityIcons 
                            name={getDocumentStatusInfo(selectedDocument.status).icon} 
                            size={20} 
                            color={getDocumentStatusInfo(selectedDocument.status).color} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Status</Text>
                        <Text style={[styles.statusValue, { color: getDocumentStatusInfo(selectedDocument.status).color }]}>
                          {getDocumentStatusInfo(selectedDocument.status).label}
                        </Text>
                      </View>
                    </Surface>

                    <Surface style={[styles.statusCard, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.statusCardContent}>
                        <View style={[styles.statusIcon, { backgroundColor: getPriorityColor(selectedDocument.priority) + '15' }]}>
                          <MaterialCommunityIcons 
                            name="flag" 
                            size={20} 
                            color={getPriorityColor(selectedDocument.priority)} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Priority</Text>
                        <Text style={[styles.statusValue, { color: getPriorityColor(selectedDocument.priority) }]}>
                          {selectedDocument.priority.charAt(0).toUpperCase() + selectedDocument.priority.slice(1)}
                        </Text>
                      </View>
                    </Surface>
                  </View>

                  {/* Document Preview */}
                  <Surface style={styles.previewCard}>
                    <Text style={styles.cardTitle}>Document Preview</Text>
                    <View style={styles.previewContainer}>
                      <View style={styles.thumbnailContainer}>
                        <MaterialCommunityIcons 
                          name={getDocumentTypeInfo(selectedDocument.type).icon} 
                          size={48} 
                          color={getDocumentTypeInfo(selectedDocument.type).color} 
                        />
                        <Text style={styles.pagesCount}>{selectedDocument.pages} pages</Text>
                      </View>
                      <View style={styles.previewInfo}>
                        <Text style={styles.previewName}>{selectedDocument.name}</Text>
                        <Text style={styles.previewSize}>{selectedDocument.size}</Text>
                        <Text style={styles.previewDate}>
                          Modified: {new Date(selectedDocument.lastModified).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </Surface>

                  {/* Description */}
                  <Surface style={styles.descriptionCard}>
                    <Text style={styles.cardTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedDocument.description}</Text>
                  </Surface>

                  {/* Tags */}
                  <Surface style={styles.tagsCard}>
                    <Text style={styles.cardTitle}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {selectedDocument.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          compact 
                          style={styles.tagChip}
                          mode="outlined"
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </Surface>

                  {/* Action Buttons */}
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.primaryActionButton, { backgroundColor: colors.info }]}
                      onPress={() => handleDownload(selectedDocument)}
                    >
                      <LinearGradient colors={colors.gradient.info} style={styles.actionButtonGradient}>
                        <MaterialCommunityIcons name="download" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Download</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {selectedDocument.canShare && (
                      <TouchableOpacity 
                        style={[styles.secondaryActionButton, { borderColor: colors.success }]}
                        onPress={() => handleShare(selectedDocument)}
                      >
                        <MaterialCommunityIcons name="share" size={20} color={colors.success} />
                        <Text style={[styles.actionButtonText, { color: colors.success }]}>Share Document</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {activeTab === 'details' && (
                <View style={styles.tabContent}>
                  <Surface style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Document Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <View style={styles.detailChipContainer}>
                        <Chip 
                          icon={getDocumentTypeInfo(selectedDocument.type).icon} 
                          compact 
                          style={styles.detailChip}
                        >
                          {getDocumentTypeInfo(selectedDocument.type).label}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{selectedDocument.category}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Version</Text>
                      <Text style={styles.detailValue}>v{selectedDocument.version}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client</Text>
                      <Text style={styles.detailValue}>{selectedDocument.client}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Associated Case</Text>
                      <Text style={styles.detailValue}>{selectedDocument.associatedCase}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Upload Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Modified</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedDocument.lastModified).toLocaleDateString()}
                      </Text>
                    </View>

                    {selectedDocument.expiryDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expiry Date</Text>
                        <Text style={[styles.detailValue, { color: colors.warning }]}>
                          {new Date(selectedDocument.expiryDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Download Count</Text>
                      <Text style={styles.detailValue}>{selectedDocument.downloadCount}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created By</Text>
                      <Text style={styles.detailValue}>{selectedDocument.createdBy}</Text>
                    </View>

                    {selectedDocument.approvedBy && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Approved By</Text>
                        <Text style={styles.detailValue}>{selectedDocument.approvedBy}</Text>
                      </View>
                    )}
                  </Surface>

                  {selectedDocument.notes && (
                    <Surface style={styles.notesCard}>
                      <Text style={styles.cardTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedDocument.notes}</Text>
                    </Surface>
                  )}
                </View>
              )}

              {activeTab === 'sharing' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>Shared With ({selectedDocument.sharedWith?.length || 0})</Text>
                  {selectedDocument.sharedWith?.map((email, index) => (
                    <Surface key={index} style={styles.sharedItem}>
                      <View style={styles.sharedIcon}>
                        <MaterialCommunityIcons 
                          name="account-outline"
                          size={24} 
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.sharedInfo}>
                        <Text style={styles.sharedEmail}>{email}</Text>
                        <Text style={styles.sharedPermission}>View & Download</Text>
                      </View>
                      <TouchableOpacity style={styles.sharedAction}>
                        <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </Surface>
                  )) || (
                    <Text style={styles.noSharingText}>Document not shared with anyone</Text>
                  )}

                  {selectedDocument.isConfidential && (
                    <Surface style={styles.confidentialBanner}>
                      <MaterialCommunityIcons name="lock" size={20} color={colors.warning} />
                      <Text style={styles.confidentialText}>This document is marked as confidential</Text>
                    </Surface>
                  )}
                </View>
              )}

              {activeTab === 'history' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>Document History</Text>
                  <Surface style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <MaterialCommunityIcons 
                        name="upload" 
                        size={20} 
                        color={colors.success} 
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyAction}>Document uploaded</Text>
                      <Text style={styles.historyDate}>{new Date(selectedDocument.uploadDate).toLocaleDateString()}</Text>
                      <Text style={styles.historyUser}>by {selectedDocument.createdBy}</Text>
                    </View>
                  </Surface>

                  {selectedDocument.lastModified !== selectedDocument.uploadDate && (
                    <Surface style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <MaterialCommunityIcons 
                          name="pencil" 
                          size={20} 
                          color={colors.info} 
                        />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyAction}>Document modified</Text>
                        <Text style={styles.historyDate}>{new Date(selectedDocument.lastModified).toLocaleDateString()}</Text>
                        <Text style={styles.historyUser}>by {selectedDocument.createdBy}</Text>
                      </View>
                    </Surface>
                  )}

                  {selectedDocument.approvedBy && (
                    <Surface style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <MaterialCommunityIcons 
                          name="check-circle" 
                          size={20} 
                          color={colors.success} 
                        />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyAction}>Document approved</Text>
                        <Text style={styles.historyDate}>{new Date(selectedDocument.lastModified).toLocaleDateString()}</Text>
                        <Text style={styles.historyUser}>by {selectedDocument.approvedBy}</Text>
                      </View>
                    </Surface>
                  )}

                  {selectedDocument.downloadCount > 0 && (
                    <Surface style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <MaterialCommunityIcons 
                          name="download" 
                          size={20} 
                          color={colors.tertiary} 
                        />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyAction}>Downloaded {selectedDocument.downloadCount} times</Text>
                        <Text style={styles.historyDate}>Latest: {new Date().toLocaleDateString()}</Text>
                      </View>
                    </Surface>
                  )}
                </View>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Add/Edit Modal
  function AddEditModal({ visible, onClose, isEdit }) {
    const [localForm, setLocalForm] = useState(isEdit ? editForm : form);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);
    const [localNewTag, setLocalNewTag] = useState('');

    useEffect(() => {
      if (visible) {
        setLocalForm(isEdit ? editForm : form);
      }
    }, [visible, isEdit, editForm, form]);

    const handleSave = () => {
      if (!localForm?.name?.trim()) {
        Alert.alert('Validation Error', 'Please enter document name');
        return;
      }

      if (isEdit) {
        setEditForm(localForm);
        handleSaveEdit();
      } else {
        setForm(localForm);
        handleAddDocument();
      }
    };

    const addLocalTag = () => {
      if (localNewTag.trim() && !localForm.tags.includes(localNewTag.trim())) {
        setLocalForm(prev => ({ ...prev, tags: [...prev.tags, localNewTag.trim()] }));
        setLocalNewTag('');
      }
    };

    const removeLocalTag = (tagToRemove) => {
      setLocalForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    if (!localForm) return null;

    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <LinearGradient colors={colors.gradient.modal} style={styles.modalGradient}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={onClose}
                >
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderCenter}>
                  <Text style={styles.modalHeaderTitle}>
                    {isEdit ? 'Edit Document' : 'Add Document'}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {isEdit ? 'Update document details' : 'Enter document information'}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={handleSave}
                >
                  <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                {/* Basic Information Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Basic Information</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Document Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.name}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, name: text }))}
                      placeholder="Enter document name (without extension)"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={localForm.description}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, description: text }))}
                      placeholder="Describe the document purpose and contents"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Type Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Document Type</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name={getDocumentTypeInfo(localForm.type).icon} 
                          size={20} 
                          color={getDocumentTypeInfo(localForm.type).color} 
                        />
                        <Text style={styles.selectorText}>
                          {getDocumentTypeInfo(localForm.type).label}
                        </Text>
                      </View>
                      <MaterialCommunityIcons 
                        name={showTypeSelector ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {showTypeSelector && (
                      <View style={styles.selectorOptions}>
                        {documentTypes.map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            style={[
                              styles.selectorOption,
                              localForm.type === type.id && styles.selectorOptionActive
                            ]}
                            onPress={() => {
                              setLocalForm(prev => ({ ...prev, type: type.id }));
                              setShowTypeSelector(false);
                            }}
                          >
                            <MaterialCommunityIcons name={type.icon} size={18} color={type.color} />
                            <Text style={styles.selectorOptionText}>{type.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Priority Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowPrioritySelector(!showPrioritySelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name="flag" 
                          size={20} 
                          color={getPriorityColor(localForm.priority)} 
                        />
                        <Text style={styles.selectorText}>
                          {localForm.priority.charAt(0).toUpperCase() + localForm.priority.slice(1)}
                        </Text>
                      </View>
                      <MaterialCommunityIcons 
                        name={showPrioritySelector ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {showPrioritySelector && (
                      <View style={styles.selectorOptions}>
                        {priorityOptions.map((priority) => (
                          <TouchableOpacity
                            key={priority.id}
                            style={[
                              styles.selectorOption,
                              localForm.priority === priority.id && styles.selectorOptionActive
                            ]}
                            onPress={() => {
                              setLocalForm(prev => ({ ...prev, priority: priority.id }));
                              setShowPrioritySelector(false);
                            }}
                          >
                            <MaterialCommunityIcons name="flag" size={18} color={priority.color} />
                            <Text style={styles.selectorOptionText}>{priority.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </Surface>

                {/* Additional Details Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Additional Details</Text>
                  
                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Category</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.category}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, category: text }))}
                        placeholder="e.g., Legal Documents"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Version</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.version}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, version: text }))}
                        placeholder="1.0"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Client</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.client}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, client: text }))}
                        placeholder="Client name"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Associated Case</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.associatedCase}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, associatedCase: text }))}
                        placeholder="Case ID"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Expiry Date (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.expiryDate}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, expiryDate: text }))}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  {/* Tags Section */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tags</Text>
                    <View style={styles.tagInputContainer}>
                      <TextInput
                        style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                        value={localNewTag}
                        onChangeText={setLocalNewTag}
                        placeholder="Add a tag"
                        placeholderTextColor={colors.textTertiary}
                        onSubmitEditing={addLocalTag}
                      />
                      <TouchableOpacity 
                        style={styles.addTagButton}
                        onPress={addLocalTag}
                      >
                        <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.tagsContainer}>
                      {localForm.tags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.removableTag}
                          onPress={() => removeLocalTag(tag)}
                        >
                          <Text style={styles.removableTagText}>{tag}</Text>
                          <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={localForm.notes}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, notes: text }))}
                      placeholder="Additional notes or comments"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </Surface>

                <View style={{ height: 100 }} />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.footerButton, styles.saveButton]}
                onPress={handleSave}
              >
                <LinearGradient colors={colors.gradient.primary} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>
                    {isEdit ? 'Update Document' : 'Add Document'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Upload Modal
  function UploadModal() {
    return (
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <BlurView intensity={20} style={styles.uploadModalOverlay}>
          <View style={styles.uploadModalContainer}>
            <LinearGradient
              colors={colors.gradient.modal}
              style={styles.uploadModalContent}
            >
              <Text style={styles.uploadModalTitle}>
                Upload Document
              </Text>
              
              <Text style={styles.uploadModalSubtitle}>
                Choose how you'd like to upload your document
              </Text>

              <View style={styles.uploadOptions}>
                {uploadMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.uploadOption}
                    onPress={() => handleUpload(method.label)}
                  >
                    <View style={[styles.uploadOptionIcon, { backgroundColor: method.color + '15' }]}>
                      <MaterialCommunityIcons 
                        name={method.icon} 
                        size={32} 
                        color={method.color} 
                      />
                    </View>
                    <Text style={styles.uploadOptionText}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.uploadCancelButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Text style={styles.uploadCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
    );
  }

  // Render Document Card
  const renderDocumentCard = ({ item, index }) => {
    const isMenuOpen = menuVisibleFor === item.id;
    const cardWidth = viewMode === 'grid' ? (width - 72) / 2 : '100%';
    const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) - new Date() < 30 * 24 * 60 * 60 * 1000;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleViewDetails(item)}
        style={{ width: cardWidth, marginRight: viewMode === 'grid' && index % 2 === 0 ? 16 : 0 }}
      >
        <Surface style={styles.documentCard}>
          <LinearGradient colors={colors.gradient.glass} style={styles.documentCardGradient}>
            <View style={styles.documentHeader}>
              <View style={styles.documentIconContainer}>
                <LinearGradient 
                  colors={[getDocumentTypeInfo(item.type).color, getDocumentTypeInfo(item.type).color + '80']} 
                  style={styles.documentIcon}
                >
                  <MaterialCommunityIcons 
                    name={getDocumentTypeInfo(item.type).icon} 
                    size={20} 
                    color="white" 
                  />
                </LinearGradient>
              </View>

              <View style={styles.documentMainInfo}>
                <View style={styles.documentTitleRow}>
                  <Text style={styles.documentTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.priorityIndicator}>
                    <View style={[
                      styles.priorityDot, 
                      { backgroundColor: getPriorityColor(item.priority) }
                    ]} />
                  </View>
                </View>

                <Text style={styles.documentClient}>{item.client}</Text>
                <Text style={styles.documentCategory}>{item.category}</Text>
              </View>

              <Menu
                visible={isMenuOpen}
                onDismiss={closeMenu}
                anchor={
                  <TouchableOpacity onPress={() => openMenuFor(item.id)} style={styles.moreButton}>
                    <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item onPress={() => handleViewDetails(item)} title="View Details" leadingIcon="eye" />
                {item.canEdit && (
                  <Menu.Item onPress={() => handleEdit(item)} title="Edit" leadingIcon="pencil" />
                )}
                <Menu.Item onPress={() => handleDownload(item)} title="Download" leadingIcon="download" />
                {item.canShare && (
                  <Menu.Item onPress={() => handleShare(item)} title="Share" leadingIcon="share" />
                )}
                <Divider />
                {item.canDelete && (
                  <Menu.Item onPress={() => handleDelete(item)} title="Delete" leadingIcon="delete" />
                )}
              </Menu>
            </View>

            <View style={styles.documentMetaContainer}>
              <View style={styles.documentMetaRow}>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.statusChip, 
                    { backgroundColor: getDocumentStatusInfo(item.status).color + '15' }
                  ]}
                  textStyle={{ 
                    color: getDocumentStatusInfo(item.status).color, 
                    fontSize: 10, 
                    fontWeight: '700' 
                  }}
                  icon={getDocumentStatusInfo(item.status).icon}
                >
                  {getDocumentStatusInfo(item.status).label}
                </Chip>

                <View style={styles.sizeContainer}>
                  <Text style={styles.documentSize}>{item.size}</Text>
                  <MaterialCommunityIcons name="file-outline" size={14} color={colors.textSecondary} />
                </View>
              </View>

              <View style={styles.documentInfoContainer}>
                <View style={styles.documentInfoItem}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.documentInfoText}>
                    {new Date(item.uploadDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.documentInfoItem}>
                  <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.documentInfoText}>{item.pages} pages</Text>
                </View>
                <View style={styles.documentInfoItem}>
                  <MaterialCommunityIcons name="download-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.documentInfoText}>{item.downloadCount}</Text>
                </View>
              </View>

              {isExpiringSoon && (
                <View style={styles.expiryWarning}>
                  <MaterialCommunityIcons name="alert" size={14} color={colors.warning} />
                  <Text style={styles.expiryText}>Expires soon</Text>
                </View>
              )}
            </View>

            <View style={styles.documentFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.tagsPreview}>
                  {item.tags.slice(0, 2).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.miniTag}>
                      <Text style={styles.miniTagText}>{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 2 && (
                    <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                  )}
                </View>

                {item.isConfidential && (
                  <View style={styles.confidentialBadge}>
                    <MaterialCommunityIcons name="lock" size={12} color={colors.warning} />
                  </View>
                )}
              </View>

              <View style={styles.footerRight}>
                <TouchableOpacity 
                  style={[styles.quickActionButton, { backgroundColor: colors.info }]}
                  onPress={() => handleDownload(item)}
                >
                  <MaterialCommunityIcons name="download" size={16} color="white" />
                  <Text style={styles.quickActionText}>Download</Text>
                </TouchableOpacity>

                {item.canShare && (
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.success, marginLeft: 8 }]}
                    onPress={() => handleShare(item)}
                  >
                    <MaterialCommunityIcons name="share" size={16} color="white" />
                    <Text style={styles.quickActionText}>Share</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient colors={colors.gradient.primary} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Legal Documents</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerAction} 
                  onPress={() => setViewMode((v) => v === 'list' ? 'grid' : 'list')}
                >
                  <MaterialCommunityIcons 
                    name={viewMode === 'list' ? 'view-grid' : 'view-list'} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{documents.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {documents.filter(d => d.status === 'approved').length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {documents.filter(d => d.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(documents.reduce((sum, d) => {
                    const size = parseFloat(d.size.replace(/[^0-9.]/g, '')) || 0;
                    return sum + size;
                  }, 0) * 10) / 10}MB
                </Text>
                <Text style={styles.statLabel}>Total Size</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.searchContainer, { opacity: searchBarOpacity }]}>
        <Surface style={styles.searchSurface}>
          <View style={styles.searchBar}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search documents, clients, tags..." 
                placeholderTextColor={colors.textSecondary} 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <LinearGradient colors={colors.gradient.primary} style={styles.filterButtonGradient}>
                <MaterialCommunityIcons name="tune" size={18} color="white" />
                {selectedFilters.length > 0 && (
                  <Badge size={16} style={styles.filterBadge}>{selectedFilters.length}</Badge>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Surface>
      </Animated.View>

      <FlatList
        data={filteredDocuments}
        key={viewMode} 
        renderItem={renderDocumentCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.documentsList}
        contentContainerStyle={styles.documentsListContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        numColumns={viewMode === 'grid' ? 2 : 1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-plus-outline" size={80} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No documents found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or upload a new document</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowUploadModal(true)}
            >
              <LinearGradient colors={colors.gradient.primary} style={styles.emptyStateButtonGradient}>
                <MaterialCommunityIcons name="upload" size={20} color="white" />
                <Text style={styles.emptyStateButtonText}>Upload Document</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      <FAB 
        style={[styles.fab, { backgroundColor: colors.secondary }]} 
        icon="plus" 
        onPress={() => setShowUploadModal(true)} 
        color="white" 
      />

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint={Platform.OS === 'ios' ? 'light' : 'dark'} style={styles.modalBlur}>
            <View style={styles.filterModal}>
              <LinearGradient colors={colors.gradient.glass} style={styles.filterModalContent}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterTitle}>Filter & Sort</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Status</Text>
                    <View style={styles.filterChips}>
                      {documentStatuses.map((status) => (
                        <TouchableOpacity 
                          key={status.id} 
                          onPress={() => setSelectedFilters(prev => 
                            prev.includes(status.id) 
                              ? prev.filter(f => f !== status.id) 
                              : [...prev, status.id]
                          )}
                        >
                          <Chip 
                            selected={selectedFilters.includes(status.id)} 
                            mode={selectedFilters.includes(status.id) ? 'flat' : 'outlined'} 
                            style={[
                              styles.filterChip, 
                              selectedFilters.includes(status.id) && { backgroundColor: status.color + '20' }
                            ]} 
                            textStyle={{ 
                              color: selectedFilters.includes(status.id) ? status.color : colors.text 
                            }}
                          >
                            {status.label}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Document Type</Text>
                    <View style={styles.filterChips}>
                      {documentTypes.map((type) => (
                        <TouchableOpacity 
                          key={type.id} 
                          onPress={() => setSelectedFilters(prev => 
                            prev.includes(type.id) 
                              ? prev.filter(f => f !== type.id) 
                              : [...prev, type.id]
                          )}
                        >
                          <Chip 
                            selected={selectedFilters.includes(type.id)} 
                            mode={selectedFilters.includes(type.id) ? 'flat' : 'outlined'} 
                            style={[
                              styles.filterChip, 
                              selectedFilters.includes(type.id) && { backgroundColor: type.color + '15' }
                            ]} 
                            textStyle={{ 
                              color: selectedFilters.includes(type.id) ? type.color : colors.text 
                            }}
                          >
                            {type.label}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Priority</Text>
                    <View style={styles.filterChips}>
                      {priorityOptions.map((priority) => (
                        <TouchableOpacity 
                          key={priority.id} 
                          onPress={() => setSelectedFilters(prev => 
                            prev.includes(priority.id) 
                              ? prev.filter(f => f !== priority.id) 
                              : [...prev, priority.id]
                          )}
                        >
                          <Chip 
                            selected={selectedFilters.includes(priority.id)} 
                            mode={selectedFilters.includes(priority.id) ? 'flat' : 'outlined'} 
                            style={[
                              styles.filterChip, 
                              selectedFilters.includes(priority.id) && { backgroundColor: priority.color + '15' }
                            ]} 
                            textStyle={{ 
                              color: selectedFilters.includes(priority.id) ? priority.color : colors.text 
                            }}
                          >
                            {priority.label}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Sort By</Text>
                    <View style={styles.sortOptions}>
                      {[
                        { id: 'date', label: 'Date', icon: 'calendar' },
                        { id: 'priority', label: 'Priority', icon: 'flag' },
                        { id: 'size', label: 'Size', icon: 'file-outline' },
                        { id: 'name', label: 'Name', icon: 'sort-alphabetical' }
                      ].map((sort) => (
                        <TouchableOpacity 
                          key={sort.id} 
                          style={[styles.sortOption, sortBy === sort.id && styles.sortOptionSelected]} 
                          onPress={() => setSortBy(sort.id)}
                        >
                          <MaterialCommunityIcons 
                            name={sort.icon} 
                            size={18} 
                            color={sortBy === sort.id ? colors.primary : colors.textSecondary} 
                          />
                          <Text style={[styles.sortOptionText, sortBy === sort.id && styles.sortOptionTextSelected]}>
                            {sort.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.filterActions}>
                  <TouchableOpacity style={styles.clearFiltersButton} onPress={() => setSelectedFilters([])}>
                    <Text style={styles.clearFiltersText}>Clear All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilterModal(false)}>
                    <LinearGradient colors={colors.gradient.primary} style={styles.applyFiltersGradient}>
                      <Text style={styles.applyFiltersText}>Apply Filters</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Add Document Modal */}
      <AddEditModal 
        visible={showAddModal} 
        onClose={() => { 
          setShowAddModal(false); 
          resetForm(); 
        }} 
        isEdit={false} 
      />

      {/* Edit Modal */}
      <AddEditModal 
        visible={showEditModal} 
        onClose={() => { 
          setShowEditModal(false); 
          setEditForm(null); 
        }} 
        isEdit={true} 
      />

      {/* Upload Modal */}
      <UploadModal />

      {/* Document Details Modal */}
      <DocumentDetailsModal />

      <Snackbar 
        visible={snackbar.visible} 
        onDismiss={() => setSnackbar({ visible: false, text: '' })} 
        action={lastDeleted ? { label: 'Undo', onPress: undoDelete } : undefined}
      >
        {snackbar.text}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: { 
    position: 'relative', 
    zIndex: 1 
  },
  headerGradient: { 
    flex: 1, 
    paddingTop: StatusBar.currentHeight + 10 || 54 
  },
  headerContent: { 
    flex: 1, 
    paddingHorizontal: 24, 
    justifyContent: 'space-between' 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: 12 
  },
  headerAction: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 10 
  },
  statItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  statValue: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 2 
  },
  statLabel: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 11, 
    fontWeight: '600' 
  },
  statDivider: { 
    width: 1, 
    height: 30, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    marginHorizontal: 16 
  },
  searchContainer: { 
    marginHorizontal: 24, 
    marginTop: -20, 
    marginBottom: 20, 
    zIndex: 2 
  },
  searchSurface: { 
    borderRadius: 16, 
    elevation: 8, 
    shadowColor: colors.cardShadow, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 4, 
    gap: 8 
  },
  searchInputContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceVariant, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48 
  },
  searchIcon: { 
    marginRight: 12 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: colors.text, 
    fontWeight: '500' 
  },
  clearSearchButton: { 
    padding: 4 
  },
  filterButton: { 
    position: 'relative' 
  },
  filterButtonGradient: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filterBadge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    backgroundColor: colors.secondary 
  },
  documentsList: { 
    flex: 1 
  },
  documentsListContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 140 
  },
  documentCard: { 
    marginBottom: 16, 
    borderRadius: 20, 
    elevation: 6, 
    shadowColor: colors.cardShadow, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.8)' 
  },
  documentCardGradient: { 
    padding: 20, 
    borderRadius: 20 
  },
  documentHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  documentIconContainer: { 
    marginRight: 16 
  },
  documentIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3 
  },
  documentMainInfo: { 
    flex: 1, 
    marginRight: 12 
  },
  documentTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  documentTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: colors.text, 
    lineHeight: 24, 
    flex: 1, 
    marginRight: 8 
  },
  priorityIndicator: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  priorityDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  documentClient: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  documentCategory: { 
    fontSize: 12, 
    color: colors.textTertiary, 
    fontWeight: '500' 
  },
  moreButton: { 
    padding: 4 
  },
  documentMetaContainer: { 
    marginBottom: 16 
  },
  documentMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  statusChip: { 
    height: 28 
  },
  sizeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.info + '15', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  documentSize: { 
    fontSize: 14, 
    color: colors.info, 
    fontWeight: '800', 
    marginRight: 6 
  },
  documentInfoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: colors.surfaceVariant, 
    borderRadius: 12, 
    padding: 12 
  },
  documentInfoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  documentInfoText: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginLeft: 4 
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8
  },
  expiryText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: 4
  },
  documentFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(100,116,139,0.1)' 
  },
  footerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  tagsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  miniTag: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4
  },
  miniTagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600'
  },
  moreTagsText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  confidentialBadge: {
    marginLeft: 8
  },
  footerRight: { 
    flexDirection: 'row',
    alignItems: 'center' 
  },
  quickActionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  quickActionText: { 
    fontSize: 11, 
    color: 'white', 
    fontWeight: '700', 
    marginLeft: 4 
  },
  fab: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    elevation: 8, 
    shadowColor: colors.secondary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8 
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 80 
  },
  emptyStateTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: colors.text, 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptyStateText: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: 24 
  },
  emptyStateButton: { 
    borderRadius: 25 
  },
  emptyStateButtonGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 25 
  },
  emptyStateButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700', 
    marginLeft: 8 
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  modalGradient: {
    flex: 1
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center'
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2
  },
  modalEditButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabContainer: {
    marginTop: 8
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12
  },
  tabActive: {
    backgroundColor: colors.primary + '10'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6
  },
  tabTextActive: {
    color: colors.primary
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24
  },
  tabContent: {
    paddingTop: 24
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 20
  },
  statusCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statusCardContent: {
    padding: 16,
    alignItems: 'center'
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700'
  },
  previewCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 12
  },
  pagesCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 8
  },
  previewInfo: {
    flex: 1
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  previewSize: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4
  },
  previewDate: {
    fontSize: 12,
    color: colors.textTertiary
  },
  detailsCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right'
  },
  detailChipContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  detailChip: {
    height: 28
  },
  descriptionCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text
  },
  tagsCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagChip: {
    marginBottom: 4
  },
  actionButtonsContainer: {
    marginBottom: 20
  },
  primaryActionButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden'
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12
  },
  notesCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20
  },
  sharedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12
  },
  sharedIcon: {
    marginRight: 16
  },
  sharedInfo: {
    flex: 1
  },
  sharedEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  sharedPermission: {
    fontSize: 12,
    color: colors.textSecondary
  },
  sharedAction: {
    padding: 8
  },
  noSharingText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 40
  },
  confidentialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 16
  },
  confidentialText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: 8
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12
  },
  historyIcon: {
    marginRight: 16
  },
  historyInfo: {
    flex: 1
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  historyUser: {
    fontSize: 12,
    color: colors.textTertiary
  },
  
  // Form Styles
  formContainer: {
    paddingTop: 24
  },
  formSection: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
  },
  inputContainer: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  textInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  selectorButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectorText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 12
  },
  selectorOptions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  selectorOptionActive: {
    backgroundColor: colors.primary + '10'
  },
  selectorOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 12
  },
  rowContainer: {
    flexDirection: 'row'
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addTagButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  removableTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)'
  },
  footerButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary
  },
  saveButton: {
    overflow: 'hidden'
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white'
  },

  // Upload Modal Styles
  uploadModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  uploadModalContainer: {
    width: width * 0.9,
    maxWidth: 400
  },
  uploadModalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center'
  },
  uploadModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.text
  },
  uploadModalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    color: colors.textSecondary
  },
  uploadOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%'
  },
  uploadOption: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16
  },
  uploadOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.text
  },
  uploadCancelButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant
  },
  uploadCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary
  },

  // Filter Modal Styles
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalBlur: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  filterModal: { 
    maxHeight: height * 0.8, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    overflow: 'hidden' 
  },
  filterModalContent: { 
    flex: 1, 
    padding: 24 
  },
  filterHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(100,116,139,0.1)' 
  },
  filterTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: colors.text 
  },
  closeButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: colors.surfaceVariant, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filterSection: { 
    marginBottom: 28 
  },
  filterSectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.text, 
    marginBottom: 12 
  },
  filterChips: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  filterChip: { 
    marginBottom: 8, 
    height: 36 
  },
  sortOptions: { 
    gap: 8 
  },
  sortOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: colors.surfaceVariant 
  },
  sortOptionSelected: { 
    backgroundColor: colors.primary + '15', 
    borderWidth: 1, 
    borderColor: colors.primary + '40' 
  },
  sortOptionText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textSecondary, 
    marginLeft: 12 
  },
  sortOptionTextSelected: { 
    color: colors.primary 
  },
  filterActions: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(100,116,139,0.1)' 
  },
  clearFiltersButton: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: colors.surfaceVariant, 
    alignItems: 'center' 
  },
  clearFiltersText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.textSecondary 
  },
  applyFiltersButton: { 
    flex: 2, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  applyFiltersGradient: { 
    padding: 16, 
    alignItems: 'center' 
  },
  applyFiltersText: { 
    fontSize: 14, 
    fontWeight: '700',
    color: 'white' 
  },
});