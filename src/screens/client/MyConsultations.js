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

const consultationStatuses = [
  { id: 'scheduled', label: 'Scheduled', color: colors.info, icon: 'calendar-clock' },
  { id: 'completed', label: 'Completed', color: colors.success, icon: 'check-circle' },
  { id: 'pending', label: 'Pending', color: colors.warning, icon: 'clock-outline' },
  { id: 'cancelled', label: 'Cancelled', color: colors.error, icon: 'close-circle' },
  { id: 'rescheduled', label: 'Rescheduled', color: colors.tertiary, icon: 'calendar-refresh' }
];

const consultationTypes = [
  { id: 'video', label: 'Video Call', icon: 'video-outline' },
  { id: 'phone', label: 'Phone Call', icon: 'phone-outline' },
  { id: 'in-person', label: 'In-Person', icon: 'account-group-outline' },
  { id: 'chat', label: 'Chat', icon: 'chat-outline' }
];

const practiceAreas = [
  { id: 'corporate', label: 'Corporate Law', icon: 'domain' },
  { id: 'civil', label: 'Civil Law', icon: 'gavel' },
  { id: 'criminal', label: 'Criminal Law', icon: 'shield-alert' },
  { id: 'family', label: 'Family Law', icon: 'account-group' },
  { id: 'property', label: 'Property Law', icon: 'home-city' },
  { id: 'intellectual', label: 'IP Law', icon: 'lightbulb' },
  { id: 'tax', label: 'Tax Law', icon: 'calculator' },
  { id: 'employment', label: 'Employment Law', icon: 'briefcase' }
];

const priorityOptions = [
  { id: 'urgent', label: 'Urgent', color: colors.error },
  { id: 'high', label: 'High', color: colors.warning },
  { id: 'medium', label: 'Medium', color: colors.info },
  { id: 'low', label: 'Low', color: colors.success }
];

export default function MyConsultations({ navigation }) {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, text: '' });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [menuVisibleFor, setMenuVisibleFor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Form states
  const emptyForm = {
    lawyerName: '',
    lawyerSpecialization: '',
    consultationType: 'video',
    date: '',
    time: '',
    duration: 30,
    topic: '',
    description: '',
    fee: '',
    priority: 'medium',
    practiceArea: 'corporate',
    meetingLink: '',
    address: '',
    notes: ''
  };
  
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);

  // Enhanced mock data
  const [consultations, setConsultations] = useState([
    {
      id: '1',
      lawyer: {
        name: 'Dr. Sarah Johnson',
        specialization: 'Corporate Law',
        rating: 4.9,
        avatar: 'https://via.placeholder.com/60x60/007AFF/FFFFFF?text=SJ',
        verified: true,
        experience: '12 years',
        email: 'sarah.johnson@lawfirm.com',
        phone: '+1 234-567-8900'
      },
      consultation: {
        type: 'video',
        date: '2024-12-15',
        time: '2:00 PM',
        duration: 45,
        fee: '₹2,500',
        topic: 'Contract Review',
        description: 'Business partnership agreement review and consultation',
        priority: 'high',
        practiceArea: 'corporate'
      },
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/abc123',
      address: '',
      documents: ['Partnership_Agreement.pdf', 'NDA.pdf'],
      notes: 'Prepare all partnership documents before the meeting.',
      canRate: false,
      canReschedule: true,
      canJoin: true,
      createdAt: '2024-11-15',
      lastUpdated: '2024-12-08',
      reminders: [
        { id: 'r1', type: 'email', time: '24h', enabled: true },
        { id: 'r2', type: 'push', time: '1h', enabled: true }
      ],
      followUpScheduled: false
    },
    {
      id: '2',
      lawyer: {
        name: 'Michael Chen',
        specialization: 'Family Law',
        rating: 4.8,
        avatar: 'https://via.placeholder.com/60x60/34C759/FFFFFF?text=MC',
        verified: true,
        experience: '8 years',
        email: 'michael.chen@lawfirm.com',
        phone: '+1 234-567-8901'
      },
      consultation: {
        type: 'in-person',
        date: '2024-12-10',
        time: '10:30 AM',
        duration: 60,
        fee: '₹3,000',
        topic: 'Divorce Proceedings',
        description: 'Initial consultation for divorce case and custody matters',
        priority: 'urgent',
        practiceArea: 'family'
      },
      status: 'completed',
      meetingLink: '',
      address: '123 Legal Plaza, Suite 400, Downtown',
      documents: ['Divorce_Petition.pdf', 'Asset_List.pdf'],
      notes: 'Discussed custody arrangements and asset division.',
      canRate: true,
      canReschedule: false,
      canJoin: false,
      createdAt: '2024-11-01',
      lastUpdated: '2024-12-10',
      reminders: [],
      followUpScheduled: true,
      rating: 0
    },
    {
      id: '3',
      lawyer: {
        name: 'Emily Rodriguez',
        specialization: 'Real Estate Law',
        rating: 4.7,
        avatar: 'https://via.placeholder.com/60x60/FF9500/FFFFFF?text=ER',
        verified: true,
        experience: '10 years',
        email: 'emily.rodriguez@lawfirm.com',
        phone: '+1 234-567-8902'
      },
      consultation: {
        type: 'phone',
        date: '2024-12-18',
        time: '4:00 PM',
        duration: 30,
        fee: '₹1,500',
        topic: 'Property Purchase',
        description: 'Legal advice on residential property purchase contract',
        priority: 'medium',
        practiceArea: 'property'
      },
      status: 'pending',
      meetingLink: '',
      address: '',
      documents: ['Property_Contract.pdf'],
      notes: 'Review property documents before consultation.',
      canRate: false,
      canReschedule: true,
      canJoin: false,
      createdAt: '2024-11-20',
      lastUpdated: '2024-12-08',
      reminders: [
        { id: 'r1', type: 'email', time: '24h', enabled: true }
      ],
      followUpScheduled: false
    }
  ]);

  const filteredConsultations = consultations
    .filter((consultation) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        consultation.lawyer.name.toLowerCase().includes(q) ||
        consultation.consultation.topic.toLowerCase().includes(q) ||
        consultation.lawyer.specialization.toLowerCase().includes(q);

      const matchesFilters =
        selectedFilters.length === 0 ||
        selectedFilters.includes(consultation.status) ||
        selectedFilters.includes(consultation.consultation.type) ||
        selectedFilters.includes(consultation.consultation.priority);

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.consultation.date) - new Date(a.consultation.date);
      }
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (order[b.consultation.priority] || 0) - (order[a.consultation.priority] || 0);
      }
      if (sortBy === 'fee') {
        const aFee = parseInt(a.consultation.fee.replace(/[^0-9]/g, '')) || 0;
        const bFee = parseInt(b.consultation.fee.replace(/[^0-9]/g, '')) || 0;
        return bFee - aFee;
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

  function getConsultationStatusInfo(status) {
    return consultationStatuses.find((s) => s.id === status) || consultationStatuses[0];
  }

  function getConsultationTypeInfo(type) {
    return consultationTypes.find((t) => t.id === type) || consultationTypes[0];
  }

  function getPracticeAreaInfo(area) {
    return practiceAreas.find((p) => p.id === area) || practiceAreas[0];
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

  function openMenuFor(consultationId) {
    setMenuVisibleFor(consultationId);
  }

  function closeMenu() {
    setMenuVisibleFor(null);
  }

  function handleViewDetails(consultation) {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
    closeMenu();
  }

  function handleEdit(consultation) {
    setSelectedConsultation(consultation);
    setEditForm({
      lawyerName: consultation.lawyer.name,
      lawyerSpecialization: consultation.lawyer.specialization,
      consultationType: consultation.consultation.type,
      date: consultation.consultation.date,
      time: consultation.consultation.time,
      duration: consultation.consultation.duration,
      topic: consultation.consultation.topic,
      description: consultation.consultation.description,
      fee: consultation.consultation.fee,
      priority: consultation.consultation.priority,
      practiceArea: consultation.consultation.practiceArea,
      meetingLink: consultation.meetingLink || '',
      address: consultation.address || '',
      notes: consultation.notes || ''
    });
    setShowEditModal(true);
    closeMenu();
  }

  function handleDelete(consultation) {
    closeMenu();
    Alert.alert(
      'Cancel Consultation',
      `Are you sure you want to cancel "${consultation.consultation.topic}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setConsultations((prev) => prev.filter((c) => c.id !== consultation.id));
            setLastDeleted(consultation);
            setSnackbar({ visible: true, text: 'Consultation cancelled successfully' });
          }
        }
      ]
    );
  }

  function handleJoinMeeting(consultation) {
    Alert.alert(
      'Join Meeting',
      `Join your ${consultation.consultation.type} consultation with ${consultation.lawyer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            setSnackbar({ visible: true, text: 'Joining consultation...' });
            // Here you would implement actual meeting join logic
          }
        },
      ]
    );
  }

  function handleReschedule(consultation) {
    Alert.alert(
      'Reschedule Consultation',
      'Would you like to reschedule this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reschedule', 
          onPress: () => {
            setSnackbar({ visible: true, text: 'Rescheduling options opened...' });
            // Here you would implement rescheduling logic
          }
        },
      ]
    );
  }

  function handleRating(consultationId, ratingValue) {
    setConsultations(prev => 
      prev.map(item => 
        item.id === consultationId 
          ? { ...item, rating: ratingValue, canRate: false }
          : item
      )
    );
    setShowRatingModal(false);
    setRating(0);
    setSnackbar({ visible: true, text: 'Rating submitted successfully' });
  }

  function undoDelete() {
    if (lastDeleted) {
      setConsultations((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);
      setSnackbar({ visible: true, text: 'Consultation restored successfully' });
    }
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function handleAddConsultation() {
    if (!form.lawyerName.trim() || !form.topic.trim()) {
      Alert.alert('Validation Error', 'Please enter lawyer name and consultation topic');
      return;
    }

    const newConsultation = {
      id: Date.now().toString(),
      lawyer: {
        name: form.lawyerName,
        specialization: form.lawyerSpecialization,
        rating: 0,
        avatar: `https://via.placeholder.com/60x60/007AFF/FFFFFF?text=${form.lawyerName.charAt(0)}`,
        verified: false,
        experience: 'Not specified',
        email: '',
        phone: ''
      },
      consultation: {
        type: form.consultationType,
        date: form.date,
        time: form.time,
        duration: form.duration,
        fee: form.fee,
        topic: form.topic,
        description: form.description,
        priority: form.priority,
        practiceArea: form.practiceArea
      },
      status: 'scheduled',
      meetingLink: form.meetingLink,
      address: form.address,
      documents: [],
      notes: form.notes,
      canRate: false,
      canReschedule: true,
      canJoin: form.consultationType === 'video',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      reminders: [],
      followUpScheduled: false
    };

    setConsultations((prev) => [newConsultation, ...prev]);
    resetForm();
    setShowAddModal(false);
    setSnackbar({ visible: true, text: 'Consultation scheduled successfully' });
  }

  function handleSaveEdit() {
    if (!editForm) return;
    if (!editForm.lawyerName.trim() || !editForm.topic.trim()) {
      Alert.alert('Validation Error', 'Please enter lawyer name and consultation topic');
      return;
    }

    setConsultations((prev) => prev.map((c) => 
      c.id === selectedConsultation.id 
        ? {
            ...c,
            lawyer: {
              ...c.lawyer,
              name: editForm.lawyerName,
              specialization: editForm.lawyerSpecialization
            },
            consultation: {
              ...c.consultation,
              type: editForm.consultationType,
              date: editForm.date,
              time: editForm.time,
              duration: editForm.duration,
              topic: editForm.topic,
              description: editForm.description,
              fee: editForm.fee,
              priority: editForm.priority,
              practiceArea: editForm.practiceArea
            },
            meetingLink: editForm.meetingLink,
            address: editForm.address,
            notes: editForm.notes,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : c
    ));
    setShowEditModal(false);
    setEditForm(null);
    setSnackbar({ visible: true, text: 'Consultation updated successfully' });
  }

  function onRefresh() {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      setSnackbar({ visible: true, text: 'Consultations refreshed' });
    }, 2000);
  }

  // Enhanced Consultation Details Modal
  function ConsultationDetailsModal() {
    const [activeTab, setActiveTab] = useState('overview');

    if (!selectedConsultation) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: 'information-outline' },
      { id: 'lawyer', label: 'Lawyer', icon: 'account-tie' },
      { id: 'documents', label: 'Documents', icon: 'file-document-outline' },
      { id: 'reminders', label: 'Reminders', icon: 'bell-outline' }
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
                    {selectedConsultation.consultation.topic}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {selectedConsultation.lawyer.name}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.modalEditButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    setTimeout(() => handleEdit(selectedConsultation), 300);
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
                        <View style={[styles.statusIcon, { backgroundColor: getConsultationStatusInfo(selectedConsultation.status).color + '15' }]}>
                          <MaterialCommunityIcons 
                            name={getConsultationStatusInfo(selectedConsultation.status).icon} 
                            size={20} 
                            color={getConsultationStatusInfo(selectedConsultation.status).color} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Status</Text>
                        <Text style={[styles.statusValue, { color: getConsultationStatusInfo(selectedConsultation.status).color }]}>
                          {getConsultationStatusInfo(selectedConsultation.status).label}
                        </Text>
                      </View>
                    </Surface>

                    <Surface style={[styles.statusCard, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.statusCardContent}>
                        <View style={[styles.statusIcon, { backgroundColor: getPriorityColor(selectedConsultation.consultation.priority) + '15' }]}>
                          <MaterialCommunityIcons 
                            name="flag" 
                            size={20} 
                            color={getPriorityColor(selectedConsultation.consultation.priority)} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Priority</Text>
                        <Text style={[styles.statusValue, { color: getPriorityColor(selectedConsultation.consultation.priority) }]}>
                          {selectedConsultation.consultation.priority.charAt(0).toUpperCase() + selectedConsultation.consultation.priority.slice(1)}
                        </Text>
                      </View>
                    </Surface>
                  </View>

                  {/* Consultation Details */}
                  <Surface style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Consultation Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Topic</Text>
                      <Text style={styles.detailValue}>{selectedConsultation.consultation.topic}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <View style={styles.detailChipContainer}>
                        <Chip 
                          icon={getConsultationTypeInfo(selectedConsultation.consultation.type).icon} 
                          compact 
                          style={styles.detailChip}
                        >
                          {getConsultationTypeInfo(selectedConsultation.consultation.type).label}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Practice Area</Text>
                      <View style={styles.detailChipContainer}>
                        <Chip 
                          icon={getPracticeAreaInfo(selectedConsultation.consultation.practiceArea).icon} 
                          compact 
                          style={styles.detailChip}
                        >
                          {getPracticeAreaInfo(selectedConsultation.consultation.practiceArea).label}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fee</Text>
                      <Text style={[styles.detailValue, styles.valueText]}>{selectedConsultation.consultation.fee}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {selectedConsultation.consultation.date} at {selectedConsultation.consultation.time}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>{selectedConsultation.consultation.duration} minutes</Text>
                    </View>

                    {selectedConsultation.address && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{selectedConsultation.address}</Text>
                      </View>
                    )}
                  </Surface>

                  {/* Description */}
                  <Surface style={styles.descriptionCard}>
                    <Text style={styles.cardTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedConsultation.consultation.description}</Text>
                  </Surface>

                  {/* Action Buttons */}
                  <View style={styles.actionButtonsContainer}>
                    {selectedConsultation.canJoin && (
                      <TouchableOpacity 
                        style={[styles.primaryActionButton, { backgroundColor: colors.success }]}
                        onPress={() => handleJoinMeeting(selectedConsultation)}
                      >
                        <LinearGradient colors={colors.gradient.success} style={styles.actionButtonGradient}>
                          <MaterialCommunityIcons name="video" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Join Meeting</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {selectedConsultation.canReschedule && (
                      <TouchableOpacity 
                        style={[styles.secondaryActionButton, { borderColor: colors.warning }]}
                        onPress={() => handleReschedule(selectedConsultation)}
                      >
                        <MaterialCommunityIcons name="calendar-refresh" size={20} color={colors.warning} />
                        <Text style={[styles.actionButtonText, { color: colors.warning }]}>Reschedule</Text>
                      </TouchableOpacity>
                    )}

                    {selectedConsultation.canRate && (
                      <TouchableOpacity 
                        style={[styles.secondaryActionButton, { borderColor: colors.secondary }]}
                        onPress={() => {
                          setShowDetailsModal(false);
                          setTimeout(() => setShowRatingModal(true), 300);
                        }}
                      >
                        <MaterialCommunityIcons name="star-outline" size={20} color={colors.secondary} />
                        <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Rate Lawyer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {activeTab === 'lawyer' && (
                <View style={styles.tabContent}>
                  <Surface style={styles.lawyerCard}>
                    <View style={styles.lawyerHeader}>
                      <Avatar.Image 
                        size={80} 
                        source={{ uri: selectedConsultation.lawyer.avatar }} 
                        style={styles.lawyerAvatar}
                      />
                      <View style={styles.lawyerInfo}>
                        <View style={styles.lawyerNameRow}>
                          <Text style={styles.lawyerName}>{selectedConsultation.lawyer.name}</Text>
                          {selectedConsultation.lawyer.verified && (
                            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.info} />
                          )}
                        </View>
                        <Text style={styles.lawyerSpecialization}>{selectedConsultation.lawyer.specialization}</Text>
                        <View style={styles.lawyerRating}>
                          <MaterialCommunityIcons name="star" size={16} color={colors.secondary} />
                          <Text style={styles.ratingText}>{selectedConsultation.lawyer.rating}</Text>
                          <Text style={styles.experienceText}>• {selectedConsultation.lawyer.experience}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.contactInfo}>
                      {selectedConsultation.lawyer.email && (
                        <TouchableOpacity style={styles.contactItem}>
                          <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                          <Text style={styles.contactText}>{selectedConsultation.lawyer.email}</Text>
                        </TouchableOpacity>
                      )}
                      
                      {selectedConsultation.lawyer.phone && (
                        <TouchableOpacity style={styles.contactItem}>
                          <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
                          <Text style={styles.contactText}>{selectedConsultation.lawyer.phone}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Surface>
                </View>
              )}

              {activeTab === 'documents' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>Documents ({selectedConsultation.documents?.length || 0})</Text>
                  {selectedConsultation.documents?.map((doc, index) => (
                    <Surface key={index} style={styles.documentItem}>
                      <View style={styles.documentIcon}>
                        <MaterialCommunityIcons 
                          name="file-pdf-box"
                          size={24} 
                          color={colors.error}
                        />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentName}>{doc}</Text>
                        <Text style={styles.documentSize}>PDF Document</Text>
                      </View>
                      <TouchableOpacity style={styles.documentAction}>
                        <MaterialCommunityIcons name="download" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </Surface>
                  )) || (
                    <Text style={styles.noDocumentsText}>No documents available</Text>
                  )}
                </View>
              )}

              {activeTab === 'reminders' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>Reminders</Text>
                  {selectedConsultation.reminders?.length > 0 ? (
                    selectedConsultation.reminders.map((reminder) => (
                      <Surface key={reminder.id} style={styles.reminderItem}>
                        <View style={styles.reminderIcon}>
                          <MaterialCommunityIcons 
                            name={reminder.type === 'email' ? 'email' : 'bell'} 
                            size={20} 
                            color={reminder.enabled ? colors.success : colors.textTertiary} 
                          />
                        </View>
                        <View style={styles.reminderInfo}>
                          <Text style={styles.reminderText}>
                            {reminder.type === 'email' ? 'Email' : 'Push'} notification
                          </Text>
                          <Text style={styles.reminderTime}>{reminder.time} before consultation</Text>
                        </View>
                        <View style={styles.reminderStatus}>
                          <Chip 
                            compact 
                            style={[
                              styles.statusChip,
                              { backgroundColor: (reminder.enabled ? colors.success : colors.textTertiary) + '15' }
                            ]}
                            textStyle={{ 
                              color: reminder.enabled ? colors.success : colors.textTertiary,
                              fontSize: 10 
                            }}
                          >
                            {reminder.enabled ? 'Active' : 'Disabled'}
                          </Chip>
                        </View>
                      </Surface>
                    ))
                  ) : (
                    <Text style={styles.noRemindersText}>No reminders set</Text>
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
    const [showPracticeAreaSelector, setShowPracticeAreaSelector] = useState(false);
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);

    useEffect(() => {
      if (visible) {
        setLocalForm(isEdit ? editForm : form);
      }
    }, [visible, isEdit, editForm, form]);

    const handleSave = () => {
      if (!localForm?.lawyerName?.trim() || !localForm?.topic?.trim()) {
        Alert.alert('Validation Error', 'Please enter lawyer name and consultation topic');
        return;
      }

      if (isEdit) {
        setEditForm(localForm);
        handleSaveEdit();
      } else {
        setForm(localForm);
        handleAddConsultation();
      }
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
                    {isEdit ? 'Edit Consultation' : 'Schedule Consultation'}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {isEdit ? 'Update consultation details' : 'Enter consultation information'}
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
                {/* Lawyer Information Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Lawyer Information</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Lawyer Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.lawyerName}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, lawyerName: text }))}
                      placeholder="Enter lawyer name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Specialization</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.lawyerSpecialization}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, lawyerSpecialization: text }))}
                      placeholder="Enter specialization"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </Surface>

                {/* Consultation Details Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Consultation Details</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Topic *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.topic}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, topic: text }))}
                      placeholder="Enter consultation topic"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={localForm.description}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, description: text }))}
                      placeholder="Describe your consultation requirements"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Type Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Consultation Type</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name={getConsultationTypeInfo(localForm.consultationType).icon} 
                          size={20} 
                          color={colors.primary} 
                        />
                        <Text style={styles.selectorText}>
                          {getConsultationTypeInfo(localForm.consultationType).label}
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
                        {consultationTypes.map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            style={[
                              styles.selectorOption,
                              localForm.consultationType === type.id && styles.selectorOptionActive
                            ]}
                            onPress={() => {
                              setLocalForm(prev => ({ ...prev, consultationType: type.id }));
                              setShowTypeSelector(false);
                            }}
                          >
                            <MaterialCommunityIcons name={type.icon} size={18} color={colors.primary} />
                            <Text style={styles.selectorOptionText}>{type.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Practice Area Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Practice Area</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowPracticeAreaSelector(!showPracticeAreaSelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name={getPracticeAreaInfo(localForm.practiceArea).icon} 
                          size={20} 
                          color={colors.primary} 
                        />
                        <Text style={styles.selectorText}>
                          {getPracticeAreaInfo(localForm.practiceArea).label}
                        </Text>
                      </View>
                      <MaterialCommunityIcons 
                        name={showPracticeAreaSelector ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {showPracticeAreaSelector && (
                      <View style={styles.selectorOptions}>
                        {practiceAreas.map((area) => (
                          <TouchableOpacity
                            key={area.id}
                            style={[
                              styles.selectorOption,
                              localForm.practiceArea === area.id && styles.selectorOptionActive
                            ]}
                            onPress={() => {
                              setLocalForm(prev => ({ ...prev, practiceArea: area.id }));
                              setShowPracticeAreaSelector(false);
                            }}
                          >
                            <MaterialCommunityIcons name={area.icon} size={18} color={colors.primary} />
                            <Text style={styles.selectorOptionText}>{area.label}</Text>
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

                {/* Schedule & Payment Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Schedule & Payment</Text>
                  
                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Date</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.date}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, date: text }))}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Time</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.time}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, time: text }))}
                        placeholder="HH:MM AM/PM"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Duration (minutes)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={String(localForm.duration)}
                        onChangeText={(text) => {
                          const duration = parseInt(text) || 30;
                          setLocalForm(prev => ({ ...prev, duration }));
                        }}
                        placeholder="30"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Fee</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.fee}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, fee: text }))}
                        placeholder="₹0"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>

                  {localForm.consultationType === 'video' && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Meeting Link</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.meetingLink}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, meetingLink: text }))}
                        placeholder="https://meet.example.com/..."
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  )}

                  {localForm.consultationType === 'in-person' && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Address</Text>
                      <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={localForm.address}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, address: text }))}
                        placeholder="Enter meeting address"
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={localForm.notes}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, notes: text }))}
                      placeholder="Additional notes or requirements"
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
                    {isEdit ? 'Update Consultation' : 'Schedule Consultation'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Rating Modal
  function RatingModal() {
    return (
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <BlurView intensity={20} style={styles.ratingModalOverlay}>
          <View style={styles.ratingModalContainer}>
            <LinearGradient
              colors={colors.gradient.modal}
              style={styles.ratingModalContent}
            >
              <Text style={styles.ratingModalTitle}>
                Rate Your Consultation
              </Text>
              
              {selectedConsultation && (
                <Text style={styles.ratingModalSubtitle}>
                  How was your consultation with {selectedConsultation.lawyer.name}?
                </Text>
              )}

              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <MaterialCommunityIcons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? colors.secondary : colors.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.ratingActions}>
                <TouchableOpacity
                  style={styles.ratingCancelButton}
                  onPress={() => {
                    setShowRatingModal(false);
                    setRating(0);
                  }}
                >
                  <Text style={styles.ratingCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.ratingSubmitButton,
                    { 
                      backgroundColor: rating > 0 ? colors.primary : colors.textTertiary,
                      opacity: rating > 0 ? 1 : 0.5,
                    }
                  ]}
                  onPress={() => selectedConsultation && handleRating(selectedConsultation.id, rating)}
                  disabled={rating === 0}
                >
                  <Text style={styles.ratingSubmitButtonText}>Submit Rating</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
    );
  }

  // Render Consultation Card
  const renderConsultationCard = ({ item, index }) => {
    const isMenuOpen = menuVisibleFor === item.id;
    const cardWidth = viewMode === 'grid' ? (width - 72) / 2 : '100%';
    const canJoin = item.canJoin && new Date(`${item.consultation.date} ${item.consultation.time}`).getTime() - Date.now() < 900000;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleViewDetails(item)}
        style={{ width: cardWidth, marginRight: viewMode === 'grid' && index % 2 === 0 ? 16 : 0 }}
      >
        <Surface style={styles.consultationCard}>
          <LinearGradient colors={colors.gradient.glass} style={styles.consultationCardGradient}>
            <View style={styles.consultationHeader}>
              <View style={styles.consultationIconContainer}>
                <LinearGradient colors={colors.gradient.primary} style={styles.consultationIcon}>
                  <MaterialCommunityIcons 
                    name={getConsultationTypeInfo(item.consultation.type).icon} 
                    size={20} 
                    color="white" 
                  />
                </LinearGradient>
              </View>

              <View style={styles.consultationMainInfo}>
                <View style={styles.consultationTitleRow}>
                  <Text style={styles.consultationTitle} numberOfLines={2}>
                    {item.consultation.topic}
                  </Text>
                  <View style={styles.priorityIndicator}>
                    <View style={[
                      styles.priorityDot, 
                      { backgroundColor: getPriorityColor(item.consultation.priority) }
                    ]} />
                  </View>
                </View>

                <Text style={styles.consultationLawyer}>{item.lawyer.name}</Text>
                <Text style={styles.consultationSpecialization}>{item.lawyer.specialization}</Text>
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
                <Menu.Item onPress={() => handleEdit(item)} title="Edit" leadingIcon="pencil" />
                {item.canJoin && (
                  <Menu.Item onPress={() => handleJoinMeeting(item)} title="Join Meeting" leadingIcon="video" />
                )}
                {item.canReschedule && (
                  <Menu.Item onPress={() => handleReschedule(item)} title="Reschedule" leadingIcon="calendar-refresh" />
                )}
                <Divider />
                <Menu.Item onPress={() => handleDelete(item)} title="Cancel" leadingIcon="close" />
              </Menu>
            </View>

            <View style={styles.consultationMetaContainer}>
              <View style={styles.consultationMetaRow}>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.statusChip, 
                    { backgroundColor: getConsultationStatusInfo(item.status).color + '15' }
                  ]}
                  textStyle={{ 
                    color: getConsultationStatusInfo(item.status).color, 
                    fontSize: 10, 
                    fontWeight: '700' 
                  }}
                  icon={getConsultationStatusInfo(item.status).icon}
                >
                  {getConsultationStatusInfo(item.status).label}
                </Chip>

                <View style={styles.feeContainer}>
                  <Text style={styles.consultationFee}>{item.consultation.fee}</Text>
                  <MaterialCommunityIcons name="currency-inr" size={14} color={colors.success} />
                </View>
              </View>

              <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.timeText}>{item.consultation.date}</Text>
                </View>
                <View style={styles.timeItem}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.timeText}>{item.consultation.time}</Text>
                </View>
                <View style={styles.timeItem}>
                  <MaterialCommunityIcons name="timer-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.timeText}>{item.consultation.duration}m</Text>
                </View>
              </View>
            </View>

            <View style={styles.consultationFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.lawyerRatingContainer}>
                  <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
                  <Text style={styles.lawyerRatingText}>{item.lawyer.rating}</Text>
                  {item.lawyer.verified && (
                    <MaterialCommunityIcons name="check-decagram" size={14} color={colors.info} />
                  )}
                </View>

                <View style={styles.documentsInfo}>
                  <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.documentsText}>{item.documents.length} docs</Text>
                </View>
              </View>

              <View style={styles.footerRight}>
                {canJoin && (
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.success }]}
                    onPress={() => handleJoinMeeting(item)}
                  >
                    <MaterialCommunityIcons name="video" size={16} color="white" />
                    <Text style={styles.quickActionText}>Join</Text>
                  </TouchableOpacity>
                )}

                {item.canReschedule && !canJoin && (
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.warning }]}
                    onPress={() => handleReschedule(item)}
                  >
                    <MaterialCommunityIcons name="calendar-refresh" size={16} color="white" />
                    <Text style={styles.quickActionText}>Reschedule</Text>
                  </TouchableOpacity>
                )}

                {item.canRate && (
                  <TouchableOpacity 
                    style={[styles.quickActionButton, { backgroundColor: colors.secondary }]}
                    onPress={() => {
                      setSelectedConsultation(item);
                      setShowRatingModal(true);
                    }}
                  >
                    <MaterialCommunityIcons name="star" size={16} color="white" />
                    <Text style={styles.quickActionText}>Rate</Text>
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
              <Text style={styles.headerTitle}>My Consultations</Text>
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
                <Text style={styles.statValue}>{consultations.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {consultations.filter(c => c.status === 'scheduled').length}
                </Text>
                <Text style={styles.statLabel}>Scheduled</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {consultations.filter(c => c.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ₹{Math.round(consultations.reduce((s, c) => {
                    const fee = parseInt(c.consultation.fee.replace(/[^0-9]/g, '')) || 0;
                    return s + fee;
                  }, 0) / 1000)}K
                </Text>
                <Text style={styles.statLabel}>Total Fees</Text>
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
                placeholder="Search consultations, lawyers, topics..." 
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
        data={filteredConsultations}
        key={viewMode} 
        renderItem={renderConsultationCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.consultationsList}
        contentContainerStyle={styles.consultationsListContent}
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
            <MaterialCommunityIcons name="calendar-search" size={80} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No consultations found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or schedule a new consultation</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowAddModal(true)}
            >
              <LinearGradient colors={colors.gradient.primary} style={styles.emptyStateButtonGradient}>
                <MaterialCommunityIcons name="plus" size={20} color="white" />
                <Text style={styles.emptyStateButtonText}>Schedule Consultation</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      <FAB 
        style={[styles.fab, { backgroundColor: colors.secondary }]} 
        icon="plus" 
        onPress={() => setShowAddModal(true)} 
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
                      {consultationStatuses.map((status) => (
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
                    <Text style={styles.filterSectionTitle}>Consultation Type</Text>
                    <View style={styles.filterChips}>
                      {consultationTypes.map((type) => (
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
                              selectedFilters.includes(type.id) && { backgroundColor: colors.primary + '15' }
                            ]} 
                            textStyle={{ 
                              color: selectedFilters.includes(type.id) ? colors.primary : colors.text 
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
                        { id: 'fee', label: 'Fee', icon: 'currency-inr' }
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

      {/* Add Consultation Modal */}
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

      {/* Consultation Details Modal */}
      <ConsultationDetailsModal />

      {/* Rating Modal */}
      <RatingModal />

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
  consultationsList: { 
    flex: 1 
  },
  consultationsListContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 140 
  },
  consultationCard: { 
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
  consultationCardGradient: { 
    padding: 20, 
    borderRadius: 20 
  },
  consultationHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  consultationIconContainer: { 
    marginRight: 16 
  },
  consultationIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3 
  },
  consultationMainInfo: { 
    flex: 1, 
    marginRight: 12 
  },
  consultationTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  consultationTitle: { 
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
  consultationLawyer: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  consultationSpecialization: { 
    fontSize: 12, 
    color: colors.textTertiary, 
    fontWeight: '500' 
  },
  moreButton: { 
    padding: 4 
  },
  consultationMetaContainer: { 
    marginBottom: 16 
  },
  consultationMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  statusChip: { 
    height: 28 
  },
  feeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.success + '15', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  consultationFee: { 
    fontSize: 14, 
    color: colors.success, 
    fontWeight: '800', 
    marginRight: 6 
  },
  timeContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: colors.surfaceVariant, 
    borderRadius: 12, 
    padding: 12 
  },
  timeItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  timeText: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginLeft: 4 
  },
  consultationFooter: { 
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
  lawyerRatingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 16 
  },
  lawyerRatingText: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginLeft: 4, 
    marginRight: 6 
  },
  documentsInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  documentsText: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginLeft: 4 
  },
  footerRight: { 
    alignItems: 'flex-end' 
  },
  quickActionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginLeft: 8 
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
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
  valueText: {
    color: colors.success,
    fontWeight: '800'
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
  lawyerCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    marginBottom: 20
  },
  lawyerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  lawyerAvatar: {
    marginRight: 16
  },
  lawyerInfo: {
    flex: 1
  },
  lawyerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  lawyerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8
  },
  lawyerSpecialization: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8
  },
  lawyerRating: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4
  },
  experienceText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
    marginLeft: 4
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 16
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 8
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20
  },
  documentItem: {
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
  documentIcon: {
    marginRight: 16
  },
  documentInfo: {
    flex: 1
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  documentSize: {
    fontSize: 12,
    color: colors.textSecondary
  },
  documentAction: {
    padding: 8
  },
  noDocumentsText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 40
  },
  reminderItem: {
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
  reminderIcon: {
    marginRight: 16
  },
  reminderInfo: {
    flex: 1
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  reminderTime: {
    fontSize: 12,
    color: colors.textSecondary
  },
  reminderStatus: {
    alignItems: 'flex-end'
  },
  noRemindersText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 40
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

  // Rating Modal Styles
  ratingModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  ratingModalContainer: {
    width: width * 0.9,
    maxWidth: 400
  },
  ratingModalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center'
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.text
  },
  ratingModalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    color: colors.textSecondary
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8
  },
  starButton: {
    padding: 4
  },
  ratingActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  ratingCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant
  },
  ratingCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary
  },
  ratingSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  ratingSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
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