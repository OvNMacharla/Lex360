import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../../store/chatSlice';

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  const handleSend = () => {
    if (input.trim()) {
      dispatch(sendMessage(input));
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(_, index) => index.toString()}
      />
      <TextInput
        value={input}
        onChangeText={setInput}
        style={styles.input}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  message: { padding: 8, backgroundColor: '#eee', marginVertical: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10 },
});

export default ChatScreen;
