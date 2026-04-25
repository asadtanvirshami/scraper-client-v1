import type { GenericResponse } from "@/types/api";

export type TemplateCategory =
  | "CAMPAIGN"
  | "WELCOME"
  | "PROMOTIONAL"
  | "TRANSACTIONAL"
  | "OTHER";

export interface TemplateVariable {
  key: string;
  description?: string;
}

export interface EmailTemplate {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  preheader?: string;
  variables: TemplateVariable[];
  is_html: boolean;
  category: TemplateCategory;
  user_id: string;
  is_active: boolean;
  is_deleted: boolean;
  usage_count: number;
  last_used_at?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type FetchTemplatesResponse = GenericResponse<EmailTemplate[]>;
export type FetchTemplateResponse = GenericResponse<EmailTemplate>;
export type CreateTemplateResponse = GenericResponse<EmailTemplate>;
export type UpdateTemplateResponse = GenericResponse<EmailTemplate>;
export type DeleteTemplateResponse = GenericResponse<{ deleted: boolean }>;

export interface CreateTemplatePayload {
  user_id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  preheader?: string;
  variables?: TemplateVariable[];
  category?: TemplateCategory;
  is_html?: boolean;
  tags?: string[];
}

export interface UpdateTemplatePayload {
  template_id: string;
  user_id: string;
  name?: string;
  subject?: string;
  content?: string;
  description?: string;
  preheader?: string;
  variables?: TemplateVariable[];
  category?: TemplateCategory;
  is_html?: boolean;
  tags?: string[];
  is_active?: boolean;
}
