import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  Text, 
  Searchbar,
  List,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { ChipButton } from '../../components/ui/CustomButton';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'lawyers', title: 'Lawyers', icon: 'account-tie' },
    { id: 'questions', title: 'Legal Questions', icon: 'help-circle' },
    { id: 'articles', title: 'Articles', icon: 'file-document' },
    { id: 'cases', title: 'Case Studies', icon: 'briefcase' }
  ];

  const recentSearches = [
    'Property dispute lawyer Mumbai',
    'Divorce proceedings cost',
    'Employment law rights',
    'Tax law consultant'
  ];

  const popularSearches = [
    'Criminal lawyer',
    'Property registration',
    'Company incorporation',
    'Will and testament',
    'Consumer rights',
    'Rental agreement'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search lawyers, questions, articles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <ChipButton
                key={category.id}
                title={category.title}
                icon={category.icon}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recent Searches */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Recent Searches</Text>
            </View>
            {recentSearches.map((search, index) => (
              <List.Item
                key={index}
                title={search}
                left={props => <List.Icon {...props} icon="clock-outline" />}
                right={props => <List.Icon {...props} icon="close" />}
                onPress={() => setSearchQuery(search)}
                style={styles.listItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Popular Searches */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trending-up" size={20} color={colors.secondary} />
              <Text style={styles.cardTitle}>Popular Searches</Text>
            </View>
            <View style={styles.tagsContainer}>
              {popularSearches.map((search, index) => (
                <ChipButton
                  key={index}
                  title={search}
                  onPress={() => setSearchQuery(search)}
                />
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    marginLeft: 8,
    color: colors.text,
  },
  listItem: {
    paddingLeft: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});