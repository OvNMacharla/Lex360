import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  RefreshControl,
  Platform,
  FlatList,
  Alert,
  TextInput,
  Image,
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
  Modal,
  Portal,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SCREEN_NAMES } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

// Ultra-premium color palette
const colors = {
  primary: '#667eea',
  primaryDark: '#5a67d8',
  secondary: '#764ba2',
  tertiary: '#f093fb',
  accent: '#4ECDC4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F8',
  text: '#1A202C',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  cardShadow: 'rgba(102, 126, 234, 0.15)',
  glassMorphism: 'rgba(255, 255, 255, 0.9)',
  gradient: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#f093fb', '#f5576c'],
    success: ['#4ECDC4', '#44A08D'],
    info: ['#667eea', '#764ba2'],
    warning: ['#FFD89B', '#19547B'],
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']
  }
};

export default function ClientDashboard() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [showFindLawyersModal, setShowFindLawyersModal] = useState(false);
  const [showCaseStatusModal, setShowCaseStatusModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationNote, setConsultationNote] = useState('');

  // Dynamic state for stats
  const [stats, setStats] = useState([
    {
      label: 'Active Cases',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: 'gavel',
      gradient: colors.gradient.primary,
      glowColor: colors.primary,
      description: 'Ongoing legal matters'
    },
    {
      label: 'Consultations',
      value: '12',
      change: '+4',
      trend: 'up',
      icon: 'calendar-star',
      gradient: colors.gradient.success,
      glowColor: colors.accent,
      description: 'Completed sessions'
    },
    {
      label: 'Documents',
      value: '8',
      change: '+1',
      trend: 'up',
      icon: 'file-document-multiple',
      gradient: colors.gradient.info,
      glowColor: colors.info,
      description: 'Legal documents'
    },
    {
      label: 'Satisfaction',
      value: '4.9★',
      change: '+0.2',
      trend: 'up',
      icon: 'star',
      gradient: colors.gradient.warning,
      glowColor: colors.warning,
      description: 'Service rating'
    },
  ]);

  // Notifications state
  const [notifications] = useState([
    {
      id: 1,
      title: 'Case Update',
      message: 'Your property dispute case has a new hearing date',
      time: '2 hours ago',
      type: 'case',
      unread: true,
      icon: 'gavel'
    },
    {
      id: 2,
      title: 'Consultation Reminder',
      message: 'You have a consultation with Adv. Sharma tomorrow at 2 PM',
      time: '1 day ago',
      type: 'consultation',
      unread: true,
      icon: 'calendar'
    },
    {
      id: 3,
      title: 'Document Ready',
      message: 'Your rental agreement review is completed',
      time: '2 days ago',
      type: 'document',
      unread: false,
      icon: 'file-document'
    }
  ]);

  useEffect(() => {
    // Animation on mount
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate updating stats
    setTimeout(() => {
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: stat.label === 'Active Cases' ? '6' : 
               stat.label === 'Consultations' ? '13' :
               stat.label === 'Documents' ? '9' : stat.value
      })));
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions = [
    {
      title: 'Find Lawyers',
      icon: 'account-search',
      description: 'Browse verified lawyers',
      screen: SCREEN_NAMES.FIND_LAWYERS,
      gradient: colors.gradient.primary,
      action: () => setShowFindLawyersModal(true)
    },
    {
      title: 'AI Assistant',
      icon: 'robot-excited',
      description: 'Get instant legal help',
      screen: SCREEN_NAMES.AI_CHAT,
      gradient: colors.gradient.secondary,
      action: () => navigation.navigate('InApp', { screen: SCREEN_NAMES.AI_CHAT })
    },
    {
      title: 'Case Status',
      icon: 'clipboard-check',
      description: 'Track your cases',
      screen: SCREEN_NAMES.CASE_STATUS,
      gradient: colors.gradient.success,
      action: () => setShowCaseStatusModal(true)
    },
    {
      title: 'Documents',
      icon: 'file-document',
      description: 'Manage documents',
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
      gradient: colors.gradient.info,
      action: () => navigation.navigate('InApp', { screen: SCREEN_NAMES.LEGAL_DOCUMENTS })
    },
  ];

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'consultation',
      title: 'Consultation with Adv. Sharma',
      subtitle: 'Property Law Discussion - Contract Review',
      time: '2 hours ago',
      status: 'completed',
      icon: 'account-tie',
      priority: 'high',
      value: '₹2,500',
      progress: 100
    },
    {
      id: 2,
      type: 'case',
      title: 'Property Dispute Case Update',
      subtitle: 'Court hearing scheduled for next week',
      time: '1 day ago',
      status: 'in_progress',
      icon: 'gavel',
      priority: 'high',
      value: '₹15,000',
      progress: 65
    },
    {
      id: 3,
      type: 'document',
      title: 'Rental Agreement Review',
      subtitle: 'Document analysis completed',
      time: '3 days ago',
      status: 'reviewed',
      icon: 'file-document-edit',
      priority: 'medium',
      value: '₹1,200',
      progress: 100
    },
    {
      id: 4,
      type: 'ai_query',
      title: 'Legal Query Resolved',
      subtitle: 'AI Assistant provided detailed response',
      time: '5 days ago',
      status: 'answered',
      icon: 'chat-question',
      priority: 'low',
      value: 'Free',
      progress: 100
    },
  ]);

  const [caseStatusData, setCaseStatusData] = useState([
    {
      id: 'CS001',
      title: 'Property Dispute - Sector 18',
      lawyer: 'Adv. Priya Sharma',
      status: 'in_progress',
      progress: 65,
      nextHearing: '2025-01-15',
      priority: 'high',
      value: '₹25,000',
      description: 'Boundary dispute with neighbor regarding property lines'
    },
    {
      id: 'CS002',
      title: 'Employment Termination Case',
      lawyer: 'Adv. Rajesh Kumar',
      status: 'review',
      progress: 30,
      nextHearing: '2025-01-22',
      priority: 'medium',
      value: '₹18,000',
      description: 'Wrongful termination compensation claim'
    },
    {
      id: 'CS003',
      title: 'Consumer Complaint - Banking',
      lawyer: 'Adv. Meera Patel',
      status: 'completed',
      progress: 100,
      nextHearing: null,
      priority: 'low',
      value: '₹8,000',
      description: 'Banking service charges dispute resolved'
    }
  ]);

  const [featuredLawyers, setFeaturedLawyers] = useState([
    {
      id: 1,
      name: 'Adv. Priya Sharma',
      specialization: 'Property Law',
      experience: '12 years',
      rating: 4.9,
      reviews: 234,
      fee: '₹2,500/hr',
      image: null,
      verified: true,
      languages: ['Hindi', 'English'],
      availability: 'Available Today',
      about: 'Specialized in property law with extensive experience in real estate disputes.'
    },
    {
      id: 2,
      name: 'Adv. Rajesh Kumar',
      specialization: 'Corporate Law',
      experience: '15 years',
      rating: 4.8,
      reviews: 189,
      fee: '₹3,000/hr',
      image: null,
      verified: true,
      languages: ['Hindi', 'English', 'Marathi'],
      availability: 'Available Tomorrow',
      about: 'Corporate law expert with focus on business compliance and contracts.'
    },
    {
      id: 3,
      name: 'Adv. Meera Patel',
      specialization: 'Family Law',
      experience: '8 years',
      rating: 4.7,
      reviews: 156,
      fee: '₹2,000/hr',
      image: null,
      verified: true,
      languages: ['Hindi', 'English', 'Gujarati'],
      availability: 'Available Today',
      about: 'Family law specialist handling divorce, custody, and matrimonial disputes.'
    }
  ]);

  const handleAction = (screenName, customAction) => {
    if (customAction) {
      customAction();
    } else if (screenName) {
      navigation.navigate('InApp', { screen: screenName });
    }
  };

  const handleBookConsultation = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowConsultationModal(true);
  };

  const handleConfirmBooking = () => {
    if (!consultationDate || !consultationTime) {
      Alert.alert('Error', 'Please select date and time for consultation');
      return;
    }

    // Add new consultation to recent activity
    const newConsultation = {
      id: Date.now(),
      type: 'consultation',
      title: `Consultation with ${selectedLawyer.name}`,
      subtitle: `${selectedLawyer.specialization} - ${consultationNote || 'General consultation'}`,
      time: 'Scheduled',
      status: 'scheduled',
      icon: 'account-tie',
      priority: 'medium',
      value: selectedLawyer.fee,
      progress: 0
    };

    setRecentActivity(prev => [newConsultation, ...prev]);
    
    // Update consultation count
    setStats(prevStats => prevStats.map(stat => 
      stat.label === 'Consultations' 
        ? { ...stat, value: (parseInt(stat.value) + 1).toString() }
        : stat
    ));

    Alert.alert(
      'Consultation Booked!',
      `Your consultation with ${selectedLawyer.name} has been scheduled for ${consultationDate} at ${consultationTime}`,
      [{ text: 'OK' }]
    );

    // Reset form
    setConsultationDate('');
    setConsultationTime('');
    setConsultationNote('');
    setShowConsultationModal(false);
    setSelectedLawyer(null);
    setShowFindLawyersModal(false);
  };

  const handleCaseUpdate = (caseId, newProgress) => {
    setCaseStatusData(prev => prev.map(caseItem => 
      caseItem.id === caseId 
        ? { ...caseItem, progress: newProgress }
        : caseItem
    ));
    Alert.alert('Case Updated', 'Case progress has been updated successfully');
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.info;
      case 'review': return colors.warning;
      case 'answered': return colors.accent;
      case 'scheduled': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const filteredLawyers = featuredLawyers.filter(lawyer =>
    lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lawyer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Notifications Modal
  const NotificationsModal = () => (
    <Portal>
      <Modal
        visible={showNotificationsModal}
        onDismiss={() => setShowNotificationsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.map((notification) => (
              <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <LinearGradient
                    colors={notification.unread ? colors.gradient.primary : [colors.textTertiary, colors.textTertiary]}
                    style={styles.notificationIconGradient}
                  >
                    <MaterialCommunityIcons
                      name={notification.icon}
                      size={20}
                      color="white"
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle,
                    notification.unread && { fontWeight: '700' }
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
                
                {notification.unread && (
                  <View style={styles.unreadIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Search Modal
  const SearchModal = () => (
    <Portal>
      <Modal
        visible={showSearchModal}
        onDismiss={() => setShowSearchModal(false)}
        contentContainerStyle={styles.fullScreenModal}
      >
        <Surface style={styles.searchModalSurface}>
          <View style={styles.searchModalHeader}>
            <Searchbar
              placeholder="Search lawyers, cases, documents..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.fullScreenSearchBar}
              autoFocus={true}
            />
            <TouchableOpacity 
              onPress={() => setShowSearchModal(false)}
              style={styles.searchCloseButton}
            >
              <Text style={styles.searchCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.searchResults}>
            <Text style={styles.searchSectionTitle}>Lawyers</Text>
            {filteredLawyers.map((lawyer) => (
              <TouchableOpacity key={lawyer.id} style={styles.searchResultItem}>
                <MaterialCommunityIcons name="account-tie" size={20} color={colors.primary} />
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultTitle}>{lawyer.name}</Text>
                  <Text style={styles.searchResultSubtitle}>{lawyer.specialization}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <Text style={styles.searchSectionTitle}>Cases</Text>
            {caseStatusData.map((caseItem) => (
              <TouchableOpacity key={caseItem.id} style={styles.searchResultItem}>
                <MaterialCommunityIcons name="gavel" size={20} color={colors.info} />
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultTitle}>{caseItem.title}</Text>
                  <Text style={styles.searchResultSubtitle}>{caseItem.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Consultation Booking Modal
  const ConsultationModal = () => (
    <Portal>
      <Modal
        visible={showConsultationModal}
        onDismiss={() => setShowConsultationModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            <TouchableOpacity onPress={() => setShowConsultationModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedLawyer && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.selectedLawyerInfo}>
                <Avatar.Text
                  size={60}
                  label={selectedLawyer.name.split(' ')[1]?.charAt(0) || 'L'}
                  style={{ backgroundColor: colors.primary }}
                  labelStyle={{ color: 'white', fontWeight: '700' }}
                />
                <View style={styles.selectedLawyerDetails}>
                  <Text style={styles.selectedLawyerName}>{selectedLawyer.name}</Text>
                  <Text style={styles.selectedLawyerSpec}>{selectedLawyer.specialization}</Text>
                  <Text style={styles.selectedLawyerFee}>{selectedLawyer.fee}</Text>
                </View>
              </View>
              
              <View style={styles.bookingForm}>
                <Text style={styles.formLabel}>Select Date</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => {
                  // In real app, open date picker
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setConsultationDate(tomorrow.toDateString());
                }}>
                  <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
                  <Text style={styles.dateInputText}>
                    {consultationDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.formLabel}>Select Time</Text>
                <View style={styles.timeSlots}>
                  {['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        consultationTime === time && styles.selectedTimeSlot
                      ]}
                      onPress={() => setConsultationTime(time)}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        consultationTime === time && styles.selectedTimeSlotText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.formLabel}>Add Note (Optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Describe your legal issue briefly..."
                  multiline
                  numberOfLines={3}
                  value={consultationNote}
                  onChangeText={setConsultationNote}
                />
                
                <Button
                  mode="contained"
                  onPress={handleConfirmBooking}
                  style={styles.bookButton}
                  labelStyle={styles.bookButtonText}
                >
                  Confirm Booking - {selectedLawyer.fee}
                </Button>
              </View>
            </ScrollView>
          )}
        </Surface>
      </Modal>
    </Portal>
  );

  // Find Lawyers Modal Component
  const FindLawyersModal = () => (
    <Portal>
      <Modal
        visible={showFindLawyersModal}
        onDismiss={() => setShowFindLawyersModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Find Lawyers</Text>
            <TouchableOpacity onPress={() => setShowFindLawyersModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Searchbar
            placeholder="Search lawyers by specialization"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredLawyers.map((lawyer) => (
              <TouchableOpacity key={lawyer.id} style={styles.lawyerCard} activeOpacity={0.9}>
                <View style={styles.lawyerInfo}>
                  <View style={styles.lawyerAvatar}>
                    <Avatar.Text
                      size={50}
                      label={lawyer.name.split(' ')[1]?.charAt(0) || 'L'}
                      style={{ backgroundColor: colors.primary }}
                      labelStyle={{ color: 'white', fontWeight: '700' }}
                    />
                    {lawyer.verified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.lawyerDetails}>
                    <Text style={styles.lawyerName}>{lawyer.name}</Text>
                    <Text style={styles.lawyerSpecialization}>{lawyer.specialization}</Text>
                    
                    <View style={styles.lawyerMeta}>
                      <View style={styles.ratingContainer}>
                        <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{lawyer.rating}</Text>
                        <Text style={styles.reviewsText}>({lawyer.reviews})</Text>
                      </View>
                      
                      <View style={styles.experienceContainer}>
                        <MaterialCommunityIcons name="briefcase" size={14} color={colors.textSecondary} />
                        <Text style={styles.experienceText}>{lawyer.experience}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.lawyerFooter}>
                      <Text style={styles.feeText}>{lawyer.fee}</Text>
                      <Chip
                        mode="flat"
                        compact
                        style={[styles.availabilityChip, { backgroundColor: colors.success + '20' }]}
                        textStyle={[styles.availabilityText, { color: colors.success }]}
                      >
                        {lawyer.availability}
                      </Chip>
                    </View>
                  </View>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => handleBookConsultation(lawyer)}
                  style={styles.consultButton}
                  labelStyle={styles.consultButtonText}
                >
                  Book Consultation
                </Button>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Case Status Modal Component
  const CaseStatusModal = () => (
    <Portal>
      <Modal
        visible={showCaseStatusModal}
        onDismiss={() => setShowCaseStatusModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Case Status</Text>
            <TouchableOpacity onPress={() => setShowCaseStatusModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {caseStatusData.map((caseItem) => (
              <Surface key={caseItem.id} style={styles.caseCard}>
                <View style={styles.caseHeader}>
                  <View style={styles.caseIdContainer}>
                    <Text style={styles.caseId}>#{caseItem.id}</Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(caseItem.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(caseItem.status) }
                      ]}>
                        {caseItem.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.caseValue}>
                    <Text style={styles.caseValueText}>{caseItem.value}</Text>
                  </View>
                </View>
                
                <Text style={styles.caseTitle}>{caseItem.title}</Text>
                <Text style={styles.caseDescription}>{caseItem.description}</Text>
                
                <View style={styles.caseMeta}>
                  <View style={styles.lawyerInfoCase}>
                    <MaterialCommunityIcons name="account-tie" size={16} color={colors.textSecondary} />
                    <Text style={styles.lawyerNameCase}>{caseItem.lawyer}</Text>
                  </View>
                  
                  {caseItem.nextHearing && (
                    <View style={styles.hearingInfo}>
                      <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={styles.hearingDate}>
                        Next: {new Date(caseItem.nextHearing).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>{caseItem.progress}%</Text>
                  </View>
                  <ProgressBar
                    progress={caseItem.progress / 100}
                    color={getStatusColor(caseItem.status)}
                    style={styles.progressBar}
                  />
                </View>
                
                <View style={styles.caseActions}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Case Details', `Viewing details for ${caseItem.title}`)}
                    style={styles.caseActionButton}
                    compact
                  >
                    View Details
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => handleCaseUpdate(caseItem.id, Math.min(caseItem.progress + 10, 100))}
                    style={[styles.caseActionButton, { backgroundColor: colors.primary }]}
                    compact
                  >
                    Update Progress
                  </Button>
                </View>
              </Surface>
            ))}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.particleContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.avatarGradient}
                >
                  <Avatar.Text
                    size={56}
                    label={user?.name?.charAt(0) || 'U'}
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                  />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>{getCurrentGreeting()} ☀️</Text>
                <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
                <View style={styles.expertiseBadge}>
                  <MaterialCommunityIcons name="shield-check" size={12} color="#4ECDC4" />
                  <Text style={styles.expertiseText}>Verified Client</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={() => setShowSearchModal(true)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={() => setShowNotificationsModal(true)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="bell" size={20} color="white" />
                  <Badge size={8} style={styles.notificationBadge} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        {/* Glass Summary Card */}
        <View style={styles.summaryCardContainer}>
          <BlurView intensity={95} tint="light" style={styles.glassSummary}>
            <LinearGradient
              colors={colors.gradient.glass}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryContent}>
                <TouchableOpacity style={styles.summaryItem} onPress={() => setShowCaseStatusModal(true)}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="gavel" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{stats[0].value}</Text>
                  <Text style={styles.summaryLabel}>Active Cases</Text>
                </TouchableOpacity>
                
                <View style={styles.summaryDivider} />
                
                <TouchableOpacity style={styles.summaryItem} onPress={() => setShowFindLawyersModal(true)}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.success}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="calendar-check" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{stats[1].value}</Text>
                  <Text style={styles.summaryLabel}>Consultations</Text>
                </TouchableOpacity>
                
                <View style={styles.summaryDivider} />
                
                <TouchableOpacity 
                  style={styles.summaryItem} 
                  onPress={() => navigation.navigate('InApp', { screen: SCREEN_NAMES.LEGAL_DOCUMENTS })}
                >
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.info}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="star" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{stats[3].value}</Text>
                  <Text style={styles.summaryLabel}>Satisfaction</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </Animated.View>

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Premium Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Legal Journey</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowCaseStatusModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
            decelerationRate="fast"
          >
            {stats.map((stat, index) => (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => {
                if (stat.label === 'Active Cases') setShowCaseStatusModal(true);
                else if (stat.label === 'Consultations') setShowFindLawyersModal(true);
              }}>
                <View style={styles.statCardContainer}>
                  <LinearGradient
                    colors={stat.gradient}
                    style={styles.statCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.statGlow} />
                    
                    <View style={styles.statHeader}>
                      <View style={styles.statIconContainer}>
                        <MaterialCommunityIcons
                          name={stat.icon}
                          size={24}
                          color="rgba(255,255,255,0.9)"
                        />
                      </View>
                      
                      <View style={styles.trendContainer}>
                        <MaterialCommunityIcons
                          name="trending-up"
                          size={12}
                          color="#4ECDC4"
                        />
                        <Text style={styles.changeText}>{stat.change}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Text style={styles.statDescription}>{stat.description}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionWrapper}
                onPress={() => handleAction(action.screen, action.action)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionGlow} />
                  
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={28}
                    color="white"
                  />
                  
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.filterButton} onPress={() => {
              Alert.alert(
                'Filter Options',
                'Choose filter criteria',
                [
                  { text: 'All Activities', onPress: () => {} },
                  { text: 'Cases Only', onPress: () => {} },
                  { text: 'Consultations Only', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}>
              <MaterialCommunityIcons name="filter-variant" size={16} color={colors.primary} />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivity.map((activity) => (
            <TouchableOpacity key={activity.id} activeOpacity={0.95} onPress={() => {
              Alert.alert(
                activity.title,
                activity.subtitle,
                [
                  { text: 'View Details', onPress: () => {} },
                  { text: 'Close', style: 'cancel' }
                ]
              );
            }}>
              <Surface style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <View style={styles.activityMainInfo}>
                    <View style={styles.activityIconSection}>
                      <LinearGradient
                        colors={[getStatusColor(activity.status), getStatusColor(activity.status) + '80']}
                        style={styles.activityIconContainer}
                      >
                        <MaterialCommunityIcons
                          name={activity.icon}
                          size={20}
                          color="white"
                        />
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.activityDetails}>
                      <View style={styles.activityTitleRow}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <View style={styles.activityValueContainer}>
                          <Text style={styles.activityValue}>{activity.value}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                      
                      <View style={styles.activityMetaRow}>
                        <View style={styles.timeContainer}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                        
                        <View style={styles.priorityIndicator}>
                          <View style={[
                            styles.priorityDot,
                            { backgroundColor: getPriorityColor(activity.priority) }
                          ]} />
                          <Text style={styles.priorityText}>{activity.priority}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {activity.progress < 100 && (
                    <View style={styles.activityProgress}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercent}>{activity.progress}%</Text>
                      </View>
                      <ProgressBar
                        progress={activity.progress / 100}
                        color={getStatusColor(activity.status)}
                        style={styles.miniProgressBar}
                      />
                    </View>
                  )}
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FindLawyersModal />
      <CaseStatusModal />
      <ConsultationModal />
      <NotificationsModal />
      <SearchModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20 || 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
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
    backgroundColor: 'rgba(76, 236, 196, 0.3)',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
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
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  expertiseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 236, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  expertiseText: {
    color: '#4ECDC4',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    position: 'relative',
  },
  actionButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ECDC4',
  },
  summaryCardContainer: {
    marginHorizontal: 24,
    marginTop: -12,
  },
  glassSummary: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    paddingRight: 24,
  },
  statCardContainer: {
    width: width * 0.4,
    marginRight: 16,
    position: 'relative',
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  statGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 236, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    color: '#4ECDC4',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionWrapper: {
    width: (width - 64) / 2,
  },
  quickActionCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  activityContent: {
    padding: 20,
  },
  activityMainInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIconSection: {
    marginRight: 16,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  activityValueContainer: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityValue: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '800',
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  activityMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activityProgress: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  miniProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  bottomSpacing: {
    height: 40,
  },
  
  // Modal Styles
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalSurface: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: colors.surfaceVariant,
  },
  
  // Full Screen Modal Styles
  fullScreenModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    margin: 0,
  },
  searchModalSurface: {
    backgroundColor: colors.surface,
    flex: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  fullScreenSearchBar: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    elevation: 0,
  },
  searchCloseButton: {
    marginLeft: 16,
    paddingVertical: 8,
  },
  searchCloseText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchResultContent: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  // Notification Modal Styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    position: 'relative',
  },
  notificationIcon: {
    marginRight: 16,
  },
  notificationIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  
  // Find Lawyers Modal Styles
  lawyerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  lawyerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lawyerAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lawyerSpecialization: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  lawyerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  lawyerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  availabilityChip: {
    height: 24,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  consultButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  consultButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  
  // Consultation Booking Modal Styles
  selectedLawyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  selectedLawyerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  selectedLawyerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  selectedLawyerSpec: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  selectedLawyerFee: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 4,
  },
  bookingForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  dateInputText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeSlot: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedTimeSlotText: {
    color: colors.primary,
  },
  noteInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 24,
    minHeight: 80,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 6,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  // Case Status Modal Styles
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 12,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  caseValue: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caseValueText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  caseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  caseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lawyerInfoCase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lawyerNameCase: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  hearingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hearingDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseActionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
});