import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import {
  Surface,
  ProgressBar,
  Button,
  Avatar,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Ultra-premium color palette matching lawyer dashboard
const colors = {
  primary: '#0F0F23',
  primaryLight: '#1A1A3A',
  secondary: '#D4AF37', // Gold accent
  tertiary: '#8B5CF6', // Purple accent
  accent: '#06FFA5', // Neon green
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
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']
  }
};

// Mock data for client activities
const clientActivityData = [
  { month: 'Aug', consultations: 3, cases: 2, documents: 4, satisfaction: 4.8 },
  { month: 'Sep', consultations: 5, cases: 3, documents: 6, satisfaction: 4.9 },
  { month: 'Oct', consultations: 4, cases: 2, documents: 3, satisfaction: 4.7 },
  { month: 'Nov', consultations: 6, cases: 4, documents: 8, satisfaction: 4.9 },
  { month: 'Dec', consultations: 8, cases: 5, documents: 12, satisfaction: 5.0 }
];

// Mock upcoming consultations data
const upcomingConsultations = [
  {
    id: 1,
    lawyerName: 'Adv. Priya Sharma',
    specialization: 'Property Law',
    date: '2025-08-18',
    time: '10:00 AM',
    type: 'Video Call',
    duration: '1 hour',
    fee: '₹2,500',
    status: 'confirmed',
    avatar: 'PS',
    rating: 4.9,
    experience: '12 years',
    caseType: 'Property Dispute Consultation',
    priority: 'high',
    notes: 'Bring all property documents and NOC papers'
  },
  {
    id: 2,
    lawyerName: 'Adv. Rajesh Kumar',
    specialization: 'Corporate Law',
    date: '2025-08-20',
    time: '2:30 PM',
    type: 'In-Person',
    duration: '45 minutes',
    fee: '₹3,000',
    status: 'confirmed',
    avatar: 'RK',
    rating: 4.8,
    experience: '15 years',
    caseType: 'Business Contract Review',
    priority: 'medium',
    notes: 'Contract documents review and legal advice'
  },
  {
    id: 3,
    lawyerName: 'Adv. Meera Patel',
    specialization: 'Family Law',
    date: '2025-08-22',
    time: '4:00 PM',
    type: 'Video Call',
    duration: '1.5 hours',
    fee: '₹2,000',
    status: 'pending_confirmation',
    avatar: 'MP',
    rating: 4.7,
    experience: '8 years',
    caseType: 'Divorce Settlement Discussion',
    priority: 'high',
    notes: 'Financial documents and marriage certificate required'
  },
  {
    id: 4,
    lawyerName: 'Adv. Arun Singh',
    specialization: 'Criminal Law',
    date: '2025-08-25',
    time: '11:30 AM',
    type: 'In-Person',
    duration: '2 hours',
    fee: '₹4,000',
    status: 'rescheduled',
    avatar: 'AS',
    rating: 4.6,
    experience: '20 years',
    caseType: 'Bail Application Consultation',
    priority: 'critical',
    notes: 'Urgent consultation for bail proceedings'
  }
];

// Upcoming Consultations Component
const UpcomingConsultations = ({ consultations, onReschedule, onCancel, onJoin }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending_confirmation': return colors.warning;
      case 'rescheduled': return colors.info;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getTimeUntil = (date, time) => {
    const consultationDateTime = new Date(`${date}T${convertTo24Hour(time)}`);
    const now = new Date();
    const diffMs = consultationDateTime - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours <= 0) return "Starting Soon";
    if (diffHours < 24) return `In ${diffHours} hours`;
    const diffDays = Math.ceil(diffHours / 24);
    return `In ${diffDays} days`;
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes}:00`;
  };

  if (!consultations || consultations.length === 0) {
    return (
      <View style={styles.emptyConsultations}>
        <MaterialCommunityIcons name="calendar-plus" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Upcoming Consultations</Text>
        <Text style={styles.emptySubtitle}>Book a consultation with our expert lawyers</Text>
        <Button
          mode="contained"
          style={styles.bookConsultationButton}
          labelStyle={styles.bookConsultationText}
        >
          Find Lawyers
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.consultationsContainer}>
      <View style={styles.consultationsHeader}>
        <Text style={styles.consultationsTitle}>Upcoming Consultations</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.consultationsScroll}
      >
        {consultations.map((consultation) => (
          <Surface key={consultation.id} style={styles.consultationCard}>
            <LinearGradient
              colors={[
                getStatusColor(consultation.status) + '05',
                getStatusColor(consultation.status) + '10'
              ]}
              style={styles.consultationGradient}
            >
              {/* Priority Indicator */}
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(consultation.priority) }
              ]} />

              {/* Header */}
              <View style={styles.consultationHeader}>
                <View style={styles.lawyerInfo}>
                  <LinearGradient
                    colors={colors.gradient.primary}
                    style={styles.lawyerAvatar}
                  >
                    <Text style={styles.avatarText}>{consultation.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.lawyerDetails}>
                    <Text style={styles.lawyerName}>{consultation.lawyerName}</Text>
                    <Text style={styles.specialization}>{consultation.specialization}</Text>
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                      <Text style={styles.rating}>{consultation.rating}</Text>
                      <Text style={styles.experience}>• {consultation.experience}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.timeUntilContainer}>
                  <Text style={styles.timeUntil}>{getTimeUntil(consultation.date, consultation.time)}</Text>
                </View>
              </View>

              {/* Case Type */}
              <View style={styles.caseTypeContainer}>
                <MaterialCommunityIcons 
                  name={consultation.type === 'Video Call' ? 'video' : 'office-building'} 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.caseType}>{consultation.caseType}</Text>
              </View>

              {/* Date & Time */}
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeItem}>
                  <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={styles.dateTimeText}>
                    {new Date(consultation.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <MaterialCommunityIcons name="clock" size={16} color={colors.textSecondary} />
                  <Text style={styles.dateTimeText}>{consultation.time}</Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <MaterialCommunityIcons name="timer" size={16} color={colors.textSecondary} />
                  <Text style={styles.dateTimeText}>{consultation.duration}</Text>
                </View>
              </View>

              {/* Status & Fee */}
              <View style={styles.statusFeeContainer}>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(consultation.status) + '20' }
                  ]}
                  textStyle={[
                    styles.statusText,
                    { color: getStatusColor(consultation.status) }
                  ]}
                >
                  {consultation.status.replace('_', ' ').toUpperCase()}
                </Chip>
                <Text style={styles.feeText}>{consultation.fee}</Text>
              </View>

              {/* Notes */}
              {consultation.notes && (
                <View style={styles.notesContainer}>
                  <MaterialCommunityIcons name="note-text" size={14} color={colors.textSecondary} />
                  <Text style={styles.notesText}>{consultation.notes}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.consultationActions}>
                {consultation.status === 'confirmed' && (
                  <Button
                    mode="contained"
                    style={[styles.actionButton, styles.joinButton]}
                    labelStyle={styles.joinButtonText}
                    onPress={() => onJoin && onJoin(consultation.id)}
                    compact
                  >
                    {consultation.type === 'Video Call' ? 'Join Call' : 'Get Directions'}
                  </Button>
                )}
                
                <Button
                  mode="outlined"
                  style={[styles.actionButton, styles.rescheduleButton]}
                  labelStyle={styles.rescheduleButtonText}
                  onPress={() => onReschedule && onReschedule(consultation.id)}
                  compact
                >
                  Reschedule
                </Button>
                
                <TouchableOpacity
                  style={styles.moreOptionsButton}
                  onPress={() => onCancel && onCancel(consultation.id)}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
};

// Main Export Component
export const ClientDashboardComponents = () => {
  const handleReschedule = (consultationId) => {
    console.log('Reschedule consultation:', consultationId);
    // Implement reschedule logic
  };

  const handleCancel = (consultationId) => {
    console.log('Cancel consultation:', consultationId);
    // Implement cancel logic
  };

  const handleJoin = (consultationId) => {
    console.log('Join consultation:', consultationId);
    // Implement join logic
  };

  return (
    <View style={styles.container}>

      {/* Upcoming Consultations Section */}
      <View style={styles.section}>
        <UpcomingConsultations
          consultations={upcomingConsultations}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onJoin={handleJoin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  // Chart Styles
  chartCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  chartBackground: {
    padding: 24,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chart: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  chartLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginLeft: 35,
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginLeft: 35,
  },
  pointValue: {
    position: 'absolute',
    top: -24,
    left: -15,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  pointValueText: {
    fontSize: 8,
    color: 'white',
    fontWeight: '700',
  },
  chartBar: {
    position: 'absolute',
    borderRadius: 6,
    opacity: 0.8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginLeft: 35,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  chartLabelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartSubLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 16,
    borderRadius: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Consultations Styles
  consultationsContainer: {
    flex: 1,
  },
  consultationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  consultationsTitle: {
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
  consultationsScroll: {
    paddingRight: 24,
  },
  consultationCard: {
    width: width * 0.85,
    marginRight: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  consultationGradient: {
    padding: 20,
    position: 'relative',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lawyerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  lawyerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  lawyerDetails: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  specialization: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 2,
  },
  experience: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 2,
  },
  timeUntilContainer: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeUntil: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
  },
  caseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusChip: {
    height: 26,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.secondary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  consultationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    height: 36,
  },
  joinButton: {
    backgroundColor: colors.success,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  rescheduleButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  rescheduleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  moreOptionsButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Empty State Styles
  emptyConsultations: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookConsultationButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
  },
  bookConsultationText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
export default ClientDashboardComponents;