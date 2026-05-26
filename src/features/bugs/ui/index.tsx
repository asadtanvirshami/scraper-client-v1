"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, Space, message, Descriptions, Tag, theme } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { BugOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import BugsTableServer, { BugItem, ServerFilters } from "./table";
import { useBugsList, useUpdateBug, useDeleteBug } from "../hooks";

const BugLayout: React.FC = () => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const { bugs, total, isLoading, query, setQuery, refetch } = useBugsList();
  const updateBugMutation = useUpdateBug();
  const deleteBugMutation = useDeleteBug();

  const [viewingBug, setViewingBug] = useState<BugItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<BugItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  const handleFetch = (filters: ServerFilters) => {
    setQuery({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      user_id: filters.user_id,
    });
  };

  const handleUpdateBug = async (id: string, payload: Partial<BugItem>) => {
    await updateBugMutation.mutateAsync({ id, payload: payload as any });
  };

  const handleDeleteBug = async (row: BugItem) => {
    await deleteBugMutation.mutateAsync(row._id);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    // Delete each selected bug
    for (const id of ids) {
      await deleteBugMutation.mutateAsync(id);
    }
  };

  const handleOpenView = (bug: BugItem) => {
    setViewingBug(bug);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (bug: BugItem) => {
    setEditingBug(bug);
    editForm.setFieldsValue({
      bug: bug.bug,
      status: bug.status || 'open',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingBug) return;
    try {
      setEditLoading(true);
      await updateBugMutation.mutateAsync({ id: editingBug._id, payload: values });
      message.success(intl.formatMessage({ id: "commons.updated", defaultMessage: "Updated" }));
      setIsEditModalOpen(false);
      setEditingBug(null);
      editForm.resetFields();
    } catch (error) {
      message.error(intl.formatMessage({ id: "commons.update_failed", defaultMessage: "Update failed" }));
    } finally {
      setEditLoading(false);
    }
  };

  const formatDateTime = (value?: string | Date) =>
    value
      ? `${intl.formatDate(new Date(value), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} ${intl.formatTime(new Date(value), {
          hour: "numeric",
          minute: "2-digit",
        })}`
      : "-";

  const getStatusLabel = (status?: BugItem["status"]) =>
    intl.formatMessage({
      id: `admin.bugs.status.${status || "open"}`,
      defaultMessage:
        status === "in_progress"
          ? "In Progress"
          : status === "resolved"
            ? "Resolved"
            : "Open",
    });

  return (
    <>
      <BugsTableServer
        bugs={bugs}
        total={total}
        loading={
          isLoading ||
          updateBugMutation.isPending ||
          deleteBugMutation.isPending
        }
        value={query}
        onFetch={handleFetch}
        onUpdateBug={handleUpdateBug}
        onDeleteOne={handleDeleteBug}
        onDeleteMany={handleDeleteSelected}
        onOpenView={handleOpenView}
        onOpenEdit={handleOpenEdit}
        showFilters
      />

      {/* ✅ View Bug Modal */}
      <Modal
        title={
          <Space>
            <BugOutlined style={{ color: "#f5222d" }} />
            <FormattedMessage
              id="admin.bugs.modal.view"
              defaultMessage="Bug Details"
            />
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingBug(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingBug(null);
            }}
          >
            <FormattedMessage id="commons.close" defaultMessage="Close" />
          </Button>,
        ]}
        width={700}
      >
        {viewingBug && (
          <>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, width: "30%" }}
            >
              <Descriptions.Item
                label={
                  <>
                    <BugOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.bugs.modal.bug_description"
                      defaultMessage="Bug Description"
                    />
                  </>
                }
              >
                <div style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
                  {viewingBug.bug || "-"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item
                label={<><CheckCircleOutlined className="mr-1" /> Status</>}
              >
                <Tag
                  color={
                    viewingBug.status === "open"
                      ? "error"
                      : viewingBug.status === "in_progress"
                      ? "processing"
                      : "success"
                  }
                >
                  {getStatusLabel(viewingBug.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.bugs.modal.user"
                      defaultMessage="User"
                    />
                  </>
                }
              >
                {typeof viewingBug.user_id === "string"
                  ? viewingBug.user_id
                  : `${viewingBug.user_id?.first_name || ""} ${viewingBug.user_id?.last_name || ""}`.trim() ||
                    viewingBug.user_id?.email ||
                    "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <FormattedMessage
                    id="admin.bugs.modal.email"
                    defaultMessage="Email"
                  />
                }
              >
                {typeof viewingBug.user_id === "string"
                  ? "-"
                  : viewingBug.user_id?.email || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.bugs.modal.created"
                      defaultMessage="Created"
                    />
                  </>
                }
              >
                {formatDateTime(viewingBug.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.bugs.modal.updated"
                      defaultMessage="Updated"
                    />
                  </>
                }
              >
                {formatDateTime(viewingBug.updatedAt)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <FormattedMessage
                    id="admin.bugs.modal.id"
                    defaultMessage="ID"
                  />
                }
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: token.colorTextTertiary,
                  }}
                >
                  {viewingBug._id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* ✅ Edit Bug Modal */}
      <Modal
        title={
          <Space>
            <BugOutlined style={{ color: "#f5222d" }} />
            <FormattedMessage
              id="admin.bugs.modal.edit"
              defaultMessage="Edit Bug"
            />
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingBug(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={editLoading}
        width={700}
      >
        {editingBug && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
          >
            <Form.Item
              label={intl.formatMessage({
                id: "admin.bugs.modal.bug_description",
                defaultMessage: "Bug Description",
              })}
              name="bug"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "admin.bugs.modal.bug_description_required",
                    defaultMessage: "Please enter bug description",
                  }),
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label={intl.formatMessage({
                id: "admin.bugs.table.status",
                defaultMessage: "Status",
              })}
              name="status"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "admin.bugs.modal.status_required",
                    defaultMessage: "Please select status",
                  }),
                },
              ]}
            >
              <Select
                options={[
                  { label: getStatusLabel("open"), value: "open" },
                  { label: getStatusLabel("in_progress"), value: "in_progress" },
                  { label: getStatusLabel("resolved"), value: "resolved" },
                ]}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default BugLayout;
