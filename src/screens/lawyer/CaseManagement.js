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
  Keyboard,
  Platform,
  Text as RNText
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
  TextInput as PaperInput,
  Menu,
  IconButton,
  Switch,
  Checkbox
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { createCase,updateCase, deleteCase, getUserCases } from '../../store/caseSlice';
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

const caseStatuses = [
  { id: 'active', label: 'Active', color: colors.success, icon: 'play-circle' },
  { id: 'pending', label: 'Pending', color: colors.warning, icon: 'clock-outline' },
  { id: 'review', label: 'Under Review', color: colors.info, icon: 'magnify' },
  { id: 'completed', label: 'Completed', color: colors.primary, icon: 'check-circle' },
  { id: 'on-hold', label: 'On Hold', color: colors.error, icon: 'pause-circle' }
];

const caseTypes = [
  { id: 'corporate', label: 'Corporate Law', icon: 'domain' },
  { id: 'civil', label: 'Civil Law', icon: 'gavel' },
  { id: 'criminal', label: 'Criminal Law', icon: 'shield-alert' },
  { id: 'family', label: 'Family Law', icon: 'account-group' },
  { id: 'property', label: 'Property Law', icon: 'home-city' },
  { id: 'intellectual', label: 'IP Law', icon: 'lightbulb' }
];

const priorityOptions = [
  { id: 'critical', label: 'Critical', color: colors.error },
  { id: 'high', label: 'High', color: colors.warning },
  { id: 'medium', label: 'Medium', color: colors.info },
  { id: 'low', label: 'Low', color: colors.success }
];

const timelineEventTypes = [
  { id: 'case_created', label: 'Case Created', icon: 'plus-circle', color: colors.success },
  { id: 'hearing_scheduled', label: 'Hearing Scheduled', icon: 'calendar-plus', color: colors.info },
  { id: 'hearing_completed', label: 'Hearing Completed', icon: 'check-circle', color: colors.success },
  { id: 'document_filed', label: 'Document Filed', icon: 'file-upload', color: colors.warning },
  { id: 'milestone_reached', label: 'Milestone Reached', icon: 'flag', color: colors.primary },
  { id: 'status_changed', label: 'Status Changed', icon: 'refresh', color: colors.tertiary },
  { id: 'note_added', label: 'Note Added', icon: 'note-text', color: colors.textSecondary },
  { id: 'custom', label: 'Custom Event', icon: 'star', color: colors.secondary }
];

function parseCurrencyToNumber(value) {
  if (!value) return 0;
  try {
    const digits = value.replace(/[^0-9]/g, '');
    return parseInt(digits || '0', 10);
  } catch (e) {
    return 0;
  }
}




export default function CaseManagement({ navigation }) {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

    const fetchCases = async () => {
    try {
      const cases = await dispatch(getUserCases({ userId: user.uid, userRole: user.role })).unwrap();
      console.log('Fetched cases:', cases);
      setCases(cases);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };
  
  // Base state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, text: '' });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [menuVisibleFor, setMenuVisibleFor] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Enhanced modals state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false);
  const [documentUploadProgress, setDocumentUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const emptyForm = {
    title: '',
    client: '',
    type: 'corporate',
    status: 'active',
    priority: 'medium',
    value: '',
    progress: 0,
    nextHearing: '',
    description: '',
    documents: 0,
    team: [],
    subtasks: [],
    attachments: [],
    timeline: []
  };
  
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);
  const [teamInput, setTeamInput] = useState('');
  const [cases, setCases] = useState([]);

  // Document form state
  const [documentForm, setDocumentForm] = useState({
    name: '',
    description: '',
    category: 'legal',
    isPublic: false,
    file: null
  });

  // Subtask form state
  const [subtaskForm, setSubtaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    category: 'research'
  });

  // Timeline form state
  const [timelineForm, setTimelineForm] = useState({
    type: 'custom',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  });

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with mock data
    const mockCases = [
      {
        id: '1',
        title: 'Corporate Merger Agreement',
        client: 'TechCorp India Ltd.',
        caseNumber: 'CSE/2024/001',
        type: 'corporate',
        status: 'active',
        priority: 'high',
        value: '₹50,00,000',
        progress: 65,
        nextHearing: '2024-08-20',
        description: 'Complex corporate merger involving due diligence and regulatory compliance.',
        createdAt: '2024-07-15',
        lastUpdated: '2024-08-14',
        team: ['Adv. Rajesh Kumar', 'Adv. Priya Sharma', 'Jr. Associate John'],
        documents: 12,
        subtasks: [
          {
            id: 'st1',
            title: 'Due Diligence Review',
            description: 'Complete financial and legal due diligence',
            assignedTo: 'Adv. Priya Sharma',
            dueDate: '2024-08-18',
            priority: 'high',
            category: 'research',
            status: 'in-progress',
            completedAt: null,
            createdAt: '2024-08-10'
          },
          {
            id: 'st2',
            title: 'Draft Merger Documents',
            description: 'Prepare merger agreement and ancillary documents',
            assignedTo: 'Adv. Rajesh Kumar',
            dueDate: '2024-08-25',
            priority: 'medium',
            category: 'drafting',
            status: 'pending',
            completedAt: null,
            createdAt: '2024-08-12'
          }
        ],
        attachments: [
          {
            id: 'doc1',
            name: 'Merger Agreement Draft.pdf',
            size: '2.5 MB',
            type: 'pdf',
            category: 'legal',
            uploadedBy: 'Adv. Rajesh Kumar',
            uploadedAt: '2024-08-10',
            isPublic: false,
            description: 'Initial draft of merger agreement'
          },
          {
            id: 'doc2',
            name: 'Financial Statements.xlsx',
            size: '1.2 MB',
            type: 'excel',
            category: 'financial',
            uploadedBy: 'Jr. Associate John',
            uploadedAt: '2024-08-12',
            isPublic: true,
            description: 'Consolidated financial statements'
          }
        ],
        timeline: [
          {
            id: 't1',
            type: 'case_created',
            title: 'Case Created',
            description: 'Case opened for corporate merger proceedings',
            date: '2024-07-15',
            status: 'completed',
            createdBy: 'Adv. Rajesh Kumar'
          },
          {
            id: 't2',
            type: 'hearing_scheduled',
            title: 'Initial Hearing Scheduled',
            description: 'First hearing scheduled with regulatory authority',
            date: '2024-08-05',
            status: 'completed',
            createdBy: 'Adv. Rajesh Kumar'
          },
          {
            id: 't3',
            type: 'document_filed',
            title: 'Merger Application Filed',
            description: 'Application filed with Competition Commission',
            date: '2024-08-10',
            status: 'completed',
            createdBy: 'Adv. Priya Sharma'
          }
        ]
      }
    ];
    if (user?.uid && user?.role) {
      fetchCases();
    }
    setCases(mockCases);
  }, [user, dispatch]);

  // Utility functions
  function getCaseTypeInfo(type) {
    return caseTypes.find((t) => t.id === type) || caseTypes[0];
  }

    function getCaseTypeInfo(type) {
    return caseTypes.find((t) => t.id === type) || caseTypes[0];
  }

  function getCaseStatusInfo(status) {
    return caseStatuses.find((s) => s.id === status) || caseStatuses[0];
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

  function openMenuFor(caseItemId) {
    setMenuVisibleFor(caseItemId);
  }

  function closeMenu() {
    setMenuVisibleFor(null);
  }

  function handleViewDetails(caseItem) {
    setSelectedCase(caseItem);
    setShowCaseDetailsModal(true);
    closeMenu();
  }

  function handleDelete(caseItem) {
    closeMenu();

    Alert.alert(
      'Delete Case',
      `Are you sure you want to delete "${caseItem.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCase(caseItem.id)) // use the correct id
              .unwrap()
              .then(() => {
                setSnackbar({ visible: true, text: 'Case deleted successfully' });
                fetchCases(); // fetch updated cases after successful deletion
              })
              .catch((error) => {
                Alert.alert('Error', error.message || error);
              });
          }
        }
      ]
    );
  }


  function handleEdit(caseItem) {
    setSelectedCase(caseItem);
    setEditForm(caseItem);
    setShowEditModal(true);
    closeMenu();
  }

  function undoDelete() {
    if (lastDeleted) {
      setCases((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);

          setSnackbar({ visible: true, text: 'Case restored successfully' });
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setTeamInput('');
  }

  function addTeamMember(formSetter, memberName) {
    if (!memberName || memberName.trim() === '') return;
    formSetter((prev) => ({ ...prev, team: [...(prev.team || []), memberName.trim()] }));
    setTeamInput('');
  }

  function removeTeamMember(formSetter, memberName) {
    formSetter((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m !== memberName)
    }));
  }

  function handleAddCase(localForm) {
    // if (!form.title.trim() || !form.client.trim()) {
    //   Alert.alert('Validation Error', 'Please enter both case title and client name');
    //   return;
    // }


    const newCase = {
      ...localForm,
      caseNumber: `CSE/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      timeline: [{
        id: 't1',
        date: new Date().toISOString().split('T')[0],
        text: 'Case created',
        status: 'completed'
      }],
      attachments: [],
      subtasks: []
    };

    dispatch(createCase(newCase))
      .unwrap()
      .then(() => {
        resetForm();
        setShowAddCaseModal(false);
        setSnackbar({ visible: true, text: 'Case added successfully' });
      })
      .catch((error) => {
        Alert.alert('Error', error);
      });

      fetchCases();
  }

function handleSaveEdit(localForm) {
  console.log('=== handleSaveEdit Debug ===');
  console.log('localForm:', JSON.stringify(localForm, null, 2));
  
  if (!localForm || !localForm.id) {
    console.error('Invalid form data:', localForm);
    Alert.alert('Error', 'Invalid form data');
    return;
  }

  const caseId = localForm.id;
  const patchData = { ...localForm };
  delete patchData.id;
  
  console.log('caseId:', caseId);
  console.log('patchData:', JSON.stringify(patchData, null, 2));

  dispatch(updateCase({ caseId, patchData }))
    .unwrap()
    .then((response) => {
      console.log('=== Update Success ===');
      console.log('Full response:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log('Update confirmed successful');
        setShowEditModal(false);
        setEditForm(null);
        setSnackbar({ visible: true, text: 'Case updated successfully' });
      } else {
        console.error('Update failed - no success confirmation:', response);
        Alert.alert('Error', 'Update failed - no success confirmation');
      }
    })
    .catch((error) => {
      console.log('=== Update Error ===');
      console.error('Caught error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.toString() || 'Failed to update case';
        
      console.error('Final error message:', errorMessage);
      Alert.alert('Error', errorMessage);
    });
}



  function getCaseStatusInfo(status) {
    return caseStatuses.find((s) => s.id === status) || caseStatuses[0];
  }

  function getPriorityColor(priority) {
    const priorityInfo = priorityOptions.find(p => p.id === priority);
    return priorityInfo ? priorityInfo.color : colors.textSecondary;
  }

  function getTimelineEventInfo(type) {
    return timelineEventTypes.find(t => t.id === type) || timelineEventTypes[timelineEventTypes.length - 1];
  }

  // Filter and sort cases
  const filteredCases = cases
    .filter((caseItem) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        caseItem.title.toLowerCase().includes(q) ||
        caseItem.client.toLowerCase().includes(q) ||
        caseItem.caseNumber.toLowerCase().includes(q);

      const matchesFilters =
        selectedFilters.length === 0 ||
        selectedFilters.includes(caseItem.status) ||
        selectedFilters.includes(caseItem.type) ||
        selectedFilters.includes(caseItem.priority);

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'priority') {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      if (sortBy === 'value') {
        return parseCurrencyToNumber(b.value) - parseCurrencyToNumber(a.value);
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      return 0;
    });

  // Animated values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 120],
    extrapolate: 'clamp'
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  // Document handling functions
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocumentForm(prev => ({
          ...prev,
          file: file,
          name: file.name || 'Document'
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentForm.file || !documentForm.name.trim()) {
      Alert.alert('Validation Error', 'Please select a file and provide a name');
      return;
    }

    setIsUploading(true);
    setDocumentUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setDocumentUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDocument = {
        id: `doc_${Date.now()}`,
        name: documentForm.name,
        size: documentForm.file.size ? `${(documentForm.file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        type: documentForm.file.mimeType?.includes('pdf') ? 'pdf' : 
              documentForm.file.mimeType?.includes('excel') || documentForm.file.name?.includes('.xlsx') ? 'excel' :
              documentForm.file.mimeType?.includes('word') ? 'word' : 'document',
        category: documentForm.category,
        uploadedBy: user?.name || 'Current User',
        uploadedAt: new Date().toISOString().split('T')[0],
        isPublic: documentForm.isPublic,
        description: documentForm.description,
        uri: documentForm.file.uri
      };

      // Update selected case
      const updatedCase = {
        ...selectedCase,
        attachments: [...(selectedCase.attachments || []), newDocument],
        documents: (selectedCase.documents || 0) + 1
      };

      // Update cases array
      setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
      setSelectedCase(updatedCase);

      // Add timeline event
      const timelineEvent = {
        id: `t_${Date.now()}`,
        type: 'document_filed',
        title: 'Document Uploaded',
        description: `${documentForm.name} has been uploaded`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        createdBy: user?.name || 'Current User'
      };

      updatedCase.timeline = [...(updatedCase.timeline || []), timelineEvent];
      setSelectedCase({...updatedCase});
      setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));

      setDocumentUploadProgress(100);
      setTimeout(() => {
        setShowAddDocumentModal(false);
        setDocumentForm({
          name: '',
          description: '',
          category: 'legal',
          isPublic: false,
          file: null
        });
        setIsUploading(false);
        setDocumentUploadProgress(0);
        setSnackbar({ visible: true, text: 'Document uploaded successfully' });
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setDocumentUploadProgress(0);
      Alert.alert('Upload Failed', 'Failed to upload document');
    }
  };

  // Subtask handling functions
  const handleCreateSubtask = () => {
    if (!subtaskForm.title.trim()) {
      Alert.alert('Validation Error', 'Please enter subtask title');
      return;
    }

    const newSubtask = {
      id: `st_${Date.now()}`,
      title: subtaskForm.title,
      description: subtaskForm.description,
      assignedTo: subtaskForm.assignedTo,
      dueDate: subtaskForm.dueDate,
      priority: subtaskForm.priority,
      category: subtaskForm.category,
      status: 'pending',
      completedAt: null,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: user?.name || 'Current User'
    };

    // Update selected case
    const updatedCase = {
      ...selectedCase,
      subtasks: [...(selectedCase.subtasks || []), newSubtask]
    };

    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);

    // Add timeline event
    const timelineEvent = {
      id: `t_${Date.now()}`,
      type: 'custom',
      title: 'Subtask Created',
      description: `New subtask "${subtaskForm.title}" has been created`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      createdBy: user?.name || 'Current User'
    };

    updatedCase.timeline = [...(updatedCase.timeline || []), timelineEvent];
    setSelectedCase({...updatedCase});
    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));

    setShowAddSubtaskModal(false);
    setSubtaskForm({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      category: 'research'
    });
    setSnackbar({ visible: true, text: 'Subtask created successfully' });
  };

  const handleToggleSubtask = (subtaskId) => {
    const subtask = selectedCase.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const updatedSubtask = {
      ...subtask,
      status: subtask.status === 'completed' ? 'pending' : 'completed',
      completedAt: subtask.status === 'completed' ? null : new Date().toISOString()
    };

    const updatedCase = {
      ...selectedCase,
      subtasks: selectedCase.subtasks.map(st => st.id === subtaskId ? updatedSubtask : st)
    };

    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);

    // Add timeline event
    const timelineEvent = {
      id: `t_${Date.now()}`,
      type: subtask.status === 'completed' ? 'custom' : 'milestone_reached',
      title: subtask.status === 'completed' ? 'Subtask Reopened' : 'Subtask Completed',
      description: `"${subtask.title}" has been ${subtask.status === 'completed' ? 'reopened' : 'completed'}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      createdBy: user?.name || 'Current User'
    };

    updatedCase.timeline = [...(updatedCase.timeline || []), timelineEvent];
    setSelectedCase({...updatedCase});
    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
  };

  // Timeline handling functions
  const handleAddTimelineEvent = () => {
    if (!timelineForm.title.trim()) {
      Alert.alert('Validation Error', 'Please enter event title');
      return;
    }

    const newTimelineEvent = {
      id: `t_${Date.now()}`,
      type: timelineForm.type,
      title: timelineForm.title,
      description: timelineForm.description,
      date: timelineForm.date,
      status: timelineForm.status,
      createdBy: user?.name || 'Current User'
    };

    const updatedCase = {
      ...selectedCase,
      timeline: [...(selectedCase.timeline || []), newTimelineEvent].sort((a, b) => new Date(b.date) - new Date(a.date))
    };

    setCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);

    setShowAddTimelineModal(false);
    setTimelineForm({
      type: 'custom',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
    setSnackbar({ visible: true, text: 'Timeline event added successfully' });
  };

  // Enhanced Case Details Modal
  function CaseDetailsModal() {
    const [activeTab, setActiveTab] = useState('overview');
    const [timelineAnimations] = useState(
      selectedCase?.timeline?.map(() => new Animated.Value(0)) || []
    );

    useEffect(() => {
      if (selectedCase?.timeline) {
        timelineAnimations.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay: index * 100,
            useNativeDriver: true
          }).start();
        });
      }
    }, [selectedCase]);

    if (!selectedCase) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: 'information-outline' },
      { id: 'timeline', label: 'Timeline', icon: 'timeline-outline' },
      { id: 'documents', label: 'Documents', icon: 'file-document-outline' },
      { id: 'subtasks', label: 'Subtasks', icon: 'check-circle-outline' },
      { id: 'team', label: 'Team', icon: 'account-group-outline' }
    ];

    const canAddContent = user?.role === 'lawyer' || user?.role === 'admin';
    const canViewDocuments = true; // Both users and lawyers can view
    const canAddDocuments = true; // Both users and lawyers can add documents

    return (
      <Modal visible={showCaseDetailsModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <LinearGradient colors={colors.gradient.modal} style={styles.modalGradient}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowCaseDetailsModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderCenter}>
                  <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                    {selectedCase.title}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {selectedCase.caseNumber}
                  </Text>
                </View>

                {canAddContent && (
                  <TouchableOpacity 
                    style={styles.modalEditButton}
                    onPress={() => {
                      setShowCaseDetailsModal(false);
                      setTimeout(() => handleEdit(selectedCase), 300);
                    }}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
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
                      {tab.id === 'subtasks' && selectedCase.subtasks?.length > 0 && (
                        <Badge size={16} style={styles.tabBadge}>
                          {selectedCase.subtasks.length}
                        </Badge>
                      )}
                      {tab.id === 'documents' && selectedCase.attachments?.length > 0 && (
                        <Badge size={16} style={styles.tabBadge}>
                          {selectedCase.attachments.length}
                        </Badge>
                      )}
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
                        <View style={[styles.statusIcon, { backgroundColor: getCaseStatusInfo(selectedCase.status).color + '15' }]}>
                          <MaterialCommunityIcons 
                            name={getCaseStatusInfo(selectedCase.status).icon} 
                            size={20} 
                            color={getCaseStatusInfo(selectedCase.status).color} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Status</Text>
                        <Text style={[styles.statusValue, { color: getCaseStatusInfo(selectedCase.status).color }]}>
                          {getCaseStatusInfo(selectedCase.status).label}
                        </Text>
                      </View>
                    </Surface>

                    <Surface style={[styles.statusCard, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.statusCardContent}>
                        <View style={[styles.statusIcon, { backgroundColor: getPriorityColor(selectedCase.priority) + '15' }]}>
                          <MaterialCommunityIcons 
                            name="flag" 
                            size={20} 
                            color={getPriorityColor(selectedCase.priority)} 
                          />
                        </View>
                        <Text style={styles.statusLabel}>Priority</Text>
                        <Text style={[styles.statusValue, { color: getPriorityColor(selectedCase.priority) }]}>
                          {selectedCase.priority.charAt(0).toUpperCase() + selectedCase.priority.slice(1)}
                        </Text>
                      </View>
                    </Surface>
                  </View>

                  {/* Progress Card */}
                  <Surface style={styles.progressCard}>
                    <View style={styles.progressCardContent}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Case Progress</Text>
                        <Text style={styles.progressPercent}>{selectedCase.progress}%</Text>
                      </View>
                      <ProgressBar 
                        progress={selectedCase.progress / 100} 
                        color={colors.primary} 
                        style={styles.progressBarLarge} 
                      />
                      <View style={styles.progressFooter}>
                        <Text style={styles.progressLabel}>
                          {selectedCase.progress < 25 ? 'Getting Started' :
                           selectedCase.progress < 50 ? 'In Progress' :
                           selectedCase.progress < 75 ? 'Significant Progress' :
                           selectedCase.progress < 100 ? 'Near Completion' : 'Completed'}
                        </Text>
                      </View>
                    </View>
                  </Surface>

                  {/* Quick Stats */}
                  <View style={styles.quickStatsRow}>
                    <Surface style={styles.quickStatCard}>
                      <View style={styles.quickStatContent}>
                        <MaterialCommunityIcons name="file-document" size={24} color={colors.info} />
                        <Text style={styles.quickStatNumber}>{selectedCase.attachments?.length || 0}</Text>
                        <Text style={styles.quickStatLabel}>Documents</Text>
                      </View>
                    </Surface>
                    
                    <Surface style={styles.quickStatCard}>
                      <View style={styles.quickStatContent}>
                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
                        <Text style={styles.quickStatNumber}>
                          {selectedCase.subtasks?.filter(st => st.status === 'completed').length || 0}/{selectedCase.subtasks?.length || 0}
                        </Text>
                        <Text style={styles.quickStatLabel}>Tasks Done</Text>
                      </View>
                    </Surface>
                    
                    <Surface style={styles.quickStatCard}>
                      <View style={styles.quickStatContent}>
                        <MaterialCommunityIcons name="account-group" size={24} color={colors.tertiary} />
                        <Text style={styles.quickStatNumber}>{selectedCase.team?.length || 0}</Text>
                        <Text style={styles.quickStatLabel}>Team</Text>
                      </View>
                    </Surface>
                  </View>

                  {/* Details */}
                  <Surface style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Case Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client</Text>
                      <Text style={styles.detailValue}>{selectedCase.client}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Case Type</Text>
                      <View style={styles.detailChipContainer}>
                        <Chip 
                          icon={getCaseTypeInfo(selectedCase.type).icon} 
                          compact 
                          style={styles.detailChip}
                        >
                          {getCaseTypeInfo(selectedCase.type).label}
                        </Chip>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Case Value</Text>
                      <Text style={[styles.detailValue, styles.valueText]}>{selectedCase.value}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Next Hearing</Text>
                      <Text style={styles.detailValue}>
                        {selectedCase.nextHearing === 'Completed' ? 'Completed' : selectedCase.nextHearing}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created</Text>
                      <Text style={styles.detailValue}>{selectedCase.createdAt}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Updated</Text>
                      <Text style={styles.detailValue}>{selectedCase.lastUpdated}</Text>
                    </View>
                  </Surface>

                  {/* Description */}
                  <Surface style={styles.descriptionCard}>
                    <Text style={styles.cardTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedCase.description}</Text>
                  </Surface>
                </View>
              )}

              {activeTab === 'timeline' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Case Timeline</Text>
                    {canAddContent && (
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddTimelineModal(true)}
                      >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {selectedCase.timeline?.sort((a, b) => new Date(b.date) - new Date(a.date)).map((event, index) => {
                    const eventInfo = getTimelineEventInfo(event.type);
                    return (
                      <Animated.View
                        key={event.id}
                        style={[
                          styles.timelineItem,
                          { opacity: timelineAnimations[index] || 1 }
                        ]}
                      >
                        <View style={styles.timelineMarker}>
                          <View style={[
                            styles.timelineDot,
                            { backgroundColor: eventInfo.color }
                          ]}>
                            <MaterialCommunityIcons 
                              name={eventInfo.icon} 
                              size={12} 
                              color="white" 
                            />
                          </View>
                          {index < selectedCase.timeline.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <Surface style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.timelineDate}>{event.date}</Text>
                            <Chip 
                              compact 
                              style={[
                                styles.timelineStatus,
                                { backgroundColor: eventInfo.color + '15' }
                              ]}
                              textStyle={{
                                color: eventInfo.color,
                                fontSize: 10
                              }}
                            >
                              {event.status}
                            </Chip>
                          </View>
                          <Text style={styles.timelineTitle}>{event.title}</Text>
                          {event.description && (
                            <Text style={styles.timelineText}>{event.description}</Text>
                          )}
                          {event.createdBy && (
                            <Text style={styles.timelineAuthor}>by {event.createdBy}</Text>
                          )}
                        </Surface>
                      </Animated.View>
                    );
                  })}
                </View>
              )}

              {activeTab === 'documents' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Documents ({selectedCase.attachments?.length || 0})</Text>
                    {canAddDocuments && (
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddDocumentModal(true)}
                      >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {selectedCase.attachments?.length > 0 ? (
                    selectedCase.attachments.map((doc) => (
                      <Surface key={doc.id} style={styles.documentItem}>
                        <View style={styles.documentIcon}>
                          <MaterialCommunityIcons 
                            name={
                              doc.type === 'pdf' ? 'file-pdf-box' :
                              doc.type === 'excel' ? 'file-excel-box' :
                              doc.type === 'word' ? 'file-word-box' :
                              'file-document-outline'
                            }
                            size={24} 
                            color={
                              doc.type === 'pdf' ? colors.error :
                              doc.type === 'excel' ? colors.success :
                              doc.type === 'word' ? colors.info :
                              colors.textSecondary
                            }
                          />
                        </View>
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentName}>{doc.name}</Text>
                          <Text style={styles.documentMeta}>
                            {doc.size} • {doc.uploadedAt} • {doc.uploadedBy}
                          </Text>
                          {doc.description && (
                            <Text style={styles.documentDescription}>{doc.description}</Text>
                          )}
                          <View style={styles.documentTags}>
                            <Chip compact style={styles.documentTag}>
                              {doc.category}
                            </Chip>
                            {doc.isPublic && (
                              <Chip compact style={[styles.documentTag, styles.publicTag]}>
                                Public
                              </Chip>
                            )}
                          </View>
                        </View>
                        <View style={styles.documentActions}>
                          <TouchableOpacity style={styles.documentAction}>
                            <MaterialCommunityIcons name="eye" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.documentAction}>
                            <MaterialCommunityIcons name="download" size={20} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </Surface>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="file-document-outline" size={60} color={colors.textTertiary} />
                      <Text style={styles.emptyStateTitle}>No documents yet</Text>
                      <Text style={styles.emptyStateText}>Upload documents to get started</Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'subtasks' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Subtasks ({selectedCase.subtasks?.length || 0})</Text>
                    {canAddContent && (
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => setShowAddSubtaskModal(true)}
                      >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {selectedCase.subtasks?.length > 0 ? (
                    selectedCase.subtasks.map((subtask) => (
                      <Surface key={subtask.id} style={styles.subtaskItem}>
                        <View style={styles.subtaskContent}>
                          <View style={styles.subtaskHeader}>
                            <TouchableOpacity
                              style={styles.subtaskCheckbox}
                              onPress={() => handleToggleSubtask(subtask.id)}
                            >
                              <MaterialCommunityIcons 
                                name={subtask.status === 'completed' ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                                size={24}
                                color={subtask.status === 'completed' ? colors.success : colors.textTertiary}
                              />
                            </TouchableOpacity>
                            
                            <View style={styles.subtaskInfo}>
                              <Text style={[
                                styles.subtaskTitle,
                                subtask.status === 'completed' && styles.subtaskTitleCompleted
                              ]}>
                                {subtask.title}
                              </Text>
                              {subtask.description && (
                                <Text style={styles.subtaskDescription}>{subtask.description}</Text>
                              )}
                            </View>

                            <Chip 
                              compact 
                              style={[
                                styles.priorityChip,
                                { backgroundColor: getPriorityColor(subtask.priority) + '15' }
                              ]}
                              textStyle={{ 
                                color: getPriorityColor(subtask.priority),
                                fontSize: 10
                              }}
                            >
                              {subtask.priority}
                            </Chip>
                          </View>

                          <View style={styles.subtaskMeta}>
                            {subtask.assignedTo && (
                              <View style={styles.subtaskMetaItem}>
                                <MaterialCommunityIcons name="account" size={14} color={colors.textSecondary} />
                                <Text style={styles.subtaskMetaText}>{subtask.assignedTo}</Text>
                              </View>
                            )}
                            
                            {subtask.dueDate && (
                              <View style={styles.subtaskMetaItem}>
                                <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                                <Text style={styles.subtaskMetaText}>Due: {subtask.dueDate}</Text>
                              </View>
                            )}

                            <View style={styles.subtaskMetaItem}>
                              <MaterialCommunityIcons name="tag" size={14} color={colors.textSecondary} />
                              <Text style={styles.subtaskMetaText}>{subtask.category}</Text>
                            </View>
                          </View>
                        </View>
                      </Surface>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="check-circle-outline" size={60} color={colors.textTertiary} />
                      <Text style={styles.emptyStateTitle}>No subtasks yet</Text>
                      <Text style={styles.emptyStateText}>Create subtasks to track progress</Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'team' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>Team Members ({selectedCase.team?.length || 0})</Text>
                  {selectedCase.team?.map((member, index) => (
                    <Surface key={index} style={styles.teamMemberItem}>
                      <Avatar.Text 
                        size={40} 
                        label={member.split(' ')[1]?.charAt(0) || member.charAt(0)} 
                        style={styles.teamMemberAvatar}
                      />
                      <View style={styles.teamMemberInfo}>
                        <Text style={styles.teamMemberName}>{member}</Text>
                        <Text style={styles.teamMemberRole}>
                          {member.includes('Jr.') ? 'Junior Associate' : 'Advocate'}
                        </Text>
                      </View>
                      <View style={styles.teamMemberActions}>
                        <TouchableOpacity style={styles.teamMemberAction}>
                          <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.teamMemberAction}>
                          <MaterialCommunityIcons name="message" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </Surface>
                  )) || (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="account-group-outline" size={60} color={colors.textTertiary} />
                      <Text style={styles.emptyStateTitle}>No team members</Text>
                      <Text style={styles.emptyStateText}>Add team members to collaborate</Text>
                    </View>
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

  // Enhanced Add/Edit Modal
  function AddEditModal({ visible, onClose, isEdit }) {
    const [localForm, setLocalForm] = useState(isEdit ? editForm : form);
    const [localTeamInput, setLocalTeamInput] = useState('');
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [showStatusSelector, setShowStatusSelector] = useState(false);
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);

    useEffect(() => {
      if (visible) {
        setLocalForm(isEdit ? editForm : form);
        setLocalTeamInput('');
      }
    }, [visible, isEdit, editForm, form]);

    const handleSave = () => {
      // if (!localForm?.title?.trim() || !localForm?.client?.trim()) {
      //   Alert.alert('Validation Error', 'Please enter both case title and client name');
      //   return;
      // }

      if (isEdit) {
        
        setEditForm(localForm);
        handleSaveEdit(localForm);
      } else {
        setForm(localForm);
        handleAddCase(localForm);
      }
    };

    // Fixed team member handlers
    const addLocalTeamMember = () => {
      if (!localTeamInput.trim()) {
        Alert.alert('Error', 'Please enter a team member name');
        return;
      }

      // Ensure localForm.team is always an array
      const currentTeam = Array.isArray(localForm.team) ? localForm.team : [];
      
      // Check for duplicates
      if (currentTeam.includes(localTeamInput.trim())) {
        Alert.alert('Error', 'This team member is already added');
        return;
      }

      // Update the form with the new team member
      setLocalForm(prev => ({
        ...prev,
        team: [...currentTeam, localTeamInput.trim()]
      }));
      
      // Clear the input
      setLocalTeamInput('');
    };

    const removeLocalTeamMember = (memberToRemove) => {
      // Ensure localForm.team is always an array
      const currentTeam = Array.isArray(localForm.team) ? localForm.team : [];
      
      // Filter out the member to remove
      const updatedTeam = currentTeam.filter(member => member !== memberToRemove);
      
      // Update the form
      setLocalForm(prev => ({
        ...prev,
        team: updatedTeam
      }));
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
                    {isEdit ? 'Edit Case' : 'Add New Case'}
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    {isEdit ? 'Update case information' : 'Enter case details'}
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
                {/* Basic Info Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Basic Information</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Case Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.title}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, title: text }))}
                      placeholder="Enter case title"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Client Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.client}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, client: text }))}
                      placeholder="Enter client name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={localForm.description}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, description: text }))}
                      placeholder="Enter case description"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </Surface>

                {/* Case Details Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Case Details</Text>
                  
                  {/* Type Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Case Type</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowTypeSelector(!showTypeSelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name={getCaseTypeInfo(localForm.type).icon} 
                          size={20} 
                          color={colors.primary} 
                        />
                        <Text style={styles.selectorText}>
                          {getCaseTypeInfo(localForm.type).label}
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
                        {caseTypes.map((type) => (
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
                            <MaterialCommunityIcons name={type.icon} size={18} color={colors.primary} />
                            <Text style={styles.selectorOptionText}>{type.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Status Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Status</Text>
                    <TouchableOpacity 
                      style={styles.selectorButton}
                      onPress={() => setShowStatusSelector(!showStatusSelector)}
                    >
                      <View style={styles.selectorContent}>
                        <MaterialCommunityIcons 
                          name={getCaseStatusInfo(localForm.status).icon} 
                          size={20} 
                          color={getCaseStatusInfo(localForm.status).color} 
                        />
                        <Text style={styles.selectorText}>
                          {getCaseStatusInfo(localForm.status).label}
                        </Text>
                      </View>
                      <MaterialCommunityIcons 
                        name={showStatusSelector ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    {showStatusSelector && (
                      <View style={styles.selectorOptions}>
                        {caseStatuses.map((status) => (
                          <TouchableOpacity
                            key={status.id}
                            style={[
                              styles.selectorOption,
                              localForm.status === status.id && styles.selectorOptionActive
                            ]}
                            onPress={() => {
                              setLocalForm(prev => ({ ...prev, status: status.id }));
                              setShowStatusSelector(false);
                            }}
                          >
                            <MaterialCommunityIcons name={status.icon} size={18} color={status.color} />
                            <Text style={styles.selectorOptionText}>{status.label}</Text>
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

                  {/* Value and Progress */}
                  <View style={styles.rowContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Case Value</Text>
                      <TextInput
                        style={styles.textInput}
                        value={localForm.value}
                        onChangeText={(text) => setLocalForm(prev => ({ ...prev, value: text }))}
                        placeholder="₹0"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Progress (%)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={String(localForm.progress)}
                        onChangeText={(text) => {
                          const progress = Math.min(100, Math.max(0, parseInt(text) || 0));
                          setLocalForm(prev => ({ ...prev, progress }));
                        }}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Next Hearing Date</Text>
                    <TextInput
                      style={styles.textInput}
                      value={localForm.nextHearing}
                      onChangeText={(text) => setLocalForm(prev => ({ ...prev, nextHearing: text }))}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </Surface>

                {/* Team Section */}
                <Surface style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Team Members</Text>
                  
                  <View style={styles.teamInputContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                      value={localTeamInput}
                      onChangeText={setLocalTeamInput}
                      placeholder="Add team member (e.g., Adv. Sharma)"
                      placeholderTextColor={colors.textTertiary}
                    />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={addLocalTeamMember}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  {localForm.team && localForm.team.length > 0 && (
                    <View style={styles.teamChipsContainer}>
                      {localForm.team.map((member, index) => (
                        <View key={index} style={styles.teamChip}>
                          <Avatar.Text 
                            size={24} 
                            label={member.split(' ')[1]?.charAt(0) || member.charAt(0)} 
                            style={styles.teamChipAvatar}
                          />
                          <Text style={styles.teamChipText}>{member}</Text>
                          <TouchableOpacity
                            style={styles.teamChipRemove}
                            onPress={() => removeLocalTeamMember(member)}
                          >
                            <MaterialCommunityIcons name="close" size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
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
                    {isEdit ? 'Update Case' : 'Create Case'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Add Document Modal
  function AddDocumentModal() {
    return (
      <Modal visible={showAddDocumentModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
              <LinearGradient colors={colors.gradient.modal} style={styles.addModalContent}>
                <View style={styles.addModalHeader}>
                  <Text style={styles.addModalTitle}>Upload Document</Text>
                  <TouchableOpacity onPress={() => setShowAddDocumentModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.addModalScroll}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Document File *</Text>
                    <TouchableOpacity 
                      style={[
                        styles.filePicker,
                        documentForm.file && styles.filePickerSelected
                      ]}
                      onPress={handleDocumentPick}
                    >
                      <MaterialCommunityIcons 
                        name={documentForm.file ? "file-check" : "file-plus"} 
                        size={24} 
                        color={documentForm.file ? colors.success : colors.textSecondary} 
                      />
                      <Text style={[
                        styles.filePickerText,
                        documentForm.file && styles.filePickerTextSelected
                      ]}>
                        {documentForm.file ? documentForm.file.name : "Tap to select file"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Document Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={documentForm.name}
                      onChangeText={(text) => setDocumentForm(prev => ({ ...prev, name: text }))}
                      placeholder="Enter document name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      value={documentForm.description}
                      onChangeText={(text) => setDocumentForm(prev => ({ ...prev, description: text }))}
                      placeholder="Brief description of the document"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <View style={styles.categoryChips}>
                      {['legal', 'financial', 'correspondence', 'evidence', 'other'].map((category) => (
                        <TouchableOpacity
                          key={category}
                          onPress={() => setDocumentForm(prev => ({ ...prev, category }))}
                        >
                          <Chip
                            selected={documentForm.category === category}
                            style={[
                              styles.categoryChip,
                              documentForm.category === category && styles.categoryChipSelected
                            ]}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.switchGroup}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.formLabel}>Public Access</Text>
                        <Text style={styles.switchDescription}>
                          Allow client to view this document
                        </Text>
                      </View>
                      <Switch
                        value={documentForm.isPublic}
                        onValueChange={(value) => setDocumentForm(prev => ({ ...prev, isPublic: value }))}
                        color={colors.primary}
                      />
                    </View>
                  </View>

                  {isUploading && (
                    <View style={styles.uploadProgress}>
                      <Text style={styles.uploadProgressText}>
                        Uploading... {documentUploadProgress}%
                      </Text>
                      <ProgressBar 
                        progress={documentUploadProgress / 100} 
                        color={colors.primary}
                        style={styles.uploadProgressBar}
                      />
                    </View>
                  )}
                </ScrollView>

                <View style={styles.addModalActions}>
                  <TouchableOpacity 
                    style={styles.addModalCancel}
                    onPress={() => setShowAddDocumentModal(false)}
                  >
                    <Text style={styles.addModalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.addModalSave, isUploading && styles.addModalSaveDisabled]}
                    onPress={handleDocumentUpload}
                    disabled={isUploading}
                  >
                    <LinearGradient colors={colors.gradient.primary} style={styles.addModalSaveGradient}>
                      <Text style={styles.addModalSaveText}>
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Add Subtask Modal
  function AddSubtaskModal() {
    return (
      <Modal visible={showAddSubtaskModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={colors.gradient.modal} style={styles.modalGradient}>
             <View style={styles.addModalHeader}>
                  <Text style={styles.addModalTitle}>Create Subtask</Text>
                  <TouchableOpacity onPress={() => setShowAddSubtaskModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.addModalScroll}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Task Title *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={subtaskForm.title}
                      onChangeText={(text) => setSubtaskForm(prev => ({ ...prev, title: text }))}
                      placeholder="Enter task title"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      value={subtaskForm.description}
                      onChangeText={(text) => setSubtaskForm(prev => ({ ...prev, description: text }))}
                      placeholder="Describe the task in detail"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Assign To</Text>
                    <TextInput
                      style={styles.formInput}
                      value={subtaskForm.assignedTo}
                      onChangeText={(text) => setSubtaskForm(prev => ({ ...prev, assignedTo: text }))}
                      placeholder="Team member name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.formLabel}>Due Date</Text>
                      <TextInput
                        style={styles.formInput}
                        value={subtaskForm.dueDate}
                        onChangeText={(text) => setSubtaskForm(prev => ({ ...prev, dueDate: text }))}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.formLabel}>Priority</Text>
                      <View style={styles.priorityButtons}>
                        {['low', 'medium', 'high', 'critical'].map((priority) => (
                          <TouchableOpacity
                            key={priority}
                            style={[
                              styles.priorityButton,
                              subtaskForm.priority === priority && styles.priorityButtonSelected,
                              { backgroundColor: getPriorityColor(priority) + (subtaskForm.priority === priority ? 'FF' : '15') }
                            ]}
                            onPress={() => setSubtaskForm(prev => ({ ...prev, priority }))}
                          >
                            <Text style={[
                              styles.priorityButtonText,
                              { color: subtaskForm.priority === priority ? 'white' : getPriorityColor(priority) }
                            ]}>
                              {priority.charAt(0).toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <View style={styles.categoryChips}>
                      {['research', 'drafting', 'filing', 'review', 'meeting', 'other'].map((category) => (
                        <TouchableOpacity
                          key={category}
                          onPress={() => setSubtaskForm(prev => ({ ...prev, category }))}
                        >
                          <Chip
                            selected={subtaskForm.category === category}
                            style={[
                              styles.categoryChip,
                              subtaskForm.category === category && styles.categoryChipSelected
                            ]}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.addModalActions}>
                  <TouchableOpacity 
                    style={styles.addModalCancel}
                    onPress={() => setShowAddSubtaskModal(false)}
                  >
                    <Text style={styles.addModalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.addModalSave}
                    onPress={handleCreateSubtask}
                  >
                    <LinearGradient colors={colors.gradient.primary} style={styles.addModalSaveGradient}>
                      <Text style={styles.addModalSaveText}>Create Task</Text>
                    </LinearGradient>
                  </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Add Timeline Event Modal
  function AddTimelineModal() {
    return (
      <Modal visible={showAddTimelineModal} animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={colors.gradient.modal} style={styles.modalGradient}>
            <View style={styles.addModalHeader}>
                  <Text style={styles.addModalTitle}>Add Timeline Event</Text>
                  <TouchableOpacity onPress={() => setShowAddTimelineModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.addModalScroll}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Event Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.eventTypeChips}>
                        {timelineEventTypes.map((eventType) => (
                          <TouchableOpacity
                            key={eventType.id}
                            onPress={() => setTimelineForm(prev => ({ ...prev, type: eventType.id }))}
                          >
                            <Chip
                              selected={timelineForm.type === eventType.id}
                              style={[
                                styles.eventTypeChip,
                                timelineForm.type === eventType.id && { backgroundColor: eventType.color + '15' }
                              ]}
                              textStyle={{
                                color: timelineForm.type === eventType.id ? eventType.color : colors.text
                              }}
                              icon={eventType.icon}
                            >
                              {eventType.label}
                            </Chip>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Event Title *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={timelineForm.title}
                      onChangeText={(text) => setTimelineForm(prev => ({ ...prev, title: text }))}
                      placeholder="Enter event title"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      value={timelineForm.description}
                      onChangeText={(text) => setTimelineForm(prev => ({ ...prev, description: text }))}
                      placeholder="Provide details about this event"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.formLabel}>Date</Text>
                      <TextInput
                        style={styles.formInput}
                        value={timelineForm.date}
                        onChangeText={(text) => setTimelineForm(prev => ({ ...prev, date: text }))}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.formLabel}>Status</Text>
                      <View style={styles.statusButtons}>
                        {['completed', 'active', 'pending'].map((status) => (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusButton,
                              timelineForm.status === status && styles.statusButtonSelected
                            ]}
                            onPress={() => setTimelineForm(prev => ({ ...prev, status }))}
                          >
                            <MaterialCommunityIcons 
                              name={
                                status === 'completed' ? 'check-circle' :
                                status === 'active' ? 'play-circle' : 'clock-outline'
                              }
                              size={16} 
                              color={timelineForm.status === status ? 'white' : colors.textSecondary}
                            />
                            <Text style={[
                              styles.statusButtonText,
                              timelineForm.status === status && styles.statusButtonTextSelected
                            ]}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.addModalActions}>
                  <TouchableOpacity 
                    style={styles.addModalCancel}
                    onPress={() => setShowAddTimelineModal(false)}
                  >
                    <Text style={styles.addModalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.addModalSave}
                    onPress={handleAddTimelineEvent}
                  >
                    <LinearGradient colors={colors.gradient.primary} style={styles.addModalSaveGradient}>
                      <Text style={styles.addModalSaveText}>Add Event</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

            </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Basic handlers (keeping original functionality)
  function handleBack() {
    if (navigation && navigation.goBack) {
      navigation.goBack();
      return;
    }
    Alert.alert('Back', 'Back pressed (no navigation provided)');
  }

  function openMenuFor(caseItemId) {
    setMenuVisibleFor(caseItemId);
  }

  function closeMenu() {
    setMenuVisibleFor(null);
  }

  function handleViewDetails(caseItem) {
    setSelectedCase(caseItem);
    setShowCaseDetailsModal(true);
    closeMenu();
  }

  function handleEdit(caseItem) {
    setSelectedCase(caseItem);
    setEditForm(caseItem);
    setShowEditModal(true);
    closeMenu();
  }

  // Render Case Card (simplified version of original)
const renderCaseCard = ({ item, index }) => {
  const isMenuOpen = menuVisibleFor === item.id;
  const cardWidth = viewMode === 'grid' ? (width - 72) / 2 : '100%';

  // Debug logging (remove in production)
  if (__DEV__) {
    console.log('Rendering case card for item:', {
      id: item.id,
      title: item.title,
      team: item.team,
      teamType: typeof item.team,
      teamIsArray: Array.isArray(item.team),
      teamLength: item.team?.length
    });
  }

  // Safe team handling
  const getTeamMembers = (team) => {
    // Handle undefined, null, or non-array team
    if (!team) return [];
    if (typeof team === 'string') {
      // If team is a comma-separated string, split it
      return team.split(',').map(name => name.trim()).filter(name => name);
    }
    if (Array.isArray(team)) return team;
    // If team is an object, try to extract meaningful data
    if (typeof team === 'object') {
      return Object.values(team).filter(Boolean);
    }
    return [];
  };

  // Safe attachment handling
  const getAttachmentCount = (attachments, documents) => {
    const attachmentCount = Array.isArray(attachments) ? attachments.length : 0;
    const documentCount = Array.isArray(documents) ? documents.length : 0;
    return attachmentCount + documentCount;
  };

  const teamMembers = getTeamMembers(item.team);
  const displayTeam = teamMembers.slice(0, 3);
  const attachmentCount = getAttachmentCount(item.attachments, item.documents);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleViewDetails(item)}
      style={{ width: cardWidth, marginRight: viewMode === 'grid' && index % 2 === 0 ? 16 : 0 }}
    >
      <Surface style={styles.caseCard}>
        <LinearGradient colors={colors.gradient.glass} style={styles.caseCardGradient}>
          <View style={styles.caseHeader}>
            <View style={styles.caseIconContainer}>
              <LinearGradient colors={colors.gradient.primary} style={styles.caseIcon}>
                <MaterialCommunityIcons 
                  name={getCaseTypeInfo(item.type)?.icon || 'briefcase'} 
                  size={20} 
                  color="white" 
                />
              </LinearGradient>
            </View>

            <View style={styles.caseMainInfo}>
              <View style={styles.caseTitleRow}>
                <Text style={styles.caseTitle} numberOfLines={2}>
                  {item.title || 'Untitled Case'}
                </Text>
                <View style={styles.priorityIndicator}>
                  <View style={[
                    styles.priorityDot, 
                    { backgroundColor: getPriorityColor(item.priority) || colors.textSecondary }
                  ]} />
                </View>
              </View>

              <Text style={styles.caseClient}>{item.client || item.clientName || 'Unknown Client'}</Text>
              <Text style={styles.caseNumber}>{item.caseNumber || item.id}</Text>
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
              <Menu.Item onPress={() => handleEdit(item)} title="Edit Case" leadingIcon="pencil" />
              <Divider />
              <Menu.Item onPress={() => handleDelete(item)} title="Delete" leadingIcon="delete" />
            </Menu>
          </View>

          <View style={styles.caseMetaContainer}>
            <View style={styles.caseMetaRow}>
              <Chip
                mode="flat"
                compact
                style={[
                  styles.statusChip, 
                  { backgroundColor: (getCaseStatusInfo(item.status)?.color || colors.textSecondary) + '15' }
                ]}
                textStyle={{ 
                  color: getCaseStatusInfo(item.status)?.color || colors.textSecondary, 
                  fontSize: 10, 
                  fontWeight: '700' 
                }}
                icon={getCaseStatusInfo(item.status)?.icon || 'circle'}
              >
                {getCaseStatusInfo(item.status)?.label || item.status || 'Unknown'}
              </Chip>

              <Chip mode="outlined" compact style={styles.typeChip} textStyle={styles.typeChipText}>
                {getCaseTypeInfo(item.type)?.label || item.type || 'Unknown'}
              </Chip>
            </View>

            <View style={styles.valueContainer}>
              <Text style={styles.caseValue}>{item.value || item.amount || 'N/A'}</Text>
              <MaterialCommunityIcons name="trending-up" size={14} color={colors.success} />
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{item.progress || 0}%</Text>
            </View>
            <ProgressBar 
              progress={(item.progress || 0) / 100} 
              color={colors.primary} 
              style={styles.progressBar} 
            />
          </View>

          <View style={styles.caseFooter}>
            <View style={styles.footerLeft}>
              <View style={styles.teamAvatars}>
                {displayTeam.length > 0 ? (
                  <>
                    {displayTeam.map((member, idx) => {
                      // Handle both string names and objects
                      const memberName = typeof member === 'string' ? member : member?.name || member?.displayName || 'Unknown';
                      const initials = memberName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
                      
                      return (
                        <Avatar.Text 
                          key={`${item.id}-member-${idx}`}
                          size={24} 
                          label={initials || '?'}
                          style={[styles.teamAvatar, { marginLeft: idx > 0 ? -8 : 0 }]} 
                        />
                      );
                    })}
                    {teamMembers.length > 3 && (
                      <View style={styles.moreTeamMembers}>
                        <Text style={styles.moreTeamText}>+{teamMembers.length - 3}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.noTeamIndicator}>
                    <MaterialCommunityIcons 
                      name="account-plus" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.noTeamText}>No team</Text>
                  </View>
                )}
              </View>

              <View style={styles.documentsInfo}>
                <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.documentsText}>{attachmentCount} docs</Text>
              </View>
            </View>

            <View style={styles.footerRight}>
              <View style={styles.nextHearing}>
                <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.nextHearingText}>
                  {item.nextHearing === 'Completed' || item.status === 'completed' 
                    ? 'Completed' 
                    : item.nextHearing 
                      ? `Next: ${item.nextHearing}` 
                      : 'No hearing scheduled'}
                </Text>
              </View>
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

      <Animated.View style={[styles.header, { height: headerHeight }] }>
        <LinearGradient colors={colors.gradient.primary} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cases</Text>
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
                <Text style={styles.statValue}>{cases.length}</Text>
                <Text style={styles.statLabel}>Total Cases</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cases.filter(c => c.status === 'active').length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ₹{Math.round(cases.reduce((s,c)=>s+parseCurrencyToNumber(c.value),0)/100000)}L
                </Text>
                <Text style={styles.statLabel}>Total Value</Text>
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
                placeholder="Search cases, clients, case numbers..." 
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
        data={filteredCases}
        key={viewMode} 
        renderItem={renderCaseCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.casesList}
        contentContainerStyle={styles.casesListContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        numColumns={viewMode === 'grid' ? 2 : 1}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="briefcase-search" size={80} color={colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No cases found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
          </View>
        )}
      />

      <FAB 
        style={[styles.fab, { backgroundColor: colors.secondary }]} 
        icon="plus" 
        onPress={() => setShowAddCaseModal(true)} 
        color="white" 
      />

      {/* All Modals */}
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
                      {caseStatuses.map((status) => (
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
                    <Text style={styles.filterSectionTitle}>Case Type</Text>
                    <View style={styles.filterChips}>
                      {caseTypes.map((type) => (
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
                      {['critical','high','medium','low'].map((priority) => (
                        <TouchableOpacity 
                          key={priority} 
                          onPress={() => setSelectedFilters(prev => 
                            prev.includes(priority) 
                              ? prev.filter(f => f !== priority) 
                              : [...prev, priority]
                          )}
                        >
                          <Chip 
                            selected={selectedFilters.includes(priority)} 
                            mode={selectedFilters.includes(priority) ? 'flat' : 'outlined'} 
                            style={[
                              styles.filterChip, 
                              selectedFilters.includes(priority) && { backgroundColor: getPriorityColor(priority) + '15' }
                            ]} 
                            textStyle={{ 
                              color: selectedFilters.includes(priority) ? getPriorityColor(priority) : colors.text 
                            }}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Sort By</Text>
                    <View style={styles.sortOptions}>
                      {[
                        { id: 'date', label: 'Date Created', icon: 'calendar' },
                        { id: 'priority', label: 'Priority', icon: 'alert' },
                        { id: 'value', label: 'Case Value', icon: 'currency-inr' },
                        { id: 'progress', label: 'Progress', icon: 'chart-line' }
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

      {/* Add Case Modal */}
      <AddEditModal 
        visible={showAddCaseModal} 
        onClose={() => { 
          setShowAddCaseModal(false); 
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

      <CaseDetailsModal />
      <AddDocumentModal />
      <AddSubtaskModal />
      <AddTimelineModal />

      <Snackbar 
        visible={snackbar.visible} 
        onDismiss={() => setSnackbar({ visible: false, text: '' })} 
        duration={3000}
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
  
  // Search Container
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
  
  // Cases List
  casesList: { 
    flex: 1 
  },
  casesListContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 140 
  },
  caseCard: { 
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
  caseCardGradient: { 
    padding: 20, 
    borderRadius: 20 
  },
  caseHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  caseIconContainer: { 
    marginRight: 16 
  },
  caseIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3 
  },
  caseMainInfo: { 
    flex: 1, 
    marginRight: 12 
  },
  caseTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  caseTitle: { 
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
  caseClient: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  caseNumber: { 
    fontSize: 12, 
    color: colors.textTertiary, 
    fontWeight: '500', 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' 
  },
  moreButton: { 
    padding: 4 
  },
  caseMetaContainer: { 
    marginBottom: 16 
  },
  caseMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  statusChip: { 
    height: 28 
  },
  typeChip: { 
    height: 28, 
    backgroundColor: 'transparent', 
    borderColor: colors.textTertiary 
  },
  typeChipText: { 
    fontSize: 11, 
    color: colors.textSecondary, 
    fontWeight: '600' 
  },
  valueContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.success + '15', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  caseValue: { 
    fontSize: 14, 
    color: colors.success, 
    fontWeight: '800', 
    marginRight: 6 
  },
  progressSection: { 
    marginBottom: 16 
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  progressLabel: { 
    fontSize: 13, 
    color: colors.text, 
    fontWeight: '600' 
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary
  },
  progressBarLarge: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  progressFooter: {
    alignItems: 'center'
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  
  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  quickStatContent: {
    padding: 16,
    alignItems: 'center'
  },
  quickStatNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  
  // Details Card
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
  
  // Timeline Styles
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.textTertiary + '30',
    marginTop: 8
  },
  timelineContent: {
    flex: 1,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 16
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  timelineDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  timelineStatus: {
    height: 20
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  timelineText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8
  },
  timelineAuthor: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic'
  },
  
  // Document Styles
  documentItem: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12,
    overflow: 'hidden'
  },
  documentIcon: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  documentInfo: {
    flex: 1,
    padding: 16,
    paddingLeft: 0
  },
  documentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  documentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8
  },
  documentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8
  },
  documentTags: {
    flexDirection: 'row',
    gap: 8
  },
  documentTag: {
    height: 24
  },
  publicTag: {
    backgroundColor: colors.success + '15'
  },
  documentActions: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 0
  },
  documentAction: {
    padding: 8,
    marginLeft: 8
  },
  
  // Subtask Styles
  subtaskItem: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12,
    overflow: 'hidden'
  },
  subtaskContent: {
    padding: 16
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  subtaskCheckbox: {
    marginRight: 12,
    marginTop: 2
  },
  subtaskInfo: {
    flex: 1,
    marginRight: 12
  },
  subtaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary
  },
  subtaskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18
  },
  priorityChip: {
    height: 24
  },
  subtaskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  subtaskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subtaskMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600'
  },
  
  // Team Styles
  teamMemberItem: {
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
  teamMemberAvatar: {
    backgroundColor: colors.primary,
    marginRight: 16
  },
  teamMemberInfo: {
    flex: 1
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2
  },
  teamMemberRole: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  teamMemberActions: {
    flexDirection: 'row'
  },
  teamMemberAction: {
    padding: 8,
    marginLeft: 4
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  
  // Add Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  addModal: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  addModalContent: {
    flex: 1
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  addModalScroll: {
    flex: 1,
    paddingHorizontal: 24
  },
  
  // Form Styles
  formGroup: {
    marginBottom: 20
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  formInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  formRow: {
    flexDirection: 'row'
  },
  
  // File Picker
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed'
  },
  filePickerSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10'
  },
  filePickerText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1
  },
  filePickerTextSelected: {
    color: colors.success,
    fontWeight: '600'
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
  
  // Switch Group
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  switchInfo: {
    flex: 1,
    marginRight: 16
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4
  },
  
  // Priority Buttons
  priorityButtons: {
    flexDirection: 'row',
    gap: 8
  },
  priorityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  priorityButtonSelected: {
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '700'
  },
  
  // Status Buttons
  statusButtons: {
    flexDirection: 'column',
    gap: 8
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  statusButtonSelected: {
    backgroundColor: colors.primary
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8
  },
  statusButtonTextSelected: {
    color: 'white'
  },
  
  // Event Type Chips
  eventTypeChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8
  },
  eventTypeChip: {
    marginRight: 8
  },
  
  // Upload Progress
  uploadProgress: {
    backgroundColor: colors.info + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 8,
    textAlign: 'center'
  },
  uploadProgressBar: {
    height: 4,
    borderRadius: 2
  },
  
  // Modal Actions
  addModalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)'
  },
  addModalCancel: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  addModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary
  },
  addModalSave: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden'
  },
  addModalSaveDisabled: {
    opacity: 0.6
  },
  addModalSaveGradient: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  addModalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white'
  },
    fontSize: 13, 
    color: colors.textSecondary, 
    fontWeight: '700' 
  ,
  progressBar: { 
    height: 6, 
    borderRadius: 3 
  },
  caseFooter: { 
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
  teamAvatars: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 16 
  },
  teamAvatar: { 
    backgroundColor: colors.primary, 
    borderWidth: 2, 
    borderColor: 'white' 
  },
  moreTeamMembers: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: colors.textTertiary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: -8, 
    borderWidth: 2, 
    borderColor: 'white' 
  },
  moreTeamText: { 
    fontSize: 10, 
    color: 'white', 
    fontWeight: '700' 
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
  nextHearing: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  nextHearingText: { 
    fontSize: 11, 
    color: colors.textSecondary, 
    fontWeight: '600', 
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
  
  // Tab Styles
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
  tabBadge: {
    backgroundColor: colors.primary,
    marginLeft: 6
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24
  },
  tabContent: {
    paddingTop: 24
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
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
    minHeight: 100,
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
  teamInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  teamChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  teamChipAvatar: {
    backgroundColor: colors.primary,
    marginRight: 8
  },
  teamChipText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8
  },
  teamChipRemove: {
    padding: 2
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
  
  // Overview Tab Styles
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
  progressCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20
  },
  progressCardContent: {
    padding: 20
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
progressPercent: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  progressBar: { height: 6, borderRadius: 3 },
  caseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(100,116,139,0.1)' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  teamAvatars: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  teamAvatar: { backgroundColor: colors.primary, borderWidth: 2, borderColor: 'white' },
  moreTeamMembers: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.textTertiary, justifyContent: 'center', alignItems: 'center', marginLeft: -8, borderWidth: 2, borderColor: 'white' },
  moreTeamText: { fontSize: 10, color: 'white', fontWeight: '700' },
  documentsInfo: { flexDirection: 'row', alignItems: 'center' },
  documentsText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginLeft: 4 },
  footerRight: { alignItems: 'flex-end' },
  nextHearing: { flexDirection: 'row', alignItems: 'center' },
  nextHearingText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginLeft: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, elevation: 8, shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  // Modal Styles
  modalBlur: { flex: 1, justifyContent: 'flex-end' },
  filterModal: { maxHeight: height * 0.8, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  filterModalContent: { flex: 1, padding: 24 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(100,116,139,0.1)' },
  filterTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
  filterSection: { marginBottom: 28 },
  filterSectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { marginBottom: 8, height: 36 },
  sortOptions: { gap: 8 },
  sortOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: colors.surfaceVariant },
  sortOptionSelected: { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '40' },
  sortOptionText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginLeft: 12 },
  sortOptionTextSelected: { color: colors.primary },
  filterActions: { flexDirection: 'row', gap: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(100,116,139,0.1)' },
  clearFiltersButton: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceVariant, alignItems: 'center' },
  clearFiltersText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  applyFiltersButton: { flex: 2, borderRadius: 16, overflow: 'hidden' },
  applyFiltersGradient: { padding: 16, alignItems: 'center' },
  applyFiltersText: { fontSize: 14, fontWeight: '700', color: 'white' },

  // Details Modal
  modalRoot: { flex: 1, backgroundColor: colors.background },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  detailsTitle: { fontSize: 18, fontWeight: '800', color: colors.text, flex: 1, textAlign: 'center' },
  detailsTabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  tabButtonActive: { backgroundColor: colors.primary + '10' },
  tabText: { color: colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  detailsBody: { padding: 16 },
  detailLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '700', marginTop: 12 },
  detailValue: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 6 },
  detailsFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }
});
