import { firestore } from '../../config/firebase';

class CaseService {
  constructor() {
    this.firestore = firestore();
  }

  // Create New Case
  async createCase(caseData) {
    try {
      const newCase = {
        ...caseData,
        status: 'active',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        timeline: [],
        documents: []
      };

      const caseRef = await this.firestore.collection('cases').add(newCase);
      return { success: true, caseId: caseRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Cases
  async getUserCases(userId, userRole) {
    try {
      let query;
      
      if (userRole === 'lawyer') {
        query = this.firestore.collection('cases').where('lawyerId', '==', userId);
      } else {
        query = this.firestore.collection('cases').where('clientId', '==', userId);
      }

      const snapshot = await query.orderBy('updatedAt', 'desc').get();
      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: cases };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update Case Status
  async updateCaseStatus(caseId, status, note = '') {
    try {
      const timelineEntry = {
        status,
        note,
        timestamp: firestore.FieldValue.serverTimestamp()
      };

      await this.firestore.collection('cases').doc(caseId).update({
        status,
        timeline: firestore.FieldValue.arrayUnion(timelineEntry),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add Case Document
  async addCaseDocument(caseId, documentData) {
    try {
      await this.firestore.collection('cases').doc(caseId).update({
        documents: firestore.FieldValue.arrayUnion({
          ...documentData,
          uploadedAt: firestore.FieldValue.serverTimestamp()
        })
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Case Details
  async getCaseDetails(caseId) {
    try {
      const caseDoc = await this.firestore.collection('cases').doc(caseId).get();
      
      if (!caseDoc.exists) {
        return { success: false, error: 'Case not found' };
      }

      return { success: true, data: { id: caseDoc.id, ...caseDoc.data() } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new CaseService();