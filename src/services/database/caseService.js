import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

/**
 * Convert Firestore timestamp to ISO string safely
 */
function timestampToISO(timestamp) {
  if (!timestamp) return null;

  try {
    // Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return date.toISOString();
    }

    // Already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    // Already an ISO string - validate it
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp string:', timestamp);
        return null;
      }
      // Ensure it's properly formatted ISO string
      return date.toISOString();
    }

    // Unix timestamp (milliseconds)
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp number:', timestamp);
        return null;
      }
      return date.toISOString();
    }

    // Firestore Timestamp-like object with seconds and nanoseconds
    if (timestamp && typeof timestamp.seconds === 'number') {
      const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      if (isNaN(date.getTime())) {
        console.warn('Invalid Firestore timestamp:', timestamp);
        return null;
      }
      return date.toISOString();
    }

    console.warn('Unknown timestamp format:', typeof timestamp, timestamp);
    return null;
  } catch (error) {
    console.error('Error converting timestamp:', error, timestamp);
    return null;
  }
}

/**
 * Safely convert case document data
 */
function convertCaseData(docSnap) {
  if (!docSnap || !docSnap.exists()) {
    return null;
  }

  try {
    const data = docSnap.data();
    if (!data) return null;

    return {
      id: docSnap.id,
      // Spread all data fields first
      ...data,
      // Override timestamp fields with converted versions
      createdAt: timestampToISO(data.createdAt),
      updatedAt: timestampToISO(data.updatedAt),
      // Handle timeline array safely
      timeline: Array.isArray(data.timeline) 
        ? data.timeline.map(timelineItem => {
            if (!timelineItem || typeof timelineItem !== 'object') return timelineItem;
            return {
              ...timelineItem,
              timestamp: timestampToISO(timelineItem.timestamp)
            };
          })
        : [],
      // Handle subtasks array safely
      subtasks: Array.isArray(data.subtasks)
        ? data.subtasks.map(subtask => {
            if (!subtask || typeof subtask !== 'object') return subtask;
            return {
              ...subtask,
              createdAt: timestampToISO(subtask.createdAt),
              updatedAt: timestampToISO(subtask.updatedAt),
              dueDate: timestampToISO(subtask.dueDate)
            };
          })
        : [],
      // Handle documents array safely
      documents: Array.isArray(data.documents) ? data.documents : []
    };
  } catch (error) {
    console.error('Error converting case data:', error);
    return null;
  }
}

/**
 * Serialize timestamps for Redux compatibility (convert to ISO strings)
 */
function serializeTimestamps(data) {
  if (!data || typeof data !== 'object') return data;

  const result = { ...data };
  
  for (const key in result) {
    if (result[key] && typeof result[key] === 'object') {
      // Handle Firestore Timestamp objects - convert to ISO string
      if (typeof result[key].toDate === 'function') {
        result[key] = timestampToISO(result[key]);
      }
      // Handle Date objects - convert to ISO string
      else if (result[key] instanceof Date) {
        result[key] = result[key].toISOString();
      }
      // Handle Firestore arrayUnion objects (skip serialization)
      else if (result[key]._methodName === 'arrayUnion') {
        // Keep as-is for Firestore operations
        continue;
      }
      // Handle nested objects/arrays recursively
      else if (Array.isArray(result[key])) {
        result[key] = result[key].map(item => serializeTimestamps(item));
      }
      else {
        result[key] = serializeTimestamps(result[key]);
      }
    }
  }
  
  return result;
}

class CaseService {
  /**
   * Create a new case - lawyer only
   */
  async createCase(caseData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!caseData || typeof caseData !== 'object') {
        throw new Error('Invalid case data');
      }

      const newCase = {
        ...caseData,
        lawyerId: currentUser.uid,
        status: caseData.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        timeline: [],
        documents: [],
        subtasks: []
      };

      const caseRef = await addDoc(collection(db, 'cases'), newCase);
      
      return { 
        success: true, 
        caseId: caseRef.id,
        data: { ...newCase, id: caseRef.id }
      };
    } catch (error) {
      console.error('Error creating case:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create case'
      };
    }
  }

  /**
   * Update case with patch data
   */
async updateCase(caseId, patch) {
  try {
    // Validate inputs
    if (!caseId) throw new Error('Case ID is required');
    console.log('Patch data:', patch);
    if (!patch || typeof patch !== 'object') throw new Error('Invalid patch data');

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const caseRef = doc(db, 'cases', caseId);
    const caseSnap = await getDoc(caseRef);

    if (!caseSnap.exists()) {
      throw new Error('Case not found');
    }

    const caseData = caseSnap.data();
    if (!caseData) {
      throw new Error('Case data not found');
    }

    // Permission check
    const hasPermission = currentUser.uid === caseData.lawyerId || 
                         currentUser.uid === caseData.clientId;
    
    if (!hasPermission) {
      throw new Error('You do not have permission to update this case');
    }

    const updatePayload = {};

    // Process patch fields more carefully
    for (const key in patch) {
      if (patch[key] === undefined) continue; // Skip undefined values
      
      // Handle specific array fields that should use arrayUnion
      if (['timeline', 'documents'].includes(key) && Array.isArray(patch[key])) {
        updatePayload[key] = arrayUnion(...patch[key]);
      }
      // Handle subtasks as regular array replacement (not arrayUnion)
      else if (key === 'subtasks' && Array.isArray(patch[key])) {
        updatePayload[key] = patch[key];
      }
      // Handle regular fields
      else {
        updatePayload[key] = patch[key];
      }
    }

    // Always update the updatedAt timestamp
    updatePayload.updatedAt = serverTimestamp();

    console.log('Firestore update payload:', updatePayload);

    await updateDoc(caseRef, updatePayload);

    // Get updated case data
    const updatedSnap = await getDoc(caseRef);
    
    if (!updatedSnap.exists()) {
      throw new Error('Updated case not found');
    }

    // Convert the updated data using our safe converter
    const convertedData = convertCaseData(updatedSnap);
    
    if (!convertedData) {
      throw new Error('Failed to convert updated case data');
    }

    console.log('Successfully updated case:', caseId);

    return { 
      success: true, 
      data: convertedData
    };
  } catch (error) {
    console.error('Error updating case:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update case'
    };
  }
}

  /**
   * Get cases for a user based on their role
   */
  async getUserCases(userId, userRole) {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (!userRole || !['lawyer', 'client'].includes(userRole)) {
        throw new Error('Valid user role is required (lawyer or client)');
      }

      let q;
      const casesCollection = collection(db, 'cases');

      if (userRole === 'lawyer') {
        q = query(
          casesCollection,
          where('lawyerId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
          casesCollection,
          where('clientId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { 
          success: true, 
          data: [] 
        };
      }

      const cases = [];
      snapshot.docs.forEach(doc => {
        const caseData = convertCaseData(doc);
        if (caseData) {
          cases.push(caseData);
        }
      });

      return { 
        success: true, 
        data: cases 
      };
    } catch (error) {
      console.error('Error getting user cases:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get cases',
        data: [] // Always return empty array on error
      };
    }
  }

  /**
   * Get specific case details
   */
  async getCaseDetails(caseId) {
    try {
      if (!caseId) {
        throw new Error('Case ID is required');
      }

      const caseDoc = await getDoc(doc(db, 'cases', caseId));
      
      if (!caseDoc.exists()) {
        return { 
          success: false, 
          error: 'Case not found' 
        };
      }

      const caseData = convertCaseData(caseDoc);
      
      if (!caseData) {
        throw new Error('Failed to process case data');
      }

      return { 
        success: true, 
        data: caseData 
      };
    } catch (error) {
      console.error('Error getting case details:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get case details'
      };
    }
  }

  /**
   * Update case status with timeline entry
   */
  async updateCaseStatus(caseId, status, note = '') {
    try {
      if (!caseId) throw new Error('Case ID is required');
      if (!status) throw new Error('Status is required');

      const timelineEntry = {
        status,
        note: note || '',
        timestamp: serverTimestamp()
      };

      await updateDoc(doc(db, 'cases', caseId), {
        status,
        timeline: arrayUnion(timelineEntry),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating case status:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update case status'
      };
    }
  }

  /**
   * Add document to case
   */
  async addCaseDocument(caseId, documentData) {
    try {
      if (!caseId) throw new Error('Case ID is required');
      if (!documentData) throw new Error('Document data is required');

      await updateDoc(doc(db, 'cases', caseId), {
        documents: arrayUnion({
          ...documentData,
          uploadedAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding case document:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to add document'
      };
    }
  }

  /**
   * Create subtask for a case
   */
  async createSubtask(caseId, subtask) {
    try {
      if (!caseId) throw new Error('Case ID is required');
      if (!subtask || !subtask.title) throw new Error('Subtask title is required');

      const subtaskData = {
        title: subtask.title,
        status: subtask.status || 'pending',
        priority: subtask.priority || 'normal',
        dueDate: subtask.dueDate ? Timestamp.fromDate(new Date(subtask.dueDate)) : null,
        assignedTo: subtask.assignedTo || null,
        notes: subtask.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const subtaskRef = await addDoc(
        collection(db, 'cases', caseId, 'subtasks'),
        subtaskData
      );

      // Update parent case
      await updateDoc(doc(db, 'cases', caseId), { 
        updatedAt: serverTimestamp() 
      });

      return { 
        success: true, 
        subtaskId: subtaskRef.id 
      };
    } catch (error) {
      console.error('Error creating subtask:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create subtask'
      };
    }
  }

  /**
   * Get subtasks for a case
   */
  async getSubtasks(caseId) {
    try {
      if (!caseId) throw new Error('Case ID is required');

      const q = query(
        collection(db, 'cases', caseId, 'subtasks'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const subtasks = [];
      snapshot.docs.forEach(doc => {
        const subtaskData = doc.data();
        if (subtaskData) {
          subtasks.push({
            id: doc.id,
            ...subtaskData,
            createdAt: timestampToISO(subtaskData.createdAt),
            updatedAt: timestampToISO(subtaskData.updatedAt),
            dueDate: timestampToISO(subtaskData.dueDate)
          });
        }
      });

      return { 
        success: true, 
        data: subtasks 
      };
    } catch (error) {
      console.error('Error getting subtasks:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get subtasks',
        data: []
      };
    }
  }

  /**
   * Update subtask
   */
  async updateSubtask(caseId, subtaskId, patch) {
    try {
      if (!caseId) throw new Error('Case ID is required');
      if (!subtaskId) throw new Error('Subtask ID is required');
      if (!patch) throw new Error('Patch data is required');

      const updateData = {
        ...patch,
        updatedAt: serverTimestamp()
      };

      await updateDoc(
        doc(db, 'cases', caseId, 'subtasks', subtaskId),
        updateData
      );

      // Add timeline entry if subtask completed
      if (patch.status === 'completed') {
        const timelineEntry = {
          status: 'subtask_completed',
          note: `Subtask completed: ${patch.title || ''}`.trim(),
          timestamp: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'cases', caseId), {
          timeline: arrayUnion(timelineEntry),
          updatedAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subtask:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update subtask'
      };
    }
  }

  /**
   * Delete subtask
   */
  async deleteSubtask(caseId, subtaskId) {
    try {
      if (!caseId) throw new Error('Case ID is required');
      if (!subtaskId) throw new Error('Subtask ID is required');

      await deleteDoc(doc(db, 'cases', caseId, 'subtasks', subtaskId));
      await updateDoc(doc(db, 'cases', caseId), { 
        updatedAt: serverTimestamp() 
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete subtask'
      };
    }
  }

  /**
   * Delete case
   */
  async deleteCase(caseId) {
    try {
      if (!caseId) throw new Error('Case ID is required');

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const caseRef = doc(db, 'cases', caseId);
      const caseSnap = await getDoc(caseRef);

      if (!caseSnap.exists()) {
        throw new Error('Case not found');
      }

      const caseData = caseSnap.data();
      if (!caseData) {
        throw new Error('Case data not found');
      }

      // Check permissions
      const hasPermission = currentUser.uid === caseData.lawyerId || 
                           currentUser.uid === caseData.clientId;
      
      if (!hasPermission) {
        throw new Error('You do not have permission to delete this case');
      }

      // Delete all subtasks first
      try {
        const subtasksQuery = query(collection(db, 'cases', caseId, 'subtasks'));
        const subtasksSnapshot = await getDocs(subtasksQuery);
        
        const deletePromises = subtasksSnapshot.docs.map(subtaskDoc => 
          deleteDoc(subtaskDoc.ref)
        );
        
        await Promise.all(deletePromises);
      } catch (subtaskError) {
        console.warn('Error deleting subtasks:', subtaskError);
      }

      // Delete the case
      await deleteDoc(caseRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting case:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete case'
      };
    }
  }
}

export default new CaseService();