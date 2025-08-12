// import * as Sentry from 'sentry-expo'; // Optional: Install with `npx expo install sentry-expo`

class ErrorHandler {
  static logError(error, context = {}) {
    console.error('Error:', error);
    
    // Log to Sentry if configured
    // if (Sentry.captureException) {
    //   Sentry.captureException(error, {
    //     tags: context,
    //     extra: context
    //   });
    // }
    
    // You can also log to your own analytics service here
  }

  static handleFirebaseError(error) {
    let userMessage = 'Something went wrong. Please try again.';

    if (typeof error === 'string') {
      return error;
    }

    switch (error.code) {
      case 'auth/user-not-found':
        userMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        userMessage = 'Incorrect password.';
        break;
      case 'auth/weak-password':
        userMessage = 'Password should be at least 6 characters.';
        break;
      case 'auth/email-already-in-use':
        userMessage = 'An account with this email already exists.';
        break;
      case 'auth/invalid-email':
        userMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        userMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'firestore/permission-denied':
        userMessage = 'You don\'t have permission to perform this action.';
        break;
      case 'storage/unauthorized':
        userMessage = 'You don\'t have permission to upload files.';
        break;
      case 'storage/canceled':
        userMessage = 'Upload was cancelled.';
        break;
      case 'storage/unknown':
        userMessage = 'Upload failed due to unknown error.';
        break;
      default:
        this.logError(error, { context: 'unknown_firebase_error' });
        userMessage = error.message || userMessage;
    }

    return userMessage;
  }

  static handleNetworkError() {
    return 'Please check your internet connection and try again.';
  }
}

export default ErrorHandler;