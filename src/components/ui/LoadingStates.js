import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Card } from 'react-native-paper';
import { colors } from '../../styles/colors';

export const LoadingSpinner = ({ size = 'large', color = colors.primary, text }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

export const EmptyState = ({ icon, title, description, actionButton }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <MaterialCommunityIcons name={icon} size={64} color={colors.textSecondary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {actionButton && <View style={styles.emptyAction}>{actionButton}</View>}
  </View>
);

export const ErrorState = ({ title = 'Something went wrong', description, onRetry }) => (
  <Card style={styles.errorCard}>
    <Card.Content style={styles.errorContent}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorDescription}>{description}</Text>
      {onRetry && (
        <Button mode="outlined" onPress={onRetry} style={styles.retryButton}>
          Try Again
        </Button>
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAction: {
    marginTop: 16,
  },
  errorCard: {
    margin: 16,
    elevation: 2,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderColor: colors.error,
  },
});