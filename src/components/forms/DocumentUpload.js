import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { 
  Card, 
  Text, 
  Text, 
  Button, 
  TextInput,
  HelperText,
  ProgressBar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { colors } from '../../styles/colors';
import { ChipButton } from '../ui/CustomButton';

export const DocumentUploadCard = ({ onUpload, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    'Contract', 'Legal Notice', 'Certificate', 
    'Agreement', 'Tax Document', 'Other'
  ];

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.cancelled) {
        setSelectedFile(result);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !description) {
      return;
    }

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      onUpload({
        file: selectedFile,
        type: documentType,
        description: description
      });
      setUploading(false);
    }, 2000);
  };

  return (
    <Card style={styles.uploadCard} elevation={4}>
      <Card.Content>
        <Text style={styles.uploadTitle}>Upload Document</Text>
        
        {/* File Selection */}
        <View style={styles.fileSelection}>
          {selectedFile ? (
            <View style={styles.selectedFile}>
              <MaterialCommunityIcons 
                name="file-check" 
                size={24} 
                color={colors.success} 
              />
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Button 
                mode="text" 
                compact 
                onPress={() => setSelectedFile(null)}
              >
                Change
              </Button>
            </View>
          ) : (
            <Button 
              mode="outlined" 
              icon="file-upload"
              onPress={pickFile}
              style={styles.selectButton}
            >
              Select File
            </Button>
          )}
        </View>

        {/* Document Type */}
        <Text style={styles.label}>Document Type *</Text>
        <View style={styles.typeSelection}>
          {documentTypes.map((type) => (
            <ChipButton
              key={type}
              title={type}
              selected={documentType === type}
              onPress={() => setDocumentType(type)}
            />
          ))}
        </View>

        {/* Description */}
        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.descriptionInput}
        />
        
        {uploading && (
          <View style={styles.uploadProgress}>
            <Text style={styles.uploadingText}>Uploading...</Text>
            <ProgressBar indeterminate color={colors.primary} />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={onCancel}
            disabled={uploading}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleUpload}
            disabled={!selectedFile || !documentType || !description || uploading}
            loading={uploading}
            style={styles.actionButton}
          >
            Upload
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  uploadCard: {
    margin: 16,
    borderRadius: 16,
  },
  uploadTitle: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 20,
  },
  fileSelection: {
    marginBottom: 20,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
  },
  selectButton: {
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  descriptionInput: {
    marginBottom: 16,
  },
  uploadProgress: {
    marginBottom: 20,
  },
  uploadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
