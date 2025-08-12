import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirestoreCollection = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    try {
      let q = collection(db, collectionName);
      
      // Apply query constraints
      if (queryConstraints.length > 0) {
        q = query(q, ...queryConstraints);
      }

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firestore query error:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

// Usage examples:
export const useUserPosts = (userId) => {
  return useFirestoreCollection('posts', [
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  ]);
};

export const useUserNotifications = (userId) => {
  return useFirestoreCollection('notifications', [
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  ]);
};

export const useUserCases = (userId, role) => {
  const field = role === 'lawyer' ? 'lawyerId' : 'clientId';
  return useFirestoreCollection('cases', [
    where(field, '==', userId),
    orderBy('updatedAt', 'desc')
  ]);
};