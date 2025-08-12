import analytics from 'firebase/analytics';
import { firestore } from '../config/firebase';

class AnalyticsService {
  constructor() {
    this.analytics = analytics();
    this.firestore = firestore();
  }

  // Track user events
  async trackEvent(eventName, parameters = {}) {
    try {
      await this.analytics.logEvent(eventName, parameters);
      
      // Also save to Firestore for custom analytics
      await this.firestore.collection('analytics_events').add({
        eventName,
        parameters,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Track screen views
  async trackScreenView(screenName, screenClass = null) {
    try {
      await this.analytics.logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Track user properties
  async setUserProperties(properties) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await this.analytics.setUserProperty(key, value);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Track consultation booking
  async trackConsultationBooking(lawyerId, amount, category) {
    return this.trackEvent('consultation_booked', {
      lawyer_id: lawyerId,
      amount,
      category,
      currency: 'INR'
    });
  }

  // Track post engagement
  async trackPostEngagement(postId, action, authorId) {
    return this.trackEvent('post_engagement', {
      post_id: postId,
      action, // like, comment, share
      author_id: authorId
    });
  }
}

export default new AnalyticsService();