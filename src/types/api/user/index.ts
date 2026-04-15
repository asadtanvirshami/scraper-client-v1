export type UpdateProfilePayload = {
  _id?: string;
  first_name?: string;
  last_name?: string;
  is_update_enabled?: boolean;
  is_notifications_enabled?: boolean;
  is_blocked?: boolean;
  is_deleted?: boolean;
  is_verified?: boolean;
};

export type OnboardingPayload = {
  step: 1 | 2;
  heard_about?: "mouth/word" | "instagram" | "linkedin" | "facebook" | "github";
  business_name?: string;
  business_website?: string;
};
