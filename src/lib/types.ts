import { FieldValue } from "firebase/firestore";

export type Post = {
  id: string;
  content: string;
  userId: string;
  createdAt: FieldValue | Date;
  parentId?: string;
  replies?: Post[];
  seenBy?: string[]; // Array of user IDs
};

export type UserProfile = {
  id:string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: FieldValue | Date;
};

export type AllowedUser = {
  id: string; // email
  email: string;
}
