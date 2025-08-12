import { firestore } from '../../config/firebase';
import firebase from 'firebase/app';

class ChatService {
  constructor() {
    this.firestore = firestore;
  }

  // Create or Get Conversation
  async getOrCreateConversation(participants) {
    try {
      const sortedParticipants = participants.sort();
      const conversationId = sortedParticipants.join('_');
      
      const conversationRef = this.firestore.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        await conversationRef.set({
          id: conversationId,
          participants: sortedParticipants,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessage: null
        });
      }
      
      return { success: true, conversationId };
    } catch (error) {
      console.error('Get or create conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send Message
  async sendMessage(conversationId, senderId, message, messageType = 'text') {
    try {
      const messageData = {
        senderId,
        message,
        messageType,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
      };

      // Add message to messages subcollection
      const messageRef = await this.firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add(messageData);

      // Update conversation with last message
      await this.firestore.collection('conversations').doc(conversationId).update({
        lastMessage: {
          text: message,
          senderId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Messages (with real-time listener)
  getMessagesListener(conversationId, callback) {
    return this.firestore
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback({ success: true, messages });
        },
        (error) => {
          console.error('Messages listener error:', error);
          callback({ success: false, error: error.message });
        }
      );
  }

  // Get User Conversations
  async getUserConversations(userId) {
    try {
      const snapshot = await this.firestore
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .get();

      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: conversations };
    } catch (error) {
      console.error('Get user conversations error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark Messages as Read
  async markMessagesAsRead(conversationId, userId) {
    try {
      const batch = this.firestore.batch();
      
      const messagesSnapshot = await this.firestore
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .where('senderId', '!=', userId)
        .where('read', '==', false)
        .get();

      messagesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Mark messages as read error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ChatService();