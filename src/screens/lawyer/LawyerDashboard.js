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
  Modal,
  FlatList,
  TextInput,
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
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { BlurView } from 'expo-blur';
import { SCREEN_NAMES } from '../../utils/constants';
import { getUserCases } from '../../store/caseSlice';
import {addSubtask} from '../../store/caseSlice';
import { getAllUsers } from '../../store/userSlice';
const { width, height } = Dimensions.get('window');

// Ultra-premium color palette with sophisticated gradients
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

export default function LawyerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [goalPeriod, setGoalPeriod] = useState('monthly');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized calculations for performance
  const dashboardMetrics = useMemo(() => {
    if (!cases.length) return {
      totalActiveValue: 0,
      activeClientsCount: 0,
      completedTasks: 0,
      totalTasks: 0,
      successRate: 0,
      monthlyRevenue: 0
    };

    const activeClients = new Set(
      cases
        .filter(c => c.status === "active" && c.client)
        .map(c => c.client.trim())
    );

    const totalActiveValue = cases
    .filter(c =>  user?.uid === c.lawyerId)
    .reduce((total, c) => {
      const caseValue = parseFloat(
        String(c.value || "0").replace(/[₹,]/g, "")
      );
      return total + (isNaN(caseValue) ? 0 : caseValue);
    }, 0);


    const allSubtasks = cases.flatMap(c => Array.isArray(c.subtasks) ? c.subtasks : []);
    const completedTasks = allSubtasks.filter(st => st.status === 'completed').length;
    const totalTasks = allSubtasks.length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalActiveValue,
      activeClientsCount: activeClients.size,
      completedTasks,
      totalTasks,
      successRate,
      monthlyRevenue: totalActiveValue / 100000 // Convert to lakhs
    };
  }, [cases]);

    useEffect(() => {
    if (user?.uid && user?.role) {
      fetchCases();
    }
  }, [user]);

  const CalendarModal = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [category,setCategory] = useState('');

  // Function to get all events/tasks for a specific date
  const getEventsForDate = (date) => {
    const events = [];
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Add case hearings
    cases.forEach(caseItem => {
      if (caseItem.nextHearing === dateStr && caseItem.status !== 'completed') {
        events.push({
          id: `hearing-${caseItem.id}`,
          type: 'hearing',
          title: `Hearing: ${caseItem.title}`,
          caseNumber: caseItem.caseNumber,
          priority: caseItem.priority,
          time: '10:00 AM', // Default time, can be enhanced
          caseId: caseItem.id
        });
      }
      
      // Add subtasks with deadlines
      console.log(caseItem.subtasks,'subtaskkkkkkkkkkkkkkkkkkkk')
      if (caseItem.subtasks) {
        caseItem.subtasks.forEach(subtask => {
          if (subtask.dueDate === dateStr && subtask.status !== 'completed' ) {
            events.push({
              id: `subtask-${subtask.id}`,
              type: 'subtask',
              title: subtask.title,
              caseNumber: caseItem.caseNumber,
              priority: subtask.priority || caseItem.priority,
              caseId: caseItem.id
            });
          }
        });
      }
    });
    
    return events;
  };

  // Function to check if a date has events
  const hasEvents = (day, month, year) => {
    const date =  new Date(Date.UTC(year, month, day));
    return getEventsForDate(date).length > 0;
  };

  // Function to get event indicators for a date
  const getEventIndicators = (day, month, year) => {
    const date =  new Date(Date.UTC(year, month, day));
    const events = getEventsForDate(date);
    
    const indicators = {
      hasHearing: events.some(e => e.type === 'hearing'),
      hasHighPriority: events.some(e => e.priority === 'high' || e.priority === 'critical'),
      hasSubtasks: events.some(e => e.type === 'subtask'),
      count: events.length
    };
    
    return indicators;
  };

  const handleCreateTask = () => {
    // Dispatch action to add subtask
    dispatch(addSubtask({
      caseId: selectedCase?.id,
      subtask: {
        id: `st_${Date.now()}`,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        assignedTo: assignedTo,
        category: category,
        completedAt: null,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: user?.uid,
        dueDate: selectedDate.toISOString().split('T')[0] // Store as YYYY-MM-DD
      }
    }));

    // Reset form and close modal
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setSelectedCase(null);
    setShowCalendarModal(false);
  };

  // Custom Calendar Component
  const CustomCalendar = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const goToPreviousMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1));
    };
    
    const goToNextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1));
    };
    
    const selectDate = (day) => {
      const newDate = new Date(Date.UTC(year, month, day));
      setSelectedDate(newDate);
    };
    
    const isSelected = (day) => {
      return selectedDate.getDate() === day &&
             selectedDate.getMonth() === month &&
             selectedDate.getFullYear() === year;
    };
    
    const isToday = (day) => {
      return today.getDate() === day &&
             today.getMonth() === month &&
             today.getFullYear() === year;
    };
    
    const isPastDate = (day) => {
      const checkDate =  new Date(Date.UTC(year, month, day));
      return checkDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };
    
    // Generate calendar days
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return (
      <View style={styles.calendarContainer}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthYearText}>
            {monthNames[month]} {year}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Day Names */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((dayName) => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                const indicators = day ? getEventIndicators(day, month, year) : null;
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      day && isSelected(day) && styles.selectedDayCell,
                      day && isToday(day) && !isSelected(day) && styles.todayDayCell,
                    ]}
                    onPress={() => day && !isPastDate(day) && selectDate(day)}
                    disabled={!day || isPastDate(day)}
                  >
                    {day && (
                      <>
                        {isSelected(day) && (
                          <LinearGradient
                            colors={colors.gradient.primary}
                            style={styles.selectedDayBackground}
                          />
                        )}
                        <Text style={[
                          styles.dayText,
                          isSelected(day) && styles.selectedDayText,
                          isToday(day) && !isSelected(day) && styles.todayDayText,
                          isPastDate(day) && styles.pastDayText,
                        ]}>
                          {day}
                        </Text>
                        
                        {/* Event Indicators */}
                        {indicators && indicators.count > 0 && (
                          <View style={styles.eventIndicatorsContainer}>
                            {indicators.hasHearing && (
                              <View style={[styles.eventIndicator, styles.hearingIndicator]} />
                            )}
                            {indicators.hasSubtasks && (
                              <View style={[styles.eventIndicator, styles.subtaskIndicator]} />
                            )}
                            {indicators.hasHighPriority && (
                              <View style={[styles.eventIndicator, styles.highPriorityIndicator]} />
                            )}
                            {indicators.count > 3 && (
                              <Text style={styles.eventCountText}>+{indicators.count - 3}</Text>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Events List Component for Selected Date
  const EventsList = () => {
    const events = getEventsForDate(selectedDate);
    
    if (events.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={32} color={colors.textTertiary} />
          <Text style={styles.noEventsText}>No events scheduled for this date</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.eventsListContainer}>
        <Text style={styles.eventsListTitle}>
          Events for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTypeContainer}>
                <MaterialCommunityIcons 
                  name={event.type === 'hearing' ? 'gavel' : 'clipboard-text'} 
                  size={16} 
                  color={event.type === 'hearing' ? colors.warning : colors.info}
                />
                <Text style={[styles.eventTypeText, {
                  color: event.type === 'hearing' ? colors.warning : colors.info
                }]}>
                  {event.type === 'hearing' ? 'Hearing' : 'Task'}
                </Text>
              </View>
              
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getUrgencyColor(event.priority) + '15' }
              ]}>
                <Text style={[
                  styles.priorityBadgeText,
                  { color: getUrgencyColor(event.priority) }
                ]}>
                  {event.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventFooter}>
              <Text style={styles.eventCaseNumber}>{event.caseNumber}</Text>
              {event.time && (
                <Text style={styles.eventTime}>{event.time}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const handleInputChange = (text) => {
    setAssignedTo(text);

    if (!selectedCase || !text.trim()) {
      setFilteredUsers([]); // nothing typed → hide list
      return;
    }

    const caseTeamIds = selectedCase.team || [];

    const matches = users.filter(user =>
      caseTeamIds.includes(user.uid) &&
      user.displayName?.toLowerCase().includes(text.toLowerCase())
    );

    // If no matches, store a "not found" placeholder
    if (matches.length === 0) {
      setFilteredUsers([{ uid: "not-found", displayName: "No users found" }]);
    } else {
      setFilteredUsers(matches.slice(0, 5)); // limit to 5
    }
  };


  return (
    <Modal
      visible={showCalendarModal}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      onRequestClose={() => setShowCalendarModal(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.modalHeader}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => setShowCalendarModal(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Schedule Task</Text>
            
            <TouchableOpacity 
              onPress={handleCreateTask}
              style={styles.saveButton}
              disabled={!taskTitle.trim()}
            >
              <Text style={[
                styles.saveButtonText,
                !taskTitle.trim() && { opacity: 0.5 }
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          {/* Calendar Component */}
          <Surface style={styles.calendarCard}>
            <Text style={styles.sectionTitle}>Select Date & Time</Text>
            
            <CustomCalendar />
            
            <View style={styles.selectedDateInfo}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.selectedDateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            {/* Events for Selected Date */}
            <EventsList />
          </Surface>

          {/* Task Details */}
          <Surface style={styles.taskCard}>
            <Text style={styles.sectionTitle}>Task Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Enter task title..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assign to Case</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.casesContainer}
              >
                
                {cases.slice(0, 5).map((caseItem) => (
                  <TouchableOpacity
                    key={caseItem.id}
                    style={[
                      styles.caseChip,
                      selectedCase?.id === caseItem.id && styles.caseChipActive
                    ]}
                    onPress={() => setSelectedCase(caseItem)}
                  >
                    <Text style={[
                      styles.caseChipText,
                      selectedCase?.id === caseItem.id && styles.caseChipTextActive
                    ]}>
                      {caseItem.title.length > 20 
                        ? caseItem.title.substring(0, 20) + '...' 
                        : caseItem.title
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Task description..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assign To</Text>
              <TextInput
                style={styles.textInput}
                value={assignedTo}
                onChangeText={handleInputChange}
                placeholder="Add team memeber..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            {filteredUsers.length > 0 && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 6,
                  elevation: 3,
                  maxHeight: 150,
                }}
              >
                {filteredUsers.map((user, index) => (
                  <TouchableOpacity
                    key={`${user.uid}-member-${index}`}
                    onPress={() => {
                      setAssignedTo(user.displayName);
                      setFilteredUsers([]);
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderBottomWidth: index !== filteredUsers.length - 1 ? 1 : 0,
                      borderBottomColor: '#eee'
                    }}
                  >
                    <Text style={{ color: colors.textPrimary }}>{user.displayName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {['low', 'medium', 'high', 'critical'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityChip,
                      taskPriority === priority && styles.priorityChipActive,
                      { backgroundColor: getUrgencyColor(priority) + '15' }
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: getUrgencyColor(priority) }
                    ]} />
                    <Text style={[
                      styles.priorityText,
                      { color: getUrgencyColor(priority) },
                      taskPriority === priority && styles.priorityTextActive
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.priorityContainer}>
                {['hearing', 'drafting', 'filing', 'review', 'meeting', 'other'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setCategory(priority )}
                  >
                    <Chip
                      selected={category === priority}
                      style={[
                        styles.categoryChip,
                        category === priority && styles.categoryChipSelected
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
          </Surface>
        </ScrollView>
      </View>
    </Modal>
  );
};

  // Chart data generation based on actual case data
  const chartData = useMemo(() => {
    if (!cases.length) return [];

    // Group cases by creation month for trend analysis
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize last 4 months + current month (5 total)
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        cases: 0,
        revenue: 0,
        completed: 0,
        success: 0
      };
    }

    // Populate with actual case data
    cases.forEach(caseItem => {
      let caseDate;
      let caseValue;
      if (caseItem.createdAt) {
        caseDate = new Date(caseItem.createdAt);
      } else {
        // Fallback to current date if createdAt is null
        caseDate = new Date();
      }

      caseValue = caseItem.lawyerId === user?.uid ? caseItem.value : 0;

      const monthKey = `${caseDate.getFullYear()}-${String(caseDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].cases += 1;
        monthlyData[monthKey].revenue += parseFloat(String(caseValue || "0").replace(/[₹,]/g, "")) / 100000;
        
        const subtasks = Array.isArray(caseItem.subtasks) ? caseItem.subtasks : [];
        const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
        monthlyData[monthKey].completed += completedSubtasks;
        monthlyData[monthKey].success = subtasks.length > 0 ? 
          Math.round((completedSubtasks / subtasks.length) * 100) : 0;
      }
    });

    return Object.values(monthlyData);
  }, [cases]);

  const fetchCases = async () => {
    try {
        setLoading(true);
      const casesData = await dispatch(getUserCases({ 
        userId: user.uid, 
        userRole: user.role 
      })).unwrap();

      const usersData = await dispatch(getAllUsers()).unwrap();
      setUsers(usersData || []);
      setCases(casesData || []);
      console.log('Fetched cases:', casesData);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      setCases([]);
    } finally {
      setLoading(false);
        }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  };

  const getInvolvedClients = (users, cases) => {
  return users
    .filter(user => user.role === 'client') // only clients
    .map(user => {
      const clientCases = cases.filter(c => c.client === user.displayName);

      // derive priority: highest among client’s cases
      let priority = 'low';
      if (clientCases.some(c => c.priority === 'high')) priority = 'high';
      else if (clientCases.some(c => c.priority === 'medium')) priority = 'medium';

      return {
        id: user.uid,
        name: user.displayName, // from displayName
        email: user.email,
        phone: user.phoneNumber || 'N/A', // will update later when available
        avatar: user.displayName?.charAt(0).toUpperCase(),
        status: 'active', // default
        caseCount: clientCases.length,
        totalValue: clientCases.reduce((sum, c) => sum + Number(c.value || 0), 0),
        lastContact: clientCases.length > 0 
          ? clientCases[0].updatedAt 
          : user.updatedAt,
        category: clientCases[0]?.type || 'General', // from case type
        priority, // derived logic
        location: 'N/A' // will add later
      };
    });
};



  const stats = [
    { 
      label: 'Active Cases', 
      value: cases.length.toString(), 
      change: '+2',
      trend: 'up',
      icon: 'briefcase-variant', 
      gradient: colors.gradient.primary,
      glowColor: colors.primary,
      screen: SCREEN_NAMES.CASE_MANAGEMENT,
      resource:cases,
      description: 'This month'
    },
    { 
      label: 'Success Rate', 
      value: `${dashboardMetrics.successRate}%`, 
      change: '+4%',
      trend: 'up',
      icon: 'trophy-variant', 
      gradient: colors.gradient.success,
      glowColor: colors.success,
      description: 'Completion ratio'
    },
    { 
      label: 'Active Value', 
      value: `₹${(dashboardMetrics.totalActiveValue / 100000).toFixed(1)}L`, 
      change: '+12%',
      trend: 'up',
      icon: 'diamond', 
      gradient: colors.gradient.gold,
      screen: SCREEN_NAMES.REVENUE,
      glowColor: colors.secondary,
      description: 'Total portfolio'
    },
    { 
      label: 'Active Clients', 
      value: dashboardMetrics.activeClientsCount.toString(), 
      change: '+3',
      trend: 'up',
      icon: 'account-group', 
      gradient: colors.gradient.info,
      glowColor: colors.info,
      screen: SCREEN_NAMES.MY_CONSULTATIONS,
      resource: getInvolvedClients(users, cases),
      description: 'Current clients'
    },
  ];

  const allTasks = useMemo(() => {
    return cases.flatMap(caseItem => {
      if (Array.isArray(caseItem.subtasks)) {
        return caseItem.subtasks
          .filter(subtask => subtask.status !== "completed")
          .map(subtask => {
            let deadlineText = '';
            if (subtask.dueDate) {
              const due = new Date(subtask.dueDate);
              const now = new Date();
              const diffMs = due - now;
              const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
              if (diffHrs > 24) {
                const diffDays = Math.ceil(diffHrs / 24);
                deadlineText = `${diffDays} days`;
              } else if (diffHrs > 0) {
                deadlineText = `${diffHrs} hours`;
              } else {
                deadlineText = "Overdue";
              }
            }
            
            return {
              id: subtask.id,
              title: subtask.title,
              client: caseItem.client,
              priority: subtask.priority,
              category: subtask.category,
              progress: subtask.progress || 0,
              urgency: subtask.priority,
              value: caseItem.value,
              deadline: deadlineText || "No deadline",
              assignedTo: subtask.assignedTo || "",
              caseTitle: caseItem.title,
              caseId: caseItem.id
            };
          });
      }
      return [];
    });
  }, [cases]);

  const filterButtons = [
    { key: 'all', label: 'All Tasks', icon: 'view-grid', count: allTasks.length },
    { key: 'critical', label: 'Critical', icon: 'alert-circle', count: allTasks.filter(t => t.priority === 'critical').length },
    { key: 'high', label: 'High Priority', icon: 'flag', count: allTasks.filter(t => t.priority === 'high').length },
    { key: 'overdue', label: 'Overdue', icon: 'clock-alert', count: allTasks.filter(t => t.deadline === 'Overdue').length },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'critical':
        return allTasks.filter(task => task.priority === 'critical');
      case 'high':
        return allTasks.filter(task => task.priority === 'high');
      case 'overdue':
        return allTasks.filter(task => task.deadline === 'Overdue');
      default:
        return allTasks;
    }
  };

  const quickActions = [
    { 
    title: 'Calendar', 
    icon: 'calendar-plus', 
    gradient: colors.gradient.primary,
    description: 'Schedule tasks',
    onPress: () => setShowCalendarModal(true) // Add this state
  },
    { 
      title: 'AI Research', 
      icon: 'robot-excited', 
      gradient: colors.gradient.purple,
      screen: SCREEN_NAMES.AI_CHAT,
      description: 'Legal AI'
    },
    { 
      title: 'Documents', 
      icon: 'file-document-multiple', 
      gradient: colors.gradient.info,
      screen: SCREEN_NAMES.LEGAL_DOCUMENTS,
      description: 'Manage files'
    },
    { 
      title: 'Analytics', 
      icon: 'chart-line-variant', 
      gradient: colors.gradient.success,
      screen: SCREEN_NAMES.ANALYTICS,
      description: 'View insights'
    },
  ];

  const handleAction = (screenName,resource) => {
    if (screenName) {
      navigation.navigate('InApp', { 
      screen: screenName,
      params: resource ? { resource } : undefined
    });

    }
  };

  const handleStatCardPress = (stat) => {
    if (stat.screen) {
      handleAction(stat.screen,stat?.resource);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Simple Mini Chart Component
  const MiniChart = ({ data, type = 'line' }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>No data available</Text>
        </View>
      );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1); // Prevent 0 max
    const maxCases = Math.max(...data.map(d => d.cases || 0), 1); // Prevent 0 max
    const chartHeight = 100;
    const chartWidth = width - 80; // More padding for better alignment
    const pointSpacing = chartWidth / (data.length);
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Performance Trend (Last 5 Months)</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Revenue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Cases</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.chart, { height: chartHeight, width: chartWidth, alignSelf: 'center' }]}>
          {/* Background Grid Lines */}
          <View style={styles.gridContainer}>
            {[0.25, 0.5, 0.75, 1].map((fraction, index) => (
              <View
                key={`grid-${index}`}
                style={[
                  styles.gridLine,
                  {
                    top: chartHeight * (1 - fraction),
                    width: chartWidth,
                  }
                ]}
              />
            ))}
          </View>

          {/* Revenue Line Path */}
          {data.map((point, index) => {
            if (index === data.length - 1) return null;
            const nextPoint = data[index + 1];
            
            const x1 = index * pointSpacing;
            const y1 = chartHeight - ((point.revenue / maxRevenue) * (chartHeight - 20)); // 20px padding from top
            const x2 = (index + 1) * pointSpacing;
            const y2 = chartHeight - ((nextPoint.revenue / maxRevenue) * (chartHeight - 20));
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.chartLine,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 50%',
                  }
                ]}
              />
            );
          })}
          
          {/* Revenue Data Points */}
          {data.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - ((point.revenue / maxRevenue) * (chartHeight - 20));
            
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.chartPoint,
                  {
                    left: x - 6, // Center the point
                    top: y - 6,
                  }
                ]}
              >
                {/* Value label on hover/touch */}
                <View style={styles.pointValue}>
                  <Text style={styles.pointValueText}>₹{point.revenue.toFixed(1)}L</Text>
                </View>
              </View>
            );
          })}
          
          {/* Cases Bars */}
          {data.map((point, index) => {
            const barHeight = (point.cases / maxCases) * (chartHeight * 0.4); // Max 40% of chart height
            const x = index * pointSpacing;
            
            return (
              <View
                key={`bar-${index}`}
                style={[
                  styles.chartBar,
                  {
                    left: x - 12, // Center the bar
                    bottom: 0,
                    height: barHeight,
                    width: 24, // Fixed width for bars
                  }
                ]}
              />
            );
          })}
        </View>
        
        {/* X-axis labels with better spacing */}
        <View style={[styles.chartLabels, { width: chartWidth, alignSelf: 'center' }]}>
          {data.map((point, index) => (
            <View key={`label-${index}`} style={styles.chartLabelContainer}>
              <Text style={styles.chartLabel}>{point.month}</Text>
              <Text style={styles.chartSubLabel}>{point.cases} cases</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

const SkeletonCaseCard = () => (
  <View style={styles.caseCard}>
    {/* Top row */}
    <View style={styles.caseHeader}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={{ width: 60, height: 60, borderRadius: 12 }}
      />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ width: '70%', height: 16, borderRadius: 4, marginBottom: 8 }}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ width: '50%', height: 12, borderRadius: 4 }}
        />
      </View>
    </View>

    {/* Meta info row */}
    <View style={styles.caseMeta}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={{ width: 80, height: 12, borderRadius: 4, marginRight: 8 }}
      />
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={{ width: 60, height: 12, borderRadius: 4 }}
      />
    </View>

    {/* Progress bar */}
    <ShimmerPlaceHolder
      LinearGradient={LinearGradient}
      style={{ width: '100%', height: 10, borderRadius: 5, marginTop: 12 }}
    />
  </View>
);

if (loading) {
  return (
    <FlatList
      data={[1, 2, 3, 4, 5, 6]} // number of skeleton cards
      keyExtractor={(item) => item.toString()}
      renderItem={() => <SkeletonCaseCard />}
      numColumns={2}
      columnWrapperStyle={ {justifyContent: 'space-between'}}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header with Glass Morphism */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating particles effect background */}
          <View style={styles.particleContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={colors.gradient.gold}
                  style={styles.avatarGradient}
                >
                  <Avatar.Text 
                    size={56} 
                    label={user?.displayName?.charAt(0) || 'A'} 
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                  />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>{getGreeting()}</Text>
                <Text style={styles.userName}>Adv. {user?.displayName}</Text>
                <View style={styles.expertiseBadge}>
                  <MaterialCommunityIcons name="star" size={12} color={colors.secondary} />
                  <Text style={styles.expertiseText}>Senior Partner</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="magnify" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="bell" size={20} color="white" />
                  <Badge size={8} style={styles.notificationBadge} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.8}
                onPress={handleRefresh}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons 
                    name="refresh" 
                    size={20} 
                    color="white" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        {/* Premium Glass Summary Card */}
        <View style={styles.summaryCardContainer}>
          <BlurView intensity={95} tint="light" style={styles.glassSummary}>
            <LinearGradient
              colors={colors.gradient.glass}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.primary}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="clipboard-check" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{allTasks.length}</Text>
                  <Text style={styles.summaryLabel}>Priority Tasks</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.gold}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="currency-inr" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>
                    ₹{(dashboardMetrics.totalActiveValue / 100000).toFixed(1)}L
                  </Text>
                  <Text style={styles.summaryLabel}>Active Value</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <LinearGradient
                      colors={colors.gradient.success}
                      style={styles.summaryIcon}
                    >
                      <MaterialCommunityIcons name="account-group" size={16} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.summaryValue}>{dashboardMetrics.activeClientsCount}</Text>
                  <Text style={styles.summaryLabel}>Active Clients</Text>
                </View>
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {/* Premium Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={width * 0.42}
          >
            {stats.map((stat, index) => (
              <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => handleStatCardPress(stat)}>
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
                          color={colors.accent} 
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

        {/* Dynamic Performance Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Trends</Text>
          </View>
          
          <Surface style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.progressBackground}
            >
              <MiniChart data={chartData} type="line" />
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{dashboardMetrics.successRate}%</Text>
                  <Text style={styles.metricLabel}>Success Rate</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{dashboardMetrics.completedTasks}/{dashboardMetrics.totalTasks}</Text>
                  <Text style={styles.metricLabel}>Tasks Done</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>₹{dashboardMetrics.monthlyRevenue.toFixed(1)}L</Text>
                  <Text style={styles.metricLabel}>Monthly Rev</Text>
                </View>
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Enhanced Task Filter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>High-Priority Matters</Text>
          </View>
          
          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScrollView}
          >
            {filterButtons.map((filter,index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  activeFilter === filter.key && styles.filterChipActive
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={activeFilter === filter.key ? colors.gradient.primary : ['transparent', 'transparent']}
                  style={styles.filterChipGradient}
                >
                  <MaterialCommunityIcons 
                    name={filter.icon} 
                    size={16} 
                    color={activeFilter === filter.key ? 'white' : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    activeFilter === filter.key && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                  {filter.count > 0 && (
                    <View style={[
                      styles.filterBadge,
                      activeFilter === filter.key && styles.filterBadgeActive
                    ]}>
                      <Text style={[
                        styles.filterBadgeText,
                        activeFilter === filter.key && styles.filterBadgeTextActive
                      ]}>
                        {filter.count}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Filtered Tasks */}
          {getFilteredTasks().length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
              <Text style={styles.emptyStateText}>All tasks completed!</Text>
              <Text style={styles.emptyStateSubtext}>Great job staying on top of your priorities</Text>
            </View>
          ) : (
            getFilteredTasks().map((task, index) => (
              <TouchableOpacity key={task.id} activeOpacity={0.95}>
                <Surface style={styles.premiumTaskCard}>
                  <View style={styles.taskCardContent}>
                    <View style={styles.taskMainInfo}>
                      <View style={styles.taskIconSection}>
                        <LinearGradient
                          colors={getPriorityGradient(task.priority)}
                          style={styles.taskIconContainer}
                        >
                          <MaterialCommunityIcons 
                            name={getTaskIcon(task.category)} 
                            size={20} 
                            color="white" 
                          />
                        </LinearGradient>
                      </View>
                      
                      <View style={styles.taskDetails}>
                        <View style={styles.taskTitleRow}>
                          <Text style={styles.premiumTaskTitle}>{task.title}</Text>
                          <View style={styles.taskValueContainer}>
                            <Text style={styles.taskValue}>
                              ₹{(parseFloat(String(task.value || "0").replace(/[₹,]/g, "")) / 100000).toFixed(1)}L
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={styles.taskClient}>{task.client}</Text>
                        
                        <View style={styles.taskMetaRow}>
                          <Chip 
                            mode="flat"
                            compact
                            style={[
                              styles.categoryChip,
                              { backgroundColor: colors.primary + '10' }
                            ]}
                            textStyle={styles.categoryChipText}
                          >
                            {task.category || 'General'}
                          </Chip>
                          
                          <View style={styles.urgencyIndicator}>
                            <View style={[
                              styles.urgencyDot,
                              { backgroundColor: getUrgencyColor(task.urgency) }
                            ]} />
                            <Text style={styles.urgencyText}>{task.urgency}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.taskFooter}>
                      <View style={styles.deadlineSection}>
                        <MaterialCommunityIcons 
                          name={task.deadline === 'Overdue' ? 'alert-circle' : 'clock-outline'} 
                          size={14} 
                          color={task.deadline === 'Overdue' ? colors.error : colors.textSecondary} 
                        />
                        <Text style={[
                          styles.deadlineText,
                          task.deadline === 'Overdue' && { color: colors.error }
                        ]}>
                          {task.deadline === 'Overdue' ? 'Overdue' : `Due in ${task.deadline}`}
                        </Text>
                      </View>
                      
                      <View style={styles.progressSection}>
                        <Text style={styles.progressLabel}>{task.progress}% Complete</Text>
                        <View style={styles.miniProgressContainer}>
                          <ProgressBar 
                            progress={task.progress / 100} 
                            color={colors.primary}
                            style={styles.miniProgressBar}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Futuristic Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionWrapper}
                onPress={action.onPress || (() => handleAction(action.screen))}
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
        <CalendarModal/>
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

// Helper functions
const getPriorityGradient = (priority) => {
  switch (priority) {
    case 'critical': return ['#EF4444', '#DC2626'];
    case 'high': return ['#F59E0B', '#D97706'];
    case 'medium': return ['#3B82F6', '#2563EB'];
    case 'low': return ['#10B981', '#059669'];
    default: return ['#64748B', '#475569'];
  }
};

const getTaskIcon = (category) => {
  switch (category) {
    case 'research': return 'magnify';
    case 'filing': return 'file-document-edit';
    case 'review': return 'magnify-scan';
    case 'audit': return 'shield-check';
    case 'negotiation': return 'handshake';
    case 'application': return 'file-plus';
    case 'other': return 'briefcase';
    default: return 'clipboard-text';
  }
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#3B82F6';
    case 'low': return '#10B981';
    default: return '#64748B';
  }
};

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
    backgroundColor: colors.accent,
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
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  expertiseText: {
    color: colors.secondary,
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
    borderColor: 'rgba(3, 3, 3, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
  },
  summaryCardContainer: {
    marginHorizontal: 24,
    marginTop: -12,
  },
  glassSummary: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(11, 10, 10, 0.2)',
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
  sectionHeaderSimple: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  filterScrollView: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingRight: 24,
    gap: 12,
  },
  filterChip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.textTertiary,
  },
  filterChipActive: {
    borderColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: colors.textTertiary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  filterBadgeTextActive: {
    color: 'white',
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
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    color: colors.accent,
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
  progressCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  progressBackground: {
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
    backgroundColor: colors.secondary,
    borderRadius: 1.5,
    elevation: 1,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginLeft: 35, // Adjust to align with chart points
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: colors.secondary,
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
    backgroundColor: colors.success,
    borderRadius: 6,
    opacity: 0.8,
    elevation: 1,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginLeft: 35, // Adjust to align with chart bars
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
    height: 100,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumTaskCard: {
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
  taskCardContent: {
    padding: 20,
  },
  taskMainInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskIconSection: {
    marginRight: 16,
  },
  taskIconContainer: {
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
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  premiumTaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  taskValueContainer: {
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskValue: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '800',
  },
  taskClient: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 28,
    backgroundColor: colors.primary + '10',
  },
  categoryChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniProgressContainer: {
    width: 60,
    marginTop: 4,
  },
  miniProgressBar: {
    height: 3,
    borderRadius: 1.5,
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
  bottomSpacing: {
    height: 40,
  },
  eventIndicatorsContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  hearingIndicator: {
    backgroundColor: '#FFA500', // Orange for hearings
  },
  subtaskIndicator: {
    backgroundColor: '#2196F3', // Blue for subtasks
  },
  highPriorityIndicator: {
    backgroundColor: '#F44336', // Red for high priority
  },
  eventCountText: {
    fontSize: 8,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  
  // Events List
  eventsListContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Event Item
  eventItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCaseNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // Enhanced Calendar Day Cell for better event visibility
  dayCell: {
    flex: 1,
    height: 45, // Increased height to accommodate indicators
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
    position: 'relative',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + 20 || 44,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  calendarCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  taskCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  
  // Custom Calendar Styles
  calendarContainer: {
    backgroundColor: 'transparent',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calendarGrid: {
    backgroundColor: 'transparent',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDayBackground: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedDayCell: {
    // Additional styling handled by gradient background
  },
  todayDayCell: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    zIndex: 1,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '700',
  },
  todayDayText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  pastDayText: {
    color: colors.textTertiary,
    opacity: 0.5,
  },
  
  selectedDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityTextActive: {
    color: colors.primary,
  },
  casesContainer: {
    gap: 12,
    paddingRight: 24,
  },
  caseChip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  caseChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  caseChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  caseChipTextActive: {
    color: colors.primary,
  },
    // Category Chips
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryChip: {
    marginBottom: 4
  },
  categoryChipSelected: {
    backgroundColor: colors.primary + '15'
  },
    formGroup: {
    marginBottom: 20,
    marginTop: 20
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  }
});
