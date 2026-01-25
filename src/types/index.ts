export type Lead = {
  _id?: string;
  first_name?: string;
  last_name?: string;
  emails?: string[];
  phone_numbers?: string | string[];
  company?: string;
  job_title?: string;
  is_converted?: boolean;
  createdAt?: string | Date;
};
