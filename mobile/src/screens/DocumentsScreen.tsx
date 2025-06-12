import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, FAB, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/ApiService';
import { theme, spacing } from '@/constants/theme';

export function DocumentsScreen() {
  const [uploadMode, setUploadMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => ApiService.getDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => ApiService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadMode(false);
      Alert.alert('Success', 'Document uploaded successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => ApiService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Success', 'Document deleted successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete document');
    },
  });

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('document', {
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          name: asset.name,
        } as any);
        formData.append('type', 'general');
        
        uploadMutation.mutate(formData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleCameraUpload = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to capture documents');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('document', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `document_${Date.now()}.jpg`,
        } as any);
        formData.append('type', 'photo');
        
        uploadMutation.mutate(formData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture document');
    }
  };

  const handleDeleteDocument = (documentId: string, documentName: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${documentName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(documentId)
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return theme.colors.primary;
      case 'pending': return '#f59e0b';
      case 'rejected': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Uploaded';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Document Glovebox
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage your verification documents
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Upload Actions */}
        {uploadMode && (
          <Card style={styles.uploadCard} mode="elevated">
            <Card.Content style={styles.uploadContent}>
              <Text variant="titleMedium" style={styles.uploadTitle}>
                Upload Document
              </Text>
              <View style={styles.uploadActions}>
                <Button
                  mode="contained"
                  icon="file-document"
                  onPress={handleDocumentUpload}
                  style={styles.uploadButton}
                  loading={uploadMutation.isPending}
                >
                  Choose File
                </Button>
                <Button
                  mode="contained"
                  icon="camera"
                  onPress={handleCameraUpload}
                  style={styles.uploadButton}
                  loading={uploadMutation.isPending}
                >
                  Take Photo
                </Button>
              </View>
              <Button
                mode="outlined"
                onPress={() => setUploadMode(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Document Categories */}
        <Card style={styles.categoryCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.categoryTitle}>
              Required Documents
            </Text>
            <View style={styles.categoryList}>
              <View style={styles.categoryItem}>
                <Text variant="bodyMedium" style={styles.categoryName}>
                  Driver's License
                </Text>
                <Chip size="small" textStyle={{ color: getStatusColor('verified') }}>
                  Verified
                </Chip>
              </View>
              <View style={styles.categoryItem}>
                <Text variant="bodyMedium" style={styles.categoryName}>
                  Insurance Certificate
                </Text>
                <Chip size="small" textStyle={{ color: getStatusColor('pending') }}>
                  Pending
                </Chip>
              </View>
              <View style={styles.categoryItem}>
                <Text variant="bodyMedium" style={styles.categoryName}>
                  Background Check
                </Text>
                <Chip size="small" textStyle={{ color: getStatusColor('verified') }}>
                  Verified
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Documents List */}
        {documents?.length > 0 ? (
          documents.map((document: any, index: number) => (
            <Card key={index} style={styles.documentCard} mode="elevated">
              <Card.Content style={styles.documentContent}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentInfo}>
                    <Text variant="titleSmall" style={styles.documentName}>
                      {document.name || `Document ${index + 1}`}
                    </Text>
                    <Text variant="bodySmall" style={styles.documentType}>
                      {document.type || 'General Document'}
                    </Text>
                  </View>
                  <View style={styles.documentActions}>
                    <Chip 
                      size="small" 
                      textStyle={{ color: getStatusColor(document.status) }}
                    >
                      {getStatusLabel(document.status)}
                    </Chip>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteDocument(document.id, document.name)}
                      disabled={deleteMutation.isPending}
                    />
                  </View>
                </View>
                
                <View style={styles.documentDetails}>
                  <Text variant="bodySmall" style={styles.documentDate}>
                    Uploaded: {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Unknown'}
                  </Text>
                  <Text variant="bodySmall" style={styles.documentSize}>
                    Size: {document.size ? `${Math.round(document.size / 1024)} KB` : 'Unknown'}
                  </Text>
                </View>

                {document.status === 'rejected' && (
                  <View style={styles.rejectionReason}>
                    <Text variant="bodySmall" style={styles.rejectionText}>
                      Rejection reason: {document.rejectionReason || 'Document quality issues'}
                    </Text>
                  </View>
                )}

                <View style={styles.documentCardActions}>
                  <Button
                    mode="outlined"
                    icon="eye"
                    onPress={() => {/* View document */}}
                    style={styles.viewButton}
                  >
                    View
                  </Button>
                  <Button
                    mode="outlined"
                    icon="download"
                    onPress={() => {/* Download document */}}
                    style={styles.downloadButton}
                  >
                    Download
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No documents uploaded
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Upload your verification documents to get started with the onboarding process.
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setUploadMode(true)}
                style={styles.uploadStartButton}
              >
                Upload First Document
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {!uploadMode && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setUploadMode(true)}
          label="Upload"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  scrollView: {
    flex: 1,
  },
  uploadCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  uploadContent: {
    padding: spacing.lg,
  },
  uploadTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  uploadButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
  categoryCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  categoryTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  categoryName: {
    color: theme.colors.onSurface,
  },
  documentCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  documentContent: {
    padding: spacing.lg,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  documentType: {
    color: theme.colors.onSurfaceVariant,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  documentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  documentDate: {
    color: theme.colors.onSurfaceVariant,
  },
  documentSize: {
    color: theme.colors.onSurfaceVariant,
  },
  rejectionReason: {
    backgroundColor: theme.colors.errorContainer,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  rejectionText: {
    color: theme.colors.error,
  },
  documentCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  uploadStartButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: theme.colors.primary,
  },
});