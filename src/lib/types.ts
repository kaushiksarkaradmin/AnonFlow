import { FieldValue } from "firebase/firestore";

export type Post = {
  id: string;
  content: string;
  digitalToken: string;
  createdAt: FieldValue | Date;
};

export type UserToken = {
  digitalToken: string;
  displayName: string;
  createdAt: FieldValue | Date;
};
