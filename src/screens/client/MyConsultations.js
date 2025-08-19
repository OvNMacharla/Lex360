import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  KeyboardAvoidingView
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
  RadioButton,
  Checkbox
} from 'react-native-paper';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createConsultation, getUserConsultations, selectConsultations } from '../../store/consultationSlice';

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
    error: ['#EF4444', '#DC2626', '#B91C1C']
  }
};

export default function MyConsultations() {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('clients'); // clients, consultations, requests
  const [clients, setClients] = useState(resource?resource:[]);
  const [consultations, setConsultations] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));
  const { resource } = route.params || {};
  // Schedule consultation form state
  const [scheduleForm, setScheduleForm] = useState({
    clientId: '',
    clientName: '',
    date: new Date(),
    time: '',
    duration: '60',
    type: 'online',
    subject: '',
    description: '',
    fee: '',
    urgent: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const mockConsultationRequests = [
    {
      id: 'r1',
      clientName: 'StartupX Ltd.',
      email: 'founder@startupx.com',
      phone: '+91 98765 12345',
      subject: 'IPO Legal Consultation',
      description: 'Need urgent consultation regarding IPO compliance and regulatory requirements. We are planning to go public in Q4 2025.',
      preferredDate: '2025-08-22',
      preferredTime: '11:00 AM',
      type: 'online',
      urgency: 'high',
      estimatedDuration: '120 minutes',
      budget: 100000,
      status: 'pending',
      requestedAt: '2025-08-15T10:30:00Z',
      category: 'Securities Law'
    },
    {
      id: 'r2',
      clientName: 'Global Tech Inc.',
      email: 'legal@globaltech.com',
      phone: '+91 87654 98765',
      subject: 'Contract Negotiation Support',
      description: 'Require assistance with international contract negotiations. Multiple stakeholders involved.',
      preferredDate: '2025-08-21',
      preferredTime: '3:00 PM',
      type: 'offline',
      urgency: 'medium',
      estimatedDuration: '90 minutes',
      budget: 60000,
      status: 'pending',
      requestedAt: '2025-08-14T15:45:00Z',
      category: 'Contract Law'
    }
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.uid || !user?.role) return;
    setLoading(true);
    
    try {
      const [consultationResult] = await Promise.all([
        dispatch(getUserConsultations({userId:user?.uid,role:user?.role})).unwrap()
      ]);
      console.log(consultationResult,'conssssssssssssssss')
      setClients(resource);
      setConsultations(consultationResult);
      setConsultationRequests(mockConsultationRequests);
    } catch (error) {
      console.error('Failed to fetch cases:', error);

      Alert.alert('Error', 'Failed to fetch cases');
    }
    setLoading(false);
  }, [dispatch, user?.uid, user?.role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtered and searched data
  const filteredClients = useMemo(() => {
    let filtered = clients;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [clients, filterStatus, searchQuery]);

  const filteredConsultations = useMemo(() => {
    let filtered = consultations;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(consultation =>
        consultation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [consultations, filterStatus, searchQuery]);

  const filteredRequests = useMemo(() => {
    let filtered = consultationRequests;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [consultationRequests, filterStatus, searchQuery]);

  // Tab configuration
  const tabs = [
    { 
      key: 'clients', 
      label: 'Active Clients', 
      icon: 'account-group', 
      count: filteredClients.length,
      gradient: colors.gradient.primary 
    },
    { 
      key: 'consultations', 
      label: 'Consultations', 
      icon: 'calendar-star', 
      count: filteredConsultations.length,
      gradient: colors.gradient.info 
    },
    { 
      key: 'requests', 
      label: 'Requests', 
      icon: 'bell-ring', 
      count: filteredRequests.filter(r => r.status === 'pending').length,
      gradient: colors.gradient.gold 
    }
  ];

  // Handle consultation scheduling
  const handleScheduleConsultation = (client = null) => {
    if (client) {
      setScheduleForm(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name
      }));
    }
    setShowScheduleModal(true);
  };

  const submitConsultationSchedule = async () => {
    try {
      // --- Validation ---
      if (!scheduleForm.clientName || !scheduleForm.subject || !scheduleForm.time) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // --- Prepare consultation object ---
      const newConsultation = {
        clientId: user?.clientId,
        clientName: scheduleForm.clientName,
        date: scheduleForm.date.toISOString().split('T')[0],
        time: scheduleForm.time,
        duration: `${scheduleForm.duration} minutes`,
        type: scheduleForm.type,
        status: 'scheduled',
        subject: scheduleForm.subject,
        fee: parseInt(scheduleForm.fee) || 0,
        meetingLink: scheduleForm.type === 'online' 
          ? 'https://meet.google.com/generated-link' 
          : null,
        notes: scheduleForm.description,
        urgent: scheduleForm.urgent || false,
        createdAt: new Date().toISOString(),
        ...(user?.role === 'lawyer' && { lawyerId: user?.uid }),
        ...(user?.role === 'client' && { clientId: user?.uid }),
        ...(user?.role === 'firm'   && { firmId: user?.uid }),
      };

      // --- Save to Firestore via Redux thunk ---
      const createdId = await dispatch(createConsultation(newConsultation)).unwrap();

      // --- Add to local state with the Firestore ID ---
      setConsultations(prev => [
        ...prev,
        { id: createdId, ...newConsultation }
      ]);

      // --- Reset form ---
      setScheduleForm({
        clientId: '',
        clientName: '',
        date: new Date(),
        time: '',
        duration: '60',
        type: 'online',
        subject: '',
        description: '',
        fee: '',
        urgent: false
      });

      setShowScheduleModal(false);
      Alert.alert('Success', 'Consultation scheduled successfully');

    } catch (error) {
      console.error('Consultation schedule error:', error);
      Alert.alert('Error', error.message || 'Failed to schedule consultation');
    }
  };


  // Handle consultation request actions
  const handleRequestAction = (request, action) => {
    setSelectedRequest(request);
    setShowRequestDialog(true);
  };

  const acceptConsultationRequest = async () => {
    try {
      if (!selectedRequest) return;

      // Convert request to scheduled consultation
      const newConsultation = {
        id: `c${Date.now()}`,
        clientId: `new_${Date.now()}`,
        clientName: selectedRequest.clientName,
        date: selectedRequest.preferredDate,
        time: selectedRequest.preferredTime,
        duration: selectedRequest.estimatedDuration,
        type: selectedRequest.type,
        status: 'scheduled',
        subject: selectedRequest.subject,
        fee: selectedRequest.budget,
        meetingLink: selectedRequest.type === 'online' ? 'https://meet.google.com/generated-link' : null,
        notes: selectedRequest.description
      };

      setConsultations(prev => [...prev, newConsultation]);
      
      // Remove from requests
      setConsultationRequests(prev => 
        prev.filter(req => req.id !== selectedRequest.id)
      );

      setShowRequestDialog(false);
      setSelectedRequest(null);
      
      Alert.alert('Success', 'Consultation request accepted and scheduled');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept consultation request');
    }
  };

  const rejectConsultationRequest = async () => {
    try {
      if (!selectedRequest) return;

      // Update request status
      setConsultationRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: 'rejected' }
            : req
        )
      );

      setShowRequestDialog(false);
      setSelectedRequest(null);
      
      Alert.alert('Success', 'Consultation request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject consultation request');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'scheduled': case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'completed': return colors.info;
      case 'cancelled': case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Client Management</Text>
            <Text style={styles.headerSubtitle}>Active clients & consultations</Text>
          </View>
          
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.8}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={80} tint="light" style={styles.searchBlur}>
            <LinearGradient
              colors={colors.gradient.glass}
              style={styles.searchGradient}
            >
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search clients, consultations..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </LinearGradient>
          </BlurView>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={activeTab === tab.key ? tab.gradient : ['transparent', 'transparent']}
              style={styles.tabGradient}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.tabBadge,
                  activeTab === tab.key && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    activeTab === tab.key && styles.tabBadgeTextActive
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderClientCard = (client) => (
    <TouchableOpacity key={client.id} activeOpacity={0.9}>
      <Surface style={styles.clientCard}>
        <View style={styles.clientCardContent}>
          <View style={styles.clientHeader}>
            <View style={styles.clientAvatarSection}>
              <LinearGradient
                colors={colors.gradient.gold}
                style={styles.clientAvatarGradient}
              >
                <Avatar.Text
                  size={48}
                  label={client.avatar}
                  style={styles.clientAvatar}
                  labelStyle={styles.clientAvatarLabel}
                />
              </LinearGradient>
              <View style={[
                styles.clientStatusIndicator,
                { backgroundColor: getStatusColor(client.status) }
              ]} />
            </View>
            
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientEmail}>{client.email}</Text>
              <View style={styles.clientMeta}>
                <View style={styles.clientMetaItem}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={colors.textSecondary} />
                  <Text style={styles.clientMetaText}>{client.location}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.clientActions}>
              <TouchableOpacity 
                style={styles.clientActionButton}
                onPress={() => handleScheduleConsultation(client)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradient.success}
                  style={styles.clientActionGradient}
                >
                  <MaterialCommunityIcons name="calendar-plus" size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clientActionButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={colors.gradient.info}
                  style={styles.clientActionGradient}
                >
                  <MaterialCommunityIcons name="message-text" size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.clientStats}>
            <View style={styles.clientStat}>
              <Text style={styles.clientStatValue}>{client.caseCount}</Text>
              <Text style={styles.clientStatLabel}>Active Cases</Text>
            </View>
            
            <View style={styles.clientStat}>
              <Text style={styles.clientStatValue}>{formatCurrency(client.totalValue)}</Text>
              <Text style={styles.clientStatLabel}>Total Value</Text>
            </View>
            
            <View style={styles.clientStat}>
              <Text style={styles.clientStatValue}>{client.category}</Text>
              <Text style={styles.clientStatLabel}>Category</Text>
            </View>
            
            <View style={styles.clientStat}>
              <View style={styles.priorityIndicator}>
                <View style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(client.priority) }
                ]} />
                <Text style={styles.clientStatValue}>{client.priority}</Text>
              </View>
              <Text style={styles.clientStatLabel}>Priority</Text>
            </View>
          </View>
          
          <View style={styles.clientFooter}>
            <Text style={styles.lastContactText}>
              Last contact: {new Date(client.lastContact).toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.viewDetailsButton} activeOpacity={0.8}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderConsultationCard = (consultation) => (
    <TouchableOpacity key={consultation.id} activeOpacity={0.9}>
      <Surface style={styles.consultationCard}>
        <View style={styles.consultationCardContent}>
          <View style={styles.consultationHeader}>
            <View style={styles.consultationInfo}>
              <Text style={styles.consultationClient}>{consultation.clientName}</Text>
              <Text style={styles.consultationSubject}>{consultation.subject}</Text>
            </View>
            
            <View style={styles.consultationStatus}>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(consultation.status) + '20' }
                ]}
                textStyle={[
                  styles.statusChipText,
                  { color: getStatusColor(consultation.status) }
                ]}
              >
                {consultation.status}
              </Chip>
            </View>
          </View>
          
          <View style={styles.consultationDetails}>
            <View style={styles.consultationDetailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.consultationDetailText}>
                {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
              </Text>
            </View>
            
            <View style={styles.consultationDetailItem}>
              <MaterialCommunityIcons name="clock" size={16} color={colors.textSecondary} />
              <Text style={styles.consultationDetailText}>{consultation.duration}</Text>
            </View>
            
            <View style={styles.consultationDetailItem}>
              <MaterialCommunityIcons 
                name={consultation.type === 'online' ? 'video' : 'office-building'} 
                size={16} 
                color={colors.textSecondary} 
              />
              <Text style={styles.consultationDetailText}>
                {consultation.type === 'online' ? 'Online Meeting' : 'In-Person'}
              </Text>
            </View>
            
            <View style={styles.consultationDetailItem}>
              <MaterialCommunityIcons name="currency-inr" size={16} color={colors.textSecondary} />
              <Text style={styles.consultationDetailText}>{formatCurrency(consultation.fee)}</Text>
            </View>
          </View>
          
          {consultation.notes && (
            <View style={styles.consultationNotes}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{consultation.notes}</Text>
            </View>
          )}
          
          <View style={styles.consultationActions}>
            {consultation.meetingLink && (
              <TouchableOpacity style={styles.consultationAction} activeOpacity={0.8}>
                <LinearGradient
                  colors={colors.gradient.success}
                  style={styles.consultationActionGradient}
                >
                  <MaterialCommunityIcons name="video" size={16} color="white" />
                  <Text style={styles.consultationActionText}>Join Meeting</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.consultationAction} activeOpacity={0.8}>
              <LinearGradient
                colors={colors.gradient.info}
                style={styles.consultationActionGradient}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="white" />
                <Text style={styles.consultationActionText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderRequestCard = (request) => (
    <TouchableOpacity key={request.id} activeOpacity={0.9}>
      <Surface style={styles.requestCard}>
        <View style={styles.requestCardContent}>
          <View style={styles.requestHeader}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestClient}>{request.clientName}</Text>
              <Text style={styles.requestSubject}>{request.subject}</Text>
              <View style={styles.requestMeta}>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.tertiary + '20' }
                  ]}
                  textStyle={styles.categoryChipText}
                >
                  {request.category}
                </Chip>
                
                <View style={styles.urgencyIndicator}>
                  <View style={[
                    styles.urgencyDot,
                    { backgroundColor: getPriorityColor(request.urgency) }
                  ]} />
                  <Text style={styles.urgencyText}>{request.urgency}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.requestBudget}>
              <Text style={styles.budgetAmount}>{formatCurrency(request.budget)}</Text>
              <Text style={styles.budgetLabel}>Budget</Text>
            </View>
          </View>
          
          <View style={styles.requestDetails}>
            <Text style={styles.requestDescription}>{request.description}</Text>
            
            <View style={styles.requestPreferences}>
              <View style={styles.requestPreferenceItem}>
                <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.requestPreferenceText}>
                  {new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}
                </Text>
              </View>
              
              <View style={styles.requestPreferenceItem}>
                <MaterialCommunityIcons name="clock" size={16} color={colors.textSecondary} />
                <Text style={styles.requestPreferenceText}>{request.estimatedDuration}</Text>
              </View>
              
              <View style={styles.requestPreferenceItem}>
                <MaterialCommunityIcons 
                  name={request.type === 'online' ? 'video' : 'office-building'} 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.requestPreferenceText}>
                  {request.type === 'online' ? 'Online' : 'In-Person'}
                </Text>
              </View>
            </View>
            
            <View style={styles.requestContact}>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="email" size={16} color={colors.textSecondary} />
                <Text style={styles.contactText}>{request.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="phone" size={16} color={colors.textSecondary} />
                <Text style={styles.contactText}>{request.phone}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.requestFooter}>
            <Text style={styles.requestTime}>
              Requested {new Date(request.requestedAt).toLocaleDateString()}
            </Text>
            
            <View style={styles.requestActions}>
              <TouchableOpacity 
                style={styles.requestActionButton}
                onPress={() => handleRequestAction(request, 'reject')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradient.error}
                  style={styles.requestActionGradient}
                >
                  <MaterialCommunityIcons name="close" size={16} color="white" />
                  <Text style={styles.requestActionText}>Decline</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.requestActionButton}
                onPress={() => handleRequestAction(request, 'accept')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradient.success}
                  style={styles.requestActionGradient}
                >
                  <MaterialCommunityIcons name="check" size={16} color="white" />
                  <Text style={styles.requestActionText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity 
              onPress={() => setShowScheduleModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Schedule Consultation</Text>
            
            <TouchableOpacity 
              onPress={submitConsultationSchedule}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Client Selection */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Client *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter client name"
              value={scheduleForm.clientName}
              onChangeText={(text) => setScheduleForm(prev => ({ ...prev, clientName: text }))}
            />
          </View>
          
          {/* Subject */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Subject *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Consultation subject"
              value={scheduleForm.subject}
              onChangeText={(text) => setScheduleForm(prev => ({ ...prev, subject: text }))}
            />
          </View>
          
          {/* Date and Time */}
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>Date *</Text>
              <TouchableOpacity 
                style={styles.formInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {scheduleForm.date.toLocaleDateString()}
                </Text>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>Time *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="10:00 AM"
                value={scheduleForm.time}
                onChangeText={(text) => setScheduleForm(prev => ({ ...prev, time: text }))}
              />
            </View>
          </View>
          
          {/* Duration and Type */}
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="60"
                keyboardType="numeric"
                value={scheduleForm.duration}
                onChangeText={(text) => setScheduleForm(prev => ({ ...prev, duration: text }))}
              />
            </View>
            
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setScheduleForm(prev => ({ ...prev, type: 'online' }))}
                >
                  <RadioButton
                    value="online"
                    status={scheduleForm.type === 'online' ? 'checked' : 'unchecked'}
                    color={colors.primary}
                  />
                  <Text style={styles.radioText}>Online</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setScheduleForm(prev => ({ ...prev, type: 'offline' }))}
                >
                  <RadioButton
                    value="offline"
                    status={scheduleForm.type === 'offline' ? 'checked' : 'unchecked'}
                    color={colors.primary}
                  />
                  <Text style={styles.radioText}>In-Person</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Fee */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Consultation Fee (₹)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="50000"
              keyboardType="numeric"
              value={scheduleForm.fee}
              onChangeText={(text) => setScheduleForm(prev => ({ ...prev, fee: text }))}
            />
          </View>
          
          {/* Description */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Additional notes or agenda"
              multiline
              numberOfLines={4}
              value={scheduleForm.description}
              onChangeText={(text) => setScheduleForm(prev => ({ ...prev, description: text }))}
            />
          </View>
          
          {/* Urgent Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setScheduleForm(prev => ({ ...prev, urgent: !prev.urgent }))}
          >
            <Checkbox
              status={scheduleForm.urgent ? 'checked' : 'unchecked'}
              color={colors.primary}
            />
            <Text style={styles.checkboxText}>Mark as urgent</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {showDatePicker && (
          <DateTimePicker
            value={scheduleForm.date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setScheduleForm(prev => ({ ...prev, date: selectedDate }));
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderRequestDialog = () => (
    <Portal>
      <Dialog
        visible={showRequestDialog}
        onDismiss={() => setShowRequestDialog(false)}
        style={styles.requestDialog}
      >
        <Dialog.Title style={styles.dialogTitle}>
          Consultation Request
        </Dialog.Title>
        
        <Dialog.Content>
          {selectedRequest && (
            <View>
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Client: </Text>
                {selectedRequest.clientName}
              </Text>
              
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Subject: </Text>
                {selectedRequest.subject}
              </Text>
              
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Preferred Date: </Text>
                {new Date(selectedRequest.preferredDate).toLocaleDateString()} at {selectedRequest.preferredTime}
              </Text>
              
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Budget: </Text>
                {formatCurrency(selectedRequest.budget)}
              </Text>
              
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Duration: </Text>
                {selectedRequest.estimatedDuration}
              </Text>
              
              <Text style={styles.dialogText}>
                <Text style={styles.dialogLabel}>Type: </Text>
                {selectedRequest.type === 'online' ? 'Online Meeting' : 'In-Person Meeting'}
              </Text>
              
              <Text style={styles.dialogDescription}>
                {selectedRequest.description}
              </Text>
            </View>
          )}
        </Dialog.Content>
        
        <Dialog.Actions style={styles.dialogActions}>
          <Button
            mode="outlined"
            onPress={rejectConsultationRequest}
            style={styles.dialogButton}
            labelStyle={[styles.dialogButtonText, { color: colors.error }]}
          >
            Decline
          </Button>
          
          <Button
            mode="contained"
            onPress={acceptConsultationRequest}
            style={[styles.dialogButton, { backgroundColor: colors.success }]}
            labelStyle={styles.dialogButtonText}
          >
            Accept & Schedule
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      );
    }

    const getEmptyMessage = () => {
      switch (activeTab) {
        case 'clients': return 'No active clients found';
        case 'consultations': return 'No consultations scheduled';
        case 'requests': return 'No consultation requests';
        default: return 'No data available';
      }
    };

    const getEmptyIcon = () => {
      switch (activeTab) {
        case 'clients': return 'account-group';
        case 'consultations': return 'calendar-star';
        case 'requests': return 'bell-ring';
        default: return 'information';
      }
    };

    const getCurrentData = () => {
      switch (activeTab) {
        case 'clients': return filteredClients;
        case 'consultations': return filteredConsultations;
        case 'requests': return filteredRequests;
        default: return [];
      }
    };

    const renderCard = (item) => {
      switch (activeTab) {
        case 'clients': return renderClientCard(item);
        case 'consultations': return renderConsultationCard(item);
        case 'requests': return renderRequestCard(item);
        default: return null;
      }
    };

    const currentData = getCurrentData();

    if (currentData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name={getEmptyIcon()} 
            size={64} 
            color={colors.textTertiary} 
          />
          <Text style={styles.emptyStateTitle}>{getEmptyMessage()}</Text>
          <Text style={styles.emptyStateSubtitle}>
            {searchQuery ? 'Try adjusting your search' : 'Data will appear here when available'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {currentData.map(item => renderCard(item))}
      </View>
    );
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <LinearGradient
  //         colors={colors.gradient.primary}
  //         style={styles.loadingGradient}
  //       >
  //         <ActivityIndicator size="large" color="white" />
  //         <Text style={styles.loadingText}>Loading client data...</Text>
  //       </LinearGradient>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      {renderTabs()}
      
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
         {loading ? <View>
                    <LinearGradient
                      colors={colors.gradient.glass}
                      style={styles.loadingGradient}
                    >
                      <ActivityIndicator size="large" color="black" />
                    </LinearGradient>
                  </View>:renderContent()}
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <FAB
        style={[
          styles.fab,
          { backgroundColor: colors.secondary }
        ]}
        icon="plus"
        onPress={() => handleScheduleConsultation()}
        label={activeTab === 'requests' ? 'New Request' : 'Schedule'}
      />
      
      {renderScheduleModal()}
      {renderRequestDialog()}
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
    textAlign: 'center',
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.1)',
  },
  tabsContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  tab: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabActive: {
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: colors.textTertiary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  contentContainer: {
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  clientCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  clientCardContent: {
    padding: 20,
  },
  clientHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  clientAvatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  clientAvatarGradient: {
    borderRadius: 24,
    padding: 2,
  },
  clientAvatar: {
    backgroundColor: 'transparent',
  },
  clientAvatarLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  clientStatusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  clientMeta: {
    gap: 8,
  },
  clientMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clientActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clientActionGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  clientStat: {
    alignItems: 'center',
  },
  clientStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  clientStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  lastContactText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  consultationCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  consultationCardContent: {
    padding: 20,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  consultationInfo: {
    flex: 1,
    marginRight: 12,
  },
  consultationClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  consultationSubject: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  consultationStatus: {
    alignSelf: 'flex-start',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  consultationDetails: {
    gap: 12,
    marginBottom: 16,
  },
  consultationDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultationDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  consultationNotes: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  consultationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  consultationAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  consultationActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  consultationActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  requestCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  requestCardContent: {
    padding: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  requestSubject: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryChip: {
    height: 24,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestBudget: {
    alignItems: 'flex-end',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 2,
  },
  budgetLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 16,
  },
  requestDescription: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 16,
  },
  requestPreferences: {
    gap: 8,
    marginBottom: 12,
  },
  requestPreferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestPreferenceText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  requestContact: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  requestTime: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  requestActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  requestActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
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
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  modalSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  formHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  requestDialog: {
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  dialogText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  dialogLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dialogDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  dialogActions: {
    gap: 12,
  },
  dialogButton: {
    borderRadius: 12,
  },
  dialogButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});