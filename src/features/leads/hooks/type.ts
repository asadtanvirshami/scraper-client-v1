type LeadsSummaryParams = {
  days?: number;
  type?: "INSTAGRAM" | "LINKEDIN" | "MANUAL";
  folder_id?: string;
  dateFrom?: string;
  dateTo?: string;
  is_converted?: boolean;
  limit?: number;
  offset?: number;
  user_id?: string;
  scrape_status?: boolean;
  scrape_id?: string;
  _id?: string;
};

type LeadsListParams = {
  page: number;
  limit: number;
  offset?: number;
  user_id?: string;
  search?: string;
  type?: string;
  is_converted?: boolean | undefined; // undefined => no filter
  folder_id?: string;
  scrape_status?: boolean;
  scrape_id?: string;
  _id?: string;
};
