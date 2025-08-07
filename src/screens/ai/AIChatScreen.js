import React, { useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Card, 
  TextInput, 
  Button, 
  Title, 
  Avatar,
  Surface,
  Text,
  Paragraph,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';

export default function AIChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your AI legal assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I understand your question about ' + message + '. This is a complex legal matter that may require professional consultation. Here are some initial thoughts...',
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 2000);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isBot ? styles.botMessage : styles.userMessage]}>
      <Card style={[styles.messageCard, item.isBot ? styles.botCard : styles.userCard]}>
        <Card.Content style={styles.messageContent}>
          {item.isBot && (
            <View style={styles.botHeader}>
              <Avatar.Icon 
                size={32} 
                icon="robot" 
                style={styles.botAvatar}
              />
              <Text style={styles.botName}>AI Legal Assistant</Text>
            </View>
          )}
          <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const quickQuestions = [
    'What are my rights as a tenant?',
    'How to register a company?',
    'Property dispute resolution',
    'Employment law basics'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {messages.length === 1 && (
        <Surface style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <MaterialCommunityIcons name="robot" size={48} color={colors.primary} />
            <Text style={styles.welcomeTitle}>AI Legal Assistant</Text>
            <Paragraph style={styles.welcomeText}>
              Ask me any legal question and I'll provide guidance based on Indian law.
            </Paragraph>
            
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                mode="outlined"
                compact
                style={styles.quickQuestion}
                onPress={() => setMessage(question)}
              >
                {question}
              </Button>
            ))}
          </View>
        </Surface>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>AI is typing...</Text>
        </View>
      )}

      <Surface style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask your legal question..."
          multiline
          maxLength={500}
          style={styles.textInput}
          right={
            <TextInput.Icon 
              icon="send" 
              onPress={sendMessage}
              disabled={!message.trim() || loading}
            />
          }
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.primary,
  },
  welcomeText: {
    textAlign: 'center',
    marginVertical: 16,
    color: colors.textSecondary,
  },
  quickQuestionsTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: colors.text,
  },
  quickQuestion: {
    marginVertical: 4,
    alignSelf: 'stretch',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageCard: {
    maxWidth: '85%',
    elevation: 2,
  },
  botCard: {
    backgroundColor: colors.surface,
  },
  userCard: {
    backgroundColor: colors.primary,
  },
  messageContent: {
    padding: 12,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  botAvatar: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  botName: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: colors.text,
  },
  userText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  inputContainer: {
    padding: 16,
    elevation: 8,
  },
  textInput: {
    backgroundColor: colors.background,
  },
});