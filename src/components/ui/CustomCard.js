import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export const ActionCard = ({ title, description, icon, onPress, color = colors.primary }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionCardContainer}>
    <Card style={styles.actionCard} elevation={3}>
      <Card.Content style={styles.actionCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

export const StatCard = ({ title, value, icon, change, changeType }) => (
  <Card style={styles.statCard} elevation={2}>
    <Card.Content style={styles.statContent}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
        {change && (
          <View style={[styles.changeIndicator, { backgroundColor: changeType === 'positive' ? colors.success : colors.error }]}>
            <MaterialCommunityIcons 
              name={changeType === 'positive' ? 'trending-up' : 'trending-down'} 
              size={12} 
              color="white" 
            />
            <Text style={styles.changeText}>{change}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card.Content>
  </Card>
);

export const InfoCard = ({ title, children, icon, headerColor = colors.primary }) => (
  <Card style={styles.infoCard} elevation={2}>
    <View style={[styles.infoHeader, { backgroundColor: headerColor }]}>
      {icon && <MaterialCommunityIcons name={icon} size={20} color="white" />}
      <Text style={styles.infoHeaderText}>{title}</Text>
    </View>
    <Card.Content style={styles.infoContent}>
      {children}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  actionCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 16,
  },
  actionCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: colors.text,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  changeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContent: {
    paddingTop: 16,
  },
});