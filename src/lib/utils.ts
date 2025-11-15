import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatarColor(str: string) {
  let hash = 0;
  if (str.length === 0) return 'hsl(0, 0%, 80%)';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const h = hash % 360;
  return `hsl(${h}, 60%, 85%)`;
}
