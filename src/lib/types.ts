import { FieldValue } from "firebase/firestore";

export type ReactionType = 'red' | 'yellow' | 'green';

export type Reactions = {
  [key in ReactionType]?: string[];
};

export type Post = {
  id: string;
  content: string;
  digitalToken: string;
  createdAt: FieldValue | Date;
  parentId?: string;
  replies?: Post[];
  reactions?: Reactions;
};

export type UserToken = {
  digitalToken: string;
  displayName: string;
  createdAt: FieldValue | Date;
};
