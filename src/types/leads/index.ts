import { Dayjs } from "dayjs";

/* =========================
   Leads Widget
========================= */

export type LeadsWidgetProps = {
  leads?: Lead[];
  total?: number;
  isLoading?: boolean;
  onCreate?: () => void;
  onViewAll?: () => void;
};

/* =========================
   Weekly Leads Area Chart
========================= */

export type PresetKey = "7d" | "14d" | "30d" | "90d";

export type RangeValue = [Dayjs | null, Dayjs | null];

export type WeeklyLeadsAreaChartProps = {
  /** X-axis labels (dates) */
  labels: string[];

  /** Total leads per label (used when no breakdown by type) */
  counts?: number[];

  /** Leads grouped by source/type */
  countsByType?: {
    INSTAGRAM?: number[];
    LINKEDIN?: number[];
    MANUAL?: number[];
  };

  /** Loading state */
  isLoading?: boolean;

  /* ---------- Filters / Controls ---------- */

  /** Master switch: show/hide all filter UI (presets + range picker) */
  showFilters?: boolean;

  /** Selected preset (controlled) */
  preset?: PresetKey;

  /** Preset change handler */
  onPresetChange?: (preset: PresetKey) => void;

  /** Selected date range (controlled) */
  range?: RangeValue;

  /** Range change handler */
  onRangeChange?: (range: RangeValue) => void;

  /** If true, shows the RangePicker (only relevant when showFilters = true) */
  showRangePicker?: boolean;
};

/* =========================
   Lead Entity
========================= */

export type Lead = {
  _id: string;
  first_name?: string;
  last_name?: string;

  emails?: string[];
  phone_numbers?: string | string[];
  sms_number?: string;
  whatsapp_number?: string;
  landline_number?: string;

  company?: string;
  job_title?: string;
  message?: string;
  folder_id?: string;
  scrape_status?: boolean;
  is_converted?: boolean;
  createdAt?: string | Date;

  source_url?: string;
  source_rul?: string;
  instagram_profile_id?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  avatar_rul?: string;
  bio?: string;
  followers?: number | null;
  following?: number | null;
  category?: string;
  total_posts?: number | null;
  external_url?: string;
  external_url_linkshimmed?: string;
  is_verified?: boolean | null;
  is_private?: boolean | null;
  is_public?: boolean | null;
  fb_profile_biolink?: {
    url?: string;
    name?: string;
  };
  highlight_reel_count?: number | null;
  links?: Array<{
    title?: string;
    url?: string;
    lynx_url?: string;
    link_type?: string;
    subtitle?: string;
  }>;
  follower_count?: number | null;
  following_count?: number | null;
  external_urls?: string[];
};
