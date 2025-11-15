'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/types';

const POSTS_KEY = 'anonflow-posts';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client, avoiding hydration mismatches.
    try {
      const storedPosts = localStorage.getItem(POSTS_KEY);
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (error) {
      console.error("Failed to parse posts from localStorage", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPost = useCallback((newPost: Post) => {
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
      } catch (error) {
        console.error("Failed to save posts to localStorage", error);
      }
      return updatedPosts;
    });
  }, []);

  return { posts, isLoading, addPost };
}
