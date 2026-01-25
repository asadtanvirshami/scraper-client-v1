export type LeadType = "INSTAGRAM" | "LINKEDIN" | "MANUAL";

export type Lead = {
  _id: string;

  first_name?: string;
  last_name?: string;

  emails?: string[];
  phones?: string[];

  company?: string | null;
  job_title?: string | null;
  message?: string | null;

  folder_id?: any | string | null; // backend sometimes populates
  user_id: any | string;

  type?: LeadType;

  is_converted?: boolean;
  converted_at?: string | null;

  is_deleted?: boolean;

  scrape_status?: boolean;

  createdAt?: string;
  updatedAt?: string;
};


export type LeadsListParams = {
  user_id: string;
  page?: number;
  limit?: number;
  search?: string;
  type?: LeadType | "";
  folder_id?: string;
  is_converted?: boolean | undefined;
};

export type LeadsSummaryParams = {
  user_id: string;
  days?: number;
  type?: LeadType | "";
  folder_id?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};


type LeadsSummaryResponse = {
  success?: boolean;
  message?: string;
  data?: {
    stats?: {
      total?: number;
      converted?: number;
      deleted?: number;
      byType?: Record<string, number>;
    };
    charts?: {
      dailyTotal?: {
        labels?: string[];
        counts?: number[];
      };
      dailyByType?: {
        labels?: string[];
        countsByType?: Record<string, number[]>;
      };
    };
  };
};
