// src/screens/CaseDetails/SubtasksTab.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubtasks,
  addSubtask,
  updateSubtask,
  toggleSubtaskStatus,
  deleteSubtask,
  selectSubtasksByCase,
  selectCaseLoading
} from '../../store/caseSlice';

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'critical'];

export default function SubtasksTab({ caseId, colors, isDarkMode, styles }) {
  const dispatch = useDispatch();
  const subtasks = useSelector(selectSubtasksByCase(caseId));
  const loading = useSelector(selectCaseLoading);

  const [filterStatus, setFilterStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: '',
    assignedTo: '',
    dueDate: null,
    notes: '',
    priority: 'normal',
    status: 'pending',
  });

  useEffect(() => {
    dispatch(fetchSubtasks(caseId));
  }, [caseId, dispatch]);

  const filtered = useMemo(() => {
    return (subtasks || [])
      .filter(s => filterStatus === 'all' ? true : s.status === filterStatus)
      .filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const da = a.dueDate?.toMillis ? a.dueDate.toMillis() : (a.dueDate ? new Date(a.dueDate).getTime() : Infinity);
        const db = b.dueDate?.toMillis ? b.dueDate.toMillis() : (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
        return da - db;
      });
  }, [subtasks, filterStatus, query]);

  const resetForm = () => {
    setForm({
      title: '',
      assignedTo: '',
      dueDate: null,
      notes: '',
      priority: 'normal',
      status: 'pending',
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (st) => {
    setEditing(st);
    setForm({
      title: st.title || '',
      assignedTo: st.assignedTo || '',
      dueDate: st.dueDate?.toDate ? st.dueDate.toDate() : (st.dueDate ? new Date(st.dueDate) : null),
      notes: st.notes || '',
      priority: st.priority || 'normal',
      status: st.status || 'pending',
    });
    setShowModal(true);
  };

  const onSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) {
      await dispatch(updateSubtask({
        caseId,
        subtaskId: editing.id,
        patch: {
          ...form,
          dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        },
      }));
    } else {
      await dispatch(addSubtask({
        caseId,
        subtask: {
          ...form,
          dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        },
      }));
    }
    setShowModal(false);
    resetForm();
  };

  const onToggle = (st) => {
    const next = st.status === 'completed' ? 'pending' : 'completed';
    dispatch(toggleSubtaskStatus({ caseId, subtaskId: st.id, nextStatus: next }));
  };

  const onDelete = (st) => {
    dispatch(deleteSubtask({ caseId, subtaskId: st.id }));
  };

  const StatusPill = ({ value }) => {
    const map = {
      pending: { bg: '#FF950022', fg: '#FF9500', icon: 'pause-circle-outline' },
      in_progress: { bg: '#007AFF22', fg: '#007AFF', icon: 'progress-check' },
      blocked: { bg: '#FF3B3022', fg: '#FF3B30', icon: 'block-helper' },
      completed: { bg: '#34C75922', fg: '#34C759', icon: 'check-circle-outline' },
    };
    const m = map[value] || { bg: '#8E8E9322', fg: '#8E8E93', icon: 'circle-outline' };
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: m.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
        <MaterialCommunityIcons name={m.icon} size={14} color={m.fg} />
        <Text style={{ color: m.fg, marginLeft: 6, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
          {value.replace('_', ' ')}
        </Text>
      </View>
    );
  };

  const Item = ({ item }) => (
    <View style={{
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2C2C2E' : '#E5E5EA'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => onToggle(item)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name={item.status === 'completed' ? 'checkbox-marked-circle-outline' : 'checkbox-blank-circle-outline'}
            size={22}
            color={item.status === 'completed' ? '#34C759' : (isDarkMode ? '#8E8E93' : '#888')}
          />
          <Text style={{ marginLeft: 10, color: isDarkMode ? '#FFF' : '#000', fontWeight: '600' }}>
            {item.title}
          </Text>
        </TouchableOpacity>
        <StatusPill value={item.status} />
      </View>

      {(item.assignedTo || item.dueDate) && (
        <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
          {item.assignedTo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Feather name="user" size={14} color={isDarkMode ? '#8E8E93' : '#666'} />
              <Text style={{ marginLeft: 6, color: isDarkMode ? '#8E8E93' : '#666' }}>{item.assignedTo}</Text>
            </View>
          ) : null}
          {item.dueDate ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="calendar" size={14} color={isDarkMode ? '#8E8E93' : '#666'} />
              <Text style={{ marginLeft: 6, color: isDarkMode ? '#8E8E93' : '#666' }}>
                {item.dueDate?.toDate ? item.dueDate.toDate().toDateString() : new Date(item.dueDate).toDateString()}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {item.notes ? (
        <Text style={{ marginTop: 8, color: isDarkMode ? '#8E8E93' : '#666' }}>{item.notes}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
        <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 14 }}>
          <Feather name="edit-3" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Feather name="trash-2" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
      {/* Toolbar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center',
          borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7'
        }}>
          <Feather name="search" size={18} color={isDarkMode ? '#8E8E93' : '#666'} />
          <TextInput
            placeholder="Search subtasks..."
            placeholderTextColor={isDarkMode ? '#8E8E93' : '#666'}
            style={{ marginLeft: 8, flex: 1, color: isDarkMode ? '#FFF' : '#000' }}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 8 }}>
          {STATUS_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setFilterStatus(opt.id)}
              style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                backgroundColor: filterStatus === opt.id ? colors.primary : (isDarkMode ? '#2C2C2E' : '#F2F2F7'),
                marginRight: 8
              }}>
              <Text style={{ color: filterStatus === opt.id ? '#FFF' : (isDarkMode ? '#FFF' : '#111'), fontSize: 12, fontWeight: '600' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={openCreate} style={{ marginLeft: 8, backgroundColor: colors.primary, padding: 10, borderRadius: 12 }}>
          <Feather name="plus" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => <Item item={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <MaterialCommunityIcons name="check-circle-outline" size={36} color={isDarkMode ? '#8E8E93' : '#666'} />
            <Text style={{ marginTop: 8, color: isDarkMode ? '#8E8E93' : '#666' }}>No subtasks yet</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchSubtasks(caseId))}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <View style={{
            width: '100%', maxWidth: 480,
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF',
            borderRadius: 16, padding: 16
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDarkMode ? '#FFF' : '#111', marginBottom: 12 }}>
              {editing ? 'Edit Subtask' : 'Add Subtask'}
            </Text>

            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Title</Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="e.g., Draft petition"
                placeholderTextColor={isDarkMode ? '#8E8E93' : '#999'}
                style={{
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: isDarkMode ? '#FFF' : '#111'
                }}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Assigned To</Text>
                <TextInput
                  value={form.assignedTo}
                  onChangeText={(t) => setForm({ ...form, assignedTo: t })}
                  placeholder="e.g., Adv. Sharma"
                  placeholderTextColor={isDarkMode ? '#8E8E93' : '#999'}
                  style={{
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
                    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: isDarkMode ? '#FFF' : '#111'
                  }}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Priority</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PRIORITY_OPTIONS.map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setForm({ ...form, priority: p })}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8,
                        backgroundColor: form.priority === p ? colors.primary : (isDarkMode ? '#2C2C2E' : '#F2F2F7')
                      }}
                    >
                      <Text style={{ color: form.priority === p ? '#FFF' : (isDarkMode ? '#FFF' : '#111'), fontWeight: '600', textTransform: 'capitalize' }}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Due Date</Text>
              <TouchableOpacity
                onPress={() => setForm({ ...form, _showDate: true })}
                style={{
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12,
                  flexDirection: 'row', alignItems: 'center'
                }}
              >
                <Feather name="calendar" size={18} color={isDarkMode ? '#8E8E93' : '#666'} />
                <Text style={{ marginLeft: 8, color: isDarkMode ? '#FFF' : '#111' }}>
                  {form.dueDate ? form.dueDate.toDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
              {form._showDate && (
                <DateTimePicker
                  value={form.dueDate || new Date()}
                  onChange={(_, date) => setForm({ ...form, dueDate: date || form.dueDate, _showDate: Platform.OS === 'ios' })}
                  mode="date"
                  display="default"
                />
              )}
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Notes</Text>
              <TextInput
                value={form.notes}
                onChangeText={(t) => setForm({ ...form, notes: t })}
                placeholder="Optional notes"
                placeholderTextColor={isDarkMode ? '#8E8E93' : '#999'}
                multiline
                style={{
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
                  minHeight: 80, color: isDarkMode ? '#FFF' : '#111'
                }}
              />
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={{ color: isDarkMode ? '#8E8E93' : '#666', marginBottom: 6 }}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {STATUS_OPTIONS.filter(s => s.id !== 'all').map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setForm({ ...form, status: s.id })}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8,
                      backgroundColor: form.status === s.id ? colors.primary : (isDarkMode ? '#2C2C2E' : '#F2F2F7')
                    }}
                  >
                    <Text style={{ color: form.status === s.id ? '#FFF' : (isDarkMode ? '#FFF' : '#111'), fontWeight: '600' }}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                <Text style={{ color: '#FF3B30', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmit} style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.primary, borderRadius: 10 }}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>{editing ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
