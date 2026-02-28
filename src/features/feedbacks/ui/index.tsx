"use client";

import React, { useState } from "react";
import { Modal, Button, Descriptions, Tag, Space } from "antd";
import { FormattedMessage } from "react-intl";
import { MessageOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import FeedbacksTableServer, { FeedbackItem, ServerFilters } from "./table";
import {
  useFeedbacksList,
  useUpdateFeedback,
  useDeleteFeedback,
} from "../hooks";

const FeedBackLayout: React.FC = () => {
  const { feedbacks, total, isLoading, query, setQuery, refetch } =
    useFeedbacksList();
  const updateFeedbackMutation = useUpdateFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();

  const [viewingFeedback, setViewingFeedback] = useState<FeedbackItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleFetch = (filters: ServerFilters) => {
    setQuery({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      user_id: filters.user_id,
    });
  };

  const handleUpdateFeedback = async (
    id: string,
    payload: Partial<FeedbackItem>,
  ) => {
    await updateFeedbackMutation.mutateAsync({ id, payload: payload as any });
  };

  const handleDeleteFeedback = async (row: FeedbackItem) => {
    await deleteFeedbackMutation.mutateAsync(row._id);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    for (const id of ids) {
      await deleteFeedbackMutation.mutateAsync(id);
    }
  };

  const handleOpenView = (feedback: FeedbackItem) => {
    setViewingFeedback(feedback);
    setIsViewModalOpen(true);
  };

  return (
    <>
      <FeedbacksTableServer
        feedbacks={feedbacks}
        total={total}
        loading={
          isLoading ||
          updateFeedbackMutation.isPending ||
          deleteFeedbackMutation.isPending
        }
        value={query}
        onFetch={handleFetch}
        onUpdateFeedback={handleUpdateFeedback}
        onDeleteOne={handleDeleteFeedback}
        onDeleteMany={handleDeleteSelected}
        onOpenView={handleOpenView}
        showFilters
      />

      {/* ✅ View Feedback Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined style={{ color: "#52c41a" }} />
            <FormattedMessage
              id="admin.feedbacks.modal.view"
              defaultMessage="Feedback Details"
            />
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingFeedback(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingFeedback(null);
            }}
          >
            <FormattedMessage id="commons.close" defaultMessage="Close" />
          </Button>,
        ]}
        width={700}
      >
        {viewingFeedback && (
          <>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, width: "30%" }}
            >
              <Descriptions.Item
                label={<><MessageOutlined className="mr-1" /> Feedback</>}
              >
                <div style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
                  {viewingFeedback.feedback || "-"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item
                label={<><CheckCircleOutlined className="mr-1" /> Status</>}
              >
                <Tag
                  color={
                    viewingFeedback.status === "open"
                      ? "error"
                      : viewingFeedback.status === "in_progress"
                      ? "processing"
                      : "success"
                  }
                >
                  {viewingFeedback.status === "in_progress"
                    ? "In Progress"
                    : viewingFeedback.status === "resolved"
                    ? "Resolved"
                    : "Open"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={<><UserOutlined className="mr-1" /> User</>}
              >
                {typeof viewingFeedback.user_id === "string"
                  ? viewingFeedback.user_id
                  : `${viewingFeedback.user_id?.first_name || ""} ${viewingFeedback.user_id?.last_name || ""}`.trim() ||
                    viewingFeedback.user_id?.email ||
                    "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label="Email"
              >
                {typeof viewingFeedback.user_id === "string"
                  ? "-"
                  : viewingFeedback.user_id?.email || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={<><ClockCircleOutlined className="mr-1" /> Created</>}
              >
                {viewingFeedback.createdAt
                  ? new Date(viewingFeedback.createdAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={<><ClockCircleOutlined className="mr-1" /> Updated</>}
              >
                {viewingFeedback.updatedAt
                  ? new Date(viewingFeedback.updatedAt).toLocaleString()
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="ID">
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
                  {viewingFeedback._id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default FeedBackLayout;
