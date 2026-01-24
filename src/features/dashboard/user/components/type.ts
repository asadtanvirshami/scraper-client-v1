import { Lead } from "@/types";

export type LeadsWidgetProps = {
  leads?: Lead[];
  total?: number;
  isLoading?: boolean;
  onCreate?: () => void;
  onViewAll?: () => void;
};

export type WeeklyLeadsAreaChartProps = {
  labels: string[];
  counts: number[];
  isLoading?: boolean;
};
