'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SHA256 from 'crypto-js/sha256';

const USER_TOKEN_KEY = 'anonflow-user-token';

export function useAnonUser() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let userToken = localStorage.getItem(USER_TOKEN_KEY);
    if (!userToken) {
      const newId = uuidv4();
      // We hash the UUID to create a non-reversible token.
      // This is more secure than storing the raw UUID.
      userToken = SHA256(newId).toString();
      localStorage.setItem(USER_TOKEN_KEY, userToken);
    }
    setToken(userToken);
  }, []);

  return token;
}
