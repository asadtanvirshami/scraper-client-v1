export type CreateBugPayload = {
  user_id: string;
  bug: string;
};

export type UpdateBugPayload = {
  bug?: string;
  status?: "open" | "in_progress" | "resolved";
};

export type CreateFeedbackPayload = {
  user_id: string;
  feedback: string;
};

export type BugType = {
  _id: string;
  bug?: string;
  status?: "open" | "in_progress" | "resolved";
  user_id?: any;
  is_deleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type FeedbackType = {
  _id: string;
  feedback?: string;
  user_id?: any;
  is_deleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
