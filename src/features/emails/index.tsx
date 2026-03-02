"use client";

import React, { useState } from "react";
import { message } from "antd";

import { useUserInfo } from "@/helpers/use-user";

import { useFetchEmails } from "./hooks/queries";
import {
  useCreateEmail,
  useUpdateEmail,
  useBulkDeleteEmails,
  useVerifyEmail,
} from "./hooks/mutations";

import EmailTable from "./ui/email-table";

const EmailLayout: React.FC = () => {
  const { id: userId } = useUserInfo() as any;

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data, isFetching } = useFetchEmails({
    user_id: userId,
    page: query.page,
    limit: query.limit,
    subject: query.search,
  } as any);

  const emails = (data?.data ?? []) as any[];
  const total = emails.length;

  const createEmail = useCreateEmail();
  const updateEmail = useUpdateEmail();
  const bulkDelete = useBulkDeleteEmails();
  const verifyEmail = useVerifyEmail();

  return (
    <div className="p-4 lg:p-6">
      <EmailTable
        data={emails as any}
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
        onCreateEmail={async ({ email }) => {
          await createEmail.mutateAsync({ 
            user_id: userId, 
            email 
          } as any);
          setSelectedRowKeys([]);
          setQuery((q) => ({ ...q, page: 1 }));
        }}
        onEditEmail={async ({ email_id, subject, content, to }) => {
          await updateEmail.mutateAsync({ 
            email_id, 
            subject, 
            content, 
            to 
          } as any);
          setQuery((q) => ({ ...q }));
        }}
        onDeleteAll={async (ids) => {
          await bulkDelete.mutateAsync(ids as any);
          setSelectedRowKeys([]);
          setQuery((q) => ({ ...q, page: 1, search: "" }));
        }}
        onVerifyEmail={async ({ otp, email }) => {
          await verifyEmail.mutateAsync({ otp, email });
        }}
      />
    </div>
  );
};

export default EmailLayout;
