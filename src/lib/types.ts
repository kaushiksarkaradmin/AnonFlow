import { FieldValue } from "firebase/firestore";

export type Post = {
  id: string;
  content: string;
  digitalToken: string;
  createdAt: FieldValue | Date;
};
