import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Text, 
  Button, 
  List,
  FAB,
  Menu,
  IconButton,
  Chip,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { colors } from '../../styles/colors';
import { ActionCard } from '../../components/ui/CustomCard';
import { ChipButton } from '../../components/ui/CustomButton';
import { LoadingSpinner, EmptyState } from '../../components/ui/LoadingStates';

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});

  // Mock documents data
  const mockDocuments = [
    {
      id: '1',
      name: 'Property_Agreement.pdf',
      type: 'Contract',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'Reviewed',
      description: 'Property purchase agreement for Flat No. 204',
      tags: ['Property', 'Contract', 'Important']
    },
    {
      id: '2',
      name: 'Tax_Return_2023.pdf',
      type: 'Tax Document',
      size: '856 KB',
      uploadDate: '2024-01-10',
      status: 'Pending Review',
      description: 'Annual tax return filing documents',
      tags: ['Tax', 'Annual', '2023']
    },
    {
      id: '3',
      name: 'Employment_Contract.docx',
      type: 'Contract',
      size: '1.2 MB',
      uploadDate: '2024-01-08',
      status: 'Approved',
      description: 'Employment contract with ABC Corp',
      tags: ['Employment', 'Contract']
    }
  ];

  const categories = [
    'All', 'Contract', 'Tax Document', 'Legal Notice', 
    'Certificate', 'Agreement', 'Other'
  ];

  React.useEffect(() => {
    setDocuments(mockDocuments);
  }, []);

  const pickDocument = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.cancelled) {
        const newDocument = {
          id: Date.now().toString(),
          name: result.name,
          type: 'Other',
          size: formatFileSize(result.size),
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Uploading',
          description: 'Recently uploaded document',
          tags: ['Recent'],
          uri: result.uri
        };

        setDocuments(prev => [newDocument, ...prev]);

        // Simulate upload process
        setTimeout(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDocument.id 
                ? { ...doc, status: 'Pending Review' }
                : doc
            )
          );
          setUploading(false);
        }, 2000);
      } else {
        setUploading(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'file-pdf-box';
      case 'doc':
      case 'docx': return 'file-word-box';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'file-image-box';
      default: return 'file-document-box';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return colors.success;
      case 'Reviewed': return colors.info;
      case 'Pending Review': return colors.warning;
      case 'Rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const shareDocument = async (document) => {
    try {
      if (document.uri) {
        await Sharing.shareAsync(document.uri);
      } else {
        Alert.alert('Info', 'Document not available for sharing');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const deleteDocument = (documentId) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          }
        }
      ]
    );
  };

  const filteredDocuments = documents.filter(doc => 
    selectedCategory === 'All' || doc.type === selectedCategory
  );

  const renderDocument = (document) => (
    <Card key={document.id} style={styles.documentCard} elevation={2}>
      <Card.Content>
        <View style={styles.documentHeader}>
          <MaterialCommunityIcons 
            name={getFileIcon(document.name)} 
            size={32} 
            color={colors.primary} 
          />
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{document.name}</Text>
            <Text style={styles.documentMeta}>
              {document.size} • {document.uploadDate}
            </Text>
            <Text style={styles.documentDescription} numberOfLines={1}>
              {document.description}
            </Text>
          </View>
          <View style={styles.documentActions}>
            <Chip 
              mode="outlined" 
              compact
              style={[styles.statusChip, { borderColor: getStatusColor(document.status) }]}
              textStyle={{ color: getStatusColor(document.status) }}
            >
              {document.status}
            </Chip>
            <Menu
              visible={menuVisible[document.id]}
              onDismiss={() => setMenuVisible({ ...menuVisible, [document.id]: false })}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible({ ...menuVisible, [document.id]: true })}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  shareDocument(document);
                  setMenuVisible({ ...menuVisible, [document.id]: false });
                }} 
                title="Share" 
                leadingIcon="share"
              />
              <Menu.Item 
                onPress={() => {
                  console.log('Download', document.id);
                  setMenuVisible({ ...menuVisible, [document.id]: false });
                }} 
                title="Download" 
                leadingIcon="download"
              />
              <Menu.Item 
                onPress={() => {
                  deleteDocument(document.id);
                  setMenuVisible({ ...menuVisible, [document.id]: false });
                }} 
                title="Delete" 
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        {document.status === 'Uploading' && (
          <ProgressBar 
            indeterminate 
            color={colors.primary} 
            style={styles.progressBar} 
          />
        )}

        <View style={styles.tagsContainer}>
          {document.tags.map((tag, index) => (
            <Chip key={index} compact mode="outlined" style={styles.tagChip}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{documents.length}</Text>
            <Text style={styles.statLabel}>Total Documents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {documents.filter(doc => doc.status === 'Pending Review').length}
            </Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {documents.reduce((sum, doc) => {
                const size = parseFloat(doc.size.split(' ')[0]);
                const unit = doc.size.split(' ')[1];
                return sum + (unit === 'MB' ? size : size / 1024);
              }, 0).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>MB Used</Text>
          </View>
        </View>
      </Surface>

      {/* Categories Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <ChipButton
            key={category}
            title={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {/* Documents List */}
      <ScrollView style={styles.documentsContainer}>
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon="file-document-outline"
            title="No documents found"
            description="Upload your legal documents to get started"
            actionButton={
              <Button mode="contained" onPress={pickDocument} icon="upload">
                Upload Document
              </Button>
            }
          />
        ) : (
          filteredDocuments.map(renderDocument)
        )}
      </ScrollView>

      {/* Upload FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={pickDocument}
        loading={uploading}
        disabled={uploading}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <ActionCard
          title="Scan Document"
          description="Use camera to scan"
          icon="camera"
          onPress={() => console.log('Scan document')}
        />
        <ActionCard
          title="Templates"
          description="Legal document templates"
          icon="file-multiple"
          onPress={() => console.log('Document templates')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  documentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  documentCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  documentActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 8,
    height: 24,
  },
  progressBar: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 6,
    marginBottom: 4,
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});