import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text, Paragraph, Button } from 'react-native-paper';

export default function HelpScreen() {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@lex360.com?subject=App Support');
  };

  return (
    <View style={styles.container}>
      <Text>Help & Support</Text>
      <Paragraph style={styles.paragraph}>
        If you're experiencing issues or have questions, feel free to reach out
        to our support team. We’re here to help!
      </Paragraph>

      <Button mode="contained" icon="email" onPress={handleContactSupport}>
        Contact Support
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
    marginVertical: 16,
    lineHeight: 22,
  },
});
