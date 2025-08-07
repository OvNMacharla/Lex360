import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Paragraph } from 'react-native-paper';

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (feedback.trim() === '') {
      Alert.alert('Please enter your feedback.');
      return;
    }

    // You can replace this with actual API call
    console.log('Feedback submitted:', { email, feedback });

    Alert.alert('Thank you!', 'Your feedback has been submitted.');
    setEmail('');
    setFeedback('');
  };

  return (
    <View style={styles.container}>
      <Text>Send Feedback</Text>
      <Paragraph style={styles.paragraph}>
        We’d love to hear your thoughts! Help us improve by sharing your feedback.
      </Paragraph>

      <TextInput
        label="Your Email (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Your Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={5}
        style={styles.textArea}
      />

      <Button mode="contained" onPress={handleSubmit}>
        Submit Feedback
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  paragraph: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  textArea: {
    marginBottom: 16,
  },
});
