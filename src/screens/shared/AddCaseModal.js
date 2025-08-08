import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const AddCaseModal = ({ visible, onClose, onSubmit }) => {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseType: '',
    priority: 'Medium',
    client: '',
    clientEmail: '',
    clientPhone: '',
    urgency: 'Normal',
    expectedDuration: '',
    budget: '',
    deadlineDate: new Date(),
    tags: [],
    documents: [],
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const caseTypes = [
    { id: 'corporate', name: 'Corporate Law', icon: 'office-building' },
    { id: 'family', name: 'Family Law', icon: 'home-heart' },
    { id: 'criminal', name: 'Criminal Defense', icon: 'shield-account' },
    { id: 'real-estate', name: 'Real Estate', icon: 'home-city' },
    { id: 'immigration', name: 'Immigration', icon: 'passport' },
    { id: 'personal-injury', name: 'Personal Injury', icon: 'medical-bag' },
    { id: 'employment', name: 'Employment', icon: 'account-tie' },
    { id: 'intellectual-property', name: 'IP Law', icon: 'lightbulb-on' },
  ];

  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const urgencyLevels = ['Normal', 'Urgent', 'Emergency'];
  const suggestedTags = ['Contract', 'Litigation', 'Consultation', 'Review', 'Negotiation', 'Documentation'];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Case title is required';
      if (!formData.description.trim()) newErrors.description = 'Case description is required';
      if (!formData.caseType) newErrors.caseType = 'Case type is required';
    }
    
    if (step === 2) {
      if (!formData.client.trim()) newErrors.client = 'Client name is required';
      if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Client email is required';
      if (formData.clientEmail && !/\S+@\S+\.\S+/.test(formData.clientEmail)) {
        newErrors.clientEmail = 'Valid email is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        Animated.timing(slideAnim, {
          toValue: currentStep,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      Animated.timing(slideAnim, {
        toValue: currentStep - 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call the onSubmit prop with form data
        onSubmit && onSubmit(formData);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          caseType: '',
          priority: 'Medium',
          client: '',
          clientEmail: '',
          clientPhone: '',
          urgency: 'Normal',
          expectedDuration: '',
          budget: '',
          deadlineDate: new Date(),
          tags: [],
          documents: [],
          notes: '',
        });
        setCurrentStep(1);
        setErrors({});
        
        Alert.alert('Success', 'Case has been created successfully!');
        onClose();
      } catch (error) {
        Alert.alert('Error', 'Failed to create case. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setCustomTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleDocumentUpload = () => {
    Alert.alert(
      'Upload Document',
      'Choose upload method:',
      [
        { text: 'Camera', onPress: () => console.log('Camera') },
        { text: 'Gallery', onPress: () => console.log('Gallery') },
        { text: 'Files', onPress: () => console.log('Files') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            {
              backgroundColor: step <= currentStep
                ? '#007AFF'
                : isDarkMode ? '#3A3A3C' : '#E5E5EA'
            }
          ]}
        />
      ))}
    </View>
  );

  const renderStepContent = () => {
    const stepWidth = width * 0.9 - 48;
    
    return (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalOverlay}
    >
      <BlurView intensity={70} tint={isDarkMode ? 'dark' : 'light'} style={styles.modalContent}>
        <LinearGradient
          colors={isDarkMode ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F2F2F7']}
          style={styles.modalInner}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#1D1D1F'} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                Add New Case
              </Text>
              <Text style={[styles.stepIndicator, { color: isDarkMode ? '#8E8E93' : '#86868B' }]}>
                Step {currentStep} of 3
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Steps */}
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {renderStepContent()}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.footerButton, styles.secondaryButton]}
                onPress={handlePrevious}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#FFFFFF' : '#1D1D1F'} />
                <Text style={[styles.footerButtonText, { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.primaryButton,
                {
                  backgroundColor: loading ? '#8E8E93' : '#007AFF',
                  flex: currentStep === 1 ? 1 : 0.6,
                }
              ]}
              onPress={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {currentStep === 3 ? 'Create Case' : 'Next'}
                  </Text>
                  <Feather
                    name={currentStep === 3 ? 'check' : 'arrow-right'}
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </KeyboardAvoidingView>

    {/* Date Picker Modal */}
    {showDatePicker && (
      <Modal
        transparent
        animationType="fade"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={[
            styles.datePickerContainer,
            { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.datePickerButton, { color: '#FF3B30' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[
                styles.datePickerTitle,
                { color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }
              ]}>
                Select Deadline
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.datePickerButton, { color: '#007AFF' }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={formData.deadlineDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, deadlineDate: selectedDate }));
                }
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                }
              }}
              minimumDate={new Date()}
            />
          </View>
        </View>
      </Modal>
    )}
  </Modal>
);
  }
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.95,
    maxWidth: 500,
    height: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalInner: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    width: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    width: width * 2.7, // 3 steps * 0.9 width
  },
  stepContent: {
    paddingHorizontal: 4,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1,
    height: 100,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  caseTypesContainer: {
    paddingRight: 20,
  },
  caseTypeCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 100,
  },
  caseTypeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 12,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  suggestedTags: {
    paddingRight: 20,
  },
  suggestedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestedTagText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  customTagInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  documentsPreview: {
    marginTop: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  secondaryButton: {
    flex: 0.4,
  },
  primaryButton: {
    flex: 1,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  
  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerContainer: {
    width: width * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddCaseModal;