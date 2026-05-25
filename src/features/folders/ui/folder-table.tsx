"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Input,
  Space,
  Button,
  Modal,
  Form,
  message,
  Select,
  Alert,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  FolderOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useIntl } from "react-intl";
import type { Folder, FolderTableProps } from "@/types/folders";
import { useRouter } from "next/navigation"; // ✅ add
import TableHeaderTitle from "@/components/ui (generic)/table-header-title";

const { Text } = Typography;

const FolderTable: React.FC<FolderTableProps> = ({
  data = [],
  folderOptions = data,
  showFilters = true,
  loading = false,
  pageSize = 10,

  // server-mode
  value,
  onFetch,

  // selection
  selectedRowKeys = [],
  onSelectedRowKeysChange,

  // actions
  onDeleteAll,
  onCreateFolder,
  onEditFolder,
}) => {
  const intl = useIntl();
  const router = useRouter(); // ✅ add

  const isServerMode = Boolean(value && onFetch);

  const [searchDraft, setSearchDraft] = useState<string>(value?.search ?? "");
  React.useEffect(() => {
    setSearchDraft(value?.search ?? "");
  }, [value?.search]);

  const applySearch = () => {
    const term = (searchDraft || "").trim();
    if (isServerMode) {
      if ((value?.search || "") === term) return;
      onSelectedRowKeysChange?.([]);
      onFetch?.({ ...value!, page: 1, search: term });
    }
  };

  const resetSearch = () => {
    setSearchDraft("");
    if (isServerMode) {
      onSelectedRowKeysChange?.([]);
      onFetch?.({ ...value!, page: 1, search: "" });
    }
  };

  const isDirtySearch =
    (searchDraft || "").trim() !== ((value?.search ?? "") || "").trim();

  const filteredData = useMemo(() => {
    if (isServerMode) return data;

    const term = (searchDraft || "").trim().toLowerCase();
    if (!term) return data;

    return (data || []).filter((f) =>
      String(f?.name || "").toLowerCase().includes(term),
    );
  }, [data, isServerMode, searchDraft]);

  // ✅ helper for consistent id
  const getFolderId = (record: Folder) =>
    String((record as any)?._id ?? (record as any)?.id ?? "");

  const getLeadCount = (folder: Folder) =>
    Number(
      (folder as any)?.lead_count ??
        (folder as any)?.leads_count ??
        (folder as any)?.total_leads ??
        0,
    ) || 0;

  const currentPageRowKeys = useMemo(() => {
    return (filteredData || [])
      .map((f) => getFolderId(f) || (f as any)?.name)
      .filter(Boolean)
      .map(String);
  }, [filteredData]);

  const selectAllCurrentPage = () =>
    onSelectedRowKeysChange?.(currentPageRowKeys);
  const clearSelection = () => onSelectedRowKeysChange?.([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"delete" | "move">("delete");
  const [moveToFolderId, setMoveToFolderId] = useState<string | undefined>();
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [editing, setEditing] = useState<Folder | null>(null);

  const [createForm] = Form.useForm<{ name: string }>();
  const [editForm] = Form.useForm<{ _id: string; name: string }>();

  const openCreate = () => {
    createForm.resetFields();
    setCreateOpen(true);
  };
  const closeCreate = () => setCreateOpen(false);

  const openEdit = (folder: Folder) => {
    setEditing(folder);
    editForm.setFieldsValue({ _id: folder?._id ?? "", name: folder?.name ?? "" });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const selectedFolders = useMemo(() => {
    const selectedIds = new Set((selectedRowKeys || []).map(String));
    return (data || []).filter((folder) => selectedIds.has(getFolderId(folder)));
  }, [data, selectedRowKeys]);

  const selectedLeadCount = useMemo(
    () => selectedFolders.reduce((sum, folder) => sum + getLeadCount(folder), 0),
    [selectedFolders],
  );

  const moveFolderOptions = useMemo(() => {
    const selectedIds = new Set((selectedRowKeys || []).map(String));
    return (folderOptions || [])
      .map((folder) => ({
        value: getFolderId(folder),
        label: folder.name,
      }))
      .filter((option) => option.value && !selectedIds.has(option.value));
  }, [folderOptions, selectedRowKeys]);

  const openDeleteConfirm = () => {
    if (!selectedRowKeys.length || !onDeleteAll) return;
    setDeleteMode("delete");
    setMoveToFolderId(undefined);
    setDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deleteSubmitting) return;
    setDeleteOpen(false);
    setDeleteMode("delete");
    setMoveToFolderId(undefined);
  };

  const submitCreate = async () => {
    if (!onCreateFolder) return;

    try {
      const { name } = await createForm.validateFields();
      const clean = String(name || "").trim();
      await onCreateFolder({ name: clean });

      message.success(
        intl.formatMessage({ id: "commons.saved", defaultMessage: "Saved" }),
      );
      closeCreate();

      if (isServerMode) {
        onFetch?.({
          page: 1,
          limit: value?.limit ?? pageSize,
          search: value?.search ?? "",
        });
      }
    } catch {
      message.error(
        intl.formatMessage({
          id: "commons.save_failed",
          defaultMessage: "Save failed",
        }),
      );
    }
  };

  const submitEdit = async () => {
    if (!onEditFolder || !editing?._id) return;
    try {
      const { name } = await editForm.validateFields();
      const clean = String(name || "").trim();
      await onEditFolder({ folder_id: editing?._id, name: clean });

      message.success(
        intl.formatMessage({ id: "commons.saved", defaultMessage: "Saved" }),
      );
      closeEdit();

      if (isServerMode) {
        onFetch?.({
          page: value!.page,
          limit: value!.limit,
          search: value?.search ?? "",
        });
      }
    } catch {
      message.error(
        intl.formatMessage({
          id: "commons.save_failed",
          defaultMessage: "Save failed",
        }),
      );
    }
  };

  const deleteSelected = async (mode: "delete" | "move" = deleteMode) => {
    if (!onDeleteAll) return;

    const ids = (selectedRowKeys || []).map(String).filter(Boolean);
    if (!ids.length) return;
    if (mode === "move" && !moveToFolderId) return;

    try {
      setDeleteSubmitting(true);
      await onDeleteAll(
        ids,
        mode === "move" ? { move_to_folder_id: moveToFolderId } : undefined,
      );

      message.success(
        mode === "move"
          ? intl.formatMessage({
              id: "folders.delete.move_success",
              defaultMessage: "Folder deleted and leads moved",
            })
          : `${intl.formatMessage({ id: "commons.deleted", defaultMessage: "Deleted" })} ${ids.length}`,
      );

      onSelectedRowKeysChange?.([]);
      setSearchDraft("");
      setDeleteOpen(false);
      setMoveToFolderId(undefined);

      if (isServerMode) {
        onFetch?.({ page: 1, limit: value?.limit ?? pageSize, search: "" });
      }
    } catch {
      message.error(
        intl.formatMessage({
          id: "commons.bulk_delete_failed",
          defaultMessage: "Bulk delete failed",
        }),
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns: ColumnsType<Folder> = [
    {
      title: intl.formatMessage({ id: "folders.table.name" }),
      dataIndex: "name",
      key: "name",
      render: (name: Folder["name"]) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FolderOutlined style={{ fontSize: 18 }} />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: "folders.table.createdAt" }),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: Folder["createdAt"]) => (
        <Text type="secondary">
          {createdAt
            ? intl.formatDate(new Date(createdAt), {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : "—"}
        </Text>
      ),
    },
    {
      title: intl.formatMessage({ id: "commons.actions", defaultMessage: "Actions" }),
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_: any, record: Folder) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevent row click
              openEdit(record);
            }}
            disabled={!onEditFolder}
          />
        </Space>
      ),
    },
  ];

  const handleChange = (pagination: TablePaginationConfig) => {
    if (!isServerMode) return;

    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? value!.limit ?? pageSize;

    onFetch?.({
      page,
      limit,
      search: value?.search ?? "",
    });

    onSelectedRowKeysChange?.([]);
  };

  const rowSelection =
    showFilters && onSelectedRowKeysChange
      ? {
          selectedRowKeys,
          onChange: (keys: React.Key[]) => onSelectedRowKeysChange(keys),
          onCell: () => ({
            onClick: (e: React.MouseEvent) => e.stopPropagation(), // ✅ checkbox click won't navigate
          }),
        }
      : undefined;

  return (
    <Card
      title={
        <TableHeaderTitle
          icon={<FolderOutlined />}
          title={<span>{intl.formatMessage({ id: "folders.title" })}</span>}
        />
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ paddingTop: 8 }}
      extra={
        showFilters ? (
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              value={searchDraft}
              placeholder={intl.formatMessage({
                id: "folders.search.placeholder",
                defaultMessage: "Search folders...",
              })}
              onChange={(e) => setSearchDraft(e.target.value)}
              style={{ width: 260, maxWidth: "100%" }}
            />

            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={applySearch}
              disabled={loading || (isServerMode ? !isDirtySearch : false)}
            >
              {intl.formatMessage({ id: "commons.search", defaultMessage: "Search" })}
            </Button>

            <Button icon={<ReloadOutlined />} onClick={resetSearch} disabled={loading}>
              {intl.formatMessage({ id: "commons.reset", defaultMessage: "Reset" })}
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              disabled={!onCreateFolder}
            >
              {intl.formatMessage({ id: "folders.create", defaultMessage: "Create Folder" })}
            </Button>

            <Button onClick={selectAllCurrentPage} disabled={!filteredData.length}>
              {intl.formatMessage({ id: "commons.select_all", defaultMessage: "Select all" })}
            </Button>

            <Button onClick={clearSelection} disabled={!selectedRowKeys.length}>
              {intl.formatMessage({ id: "commons.clear_selection", defaultMessage: "Clear selection" })}
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedRowKeys.length || !onDeleteAll}
              onClick={openDeleteConfirm}
            >
              {intl.formatMessage({ id: "commons.delete_selected", defaultMessage: "Delete selected" })}
            </Button>
          </Space>
        ) : null
      }
    >
      <Table<Folder>
        rowKey={(record) => (record as any)._id ?? (record as any).id ?? record.name}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowSelection={rowSelection}
        locale={{
          emptyText: intl.formatMessage({
            id: "folders.table.empty",
            defaultMessage: "No folders",
          }),
        }}
        onChange={handleChange}
        // ✅ make rows clickable
        onRow={(record) => ({
          onClick: () => {
            const id = getFolderId(record);
            if (!id) return; // avoid navigating for client-mode rows without id
            const name = encodeURIComponent(String(record?.name ?? ""));
            router.push(`/folders/f/${id}?name=${name}`);
          },
          style: { cursor: "pointer" },
        })}
        pagination={
          showFilters
            ? isServerMode
              ? {
                  current: value!.page,
                  pageSize: value!.limit,
                  total: value?.total,
                  showSizeChanger: true,
                }
              : {
                  pageSize,
                  showSizeChanger: false,
                }
            : false
        }
      />

      {/* Create modal */}
      <Modal
        open={createOpen}
        onCancel={closeCreate}
        onOk={submitCreate}
        title={intl.formatMessage({ id: "folders.create", defaultMessage: "Create Folder" })}
        okText={intl.formatMessage({ id: "commons.create", defaultMessage: "Create" })}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: "folders.fields.name", defaultMessage: "Name" })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "folders.errors.name_required",
                  defaultMessage: "Name is required.",
                }),
              },
            ]}
          >
            <Input
              maxLength={80}
              placeholder={intl.formatMessage({
                id: "folders.placeholders.name",
                defaultMessage: "e.g. Security Leads",
              })}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onCancel={closeEdit}
        onOk={submitEdit}
        title={intl.formatMessage({ id: "folders.edit", defaultMessage: "Edit Folder" })}
        okText={intl.formatMessage({ id: "commons.save", defaultMessage: "Save" })}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: "folders.fields.name", defaultMessage: "Name" })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "folders.errors.name_required",
                  defaultMessage: "Name is required.",
                }),
              },
            ]}
          >
            <Input maxLength={80} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteOpen}
        onCancel={closeDeleteConfirm}
        title={intl.formatMessage({
          id: "folders.delete.confirm_title",
          defaultMessage: "Delete selected folder(s)?",
        })}
        footer={[
          <Button key="cancel" onClick={closeDeleteConfirm} disabled={deleteSubmitting}>
            {intl.formatMessage({ id: "commons.cancel", defaultMessage: "Cancel" })}
          </Button>,
          <Button
            key="delete"
            danger
            loading={deleteSubmitting && deleteMode === "delete"}
            onClick={() => {
              setDeleteMode("delete");
              void deleteSelected("delete");
            }}
          >
            {selectedLeadCount > 0
              ? intl.formatMessage({
                  id: "folders.delete.confirm_loss",
                  defaultMessage: "Delete folder and leads",
                })
              : intl.formatMessage({
                  id: "folders.delete.confirm_empty",
                  defaultMessage: "Delete folder",
                })}
          </Button>,
          selectedLeadCount > 0 ? (
            <Button
              key="move"
              type="primary"
              disabled={!moveToFolderId || moveFolderOptions.length === 0}
              loading={deleteSubmitting && deleteMode === "move"}
              onClick={() => {
                setDeleteMode("move");
                void deleteSelected("move");
              }}
            >
              {intl.formatMessage({
                id: "folders.delete.move_and_delete",
                defaultMessage: "Move leads and delete",
              })}
            </Button>
          ) : null,
        ]}
      >
        {selectedLeadCount > 0 ? (
          <Alert
            type="warning"
            showIcon
            message={intl.formatMessage({
              id: "folders.delete.warning_title",
              defaultMessage: "This folder contains leads",
            })}
            description={intl.formatMessage(
              {
                id: "folders.delete.warning_desc",
                defaultMessage:
                  "The selected folder(s) contain leads or data. Deleting without moving will permanently remove those leads from this folder.",
              },
            )}
            style={{ marginBottom: 16 }}
          />
        ) : (
          <p>
            {intl.formatMessage(
              {
                id: "folders.delete.empty_desc",
                defaultMessage: "You are deleting {count} selected folder(s).",
              },
              { count: selectedRowKeys.length },
            )}
          </p>
        )}

        {selectedLeadCount > 0 && (
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            <Text strong>
              {intl.formatMessage({
                id: "folders.delete.move_label",
                defaultMessage: "Move leads to another folder first",
              })}
            </Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              placeholder={intl.formatMessage({
                id: "folders.delete.move_placeholder",
                defaultMessage: "Choose destination folder",
              })}
              options={moveFolderOptions}
              value={moveToFolderId}
              onChange={setMoveToFolderId}
              disabled={moveFolderOptions.length === 0}
            />
            {moveFolderOptions.length === 0 && (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "folders.delete.no_destination",
                  defaultMessage:
                    "Create another folder if you want to move these leads before deleting.",
                })}
              </Text>
            )}
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default FolderTable;
