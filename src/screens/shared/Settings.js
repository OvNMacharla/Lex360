import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import {
  Title,
  List,
  Switch,
  Divider,
  useTheme,
  Button,
  TextInput,
  Portal,
  Modal,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { colors } from '../../styles/colors';
export default function SettingsScreen() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Feedback modal
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');

  // Language picker modal
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [language, setLanguage] = React.useState('English');

  const handleSendFeedback = () => {
    // You can POST to server here
    console.log('Feedback submitted:', feedback);
    setFeedback('');
    setFeedbackVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={[styles.title, { color: colors.primary }]}>App Settings</Title>

      {/* Theme Toggle */}
      <List.Item
        title="Enable Dark Mode"
        description="Switch between light and dark themes"
        left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
        right={() => (
          <Switch value={isDarkMode} onValueChange={() => dispatch(toggleTheme())} />
        )}
      />
      <Divider />

      {/* Language Picker */}
      <List.Item
        title="Language"
        description={`Current: ${language}`}
        left={(props) => <List.Icon {...props} icon="translate" />}
        onPress={() => setLanguageModalVisible(true)}
      />
      <Divider />

      {/* Feedback */}
      <List.Item
        title="Send Feedback"
        description="Tell us what you think"
        left={(props) => <List.Icon {...props} icon="message-text" />}
        onPress={() => setFeedbackVisible(true)}
      />
      <Divider />

      {/* Privacy Policy */}
      <List.Item
        title="Privacy Policy"
        description="Review our privacy practices"
        left={(props) => <List.Icon {...props} icon="lock" />}
        onPress={() =>
          Linking.openURL('https://yourdomain.com/privacy-policy') // Replace with real link
        }
      />
      <Divider />

      {/* Feedback Modal */}
      <Portal>
        <Modal
          visible={feedbackVisible}
          onDismiss={() => setFeedbackVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Submit Feedback</Title>
          <TextInput
            label="Your feedback"
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
            mode="outlined"
            style={{ marginBottom: 16 }}
          />
          <Button mode="contained" onPress={handleSendFeedback}>
            Submit
          </Button>
        </Modal>
      </Portal>

      {/* Language Picker Modal */}
      <Portal>
        <Modal
          visible={languageModalVisible}
          onDismiss={() => setLanguageModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Select Language</Title>
          {['English', 'Spanish', 'French', 'German'].map((lang) => (
            <List.Item
              key={lang}
              title={lang}
              onPress={() => {
                setLanguage(lang);
                setLanguageModalVisible(false);
              }}
              left={() => <List.Icon icon={language === lang ? 'check' : ''} />}
            />
          ))}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
});
