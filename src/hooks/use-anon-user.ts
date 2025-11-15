'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const USER_TOKEN_KEY = 'anonflow-user-token';

export function useAnonUser() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let userToken = localStorage.getItem(USER_TOKEN_KEY);
    if (!userToken) {
      userToken = uuidv4();
      localStorage.setItem(USER_TOKEN_KEY, userToken);
    }
    setToken(userToken);
  }, []);

  return token;
}
