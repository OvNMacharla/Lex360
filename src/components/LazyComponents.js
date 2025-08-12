import React, { lazy, Suspense } from 'react';
import { View, Text } from 'react-native';

// Lazy load heavy components
const LazyPostCard = lazy(() => import('./PostCard'));
const LazyChatScreen = lazy(() => import('../screens/shared/ChatScreen'));
const LazyDocumentViewer = lazy(() => import('./DocumentViewer'));

// Loading fallback
const LoadingFallback = () => (
  <View style={{ padding: 20, alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);

// Wrapper components
export const PostCard = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPostCard {...props} />
  </Suspense>
);

export const ChatScreen = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyChatScreen {...props} />
  </Suspense>
);

export const DocumentViewer = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDocumentViewer {...props} />
  </Suspense>
);