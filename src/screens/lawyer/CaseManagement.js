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
  Platform
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
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Ultra-premium color palette (kept from your original)
const colors = {
  primary: '#0F0F23',
  primaryLight: '#1A1A3A',
  secondary: '#D4AF37', // Gold
  tertiary: '#8B5CF6', // Purple
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
    error: ['#EF4444', '#F87171', '#FCA5A5'],
    glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, text: '' });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [menuVisibleFor, setMenuVisibleFor] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [cases, setCases] = useState([
    {
      id: 1,
      title: 'Reliance Industries Merger',
      client: 'Reliance Industries Ltd.',
      caseNumber: 'CRP/2024/001',
      type: 'corporate',
      status: 'active',
      priority: 'critical',
      value: '₹25,00,000',
      progress: 75,
      nextHearing: '2024-12-15',
      createdAt: '2024-06-01',
      lastUpdated: '2024-12-08',
      description: 'Major corporate merger involving regulatory compliance and due diligence.',
      documents: 24,
      team: ['Adv. Sharma', 'Adv. Patel', 'Adv. Kumar'],
      timeline: [
        { id: 't1', date: '2024-06-01', text: 'Case opened' },
        { id: 't2', date: '2024-08-05', text: 'Initial discovery' }
      ]
    },
    {
      id: 2,
      title: 'TechCorp Patent Dispute',
      client: 'TechCorp Solutions',
      caseNumber: 'IP/2024/087',
      type: 'intellectual',
      status: 'review',
      priority: 'high',
      value: '₹15,00,000',
      progress: 60,
      nextHearing: '2024-12-20',
      createdAt: '2024-07-16',
      lastUpdated: '2024-12-10',
      description: 'Intellectual property dispute regarding software patents.',
      documents: 18,
      team: ['Adv. Singh', 'Adv. Gupta'],
      timeline: [
        { id: 't1', date: '2024-07-16', text: 'Filed patent claim' },
        { id: 't2', date: '2024-09-01', text: 'Preliminary review' }
      ]
    },
    {
      id: 3,
      title: 'Property Acquisition Case',
      client: 'Mumbai Developers Ltd.',
      caseNumber: 'PROP/2024/156',
      type: 'property',
      status: 'pending',
      priority: 'medium',
      value: '₹8,00,000',
      progress: 30,
      nextHearing: '2024-12-18',
      createdAt: '2024-08-02',
      lastUpdated: '2024-12-09',
      description: 'Commercial property acquisition with zoning compliance issues.',
      documents: 12,
      team: ['Adv. Sharma', 'Adv. Reddy'],
      timeline: [
        { id: 't1', date: '2024-08-02', text: 'Case registered' }
      ]
    },
    {
      id: 4,
      title: 'Employment Tribunal Case',
      client: 'Corporate Excellence Inc.',
      caseNumber: 'EMP/2024/203',
      type: 'civil',
      status: 'completed',
      priority: 'low',
      value: '₹3,50,000',
      progress: 100,
      nextHearing: 'Completed',
      createdAt: '2024-03-10',
      lastUpdated: '2024-11-28',
      description: 'Employment dispute resolution for wrongful termination.',
      documents: 8,
      team: ['Adv. Mishra'],
      timeline: [
        { id: 't1', date: '2024-03-10', text: 'Mediation' },
        { id: 't2', date: '2024-05-12', text: 'Settlement reached' }
      ]
    }
  ]);

  // Derived filtered + sorted cases
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
        // sort by createdAt desc
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

  function getCaseTypeInfo(type) {
    return caseTypes.find((t) => t.id === type) || caseTypes[0];
  }

  function getCaseStatusInfo(status) {
    return caseStatuses.find((s) => s.id === status) || caseStatuses[0];
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'critical':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.info;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  }

  // Back button behavior
  function handleBack() {
    if (navigation && navigation.goBack) {
      navigation.goBack();
      return;
    }
    Alert.alert('Back', 'Back pressed (no navigation provided)');
  }

  // Menu actions
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
            setCases((prev) => prev.filter((c) => c.id !== caseItem.id));
            setLastDeleted(caseItem);
            setSnackbar({ visible: true, text: 'Case deleted' });
          }
        }
      ]
    );
  }

  function handleEdit(caseItem) {
    setSelectedCase(caseItem);
    setShowEditModal(true);
    closeMenu();
  }

  function undoDelete() {
    if (lastDeleted) {
      setCases((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);
      setSnackbar({ visible: true, text: 'Deletion undone' });
    }
  }

  // Add Case Form state
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
    team: []
  };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);
  const [teamInput, setTeamInput] = useState('');

  function resetForm() {
    setForm(emptyForm);
    setTeamInput('');
  }

  function addTeamMember(formSetter, memberName, clearLocalInput = true) {
    if (!memberName || memberName.trim() === '') return;
    formSetter((prev) => ({ ...prev, team: [...(prev.team || []), memberName.trim()] }));
    if (clearLocalInput) setTeamInput('');
  }

  function handleAddCase() {
    if (!form.title || !form.client) {
      Alert.alert('Validation', 'Please enter at least title and client');
      return;
    }
    const newCase = {
      ...form,
      id: Date.now(),
      caseNumber: `CSE/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setCases((prev) => [newCase, ...prev]);
    resetForm();
    setShowAddCaseModal(false);
    setSnackbar({ visible: true, text: 'Case added' });
  }

  function handleSaveEdit() {
    if (!editForm) return;
    setCases((prev) => prev.map((c) => (c.id === editForm.id ? editForm : c)));
    setShowEditModal(false);
    setEditForm(null);
    setSnackbar({ visible: true, text: 'Case updated' });
  }

  // Render Case Card (works for list + grid)
  const renderCaseCard = ({ item, index }) => {
    const isMenuOpen = menuVisibleFor === item.id;
    const cardWidth = viewMode === 'grid' ? (width - 72) / 2 : '100%';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleViewDetails(item)}
        style={{ width: cardWidth, marginRight: viewMode === 'grid' && index % 2 === 0 ? 16 : 0 }}
      >
        <Surface style={styles.caseCard}>
          <LinearGradient colors={[ 'rgba(255,255,255,0.95)', 'rgba(248,249,254,0.95)' ]} style={styles.caseCardGradient}>
            <View style={styles.caseHeader}>
              <View style={styles.caseIconContainer}>
                <LinearGradient colors={colors.gradient.primary} style={styles.caseIcon}>
                  <MaterialCommunityIcons name={getCaseTypeInfo(item.type).icon} size={20} color="white" />
                </LinearGradient>
              </View>

              <View style={styles.caseMainInfo}>
                <View style={styles.caseTitleRow}>
                  <Text style={styles.caseTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.priorityIndicator}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                  </View>
                </View>

                <Text style={styles.caseClient}>{item.client}</Text>
                <Text style={styles.caseNumber}>{item.caseNumber}</Text>
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
                  style={[styles.statusChip, { backgroundColor: getCaseStatusInfo(item.status).color + '15' }]}
                  textStyle={{ color: getCaseStatusInfo(item.status).color, fontSize: 10, fontWeight: '700' }}
                  icon={getCaseStatusInfo(item.status).icon}
                >
                  {getCaseStatusInfo(item.status).label}
                </Chip>

                <Chip mode="outlined" compact style={styles.typeChip} textStyle={styles.typeChipText}>{getCaseTypeInfo(item.type).label}</Chip>
              </View>

              <View style={styles.valueContainer}>
                <Text style={styles.caseValue}>{item.value}</Text>
                <MaterialCommunityIcons name="trending-up" size={14} color={colors.success} />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>{item.progress}%</Text>
              </View>
              <ProgressBar progress={item.progress / 100} color={colors.primary} style={styles.progressBar} />
            </View>

            <View style={styles.caseFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.teamAvatars}>
                  {item.team.slice(0,3).map((member, idx) => (
                    <Avatar.Text key={idx} size={24} label={member.split(' ')[1]?.charAt(0) || member.charAt(0)} style={[styles.teamAvatar, { marginLeft: idx > 0 ? -8 : 0 }]} />
                  ))}
                  {item.team.length > 3 && (
                    <View style={styles.moreTeamMembers}><Text style={styles.moreTeamText}>+{item.team.length - 3}</Text></View>
                  )}
                </View>

                <View style={styles.documentsInfo}>
                  <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.documentsText}>{item.documents} docs</Text>
                </View>
              </View>

              <View style={styles.footerRight}>
                <View style={styles.nextHearing}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.nextHearingText}>{item.nextHearing === 'Completed' ? 'Completed' : `Next: ${item.nextHearing}`}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    );
  };

  // Case Details modal content (tabs)
  function CaseDetailsModal() {
    const [tab, setTab] = useState('overview');
    if (!selectedCase) return null;

    return (
      <Modal visible={showCaseDetailsModal} animationType="slide" onRequestClose={() => setShowCaseDetailsModal(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.detailsHeader}>
            <IconButton icon="arrow-left" color={colors.text} size={24} onPress={() => setShowCaseDetailsModal(false)} />
            <Text style={styles.detailsTitle}>{selectedCase.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.detailsTabBar}>
            {['overview','documents','timeline'].map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabButton, tab === t && styles.tabButtonActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.detailsBody}>
            {tab === 'overview' && (
              <View>
                <Text style={styles.detailLabel}>Client</Text>
                <Text style={styles.detailValue}>{selectedCase.client}</Text>

                <Text style={styles.detailLabel}>Case Number</Text>
                <Text style={styles.detailValue}>{selectedCase.caseNumber}</Text>

                <Text style={styles.detailLabel}>Status & Priority</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Chip compact icon={getCaseStatusInfo(selectedCase.status).icon} style={{ backgroundColor: getCaseStatusInfo(selectedCase.status).color + '15' }} textStyle={{ color: getCaseStatusInfo(selectedCase.status).color }}>{getCaseStatusInfo(selectedCase.status).label}</Chip>
                  <Chip compact mode="outlined" style={{ borderColor: getPriorityColor(selectedCase.priority) }}>{selectedCase.priority.charAt(0).toUpperCase() + selectedCase.priority.slice(1)}</Chip>
                </View>

                <Text style={styles.detailLabel}>Value</Text>
                <Text style={styles.detailValue}>{selectedCase.value}</Text>

                <Text style={styles.detailLabel}>Progress</Text>
                <View style={{ marginBottom: 12 }}>
                  <ProgressBar progress={selectedCase.progress / 100} color={colors.primary} style={{ height: 8, borderRadius: 6 }} />
                  <Text style={{ marginTop: 6 }}>{selectedCase.progress}%</Text>
                </View>

                <Text style={styles.detailLabel}>Team</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedCase.team.map((m, i) => (
                    <Chip key={i} compact style={{ marginRight: 8 }}>{m}</Chip>
                  ))}
                </View>

                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{selectedCase.description}</Text>

                <View style={{ height: 40 }} />
              </View>
            )}

            {tab === 'documents' && (
              <View>
                <Text style={styles.detailLabel}>Documents ({selectedCase.documents})</Text>
                {[...Array(selectedCase.documents).keys()].slice(0,10).map((i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                    <Text>Document_{i+1}.pdf</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton icon="download" size={20} onPress={() => Alert.alert('Download', `Pretend to download Document_${i+1}.pdf`)} />
                    </View>
                  </View>
                ))}
                {selectedCase.documents > 10 && <Text style={{ color: colors.textSecondary }}>And {selectedCase.documents - 10} more...</Text>}
              </View>
            )}

            {tab === 'timeline' && (
              <View>
                <Text style={styles.detailLabel}>Timeline</Text>
                {selectedCase.timeline.map((ev) => (
                  <View key={ev.id} style={{ paddingVertical: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{ev.date}</Text>
                    <Text style={{ color: colors.textSecondary }}>{ev.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.detailsFooter}>
            <Button mode="contained" onPress={() => { setShowEditModal(true); setEditForm(selectedCase); }} style={{ flex: 1, marginRight: 8 }}>Edit</Button>
            <Button mode="outlined" onPress={() => { handleDelete(selectedCase); setShowCaseDetailsModal(false); }} style={{ flex: 1 }}>Delete</Button>
          </View>
        </View>
      </Modal>
    );
  }

  // Add / Edit Modal
  function AddEditModal({ visible, onClose, isEdit }) {
    const setter = isEdit ? setEditForm : setForm;
    const currentForm = isEdit ? editForm : form;

    useEffect(() => {
      if (visible && isEdit && selectedCase && !editForm) {
        // prefill
        setEditForm(selectedCase);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    if (!currentForm) return null;

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalRoot}>
          <View style={styles.detailsHeader}>
            <IconButton icon="close" color={colors.text} size={24} onPress={onClose} />
            <Text style={styles.detailsTitle}>{isEdit ? 'Edit Case' : 'Add Case'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.detailsBody} contentContainerStyle={{ paddingBottom: 80 }}>
            <PaperInput label="Title" value={currentForm.title} onChangeText={(t) => setter({ ...currentForm, title: t })} style={{ marginBottom: 12 }} />
            <PaperInput label="Client" value={currentForm.client} onChangeText={(t) => setter({ ...currentForm, client: t })} style={{ marginBottom: 12 }} />

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <PaperInput style={{ flex: 1 }} label="Value" value={currentForm.value} onChangeText={(t) => setter({ ...currentForm, value: t })} />
              <PaperInput style={{ width: 110 }} label="Progress %" keyboardType="numeric" value={String(currentForm.progress)} onChangeText={(t) => setter({ ...currentForm, progress: Math.min(100, Math.max(0, Number(t) || 0)) })} />
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <PaperInput style={{ flex: 1 }} label="Next Hearing" value={currentForm.nextHearing} onChangeText={(t) => setter({ ...currentForm, nextHearing: t })} />
              <PaperInput style={{ width: 140 }} label="Priority" value={currentForm.priority} onChangeText={(t) => setter({ ...currentForm, priority: t })} />
            </View>

            <PaperInput label="Description" value={currentForm.description} onChangeText={(t) => setter({ ...currentForm, description: t })} multiline numberOfLines={4} style={{ marginBottom: 12 }} />

            <Text style={{ marginBottom: 8, fontWeight: '700' }}>Team</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <PaperInput placeholder="Add member (e.g. Adv. Jain)" value={teamInput} onChangeText={setTeamInput} style={{ flex: 1 }} />
              <Button mode="contained" onPress={() => addTeamMember(setter, teamInput)}>Add</Button>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(currentForm.team || []).map((m, i) => (
                <Chip key={i} onClose={() => setter({ ...currentForm, team: currentForm.team.filter((x) => x !== m) })}>{m}</Chip>
              ))}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
            <Button mode="outlined" onPress={onClose} style={{ flex: 1, marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={() => { isEdit ? handleSaveEdit() : handleAddCase(); }} style={{ flex: 1 }}>{isEdit ? 'Save' : 'Add'}</Button>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.header, { height: headerHeight }] }>
        <LinearGradient colors={colors.gradient.primary} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}><MaterialCommunityIcons name="arrow-left" size={24} color="white" /></TouchableOpacity>
              <Text style={styles.headerTitle}>Cases</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerAction} onPress={() => setViewMode((v) => v === 'list' ? 'grid' : 'list')}>
                  <MaterialCommunityIcons name={viewMode === 'list' ? 'view-grid' : 'view-list'} size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerAction} onPress={() => setShowFilterModal(true)}>
                  <MaterialCommunityIcons name="tune" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statValue}>{cases.length}</Text><Text style={styles.statLabel}>Total Cases</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statValue}>{cases.filter(c => c.status === 'active').length}</Text><Text style={styles.statLabel}>Active</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statValue}>₹{Math.round(cases.reduce((s,c)=>s+parseCurrencyToNumber(c.value),0)/100000)}L</Text><Text style={styles.statLabel}>Total Value</Text></View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.searchContainer, { opacity: searchBarOpacity }]}>
        <Surface style={styles.searchSurface}>
          <View style={styles.searchBar}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder="Search cases, clients, case numbers..." placeholderTextColor={colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}><MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} /></TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <LinearGradient colors={colors.gradient.primary} style={styles.filterButtonGradient}>
                <MaterialCommunityIcons name="tune" size={18} color="white" />
                {selectedFilters.length > 0 && (<Badge size={16} style={styles.filterBadge}>{selectedFilters.length}</Badge>)}
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

      <FAB style={[styles.fab, { backgroundColor: colors.secondary }]} icon="plus" onPress={() => setShowAddCaseModal(true)} color="white" />

      {/* Filter Modal (re-using your UI but making Apply functional) */}
      <Modal visible={showFilterModal} animationType="slide" transparent onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint={Platform.OS === 'ios' ? 'light' : 'dark'} style={styles.modalBlur}>
            <View style={styles.filterModal}>
              <LinearGradient colors={colors.gradient.glass} style={styles.filterModalContent}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterTitle}>Filter & Sort</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeButton}><MaterialCommunityIcons name="close" size={24} color={colors.text} /></TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Status</Text>
                    <View style={styles.filterChips}>
                      {caseStatuses.map((status) => (
                        <TouchableOpacity key={status.id} onPress={() => setSelectedFilters(prev => prev.includes(status.id) ? prev.filter(f => f !== status.id) : [...prev, status.id])}>
                          <Chip selected={selectedFilters.includes(status.id)} mode={selectedFilters.includes(status.id) ? 'flat' : 'outlined'} style={[styles.filterChip, selectedFilters.includes(status.id) && { backgroundColor: status.color + '20' }]} textStyle={{ color: selectedFilters.includes(status.id) ? status.color : colors.text }}>{status.label}</Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Case Type</Text>
                    <View style={styles.filterChips}>
                      {caseTypes.map((type) => (
                        <TouchableOpacity key={type.id} onPress={() => setSelectedFilters(prev => prev.includes(type.id) ? prev.filter(f => f !== type.id) : [...prev, type.id])}>
                          <Chip selected={selectedFilters.includes(type.id)} mode={selectedFilters.includes(type.id) ? 'flat' : 'outlined'} style={[styles.filterChip, selectedFilters.includes(type.id) && { backgroundColor: colors.primary + '15' }]} textStyle={{ color: selectedFilters.includes(type.id) ? colors.primary : colors.text }}>{type.label}</Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Priority</Text>
                    <View style={styles.filterChips}>
                      {['critical','high','medium','low'].map((priority) => (
                        <TouchableOpacity key={priority} onPress={() => setSelectedFilters(prev => prev.includes(priority) ? prev.filter(f => f !== priority) : [...prev, priority])}>
                          <Chip selected={selectedFilters.includes(priority)} mode={selectedFilters.includes(priority) ? 'flat' : 'outlined'} style={[styles.filterChip, selectedFilters.includes(priority) && { backgroundColor: getPriorityColor(priority) + '15' }]} textStyle={{ color: selectedFilters.includes(priority) ? getPriorityColor(priority) : colors.text }}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Chip>
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
                        <TouchableOpacity key={sort.id} style={[styles.sortOption, sortBy === sort.id && styles.sortOptionSelected]} onPress={() => setSortBy(sort.id)}>
                          <MaterialCommunityIcons name={sort.icon} size={18} color={sortBy === sort.id ? colors.primary : colors.textSecondary} />
                          <Text style={[styles.sortOptionText, sortBy === sort.id && styles.sortOptionTextSelected]}>{sort.label}</Text>
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
                    <LinearGradient colors={colors.gradient.primary} style={styles.applyFiltersGradient}><Text style={styles.applyFiltersText}>Apply Filters</Text></LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Add Case Modal */}
      <AddEditModal visible={showAddCaseModal} onClose={() => { setShowAddCaseModal(false); resetForm(); }} isEdit={false} />

      {/* Edit Modal */}
      <AddEditModal visible={showEditModal} onClose={() => { setShowEditModal(false); setEditForm(null); }} isEdit={true} />

      {/* Case Details Modal */}
      {showCaseDetailsModal && <CaseDetailsModal />}

      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar({ visible: false, text: '' })} action={{ label: 'Undo', onPress: undoDelete }}>{snackbar.text}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { position: 'relative', zIndex: 1 },
  headerGradient: { flex: 1, paddingTop: StatusBar.currentHeight + 10 || 54 },
  headerContent: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 10 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  searchContainer: { marginHorizontal: 24, marginTop: -20, marginBottom: 20, zIndex: 2 },
  searchSurface: { borderRadius: 16, elevation: 8, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 4, gap: 8 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceVariant, borderRadius: 12, paddingHorizontal: 16, height: 48 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' },
  clearSearchButton: { padding: 4 },
  filterButton: { position: 'relative' },
  filterButtonGradient: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  filterBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.secondary },
  casesList: { flex: 1 },
  casesListContent: { paddingHorizontal: 24, paddingBottom: 140 },
  caseCard: { marginBottom: 16, borderRadius: 20, elevation: 6, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  caseCardGradient: { padding: 20, borderRadius: 20 },
  caseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  caseIconContainer: { marginRight: 16 },
  caseIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  caseMainInfo: { flex: 1, marginRight: 12 },
  caseTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  caseTitle: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 24, flex: 1, marginRight: 8 },
  priorityIndicator: { alignItems: 'center', justifyContent: 'center' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  caseClient: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  caseNumber: { fontSize: 12, color: colors.textTertiary, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  moreButton: { padding: 4 },
  caseMetaContainer: { marginBottom: 16 },
  caseMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statusChip: { height: 28 },
  typeChip: { height: 28, backgroundColor: 'transparent', borderColor: colors.textTertiary },
  typeChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  valueContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  caseValue: { fontSize: 14, color: colors.success, fontWeight: '800', marginRight: 6 },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: colors.text, fontWeight: '600' },
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
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
