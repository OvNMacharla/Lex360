import React, { memo, useMemo } from 'react';

// Memoized Post Card to prevent unnecessary re-renders
export const MemoizedPostCard = memo(({ post, onLike, currentUserId }) => {
  const isLiked = useMemo(() => {
    return post.likes && post.likes.includes(currentUserId);
  }, [post.likes, currentUserId]);

  const likeCount = useMemo(() => {
    return post.likes ? post.likes.length : 0;
  }, [post.likes]);

  return (
    <PostCardUI 
      post={post}
      isLiked={isLiked}
      likeCount={likeCount}
      onLike={onLike}
    />
  );
});

// Memoized Message Bubble
export const MemoizedMessageBubble = memo(({ message, isOwn }) => {
  const timestamp = useMemo(() => {
    return message.timestamp ? formatTimestamp(message.timestamp) : '';
  }, [message.timestamp]);

  return (
    <MessageBubbleUI 
      message={message}
      isOwn={isOwn}
      timestamp={timestamp}
    />
  );
});