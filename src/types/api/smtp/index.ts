import { GenericResponse } from "@/types/api";

export type SmtpAccount = {
  _id: string;
  user_id: string;
  label?: string | null;
  sender_name?: string | null;
  email_address: string;
  username: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  imap: {
    enabled: boolean;
    host?: string | null;
    port?: number | null;
    secure: boolean;
  };
  settings: {
    enable_inbox: boolean;
    warmup_enabled: boolean;
    messages_per_day: number;
    signature?: string | null;
    unsubscribe_url?: string | null;
    is_default: boolean;
    active: boolean;
  };
  status: string;
  is_verified: boolean;
  is_tested: boolean;
  messages_sent_today: number;
  day_window_start: string;
  last_sent_at?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type CreateSmtpAccountPayload = {
  label?: string;
  sender_name?: string;
  email_address: string;
  username: string;
  password: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  imap?: {
    enabled?: boolean;
    host?: string | null;
    port?: number | null;
    secure?: boolean;
  };
  settings?: {
    enable_inbox?: boolean;
    warmup_enabled?: boolean;
    messages_per_day?: number;
    signature?: string | null;
    unsubscribe_url?: string | null;
    is_default?: boolean;
    active?: boolean;
  };
};

export type UpdateSmtpAccountPayload = Partial<CreateSmtpAccountPayload> & {
  password?: string;
};

export type FetchSmtpAccountsResponse = GenericResponse<SmtpAccount[]>;
export type FetchSmtpAccountResponse = GenericResponse<SmtpAccount>;
export type CreateSmtpAccountResponse = GenericResponse<SmtpAccount>;
export type UpdateSmtpAccountResponse = GenericResponse<SmtpAccount>;
export type DeleteSmtpAccountResponse = GenericResponse<SmtpAccount>;
export type TestSmtpAccountResponse = GenericResponse<{ to: string; subject: string } | null>;
