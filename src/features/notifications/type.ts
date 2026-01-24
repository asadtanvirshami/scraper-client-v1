export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  is_read: boolean;
  ts?: number;
  created_at: string;
}

interface QueryPages {
  pages: [Notification[]];
}

export interface PaginatedResponse {
  pages: QueryPages | any;
  totalCount:number | null
  data:Notification[]
}

export type Filters = { type?: string };
