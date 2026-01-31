export type Folder = {
  _id?: string;
  name: string;
  createdAt?: string | null;
};

export type FolderTableProps = {
  /** ✅ optional server-mode support */
  value?: {
    page: number;
    limit: number;
    search?: string;
    total?: number;
  };
  showFilters?: boolean;
  data: Folder[];
  loading?: boolean;
  pageSize?: number;
  onFetch?: (next: { page: number; limit: number; search?: string }) => void;

  /** ✅ selection + bulk delete */
  selectedRowKeys?: React.Key[];
  onSelectedRowKeysChange?: (keys: React.Key[]) => void;
  onDeleteAll?: (ids: string[]) => Promise<void> | void;

  /** ✅ create / edit */
  onCreateFolder?: (payload: { name: string }) => Promise<void> | void;
  onEditFolder?: (payload: {
    folder_id: string;
    name: string;
  }) => Promise<void> | void;
};
