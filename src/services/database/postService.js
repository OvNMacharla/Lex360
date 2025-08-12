import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

class PostService {
  // Create post
  async createPost(postData) {
    try {
      const post = {
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: [],
        comments: [],
        shares: 0,
        views: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), post);
      return { success: true, postId: docRef.id };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get feed posts
  async getFeedPosts(lastDocId = null, limitCount = 10) {
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDocId) {
        const lastDoc = await getDoc(doc(db, 'posts', lastDocId));
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const posts = [];
      
      for (const docSnap of querySnapshot.docs) {
        const postData = docSnap.data();
        
        // Get author details
        try {
          const authorDoc = await getDoc(doc(db, 'users', postData.authorId));
          const author = authorDoc.exists() ? authorDoc.data() : null;

          posts.push({
            id: docSnap.id,
            ...postData,
            author: {
              id: postData.authorId,
              name: author?.displayName || 'Anonymous',
              photo: author?.photoURL || null,
              role: author?.role || 'user'
            }
          });
        } catch (authorError) {
          // If author fetch fails, still include the post
          posts.push({
            id: docSnap.id,
            ...postData,
            author: {
              id: postData.authorId,
              name: 'Anonymous',
              photo: null,
              role: 'user'
            }
          });
        }
      }

      return { 
        success: true, 
        data: posts,
        lastDocId: querySnapshot.docs[querySnapshot.docs.length - 1]?.id
      };
    } catch (error) {
      console.error('Get feed posts error:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle like
  async togglePostLike(postId, userId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        return { success: false, error: 'Post not found' };
      }

      const postData = postDoc.data();
      const likes = postData.likes || [];
      const isLiked = likes.includes(userId);

      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      }

      return { success: true, isLiked: !isLiked };
    } catch (error) {
      console.error('Toggle like error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add comment
  async addComment(postId, userId, comment) {
    try {
      const commentData = {
        userId,
        comment,
        timestamp: new Date().toISOString()
      };

      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion(commentData)
      });

      return { success: true };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload media
  async uploadPostMedia(mediaUri, mediaType) {
    try {
      const response = await fetch(mediaUri);
      const blob = await response.blob();
      
      const filename = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const mediaRef = ref(storage, filename);
      
      await uploadBytes(mediaRef, blob);
      const downloadURL = await getDownloadURL(mediaRef);
      
      return { success: true, url: downloadURL, type: mediaType };
    } catch (error) {
      console.error('Upload media error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PostService();