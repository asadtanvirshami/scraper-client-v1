"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, Space, message, Descriptions, Tag, Divider } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { BugOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import BugsTableServer, { BugItem, ServerFilters } from "./table";
import { useBugsList, useUpdateBug, useDeleteBug } from "../hooks";

const BugLayout: React.FC = () => {
  const intl = useIntl();
  const { bugs, total, isLoading, query, setQuery, refetch } = useBugsList();
  const updateBugMutation = useUpdateBug();
  const deleteBugMutation = useDeleteBug();

  const [viewingBug, setViewingBug] = useState<BugItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
                label={<><BugOutlined className="mr-1" /> Bug Description</>}
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
                  {viewingBug.status === "in_progress"
                    ? "In Progress"
                    : viewingBug.status === "resolved"
                    ? "Resolved"
                    : "Open"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={<><UserOutlined className="mr-1" /> User</>}
              >
                {typeof viewingBug.user_id === "string"
                  ? viewingBug.user_id
                  : `${viewingBug.user_id?.first_name || ""} ${viewingBug.user_id?.last_name || ""}`.trim() ||
                    viewingBug.user_id?.email ||
                    "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label="Email"
              >
                {typeof viewingBug.user_id === "string"
                  ? "-"
                  : viewingBug.user_id?.email || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={<><ClockCircleOutlined className="mr-1" /> Created</>}
              >
                {viewingBug.createdAt
                  ? new Date(viewingBug.createdAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={<><ClockCircleOutlined className="mr-1" /> Updated</>}
              >
                {viewingBug.updatedAt
                  ? new Date(viewingBug.updatedAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="ID">
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
                  {viewingBug._id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default BugLayout;
