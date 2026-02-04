"use client";

import React, { useState } from "react";
import { message } from "antd";

import { useUserInfo } from "@/helpers/use-user";

import { useFetchFolders } from "./hooks/queries";
import {
  useCreateFolder,
  useUpdateFolder,
  useBulkDeleteFolders,
} from "./hooks/mutations";

import FolderTable from "./ui/folder-table";

const FolderLayout: React.FC = () => {
  const { id: userId } = useUserInfo() as any;

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data, isFetching } = useFetchFolders({
    user_id: userId,
    page: query.page,
    limit: query.limit,
    name: query.search,
  } as any);

  const folders = ((data as any)?.folders ?? data?.data ?? []) as any[];
  const total = ((data as any)?.total ?? (data as any)?.meta?.total ?? 0) as number;

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const bulkDelete = useBulkDeleteFolders();

  return (
    <div className="p-4 lg:p-6">
      <FolderTable
        data={folders as any}
        loading={isFetching}
        showFilters
        pageSize={query.limit}
        selectedRowKeys={selectedRowKeys}
        onSelectedRowKeysChange={setSelectedRowKeys}
        value={{
          page: query.page,
          limit: query.limit,
          search: query.search,
          total,
        }}
        onFetch={(next) => {
          setSelectedRowKeys([]);
          setQuery(next as any);
        }}
        onCreateFolder={async ({ name }) => {
          await createFolder.mutateAsync({ user_id: userId, name } as any);
          setSelectedRowKeys([]);
          setQuery((q) => ({ ...q, page: 1 }));
        }}
        onEditFolder={async ({ folder_id, name }) => {
          await updateFolder.mutateAsync({ folder_id: folder_id, name } as any);
          setQuery((q) => ({ ...q }));
        }}
        onDeleteAll={async (ids) => {
          await bulkDelete.mutateAsync(ids as any);
          setSelectedRowKeys([]);
          setQuery((q) => ({ ...q, page: 1, search: "" }));
        }}
      />
    </div>
  );
};

export default FolderLayout;
