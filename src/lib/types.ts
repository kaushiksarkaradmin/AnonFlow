import { FieldValue } from "firebase/firestore";

export type Post = {
  id: string;
  content: string;
  digitalToken: string;
  createdAt: FieldValue | Date;
  parentId?: string;
  replies?: Post[];
};

export type UserToken = {
  digitalToken: string;
  displayName: string;
  createdAt: FieldValue | Date;
};
