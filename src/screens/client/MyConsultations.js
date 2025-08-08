import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Animated,
  StatusBar,
  TextInput,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const MyConsultations = () => {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Enhanced mock data with more details
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
      },
      consultation: {
        type: 'Video Call',
        date: '2024-03-15',
        time: '2:00 PM',
        duration: 45,
        fee: '$150',
        topic: 'Contract Review',
        description: 'Business partnership agreement review and consultation',
      },
      status: 'Completed',
      meetingLink: 'https://meet.example.com/abc123',
      documents: ['Partnership_Agreement.pdf', 'NDA.pdf'],
      notes: 'Discussed key terms and potential risks in the partnership agreement.',
      canRate: true,
      canReschedule: false,
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
      },
      consultation: {
        type: 'In-Person',
        date: '2024-03-20',
        time: '10:30 AM',
        duration: 60,
        fee: '$200',
        topic: 'Divorce Proceedings',
        description: 'Initial consultation for divorce case and custody matters',
      },
      status: 'Scheduled',
      address: '123 Legal Plaza, Suite 400, Downtown',
      documents: [],
      notes: '',
      canRate: false,
      canReschedule: true,
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
      },
      consultation: {
        type: 'Phone Call',
        date: '2024-03-18',
        time: '4:00 PM',
        duration: 30,
        fee: '$100',
        topic: 'Property Purchase',
        description: 'Legal advice on residential property purchase contract',
      },
      status: 'Pending',
      documents: ['Property_Contract.pdf'],
      notes: '',
      canRate: false,
      canReschedule: true,
    },
    {
      id: '4',
      lawyer: {
        name: 'David Thompson',
        specialization: 'Criminal Defense',
        rating: 4.9,
        avatar: 'https://via.placeholder.com/60x60/FF3B30/FFFFFF?text=DT',
        verified: true,
        experience: '15 years',
      },
      consultation: {
        type: 'Video Call',
        date: '2024-03-12',
        time: '11:00 AM',
        duration: 90,
        fee: '$300',
        topic: 'Legal Defense',
        description: 'Criminal defense strategy discussion and case review',
      },
      status: 'Cancelled',
      refundAmount: '$300',
      cancellationReason: 'Client requested reschedule',
      documents: [],
      notes: '',
      canRate: false,
      canReschedule: false,
    },
  ]);

  const statusFilters = ['All', 'Scheduled', 'Completed', 'Pending', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#34C759';
      case 'Scheduled':
        return '#007AFF';
      case 'Pending':
        return '#FF9500';
      case 'Cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return 'video-outline';
      case 'Phone Call':
        return 'call-outline';
      case 'In-Person':
        return 'location-outline';
      default:
        return 'calendar-outline';
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.consultation.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.lawyer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || consultation.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleConsultationPress = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  const handleJoinMeeting = (consultation) => {
    Alert.alert(
      'Join Meeting',
      `Join your ${consultation.consultation.type.toLowerCase()} with ${consultation.lawyer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => console.log('Joining meeting:', consultation.meetingLink) },
      ]
    );
  };

  const handleReschedule = (consultation) => {
    Alert.alert(
      'Reschedule Consultation',
      'Would you like to reschedule this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reschedule', onPress: () => console.log('Reschedule:', consultation.id) },
      ]
    );
  };

  const handleRating = (consultationId, rating) => {
    setConsultations(prev => 
      prev.map(item => 
        item.id === consultationId 
          ? { ...item, userRating: rating, canRate: false }
          : item
      )
    );
    setShowRatingModal(false);
    setRating(0);
    Alert.alert('Thank you!', 'Your rating has been submitted.');
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `#007AFF20` }]}>
        <MaterialCommunityIcons
          name="calendar-check-outline"
          size={64}
          color="#007AFF"
        />
      </View>
      <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
        No Consultations Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
        Book your first consultation with a lawyer to get legal advice
      </Text>
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: '#007AFF' }]}
        onPress={() => console.log('Navigate to book consultation')}
      >
        <Feather name="calendar-plus" size={20} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Book Consultation</Text>
      </TouchableOpacity>
    </View>
  );

  const ConsultationCard = ({ item }) => {
    const isUpcoming = item.status === 'Scheduled';
    const isPending = item.status === 'Pending';
    const canJoin = isUpcoming && new Date(`${item.consultation.date} ${item.consultation.time}`).getTime() - Date.now() < 900000; // 15 min before

    return (
      <TouchableOpacity
        style={[
          styles.consultationCard,
          {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
            borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
          }
        ]}
        onPress={() => handleConsultationPress(item)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) }
          ]} />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.cardContent}>
          {/* Lawyer Info */}
          <View style={styles.lawyerInfo}>
            <Image
              source={{ uri: item.lawyer.avatar }}
              style={styles.lawyerAvatar}
            />
            <View style={styles.lawyerDetails}>
              <View style={styles.lawyerNameRow}>
                <Text style={[
                  styles.lawyerName,
                  { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
                ]}>
                  {item.lawyer.name}
                </Text>
                {item.lawyer.verified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#007AFF"
                  />
                )}
              </View>
              <Text style={[
                styles.lawyerSpecialization,
                { color: isDarkMode ? '#8E8E93' : '#86868B' }
              ]}>
                {item.lawyer.specialization} • {item.lawyer.experience}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD60A" />
                <Text style={[
                  styles.rating,
                  { color: isDarkMode ? '#8E8E93' : '#86868B' }
                ]}>
                  {item.lawyer.rating}
                </Text>
              </View>
            </View>
          </View>

          {/* Consultation Details */}
          <View style={styles.consultationInfo}>
            <View style={styles.consultationHeader}>
              <Text style={[
                styles.consultationTopic,
                { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
              ]}>
                {item.consultation.topic}
              </Text>
              <Text style={[
                styles.consultationFee,
                { color: '#007AFF' }
              ]}>
                {item.consultation.fee}
              </Text>
            </View>
            
            <Text style={[
              styles.consultationDescription,
              { color: isDarkMode ? '#8E8E93' : '#86868B' }
            ]}>
              {item.consultation.description}
            </Text>

            <View style={styles.consultationMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name={getConsultationTypeIcon(item.consultation.type)}
                  size={16}
                  color={isDarkMode ? '#8E8E93' : '#86868B'}
                />
                <Text style={[
                  styles.metaText,
                  { color: isDarkMode ? '#8E8E93' : '#86868B' }
                ]}>
                  {item.consultation.type}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={isDarkMode ? '#8E8E93' : '#86868B'}
                />
                <Text style={[
                  styles.metaText,
                  { color: isDarkMode ? '#8E8E93' : '#86868B' }
                ]}>
                  {new Date(item.consultation.date).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isDarkMode ? '#8E8E93' : '#86868B'}
                />
                <Text style={[
                  styles.metaText,
                  { color: isDarkMode ? '#8E8E93' : '#86868B' }
                ]}>
                  {item.consultation.time} ({item.consultation.duration}m)
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {canJoin && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#34C759' }]}
                onPress={() => handleJoinMeeting(item)}
              >
                <Feather name="video" size={16} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Join Now</Text>
              </TouchableOpacity>
            )}
            
            {item.canReschedule && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { 
                    backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7',
                    flex: canJoin ? 1 : undefined,
                    marginLeft: canJoin ? 8 : 0,
                  }
                ]}
                onPress={() => handleReschedule(item)}
              >
                <Feather name="clock" size={16} color={isDarkMode ? '#FFFFFF' : '#1D1D1F'} />
                <Text style={[
                  styles.secondaryButtonText,
                  { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
                ]}>
                  Reschedule
                </Text>
              </TouchableOpacity>
            )}

            {item.canRate && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: '#FFD60A20' }
                ]}
                onPress={() => {
                  setSelectedConsultation(item);
                  setShowRatingModal(true);
                }}
              >
                <Ionicons name="star-outline" size={16} color="#FFD60A" />
                <Text style={[styles.secondaryButtonText, { color: '#FFD60A' }]}>
                  Rate
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Documents */}
          {item.documents.length > 0 && (
            <View style={styles.documentsSection}>
              <Text style={[
                styles.documentsTitle,
                { color: isDarkMode ? '#8E8E93' : '#86868B' }
              ]}>
                Documents ({item.documents.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.documents.map((doc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.documentChip,
                      { backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7' }
                    ]}
                  >
                    <Feather name="file-text" size={14} color="#007AFF" />
                    <Text style={[
                      styles.documentName,
                      { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
                    ]}>
                      {doc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

  const RatingModal = () => (
    <Modal
      visible={showRatingModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRatingModal(false)}
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
              Rate Your Consultation
            </Text>
            
            {selectedConsultation && (
              <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
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
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#FFD60A' : '#8E8E93'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7' }]}
                onPress={() => {
                  setShowRatingModal(false);
                  setRating(0);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { 
                    backgroundColor: rating > 0 ? '#007AFF' : '#8E8E93',
                    opacity: rating > 0 ? 1 : 0.5,
                  }
                ]}
                onPress={() => selectedConsultation && handleRating(selectedConsultation.id, rating)}
                disabled={rating === 0}
              >
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
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
              My Consultations
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
              {consultations.length} consultations
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: '#007AFF' }]}
            onPress={() => console.log('Navigate to book consultation')}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
          <Feather name="search" size={20} color={isDarkMode ? '#8E8E93' : '#86868B'} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}
            placeholder="Search consultations..."
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
          data={statusFilters}
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

      {/* Consultations List */}
      {filteredConsultations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredConsultations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.consultationsContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ConsultationCard item={item} />}
        />
      )}

      <RatingModal />
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
  bookButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  consultationsContainer: {
    padding: 16,
  },
  consultationCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 12,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  lawyerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lawyerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  lawyerSpecialization: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  consultationInfo: {
    marginBottom: 16,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consultationTopic: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  consultationFee: {
    fontSize: 16,
    fontWeight: '700',
  },
  consultationDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 12,
  },
  consultationMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  documentsSection: {
    marginTop: 8,
  },
  documentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  documentName: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
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
    lineHeight: 24,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyConsultations;