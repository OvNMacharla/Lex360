import { auth, db } from '../../config/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const normalizeTimestamps = (data) => {
  const obj = { ...data };
  for (const key in obj) {
    if (obj[key]?.toDate) {
      obj[key] = obj[key].toDate().toISOString();
    }
  }
  return obj;
};

class ConsultationService {
  // ✅ Helper: check auth
  async requireAuth() {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user;
  }

  // ✅ Helper: validate fields for consultation creation
  async validateConsultationData(data) {
    const required = ['clientId', 'subject', 'scheduledDate'];
    for (let field of required) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }

    if (!data.lawyerId && !data.firmId) {
      throw new Error('Consultation must be assigned to either a lawyer or a firm');
    }
  }

  

  // Create a new consultation request
async createConsultation(consultationData) {
    try {
      this.requireAuth();
      this.validateConsultationData(consultationData);

      const consultationsRef = collection(db, 'consultations');
      const docRef = await addDoc(consultationsRef, {
        ...consultationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, consultationId: docRef.id };
    } catch (error) {
      console.error('Error creating consultation:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch all consultations for a specific user
  async getUserConsultations(userId, role) {
    try {
      let q;
      if (role === "lawyer") {
        q = query(collection(db, "consultations"), where("lawyerId", "==", userId));
      } else if (role === "client") {
        q = query(collection(db, "consultations"), where("clientId", "==", userId));
      } else if (role === "firm") {
        q = query(collection(db, "consultations"), where("firmId", "==", userId));
      }

      const snapshot = await getDocs(q);
      const consultations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...normalizeTimestamps(doc.data())
      }));

      return { success: true, data: consultations };
    } catch (err) {
      console.error("Error fetching consultations:", err);
      return { success: false, error: err.message };
    }
}

  // Fetch single consultation details
   async getConsultationDetails(consultationId) {
    try {
      this.requireAuth();

      if (!consultationId) throw new Error('Consultation ID is required');

      const docRef = doc(db, 'consultations', consultationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Consultation not found' };
      }

      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      return { success: false, error: error.message };
    }
  }

  // Update consultation status
   async updateConsultationStatus(consultationId, status, note = '') {
    try {
      this.requireAuth();

      if (!consultationId) throw new Error('Consultation ID is required');
      if (!status) throw new Error('Status is required');

      const docRef = doc(db, 'consultations', consultationId);
      await updateDoc(docRef, {
        status,
        note,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return { success: false, error: error.message };
    }
  }

  // Update consultation details
   async updateConsultation(consultationId, patchData) {
    try {
      this.requireAuth();

      if (!consultationId) throw new Error('Consultation ID is required');
      if (!patchData || typeof patchData !== 'object') {
        throw new Error('Patch data is required');
      }

      const docRef = doc(db, 'consultations', consultationId);
      await updateDoc(docRef, {
        ...patchData,
        updatedAt: serverTimestamp(),
      });

      return { success: true, data: patchData };
    } catch (error) {
      console.error('Error updating consultation:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete consultation
   async deleteConsultation(consultationId) {
    try {
      this.requireAuth();

      if (!consultationId) throw new Error('Consultation ID is required');

      const docRef = doc(db, 'consultations', consultationId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting consultation:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ConsultationService();