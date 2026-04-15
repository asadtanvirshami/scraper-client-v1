export interface User {
  email: string;
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string;
  plan: string;
  is_verified: boolean;
  is_update_enabled: boolean;
  is_feedback_completed: boolean;
  is_notifications_enabled: boolean;
  is_onboarding_completed: boolean;
  heard_about?: string;
  business_name?: string;
  business_website?: string;
  blocked?: boolean;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  isAuthenticated: boolean;
}
